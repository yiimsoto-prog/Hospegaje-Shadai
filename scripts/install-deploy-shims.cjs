#!/usr/bin/env node
/**
 * Cloudflare Workers Builds runs: `npx wrangler deploy` with empty build command.
 * Stock wrangler then shells out to `opennextjs-cloudflare deploy` without building.
 *
 * We patch the REAL package bins (not only .bin symlinks) because CF's npx resolves
 * package bins directly — and a non-executable .bin shim caused:
 *   sh: 1: opennextjs-cloudflare: Permission denied
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");

function writeExec(filePath, contents) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, contents, { mode: 0o755 });
  try {
    fs.chmodSync(filePath, 0o755);
  } catch {
    // ignore
  }
}

function patchWrangler() {
  const wranglerDir = path.join(root, "node_modules", "wrangler", "bin");
  const original = path.join(wranglerDir, "wrangler.js");
  const upstream = path.join(wranglerDir, "wrangler.upstream.js");
  if (!fs.existsSync(original)) return;

  // Preserve upstream once (re-installs overwrite wrangler.js; keep upstream if ours)
  const current = fs.readFileSync(original, "utf8");
  if (!current.includes("HOSPEDAJE_SHADAI_WRANGLER_SHIM")) {
    fs.copyFileSync(original, upstream);
  } else if (!fs.existsSync(upstream)) {
    console.warn("wrangler shim present but upstream missing; reinstall wrangler");
    return;
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

  writeExec(
    original,
    `#!/usr/bin/env node
/* HOSPEDAJE_SHADAI_WRANGLER_SHIM */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const upstream = path.join(__dirname, "wrangler.upstream.js");
const openNextCli = ${JSON.stringify(openNextCli)};
const args = process.argv.slice(2);
const cmd = args[0];

function run(script, scriptArgs, env) {
  const r = spawnSync(process.execPath, [script, ...scriptArgs], {
    stdio: "inherit",
    env: env || process.env,
    cwd: process.cwd(),
  });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  process.exit(r.status == null ? 1 : r.status);
}

if (cmd === "deploy" && !process.env.OPEN_NEXT_DEPLOY) {
  console.log("[hospedaje-shadai] Building OpenNext before wrangler deploy…");
  const build = spawnSync(process.execPath, [openNextCli, "build"], {
    stdio: "inherit",
    env: process.env,
    cwd: process.cwd(),
  });
  if (build.error) {
    console.error(build.error);
    process.exit(1);
  }
  if (build.status) process.exit(build.status);
  run(upstream, args, { ...process.env, OPEN_NEXT_DEPLOY: "true" });
}

run(upstream, args);
`,
  );
  console.log("Patched wrangler/bin/wrangler.js (OpenNext build-before-deploy)");
}

function patchOpenNextBin() {
  const pkgRoot = path.join(root, "node_modules", "@opennextjs", "cloudflare");
  const realCli = path.join(pkgRoot, "dist", "cli", "index.js");
  if (!fs.existsSync(realCli)) return;

  // Ensure the real CLI is executable when invoked via shebang/.bin
  try {
    fs.chmodSync(realCli, 0o755);
  } catch {
    // ignore
  }

  const wrapper = path.join(pkgRoot, "opennextjs-cloudflare.cjs");
  writeExec(
    wrapper,
    `#!/usr/bin/env node
/* HOSPEDAJE_SHADAI_OPENNEXT_SHIM */
const { spawnSync } = require("node:child_process");
const path = require("node:path");
const realCli = path.join(__dirname, "dist", "cli", "index.js");
const args = process.argv.slice(2);
const cmd = args[0];

function run(a) {
  const r = spawnSync(process.execPath, [realCli, ...a], {
    stdio: "inherit",
    env: process.env,
  });
  if (r.error) {
    console.error(r.error);
    process.exit(1);
  }
  process.exit(r.status == null ? 1 : r.status);
}

if (cmd === "deploy" || cmd === "upload" || cmd === "preview") {
  console.log("[hospedaje-shadai] OpenNext shim: running build before", cmd);
  const build = spawnSync(process.execPath, [realCli, "build"], {
    stdio: "inherit",
    env: process.env,
  });
  if (build.error) {
    console.error(build.error);
    process.exit(1);
  }
  if (build.status) process.exit(build.status);
}
run(args);
`,
  );

  // Point package bin at our executable wrapper (node can run it; also +x for sh)
  const pkgJsonPath = path.join(pkgRoot, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
  pkg.bin = { "opennextjs-cloudflare": "./opennextjs-cloudflare.cjs" };
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2) + "\n");

  // Refresh .bin as a real executable file (not a dangling/non-exec symlink)
  const binDir = path.join(root, "node_modules", ".bin");
  fs.mkdirSync(binDir, { recursive: true });
  for (const name of ["opennextjs-cloudflare"]) {
    const target = path.join(binDir, name);
    try {
      fs.rmSync(target, { force: true });
    } catch {
      // ignore
    }
    writeExec(
      target,
      `#!/bin/sh
exec "${process.execPath}" "${wrapper}" "$@"
`,
    );
  }

  // Same for wrangler .bin → call node on patched wrangler.js
  const wranglerJs = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  for (const name of ["wrangler", "wrangler2", "cf-wrangler"]) {
    const target = path.join(binDir, name);
    try {
      fs.rmSync(target, { force: true });
    } catch {
      // ignore
    }
    writeExec(
      target,
      `#!/bin/sh
exec "${process.execPath}" "${wranglerJs}" "$@"
`,
    );
  }

  console.log("Patched @opennextjs/cloudflare bin + executable .bin wrappers");
}

patchWrangler();
patchOpenNextBin();
