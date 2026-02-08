#!/usr/bin/env node
/**
 * Generates favicon.png from favicon.svg for Safari/Vercel compatibility.
 * Run: node scripts/generate-favicon-png.js
 * Requires: npm install sharp (or run from project root after npm install)
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const svgPath = path.join(root, "favicon.svg");
const outPath = path.join(root, "favicon.png");

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("sharp is required. Run: npm install sharp");
  process.exit(1);
}

sharp(svgPath)
  .resize(32, 32)
  .png()
  .toFile(outPath)
  .then(() => console.log("Wrote " + outPath))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
