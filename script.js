/**
 * Client-side behavior for char-lotte-anne: nav menu, scroll reveal,
 * back-to-top button, contact phone menu (Copy/Text/Call), footer year.
 */
(function () {
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Nav menu: toggle dropdown; close on link click or outside click
  var navTrigger = document.getElementById("nav-menu-trigger");
  var navMenu = document.getElementById("nav-menu");
  if (navTrigger && navMenu) {
    navTrigger.addEventListener("click", function (e) {
      e.stopPropagation();
      var open = navMenu.parentElement.classList.toggle("is-open");
      navTrigger.setAttribute("aria-expanded", open);
    });
    navMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navMenu.parentElement.classList.remove("is-open");
        navTrigger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", function () {
      navMenu.parentElement.classList.remove("is-open");
      navTrigger.setAttribute("aria-expanded", "false");
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
          });
        }
      });
    }
    document.addEventListener("click", function () {
      phoneMenu.classList.remove("is-open");
      phoneTrigger.setAttribute("aria-expanded", "false");
    });
  }

  // Scroll reveal: add .visible when element enters viewport (IntersectionObserver)
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { root: null, rootMargin: "0px 0px 0px 0px", threshold: 0 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  // Back to top: show when hero is out of view; click scrolls to top
  var hero = document.getElementById("hero");
  var backToTop = document.getElementById("back-to-top");
  if (backToTop) {
    backToTop.addEventListener("click", function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  if (hero && backToTop && "IntersectionObserver" in window) {
    var backToTopObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            backToTop.classList.remove("is-visible");
          } else {
            backToTop.classList.add("is-visible");
          }
        });
      },
      { root: null, rootMargin: "0px", threshold: 0 }
    );
    backToTopObserver.observe(hero);
  }
})();
