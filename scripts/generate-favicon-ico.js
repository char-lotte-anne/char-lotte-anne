#!/usr/bin/env node
/**
 * Generates favicon.ico (32x32 teal square) for Safari/legacy browser support.
 * Run: node scripts/generate-favicon-ico.js
 * Teal: #2d6a6a -> BGR: 0x6a, 0x6a, 0x2d
 */
const fs = require("fs");
const path = require("path");

const BGR = [0x6a, 0x6a, 0x2d, 0xff]; // #2d6a6a
const W = 32;
const H = 32;
const pixelBytes = W * H * 4;
const dibSize = 40 + pixelBytes;

// ICO header (6 bytes)
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(1, 4);

// ICO directory entry (16 bytes)
const entry = Buffer.alloc(16);
entry[0] = W;
entry[1] = H;
entry[2] = 0;
entry[3] = 0;
entry[4] = 1;
entry[5] = 0;
entry[6] = 32;
entry[7] = 0;
entry.writeUInt32LE(dibSize, 8);
entry.writeUInt32LE(22, 12);

// BITMAPINFOHEADER (40 bytes) - height doubled in ICO
const dib = Buffer.alloc(40);
dib.writeUInt32LE(40, 0);
dib.writeUInt32LE(W, 4);
dib.writeUInt32LE(H * 2, 8); // ICO stores height * 2
dib.writeUInt16LE(1, 12);
dib.writeUInt16LE(32, 14);
dib.writeUInt32LE(0, 16);
dib.writeUInt32LE(pixelBytes, 20);
dib.writeUInt32LE(0, 24);
dib.writeUInt32LE(0, 28);
dib.writeUInt32LE(0, 32);
dib.writeUInt32LE(0, 36);

// Pixel data: BGRx, bottom row first
const pixels = Buffer.alloc(pixelBytes);
for (let i = 0; i < pixelBytes; i += 4) {
  pixels[i] = BGR[0];
  pixels[i + 1] = BGR[1];
  pixels[i + 2] = BGR[2];
  pixels[i + 3] = BGR[3];
}

const out = path.join(__dirname, "..", "favicon.ico");
fs.writeFileSync(out, Buffer.concat([icoHeader, entry, dib, pixels]));
console.log("Wrote " + out);
