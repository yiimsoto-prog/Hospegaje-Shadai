#!/usr/bin/env node
/**
 * After npm ci / npm install, point node_modules/.bin wrappers at our shims
 * so Cloudflare's `npx wrangler deploy` builds OpenNext first.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const binDir = path.join(root, "node_modules", ".bin");

function linkShim(binName, scriptName) {
  const target = path.join(binDir, binName);
  const src = path.join(__dirname, scriptName);
  if (!fs.existsSync(src)) return;
  try {
    fs.chmodSync(src, 0o755);
  } catch {
    // ignore
  }
  fs.mkdirSync(binDir, { recursive: true });
  try {
    fs.rmSync(target, { force: true });
  } catch {
    // ignore
  }
  try {
    fs.symlinkSync(path.relative(binDir, src), target);
  } catch {
    fs.copyFileSync(src, target);
    fs.chmodSync(target, 0o755);
  }
  console.log(`Linked ${binName} → scripts/${scriptName}`);
}

if (fs.existsSync(path.join(root, "node_modules", "wrangler"))) {
  linkShim("wrangler", "wrangler.cjs");
  linkShim("wrangler2", "wrangler.cjs");
  linkShim("cf-wrangler", "wrangler.cjs");
}

if (fs.existsSync(path.join(root, "node_modules", "@opennextjs", "cloudflare"))) {
  linkShim("opennextjs-cloudflare", "opennextjs-cloudflare.cjs");
}
