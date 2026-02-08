/**
 * Client-side behavior for char-lotte-anne: nav menu, scroll reveal,
 * back-to-top, contact (phone + email dropdowns: copy, open in app), footer year, scroll progress,
 * theme toggle, focus trap, section hash.
 */
(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Copy announce for screen readers (used by email and phone dropdowns)
  var copyAnnounce = document.getElementById("copy-announce");
  function announceCopy(message) {
    if (copyAnnounce) {
      copyAnnounce.textContent = message;
      setTimeout(function () { copyAnnounce.textContent = ""; }, 1500);
    }
  }

  // Contact email: dropdown with Copy, Email (same pattern as phone)
  var emailTrigger = document.getElementById("contact-email-trigger");
  var emailMenu = document.getElementById("contact-email-menu");
  var emailAddress = "charlottelf@protonmail.com";
  if (emailTrigger && emailMenu) {
    emailTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = emailMenu.classList.toggle("is-open");
      emailTrigger.setAttribute("aria-expanded", open);
    });
    var emailCopyBtn = emailMenu.querySelector('[data-action="copy"]');
    if (emailCopyBtn) {
      emailCopyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(emailAddress).then(function () {
            emailMenu.classList.remove("is-open");
            emailTrigger.setAttribute("aria-expanded", "false");
            announceCopy("Email copied to clipboard.");
          });
        }
      });
    }
    document.addEventListener("click", function () {
      emailMenu.classList.remove("is-open");
      emailTrigger.setAttribute("aria-expanded", "false");
    });
  }

  // Theme toggle: read localStorage / prefers-color-scheme, set data-theme, update icon
  var themeToggle = document.getElementById("theme-toggle");
  var html = document.documentElement;
  function getStoredTheme() {
    try { return localStorage.getItem("theme"); } catch (e) { return null; }
  }
  function setTheme(theme) {
    if (theme === "dark") {
      html.setAttribute("data-theme", "dark");
      if (themeToggle) { themeToggle.textContent = "\u2600"; themeToggle.setAttribute("aria-label", "Switch to light mode"); }
    } else {
      html.removeAttribute("data-theme");
      if (themeToggle) { themeToggle.textContent = "\u263E"; themeToggle.setAttribute("aria-label", "Switch to dark mode"); }
    }
    try { localStorage.setItem("theme", theme || "light"); } catch (e) {}
  }
  function initTheme() {
    var stored = getStoredTheme();
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (stored === "dark" || stored === "light") setTheme(stored);
    else if (prefersDark) setTheme("dark");
    else setTheme("light");
  }
  initTheme();
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(html.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  // Nav menu: toggle, close on link/outside click, focus trap, Escape
  var navTrigger = document.getElementById("nav-menu-trigger");
  var navMenu = document.getElementById("nav-menu");
  var navLinks = navMenu ? navMenu.querySelectorAll("a") : [];
  function closeNavMenu() {
    if (!navMenu || !navTrigger) return;
    navMenu.parentElement.classList.remove("is-open");
    navTrigger.setAttribute("aria-expanded", "false");
    navTrigger.focus();
  }
  if (navTrigger && navMenu) {
    navTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = navMenu.parentElement.classList.toggle("is-open");
      navTrigger.setAttribute("aria-expanded", open);
      if (open) {
        if (navLinks.length) navLinks[0].focus();
      }
    });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeNavMenu();
      });
    });
    navMenu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    navMenu.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeNavMenu();
    });
    document.addEventListener("click", function () {
      closeNavMenu();
    });
    // Focus trap: Tab / Shift+Tab wrap within menu when open
    navMenu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab" || !navMenu.parentElement.classList.contains("is-open")) return;
      var first = navLinks[0];
      var last = navLinks[navLinks.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Contact phone: dropdown with Copy, Text, Call
  var phoneTrigger = document.getElementById("contact-phone-trigger");
  var phoneMenu = document.getElementById("contact-phone-menu");
  var phoneNumber = "+12069818327";
  if (phoneTrigger && phoneMenu) {
    phoneTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = phoneMenu.classList.toggle("is-open");
      phoneTrigger.setAttribute("aria-expanded", open);
    });
    var copyBtn = phoneMenu.querySelector('[data-action="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(phoneNumber).then(function () {
            phoneMenu.classList.remove("is-open");
            phoneTrigger.setAttribute("aria-expanded", "false");
            if (typeof announceCopy === "function") announceCopy("Phone number copied to clipboard.");
          });
        }
      });
    }
    document.addEventListener("click", function () {
      phoneMenu.classList.remove("is-open");
      phoneTrigger.setAttribute("aria-expanded", "false");
    });
  }

  // Scroll reveal: add .visible when element enters viewport (skip animation if reduced motion)
  var revealEls = document.querySelectorAll(".reveal");
  if (prefersReducedMotion) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  // Scroll progress bar (hidden when reduced motion)
  var scrollProgress = document.getElementById("scroll-progress");
  if (scrollProgress && !prefersReducedMotion) {
    function updateScrollProgress() {
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight <= 0 ? 0 : (window.scrollY / docHeight) * 100;
      scrollProgress.style.width = pct + "%";
    }
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();
  } else if (scrollProgress) {
    scrollProgress.style.display = "none";
  }

  // Back to top: show when hero is out of view; click scrolls to top
  var hero = document.getElementById("hero");
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }
  if (hero && backToTop && "IntersectionObserver" in window) {
    var backToTopObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) backToTop.classList.remove("is-visible");
          else backToTop.classList.add("is-visible");
        });
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    backToTopObserver.observe(hero);
  }

  // Shareable section URLs: update hash when section is in view (throttled)
  var sectionIds = ["hero", "about", "education", "experience", "projects", "looking-for", "contact"];
  var sections = sectionIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var hashUpdateScheduled = false;
  function updateHashFromScroll() {
    if (hashUpdateScheduled) return;
    hashUpdateScheduled = true;
    requestAnimationFrame(function () {
      hashUpdateScheduled = false;
      var top = window.scrollY;
      var best = null;
      var bestTop = -Infinity;
      for (var i = 0; i < sections.length; i++) {
        var rect = sections[i].getBoundingClientRect();
        var sectionTop = rect.top + top;
        if (rect.top <= window.innerHeight * 0.4 && sectionTop > bestTop) {
          bestTop = sectionTop;
          best = sections[i];
        }
      }
      if (best && best.id && best.id !== "hero") {
        var newHash = "#" + best.id;
        if (window.location.hash !== newHash) {
          history.replaceState(null, "", window.location.pathname + window.location.search + newHash);
        }
        // aria-current on nav link for current section
        var navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
        navLinks.forEach(function (link) {
          if (link.getAttribute("href") === "#" + best.id) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      } else {
        var navLinksAll = document.querySelectorAll(".nav-menu a[aria-current]");
        navLinksAll.forEach(function (link) { link.removeAttribute("aria-current"); });
      }
    });
  }
  window.addEventListener("scroll", updateHashFromScroll, { passive: true });
  // Set initial aria-current from hash on load
  if (window.location.hash) {
    var id = window.location.hash.slice(1);
    var navLinksInit = document.querySelectorAll(".nav-menu a[href^='#']");
    navLinksInit.forEach(function (link) {
      link.removeAttribute("aria-current");
      if (link.getAttribute("href") === "#" + id) link.setAttribute("aria-current", "location");
    });
  }
})();
