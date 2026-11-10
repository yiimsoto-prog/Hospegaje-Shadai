#!/usr/bin/env node
/**
 * Cloudflare Workers Builds runs only `npx wrangler deploy` (build command empty).
 *
 * Stock wrangler detects OpenNext and shells out to `opennextjs-cloudflare`
 * (Permission denied / missing build). We:
 * 1) Disable that autodelegate in wrangler-dist/cli.js
 * 2) Use wrangler.toml [build] with `node …/index.js build` (no .bin)
 * 3) Replace .bin entries with shell wrappers (rm first — never write through symlinks)
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function writeExecFile(filePath, contents) {
  // Critical: unlink first. writeFileSync on a symlink overwrites the TARGET.
  try {
    fs.lstatSync(filePath);
    fs.unlinkSync(filePath);
  } catch {
    // missing is fine
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, { mode: 0o755 });
  try {
    fs.chmodSync(filePath, 0o755);
  } catch {
    // ignore
  }
}

function disableOpenNextAutodelegate() {
  const cli = path.join(root, "node_modules", "wrangler", "wrangler-dist", "cli.js");
  if (!fs.existsSync(cli)) {
    console.warn("[hospedaje-shadai] wrangler cli.js not found; skip OpenNext disable");
    return;
  }

  let src = fs.readFileSync(cli, "utf8");
  if (src.includes("HOSPEDAJE_SHADAI_DISABLE_OPENNEXT_DELEGATE")) {
    console.log("[hospedaje-shadai] OpenNext autodelegate already disabled");
    return;
  }

  const replaced = src.replace(
    /async function isOpenNextProject\(projectRoot\) \{[\s\S]*?\n\}/,
    `async function isOpenNextProject(projectRoot) {
  // HOSPEDAJE_SHADAI_DISABLE_OPENNEXT_DELEGATE
  // Build is handled by wrangler.toml [build] via node (no .bin shebang).
  return false;
}`,
  );

  if (replaced === src) {
    src =
      `process.env.OPEN_NEXT_DEPLOY = process.env.OPEN_NEXT_DEPLOY || "true";\n` +
      `/* HOSPEDAJE_SHADAI_DISABLE_OPENNEXT_DELEGATE */\n` +
      src;
    fs.writeFileSync(cli, src);
    console.log("[hospedaje-shadai] Set OPEN_NEXT_DEPLOY default in wrangler cli");
    return;
  }

  fs.writeFileSync(cli, replaced);
  console.log("[hospedaje-shadai] Disabled wrangler OpenNext autodelegate");
}

function ensureBinWrappers() {
  const binDir = path.join(root, "node_modules", ".bin");
  fs.mkdirSync(binDir, { recursive: true });
  const node = process.execPath;

  const wranglerJs = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  if (fs.existsSync(wranglerJs)) {
    // Ensure package bin is still JS (repair if a previous buggy postinstall clobbered it)
    const head = fs.readFileSync(wranglerJs, "utf8").slice(0, 40);
    if (head.includes("exec ") && !head.includes("#!/usr/bin/env node")) {
      console.error(
        "[hospedaje-shadai] wrangler.js was overwritten by a shell script; reinstall wrangler",
      );
      process.exitCode = 1;
      return;
    }
    try {
      fs.chmodSync(wranglerJs, 0o755);
    } catch {
      // ignore
    }
    for (const name of ["wrangler", "wrangler2", "cf-wrangler"]) {
      writeExecFile(
        path.join(binDir, name),
        `#!/bin/sh\nexec "${node}" "${wranglerJs}" "$@"\n`,
      );
    }
  }

  const openNextCli = path.join(
    root,
    "node_modules",
    "@opennextjs",
    "cloudflare",
    "dist",
    "cli",
    "index.js",
  );
  if (fs.existsSync(openNextCli)) {
    try {
      fs.chmodSync(openNextCli, 0o755);
    } catch {
      // ignore
    }
    writeExecFile(
      path.join(binDir, "opennextjs-cloudflare"),
      `#!/bin/sh\nexec "${node}" "${openNextCli}" "$@"\n`,
    );
  }

  console.log("[hospedaje-shadai] Refreshed executable .bin wrappers");
}

console.log("[hospedaje-shadai] postinstall v4 — wrangler.toml [build] + no OpenNext autodelegate");
disableOpenNextAutodelegate();
ensureBinWrappers();
