# Accessibility: Color contrast (WCAG AA)

This site’s text and UI components meet **WCAG 2.1 Level AA** contrast requirements. This document records the foreground/background pairs used across the site and their measured ratios.

**WCAG AA targets:** Body text ≥ 4.5:1, large text (≥18px or 14px bold) ≥ 3:1, UI components ≥ 3:1.  
Ratios below were verified with [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) / [Coolors Contrast](https://coolors.co/contrast-checker).

---

## Light theme

| # | Foreground (text/icon) | Background | Ratio | Where it’s used |
|---|------------------------|------------|-------|------------------|
| 1 | **#1a1816** (--text) | **#faf8f5** (--bg) | 16.7:1 | Body text, headings, main content |
| 2 | **#5c5650** (--text-muted) | **#faf8f5** (--bg) | 6.82:1 | Muted text, footer, captions |
| 3 | **#5c5650** (--text-muted) | **#f0ebe3** (--bg-alt) | 6.09:1 | Muted text on alternating sections |
| 4 | **#2d6a6a** (--accent) | **#faf8f5** (--bg) | 5.85:1 | Links, nav links (default) |
| 5 | **#2d6a6a** (--accent) | **#f0ebe3** (--bg-alt) | 5.23:1 | Links on alternating sections |
| 6 | **#ffffff** | **#2d6a6a** (--accent) | 6.21:1 | Primary button (“See my work”), back-to-top icon |
| 7 | **#2d6a6a** (--accent) | **#e1e6e4** (--accent-soft over --bg)* | 4.92:1 | Secondary button (Resume, “Get in touch”) |
| 8 | **#faf8f5** (--bg) | **#2d6a6a** (--accent) | 5.85:1 | Skip link, back-to-top button |
| 9 | **#5c5650** (--text-muted) | **#e1e6e4** (--accent-soft over --bg)* | 5.73:1 | About callout quote, “Beyond code” panel |
| 10 | **#1a1816** (--text) | **#f0ebe3** (--bg-alt) | 14.92:1 | Section titles, card text on alt background |

\* **--accent-soft** is `rgba(45, 106, 106, 0.12)`. Over **--bg** it blends to about **#e1e6e4**; that value was used when verifying contrast for the secondary button and callout.

---

## Dark theme

| # | Foreground (text/icon) | Background | Ratio | Where it’s used |
|---|------------------------|------------|-------|------------------|
| 1 | **#f5f3f0** (--text) | **#1a1816** (--bg) | 15.98:1 | Body text, headings |
| 2 | **#a8a29e** (--text-muted) | **#1a1816** (--bg) | 7.01:1 | Muted text, footer |
| 3 | **#a8a29e** (--text-muted) | **#252220** (--bg-alt) | 6.26:1 | Muted text on alternating sections |
| 4 | **#5cb5b5** (--accent) | **#1a1816** (--bg) | 7.36:1 | Links, nav links |
| 5 | **#7ac5c5** (--accent-hover) | **#252220** (--bg-alt) | 7.99:1 | Links on alternating sections (lighter accent for AA) |
| 6 | **#1a1816** (--bg) | **#5cb5b5** (--accent) | 7.36:1 | Primary button, back-to-top icon (dark text in dark mode for AA) |
| 7 | **#5cb5b5** (--accent) | **#253536** (--accent-soft over --bg)* | 5.32:1 | Secondary button |
| 8 | **#1a1816** (--bg) | **#5cb5b5** (--accent) | 7.36:1 | Skip link, back-to-top button |
| 9 | **#a8a29e** (--text-muted) | **#253536** (--accent-soft over --bg)* | 5.07:1 | About callout, “Beyond code” panel |
| 10 | **#f5f3f0** (--text) | **#252220** (--bg-alt) | 14.27:1 | Section titles, card text on alt background |

\* **--accent-soft** in dark is `rgba(92, 181, 181, 0.18)`. Over **--bg** (#1a1816) it blends to about **#253536**; that value was used when verifying contrast for the secondary button and callout.

---

## Color values quick reference

### Light theme
| Variable      | Hex / value |
|---------------|-------------|
| --bg          | #faf8f5     |
| --bg-alt      | #f0ebe3     |
| --text        | #1a1816     |
| --text-muted  | #5c5650     |
| --accent      | #2d6a6a     |
| --accent-hover| #245454     |
| --accent-soft | rgba(45, 106, 106, 0.12) |
| --border      | #e2ddd6     |
| --header-bg   | rgba(250, 248, 245, 0.92) |

### Dark theme
| Variable      | Hex / value |
|---------------|-------------|
| --bg          | #1a1816     |
| --bg-alt      | #252220     |
| --text        | #f5f3f0     |
| --text-muted  | #a8a29e     |
| --accent      | #5cb5b5     |
| --accent-hover| #7ac5c5     |
| --accent-soft | rgba(92, 181, 181, 0.18) |
| --border      | #3d3935     |
| --header-bg   | rgba(26, 24, 22, 0.92) |

---

## Additional notes

- **Focus outline:** Focus styles use --accent or --accent-hover on the same background as the control; contrast is sufficient where body text on that background already passes.
- **Borders:** --border on --bg / --bg-alt is used for layout and structure; WCAG does not require border contrast for text readability.
