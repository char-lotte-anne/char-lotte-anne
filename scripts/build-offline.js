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
  /* Show a "this is the offline portfolio" banner only when viewed as HTML.
     Not sticky — it scrolls away so it doesn't fight the sticky site header. */
  .offline-banner {
    background: #2d6a6a; color: #fff;
    padding: 0.5rem 1rem; font-size: 0.85rem;
    text-align: center;
  }
  .offline-banner a { color: #fff; text-decoration: underline; }
}

@media print {
  /* Hide the banner and everything that doesn't belong on paper. */
  .offline-banner,
  .scroll-progress,
  .back-to-top,
  .theme-toggle,
  .nav-actions,
  .nav-menu-trigger,
  .nav-menu,
  .skip-link,
  .hero-bg { display: none !important; }

  /* Override the dark theme so PDFs always render light, regardless of viewer setting. */
  html, html[data-theme="dark"] { background: #fff !important; color: #1c1a17 !important; }
  body { background: #fff !important; color: #1c1a17 !important; }

  /* Force every reveal element on, since IntersectionObserver may not fire in print. */
  .reveal,
  .reveal.visible { opacity: 1 !important; transform: none !important; visibility: visible !important; }

  /* Site header collapses to a clean banner. */
  .site-header { position: static !important; box-shadow: none !important; border-bottom: 1px solid #d9d4cc !important; }
  .nav { padding: 0.4rem 0 !important; }
  .nav-bar { padding: 0 !important; }
  .site-title { font-size: 0.95rem !important; }

  /* Hero shrinks so the doc starts with substance, not a big portrait. */
  .hero { min-height: auto !important; padding: 0.6rem 0 0.4rem !important; }
  .hero-portrait { width: 110px !important; height: 110px !important; }
  .hero-title { font-size: 1.6rem !important; margin: 0.4rem 0 0.2rem !important; }
  .hero-tagline, .hero-location { margin: 0.1rem 0 !important; }
  .hero-pitch { margin: 0.4rem 0 0 !important; font-size: 0.95rem !important; }
  .hero-cta { display: none !important; }

  /* Sections: tighten spacing, allow natural page breaks. */
  .section { padding: 0.6rem 0 0.4rem !important; }
  .section-title { font-size: 1.3rem !important; margin: 0.4rem 0 0.5rem !important; page-break-after: avoid; }

  /* Avoid breaking individual job/project entries across pages. */
  .job, .project-card, .about-callout, .timeline > article { break-inside: avoid; page-break-inside: avoid; }

  /* Make all links visible in print (URLs are already typed out where needed). */
  a, a:visited { color: #2d6a6a !important; text-decoration: underline; }

  /* Contact dropdowns — show static, no hover behavior in PDF. */
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
  .contact-email-menu,
  .contact-phone-menu { display: none !important; }

  /* Photos: cap their print size so they don't dominate a page. */
  .job-photos img,
  .project-preview img {
    max-height: 2.4in !important;
    width: auto !important;
    object-fit: contain !important;
  }

  /* Show the table of contents only in the printed/PDF version. */
  .print-toc {
    display: block !important;
    break-after: page;
    page-break-after: always;
    padding: 0.8rem 0 0.4rem;
  }
  .print-toc h2 {
    font-family: "Fraunces", Georgia, serif;
    font-size: 1.6rem;
    margin: 0 0 0.6rem;
  }
  .print-toc ol {
    list-style: decimal inside;
    padding: 0;
    margin: 0;
    font-size: 1.05rem;
    line-height: 1.9;
  }
  .print-toc li a {
    color: #1c1a17 !important;
    text-decoration: none;
  }
  .print-toc .print-toc-meta {
    margin-top: 1rem;
    font-size: 0.9rem;
    color: #5c5650;
  }
  .print-toc .print-toc-meta a { color: #2d6a6a !important; text-decoration: underline; }

  /* Footer */
  .site-footer { border-top: 1px solid #d9d4cc; padding: 0.4rem 0 !important; }
}

@page {
  size: Letter;
  margin: 0.5in 0.55in 0.55in 0.55in;
}
`;

const TOC_HTML = `
<section class="print-toc" aria-label="Table of contents">
  <h2>Charlotte Larson Freeman — Portfolio</h2>
  <p style="margin:0 0 0.8rem; color:#5c5650; font-size:0.95rem;">
    Software Engineer · New grad, March 2026 · Bellingham, WA
  </p>
  <ol>
    <li><a href="#about">About</a></li>
    <li><a href="#education">Education</a></li>
    <li><a href="#experience">Experience</a></li>
    <li><a href="#projects">Projects (incl. live AI project)</a></li>
    <li><a href="#looking-for">What I'm Looking For</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
  <div class="print-toc-meta">
    <p><strong>Live site:</strong> <a href="https://char-lotte-anne.vercel.app/">char-lotte-anne.vercel.app</a></p>
    <p><strong>Featured AI project:</strong> Madame Mystique's Crystal Ball —
      <a href="https://guess-my-name-chi.vercel.app">guess-my-name-chi.vercel.app</a>
      (rule-based filtering + custom in-browser TensorFlow.js model).</p>
    <p><strong>GitHub:</strong> <a href="https://github.com/char-lotte-anne">github.com/char-lotte-anne</a> · <strong>LinkedIn:</strong> <a href="https://www.linkedin.com/in/clarsonfreeman/">linkedin.com/in/clarsonfreeman</a></p>
  </div>
</section>
`;

const OFFLINE_BANNER_HTML = `
<div class="offline-banner" role="note">
  Offline portfolio. Live version: <a href="https://char-lotte-anne.vercel.app/" target="_blank" rel="noopener noreferrer">char-lotte-anne.vercel.app</a>
</div>
`;

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

  console.log("Composing portfolio.html…");
  let out = html;

  out = out.replace(
    /<link rel="stylesheet" href="styles\.css" ?\/?>/,
    `<style>\n${css}\n${PRINT_AND_TOC_CSS}\n</style>`
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
