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

  // Dropdown refs and close helpers (only one open at a time: nav, email, or phone)
  var emailTrigger = document.getElementById("contact-email-trigger");
  var emailMenu = document.getElementById("contact-email-menu");
  var phoneTrigger = document.getElementById("contact-phone-trigger");
  var phoneMenu = document.getElementById("contact-phone-menu");
  var navTrigger = document.getElementById("nav-menu-trigger");
  var navMenu = document.getElementById("nav-menu");
  var navLinks = navMenu ? navMenu.querySelectorAll("a") : [];

  function closeNavMenu(returnFocus) {
    if (navMenu && navTrigger) {
      navMenu.parentElement.classList.remove("is-open");
      navTrigger.setAttribute("aria-expanded", "false");
      if (returnFocus !== false) navTrigger.focus();
    }
  }
  function closeEmailMenu() {
    if (emailMenu && emailTrigger) {
      emailMenu.classList.remove("is-open");
      emailTrigger.setAttribute("aria-expanded", "false");
    }
  }
  function closePhoneMenu() {
    if (phoneMenu && phoneTrigger) {
      phoneMenu.classList.remove("is-open");
      phoneTrigger.setAttribute("aria-expanded", "false");
    }
  }

  // Contact email: dropdown with Copy, Email (same pattern as phone)
  var emailAddress = "charlottelf@protonmail.com";
  if (emailTrigger && emailMenu) {
    var emailCloseTimeout = null;
    
    function cancelEmailClose() {
      if (emailCloseTimeout) {
        clearTimeout(emailCloseTimeout);
        emailCloseTimeout = null;
      }
    }
    
    function scheduleEmailClose() {
      cancelEmailClose();
      if (!emailTrigger.classList.contains("is-clicked")) {
        emailCloseTimeout = setTimeout(function() {
          emailMenu.classList.remove("is-open");
          emailTrigger.setAttribute("aria-expanded", "false");
        }, 150); // Small delay to allow moving from trigger to menu
      }
    }
    
    // Hover handlers - show immediately, close with delay
    emailTrigger.addEventListener("mouseenter", function() {
      cancelEmailClose();
      closeNavMenu(false);
      closePhoneMenu();
      emailMenu.classList.add("is-open");
      emailTrigger.setAttribute("aria-expanded", "true");
    });
    
    emailTrigger.addEventListener("mouseleave", function() {
      scheduleEmailClose();
    });
    
    emailMenu.addEventListener("mouseenter", function() {
      // Cancel any pending close when mouse enters menu
      cancelEmailClose();
      emailMenu.classList.add("is-open");
      emailTrigger.setAttribute("aria-expanded", "true");
    });
    
    emailMenu.addEventListener("mouseleave", function() {
      scheduleEmailClose();
    });
    
    // Click handler - toggle persistent state
    emailTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      cancelEmailClose();
      closeNavMenu(false);
      closePhoneMenu();
      var isCurrentlyClicked = emailTrigger.classList.contains("is-clicked");
      if (isCurrentlyClicked) {
        // Currently persistent, make it close
        emailTrigger.classList.remove("is-clicked");
        emailMenu.classList.remove("is-open");
        emailTrigger.setAttribute("aria-expanded", "false");
      } else {
        // Not persistent, make it stay open
        emailTrigger.classList.add("is-clicked");
        emailMenu.classList.add("is-open");
        emailTrigger.setAttribute("aria-expanded", "true");
      }
    });
    
    var emailCopyBtn = emailMenu.querySelector('[data-action="copy"]');
    if (emailCopyBtn) {
      emailCopyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(emailAddress).then(function () {
            emailMenu.classList.remove("is-open");
            emailTrigger.setAttribute("aria-expanded", "false");
            emailTrigger.classList.remove("is-clicked");
            announceCopy("Email copied to clipboard.");
          });
        }
      });
    }
    document.addEventListener("click", function () {
      cancelEmailClose();
      closeEmailMenu();
      emailTrigger.classList.remove("is-clicked");
      closeNavMenu();
      closePhoneMenu();
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
  if (navTrigger && navMenu) {
    var navCloseTimeout = null;
    
    function cancelNavClose() {
      if (navCloseTimeout) {
        clearTimeout(navCloseTimeout);
        navCloseTimeout = null;
      }
    }
    
    function scheduleNavClose() {
      cancelNavClose();
      if (!navTrigger.classList.contains("is-clicked")) {
        navCloseTimeout = setTimeout(function() {
          navMenu.parentElement.classList.remove("is-open");
          navTrigger.setAttribute("aria-expanded", "false");
        }, 150); // Small delay to allow moving from trigger to menu
      }
    }
    
    // Hover handlers - show immediately, close with delay
    navTrigger.addEventListener("mouseenter", function() {
      cancelNavClose();
      closeEmailMenu();
      closePhoneMenu();
      navMenu.parentElement.classList.add("is-open");
      navTrigger.setAttribute("aria-expanded", "true");
    });
    
    navTrigger.addEventListener("mouseleave", function() {
      scheduleNavClose();
    });
    
    navMenu.addEventListener("mouseenter", function() {
      // Cancel any pending close when mouse enters menu
      cancelNavClose();
      navMenu.parentElement.classList.add("is-open");
      navTrigger.setAttribute("aria-expanded", "true");
    });
    
    navMenu.addEventListener("mouseleave", function() {
      scheduleNavClose();
    });
    
    // Click handler - toggle persistent state
    navTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      cancelNavClose();
      closeEmailMenu();
      closePhoneMenu();
      var isCurrentlyClicked = navTrigger.classList.contains("is-clicked");
      if (isCurrentlyClicked) {
        // Currently persistent, make it close
        navTrigger.classList.remove("is-clicked");
        navMenu.parentElement.classList.remove("is-open");
        navTrigger.setAttribute("aria-expanded", "false");
      } else {
        // Not persistent, make it stay open
        navTrigger.classList.add("is-clicked");
        navMenu.parentElement.classList.add("is-open");
        navTrigger.setAttribute("aria-expanded", "true");
        if (navLinks.length) navLinks[0].focus();
      }
    });
    
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        closeNavMenu();
        navTrigger.classList.remove("is-clicked");
      });
    });
    navMenu.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    navMenu.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      e.preventDefault();
      closeNavMenu();
      navTrigger.classList.remove("is-clicked");
    });
    document.addEventListener("click", function () {
      cancelNavClose();
      closeNavMenu();
      navTrigger.classList.remove("is-clicked");
      closeEmailMenu();
      closePhoneMenu();
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
  var phoneNumber = "+12069818327";
  if (phoneTrigger && phoneMenu) {
    var phoneCloseTimeout = null;
    
    function cancelPhoneClose() {
      if (phoneCloseTimeout) {
        clearTimeout(phoneCloseTimeout);
        phoneCloseTimeout = null;
      }
    }
    
    function schedulePhoneClose() {
      cancelPhoneClose();
      if (!phoneTrigger.classList.contains("is-clicked")) {
        phoneCloseTimeout = setTimeout(function() {
          phoneMenu.classList.remove("is-open");
          phoneTrigger.setAttribute("aria-expanded", "false");
        }, 150); // Small delay to allow moving from trigger to menu
      }
    }
    
    // Hover handlers - show immediately, close with delay
    phoneTrigger.addEventListener("mouseenter", function() {
      cancelPhoneClose();
      closeNavMenu(false);
      closeEmailMenu();
      phoneMenu.classList.add("is-open");
      phoneTrigger.setAttribute("aria-expanded", "true");
    });
    
    phoneTrigger.addEventListener("mouseleave", function() {
      schedulePhoneClose();
    });
    
    phoneMenu.addEventListener("mouseenter", function() {
      // Cancel any pending close when mouse enters menu
      cancelPhoneClose();
      phoneMenu.classList.add("is-open");
      phoneTrigger.setAttribute("aria-expanded", "true");
    });
    
    phoneMenu.addEventListener("mouseleave", function() {
      schedulePhoneClose();
    });
    
    // Click handler - toggle persistent state
    phoneTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      cancelPhoneClose();
      closeNavMenu(false);
      closeEmailMenu();
      var isCurrentlyClicked = phoneTrigger.classList.contains("is-clicked");
      if (isCurrentlyClicked) {
        // Currently persistent, make it close
        phoneTrigger.classList.remove("is-clicked");
        phoneMenu.classList.remove("is-open");
        phoneTrigger.setAttribute("aria-expanded", "false");
      } else {
        // Not persistent, make it stay open
        phoneTrigger.classList.add("is-clicked");
        phoneMenu.classList.add("is-open");
        phoneTrigger.setAttribute("aria-expanded", "true");
      }
    });
    
    var copyBtn = phoneMenu.querySelector('[data-action="copy"]');
    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(phoneNumber).then(function () {
            phoneMenu.classList.remove("is-open");
            phoneTrigger.setAttribute("aria-expanded", "false");
            phoneTrigger.classList.remove("is-clicked");
            if (typeof announceCopy === "function") announceCopy("Phone number copied to clipboard.");
          });
        }
      });
    }
    document.addEventListener("click", function () {
      cancelPhoneClose();
      closeEmailMenu();
      closeNavMenu();
      closePhoneMenu();
      phoneTrigger.classList.remove("is-clicked");
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
