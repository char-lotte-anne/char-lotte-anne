/**
 * Build a self-contained, offline-friendly portfolio.html.
 *
 * - Inlines styles.css and script.js
 * - Resizes and base64-embeds every image in /images
 * - Embeds resume.pdf as a data URI
 * - Adds print-friendly overrides + a clickable Table of Contents
 *   so the document is navigable both as an HTML file and once printed to PDF.
 *
 * Output: portfolio.html in the repo root.
 */

const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const SRC_HTML = path.join(ROOT, "index.html");
const SRC_CSS = path.join(ROOT, "styles.css");
const SRC_JS = path.join(ROOT, "script.js");
const SRC_RESUME = path.join(ROOT, "resume.pdf");
const IMAGES_DIR = path.join(ROOT, "images");
const OUT_HTML = path.join(ROOT, "portfolio.html");

const PRINT_AND_TOC_CSS = `
/* ---------- Offline portfolio overrides ---------- */
.print-toc { display: none; }

@media screen {
  /* Banner only shown when viewed as HTML. Not sticky so it doesn't overlap the site header. */
  .offline-banner {
    background: #2d6a6a; color: #fff;
    padding: 0.5rem 1rem; font-size: 0.85rem;
    text-align: center;
  }
  .offline-banner a { color: #fff; text-decoration: underline; }
}

@media print {
  /* Critical: tell Chrome to honor background colors, gradients, and shadows in print
     output. Without this, the warm cream palette and card backgrounds get stripped. */
  *,
  *::before,
  *::after {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color-adjust: exact !important;
  }

  /* Disable transitions/animations in print — no smooth scroll, no fades. */
  *,
  *::before,
  *::after {
    transition: none !important;
    animation: none !important;
  }

  /* Force the light theme palette regardless of the OS setting at render time. */
  html,
  html[data-theme="dark"] {
    background: #faf8f5 !important;
    color: #1a1816 !important;
  }
  body {
    background: #faf8f5 !important;
    color: #1a1816 !important;
  }

  /* Hide things that only make sense on a screen. */
  .offline-banner,
  .scroll-progress,
  .back-to-top,
  .theme-toggle,
  .nav-actions,
  .nav-menu-trigger,
  .nav-menu,
  .skip-link { display: none !important; }

  /* Header stays visible but doesn't try to be sticky on paper. */
  .site-header {
    position: static !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* Reveal animations may not trigger during PDF rendering, force everything visible. */
  .reveal,
  .reveal.visible {
    opacity: 1 !important;
    transform: none !important;
    visibility: visible !important;
  }

  /* Hide hover-only contact dropdowns; keep the email/phone text inline and underlined. */
  .contact-email-menu,
  .contact-phone-menu { display: none !important; }
  .contact-email-trigger,
  .contact-phone-trigger {
    background: none !important;
    border: none !important;
    padding: 0 !important;
    color: #2d6a6a !important;
    text-decoration: underline;
    cursor: text;
    font: inherit;
  }

  /* Page-break hygiene: don't split entries or orphan section titles. */
  .job,
  .project-card,
  .about-callout,
  .timeline > article { break-inside: avoid; page-break-inside: avoid; }
  .section-title,
  h3 { break-after: avoid; page-break-after: avoid; }
  .hero { break-after: avoid; page-break-after: avoid; }

  /* Cap photo heights so a single image can't take a whole page. */
  .job-photos img,
  .project-preview img {
    max-height: 3.2in !important;
    width: auto !important;
    object-fit: contain !important;
  }

  /* Printable table of contents — appears as the first page of the PDF. */
  .print-toc {
    display: block !important;
    break-after: page;
    page-break-after: always;
    max-width: 52rem;
    margin: 0 auto;
    padding: 1.2rem 1.5rem 0.5rem;
    color: #1a1816;
  }
  .print-toc h2 {
    font-family: "Fraunces", Georgia, serif;
    font-weight: 600;
    font-size: 2rem;
    margin: 0 0 0.4rem;
    color: #1a1816;
  }
  .print-toc .print-toc-sub {
    color: #5c5650;
    margin: 0 0 1.2rem;
    font-size: 1rem;
  }
  .print-toc ol {
    list-style: none;
    padding: 0;
    margin: 0 0 1.5rem;
    font-size: 1.1rem;
    line-height: 2;
    border-top: 1px solid #e2ddd6;
  }
  .print-toc li {
    border-bottom: 1px solid #e2ddd6;
    padding: 0.3rem 0;
    display: flex;
    justify-content: space-between;
  }
  .print-toc li a {
    color: #1a1816 !important;
    text-decoration: none;
    font-weight: 500;
  }
  .print-toc li .print-toc-num {
    color: #5c5650;
    font-variant-numeric: tabular-nums;
    font-size: 0.95rem;
  }
  .print-toc .print-toc-meta {
    margin-top: 1.5rem;
    font-size: 0.95rem;
    color: #5c5650;
    line-height: 1.6;
  }
  .print-toc .print-toc-meta p { margin: 0.25rem 0; }
  .print-toc .print-toc-meta a { color: #2d6a6a !important; text-decoration: underline; }
}

@page {
  size: Letter;
  margin: 0.55in 0.6in 0.6in 0.6in;
}
`;

const TOC_HTML = `
<section class="print-toc" aria-label="Table of contents">
  <h2>Charlotte Larson Freeman</h2>
  <p class="print-toc-sub">Software developer · New grad, March 2026 · Bellingham, WA</p>
  <ol>
    <li><a href="#about">About</a><span class="print-toc-num">01</span></li>
    <li><a href="#education">Education</a><span class="print-toc-num">02</span></li>
    <li><a href="#experience">Experience</a><span class="print-toc-num">03</span></li>
    <li><a href="#projects">Projects (incl. live AI project)</a><span class="print-toc-num">04</span></li>
    <li><a href="#looking-for">What I'm Looking For</a><span class="print-toc-num">05</span></li>
    <li><a href="#contact">Contact</a><span class="print-toc-num">06</span></li>
  </ol>
  <div class="print-toc-meta">
    <p><strong>Live site:</strong> <a href="https://char-lotte-anne.vercel.app/">char-lotte-anne.vercel.app</a></p>
    <p><strong>Featured AI project:</strong> Madame Mystique's Crystal Ball —
      <a href="https://guess-my-name-chi.vercel.app">guess-my-name-chi.vercel.app</a>
      (rule-based filtering + a custom in-browser TensorFlow.js model)</p>
    <p><strong>GitHub:</strong> <a href="https://github.com/char-lotte-anne">github.com/char-lotte-anne</a> &nbsp;·&nbsp;
       <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/clarsonfreeman/">linkedin.com/in/clarsonfreeman</a></p>
  </div>
</section>
`;

const OFFLINE_BANNER_HTML = `
<div class="offline-banner" role="note">
  Offline portfolio. Live version: <a href="https://char-lotte-anne.vercel.app/" target="_blank" rel="noopener noreferrer">char-lotte-anne.vercel.app</a>
</div>
`;

/**
 * Fetch the Google Fonts stylesheet and inline every woff2 file as a base64 data URI.
 * We pretend to be a modern Chrome (so Google returns woff2, not older formats), and
 * we keep only the latin subset to keep the file size reasonable.
 */
async function fetchInlinedFontsCss() {
  const fontsUrl =
    "https://fonts.googleapis.com/css2?" +
    "family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400" +
    "&family=Fraunces:wght@500;600;700" +
    "&display=swap";
  const ua =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

  const res = await fetch(fontsUrl, { headers: { "User-Agent": ua } });
  if (!res.ok) throw new Error(`Google Fonts fetch failed: ${res.status}`);
  const css = await res.text();

  // Each @font-face block is preceded by a /* subset-name */ comment. Keep only latin.
  const blocks = css.split(/(?=\/\*\s*[a-z\-]+\s*\*\/)/i);
  const latinOnly = blocks
    .filter((b) => /\/\*\s*latin\s*\*\//i.test(b) || !/\/\*\s*[a-z\-]+\s*\*\//i.test(b))
    .join("\n");

  const urlRe = /url\((https:\/\/[^)]+\.woff2)\)/g;
  const urls = [...new Set([...latinOnly.matchAll(urlRe)].map((m) => m[1]))];

  const replacements = {};
  for (const u of urls) {
    const r = await fetch(u);
    if (!r.ok) {
      console.warn(`  font fetch failed (${r.status}): ${u}`);
      continue;
    }
    const buf = Buffer.from(await r.arrayBuffer());
    replacements[u] = `data:font/woff2;base64,${buf.toString("base64")}`;
    console.log(`  font ${u.split("/").pop().padEnd(40)} -> ${(buf.length / 1024).toFixed(1)} KB`);
  }

  let out = latinOnly;
  for (const [u, dataUri] of Object.entries(replacements)) {
    out = out.split(u).join(dataUri);
  }
  return out;
}

async function encodeImage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const isPng = ext === ".png";
  try {
    const img = sharp(filePath).rotate();
    const meta = await img.metadata();
    const targetWidth = Math.min(meta.width || 1400, 1400);
    let buffer;
    let mime;
    if (isPng) {
      buffer = await img
        .resize({ width: targetWidth, withoutEnlargement: true })
        .png({ quality: 82, compressionLevel: 9 })
        .toBuffer();
      mime = "image/png";
    } else {
      buffer = await img
        .resize({ width: targetWidth, withoutEnlargement: true })
        .jpeg({ quality: 78, mozjpeg: true })
        .toBuffer();
      mime = "image/jpeg";
    }
    return { mime, buffer };
  } catch (err) {
    console.warn(`Could not process ${filePath} via sharp (${err.message}); embedding raw.`);
    return {
      mime: isPng ? "image/png" : "image/jpeg",
      buffer: fs.readFileSync(filePath),
    };
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  console.log("Reading source files…");
  const html = fs.readFileSync(SRC_HTML, "utf8");
  const css = fs.readFileSync(SRC_CSS, "utf8");
  const js = fs.readFileSync(SRC_JS, "utf8");

  console.log("Processing images…");
  const imageFiles = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpe?g|png)$/i.test(f));
  const imageMap = {};
  let totalIn = 0;
  let totalOut = 0;
  for (const file of imageFiles) {
    const full = path.join(IMAGES_DIR, file);
    const inSize = fs.statSync(full).size;
    totalIn += inSize;
    const { mime, buffer } = await encodeImage(full);
    totalOut += buffer.length;
    imageMap[file] = `data:${mime};base64,${buffer.toString("base64")}`;
    console.log(
      `  ${file.padEnd(40)} ${(inSize / 1024).toFixed(0).padStart(5)} KB  ->  ${(buffer.length / 1024).toFixed(0).padStart(5)} KB`
    );
  }
  console.log(
    `Images total: ${(totalIn / 1024 / 1024).toFixed(2)} MB -> ${(totalOut / 1024 / 1024).toFixed(2)} MB`
  );

  console.log("Embedding resume.pdf…");
  const resumeBuf = fs.readFileSync(SRC_RESUME);
  const resumeDataUri = `data:application/pdf;base64,${resumeBuf.toString("base64")}`;

  console.log("Fetching + inlining Google Fonts (DM Sans, Fraunces)…");
  let fontsCss = "";
  try {
    fontsCss = await fetchInlinedFontsCss();
  } catch (err) {
    console.warn(
      `  Could not inline fonts (${err.message}). Falling back to system fonts in offline contexts.`
    );
  }

  console.log("Composing portfolio.html…");
  let out = html;

  // Strip the Google Fonts <link> + <preconnect>s (we're inlining the fonts ourselves).
  out = out
    .replace(
      /<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" ?\/?>\s*/,
      ""
    )
    .replace(
      /<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin ?\/?>\s*/,
      ""
    )
    .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2[^"]+" rel="stylesheet" ?\/?>\s*/, "");

  out = out.replace(
    /<link rel="stylesheet" href="styles\.css" ?\/?>/,
    `<style>\n/* ---------- Google Fonts (inlined as base64) ---------- */\n${fontsCss}\n\n/* ---------- Site styles ---------- */\n${css}\n${PRINT_AND_TOC_CSS}\n</style>`
  );

  out = out.replace(
    /<script src="script\.js"><\/script>/,
    `<script>\n${js}\n</script>`
  );

  for (const [file, dataUri] of Object.entries(imageMap)) {
    const re = new RegExp(`images/${escapeRegex(file)}`, "g");
    out = out.replace(re, dataUri);
  }

  out = out.replaceAll('href="resume.pdf"', `href="${resumeDataUri}"`);

  out = out
    .replace(/<link rel="icon"[^>]*>\s*/g, "")
    .replace(/<link rel="shortcut icon"[^>]*>\s*/g, "")
    .replace(/<link rel="mask-icon"[^>]*>\s*/g, "")
    .replace(/<link rel="apple-touch-icon"[^>]*>\s*/g, "");

  out = out.replace(
    /<main id="main"([^>]*)>/,
    `<main id="main"$1>${TOC_HTML}`
  );

  out = out.replace(
    /<body>/,
    `<body>\n${OFFLINE_BANNER_HTML}`
  );

  fs.writeFileSync(OUT_HTML, out, "utf8");
  const sizeMb = (Buffer.byteLength(out, "utf8") / 1024 / 1024).toFixed(2);
  console.log(`\nWrote ${path.relative(ROOT, OUT_HTML)} (${sizeMb} MB)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
