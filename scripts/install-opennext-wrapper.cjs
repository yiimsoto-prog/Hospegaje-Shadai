#!/usr/bin/env node
/**
 * Link our OpenNext shim into node_modules/.bin so `npx opennextjs-cloudflare`
 * (invoked by wrangler on Cloudflare Workers Builds) hits the wrapper.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const binDir = path.join(root, "node_modules", ".bin");
const wrapperSrc = path.join(__dirname, "opennextjs-cloudflare.cjs");
const target = path.join(binDir, "opennextjs-cloudflare");

if (!fs.existsSync(path.join(root, "node_modules", "@opennextjs", "cloudflare"))) {
  process.exit(0);
}

fs.mkdirSync(binDir, { recursive: true });

try {
  fs.rmSync(target, { force: true });
} catch {
  // ignore
}

try {
  fs.symlinkSync(path.relative(binDir, wrapperSrc), target);
} catch {
  fs.copyFileSync(wrapperSrc, target);
  fs.chmodSync(target, 0o755);
}

console.log("Linked opennextjs-cloudflare deploy shim → scripts/opennextjs-cloudflare.cjs");
