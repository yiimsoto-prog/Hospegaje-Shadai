#!/usr/bin/env node
/**
 * Wrapper used by Cloudflare Workers Builds when the dashboard keeps
 * "Build command" empty and only runs `npx wrangler deploy`.
 *
 * Wrangler detects OpenNext and calls `opennextjs-cloudflare deploy`
 * without building first. This shim runs `build` before `deploy`.
 */
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const realCli = path.join(
  __dirname,
  "..",
  "node_modules",
  "@opennextjs",
  "cloudflare",
  "dist",
  "cli",
  "index.js",
);

const args = process.argv.slice(2);
const command = args[0];

function run(cliArgs) {
  const result = spawnSync(process.execPath, [realCli, ...cliArgs], {
    stdio: "inherit",
    env: process.env,
  });
  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }
  process.exit(result.status ?? 1);
}

if (command === "deploy" || command === "upload" || command === "preview") {
  const build = spawnSync(process.execPath, [realCli, "build"], {
    stdio: "inherit",
    env: process.env,
  });
  if (build.error) {
    console.error(build.error);
    process.exit(1);
  }
  if (build.status) {
    process.exit(build.status);
  }
}

run(args);
