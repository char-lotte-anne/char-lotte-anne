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

let sharp;
try {
  sharp = require("sharp");
} catch (e) {
  console.error("sharp is required. Run: npm install sharp");
  process.exit(1);
}

Promise.all([
  sharp(svgPath).resize(32, 32).png().toFile(path.join(root, "favicon.png")),
  sharp(svgPath).resize(180, 180).png().toFile(path.join(root, "apple-touch-icon.png")),
])
  .then(() => console.log("Wrote favicon.png and apple-touch-icon.png"))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
