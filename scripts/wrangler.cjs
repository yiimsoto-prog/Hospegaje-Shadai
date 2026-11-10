#!/usr/bin/env node
/**
 * Cloudflare Workers Builds runs only:
 *   npx wrangler deploy
 * with an empty Build command.
 *
 * Stock wrangler then redirects to `opennextjs-cloudflare deploy` WITHOUT
 * building first → "Could not find compiled Open Next config".
 *
 * This shim builds OpenNext, then calls real wrangler with OPEN_NEXT_DEPLOY=true
 * so the redirect is skipped and `.open-next/worker.js` is uploaded.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const root = path.join(__dirname, "..");
const realWrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
const realOpenNext = path.join(
  root,
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js",
);

const args = process.argv.slice(2);
const command = args[0];

function runNode(script, scriptArgs, env = process.env) {
  const result = spawnSync(process.execPath, [script, ...scriptArgs], {
    stdio: "inherit",
    env,
    cwd: root,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  return result.status ?? 1;
}

const needsOpenNextBuild =
  (command === "deploy" || command === "versions" || command === "version") &&
  !process.env.OPEN_NEXT_DEPLOY;

if (needsOpenNextBuild && command === "deploy") {
  console.log("[hospedaje-shadai] Building OpenNext before wrangler deploy…");
  const buildStatus = runNode(realOpenNext, ["build"]);
  if (buildStatus !== 0) process.exit(buildStatus);

  const status = runNode(realWrangler, args, {
    ...process.env,
    OPEN_NEXT_DEPLOY: "true",
  });
  process.exit(status);
}

process.exit(runNode(realWrangler, args));
