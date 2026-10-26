/* MJ Landscapes & Maintenance — landing page behaviour
   Hero load sequence and parallax, scroll reveals, counters, testimonial carousel,
   FAQ accordion, quote form validation, sticky mobile CTA. */
(function () {
  "use strict";

  var body = document.body;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero parallax ---------- */
  var heroMedia = document.querySelector(".hero__media");
  var hero = document.querySelector(".hero");
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    // Gentle parallax on the hero photograph while it is on screen
    if (heroMedia && !reduceMotion && y < hero.offsetHeight) {
      heroMedia.style.transform = "translate3d(0," + y * 0.22 + "px,0)";
    }
    ticking = false;
  }
  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  onScroll();

  /* ---------- Hero load sequence: start once the photo is ready (or after 1.2s) ---------- */
  function startHero() {
    if (body.classList.contains("is-loaded")) return;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        body.classList.add("is-loaded");
      });
    });
  }
  var heroImg = document.querySelector(".hero__media img");
  if (heroImg && heroImg.decode && !heroImg.complete) {
    heroImg.decode().then(startHero, startHero);
  } else {
    startHero();
  }
  setTimeout(startHero, 1200);

  /* ---------- Scroll reveals ---------- */
  document.querySelectorAll("[data-stagger]").forEach(function (group) {
    group.querySelectorAll("[data-reveal]").forEach(function (el, i) {
      el.style.setProperty("--i", i);
    });
  });

  var counters = [];
  document.querySelectorAll("[data-count]").forEach(function (el) {
    counters.push(el);
    if (!reduceMotion) el.textContent = "0" + (el.dataset.suffix || "");
  });

  function countUp(el) {
    var target = parseInt(el.dataset.count, 10);
    var suffix = el.dataset.suffix || "";
    var dur = 1800;
    var start = null;
    function frame(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(2, -10 * p); // ease-out expo
      el.textContent = Math.round(target * (p === 1 ? 1 : eased)) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealIO = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          en.target.classList.add("is-in");
          if (en.target.hasAttribute("data-count")) countUp(en.target);
          revealIO.unobserve(en.target);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    document.querySelectorAll("[data-reveal], [data-count]").forEach(function (el) {
      revealIO.observe(el);
    });
  } else {
    document.querySelectorAll("[data-reveal]").forEach(function (el) {
      el.classList.add("is-in");
    });
    counters.forEach(function (el) {
      el.textContent = el.dataset.count + (el.dataset.suffix || "");
    });
  }

  /* ---------- Testimonial carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach(function (root) {
    var slides = root.querySelectorAll(".slide");
    var count = root.querySelector(".carousel-count");
    var bar = root.querySelector(".carousel-progress span");
    var live = root.querySelector("[data-carousel-live]");
    var current = 0;
    var timer = null;
    var DELAY = 7000;
    var paused = false;

    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }
    function show(i, announce) {
      slides[current].classList.remove("is-active");
      slides[current].setAttribute("aria-hidden", "true");
      current = (i + slides.length) % slides.length;
      slides[current].classList.add("is-active");
      slides[current].removeAttribute("aria-hidden");
      count.textContent = pad(current + 1) + " / " + pad(slides.length);
      if (announce && live) live.textContent = "Review " + (current + 1) + " of " + slides.length;
      restart();
    }
    function restart() {
      clearTimeout(timer);
      if (!bar) return;
      bar.style.transition = "none";
      bar.style.transform = "scaleX(0)";
      if (reduceMotion || paused) return;
      void bar.offsetWidth; // restart the progress line
      bar.style.transition = "transform " + DELAY + "ms linear";
      bar.style.transform = "scaleX(1)";
      timer = setTimeout(function () {
        show(current + 1, false);
      }, DELAY);
    }
    function pause() {
      paused = true;
      restart();
    }
    function resume() {
      paused = false;
      restart();
    }

    root.querySelector("[data-prev]").addEventListener("click", function () {
      show(current - 1, true);
    });
    root.querySelector("[data-next]").addEventListener("click", function () {
      show(current + 1, true);
    });
    root.addEventListener("mouseenter", pause);
    root.addEventListener("mouseleave", resume);
    root.addEventListener("focusin", pause);
    root.addEventListener("focusout", function (e) {
      if (!root.contains(e.relatedTarget)) resume();
    });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) pause();
      else resume();
    });
    show(0, false);
  });

  /* ---------- FAQ accordion (height animated in CSS) ---------- */
  document.querySelectorAll(".faq__btn").forEach(function (btn) {
    var item = btn.closest(".faq__item");
    btn.addEventListener("click", function () {
      var open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      item.classList.toggle("is-open", !open);
    });
  });

  /* ---------- Quote forms ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[0-9+()\s-]{8,}$/;

  function setError(container, msg) {
    var err = container.querySelector(".field-error");
    container.classList.toggle("has-error", !!msg);
    if (err) err.textContent = msg || "";
    container.querySelectorAll("input, select, textarea").forEach(function (c) {
      if (c.type === "radio" || c.type === "checkbox") return;
      if (msg) c.setAttribute("aria-invalid", "true");
      else c.removeAttribute("aria-invalid");
    });
  }

  function validateField(el) {
    var container = el.closest(".field");
    if (!container) return true;
    var v = el.value.trim();
    var msg = "";
    if (el.required && !v) msg = "This field is required.";
    else if (v && el.type === "email" && !EMAIL_RE.test(v)) msg = "Enter an email address like name@example.com.";
    else if (v && el.type === "tel" && !PHONE_RE.test(v)) msg = "Enter a phone number with at least 8 digits.";
    setError(container, msg);
    return !msg;
  }

  function validateGroup(fs) {
    var checked = fs.querySelector("input:checked");
    var msg = checked ? "" : fs.dataset.requiredMsg || "Choose an option.";
    setError(fs, msg);
    return !msg;
  }

  document.querySelectorAll("form.quote-form").forEach(function (form) {
    var wrap = form.closest(".form-card");
    var fields = form.querySelectorAll("input:not([type=radio]):not([type=checkbox]):not([type=hidden]), select, textarea");
    var groups = form.querySelectorAll("fieldset[data-required]");

    fields.forEach(function (el) {
      el.addEventListener("blur", function () {
        if (el.value.trim() || el.closest(".has-error")) validateField(el);
      });
      el.addEventListener("input", function () {
        if (el.closest(".has-error")) validateField(el);
      });
    });
    groups.forEach(function (fs) {
      fs.addEventListener("change", function () {
        validateGroup(fs);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (el) {
        if (!validateField(el) && !firstInvalid) firstInvalid = el;
      });
      groups.forEach(function (fs) {
        if (!validateGroup(fs) && !firstInvalid) firstInvalid = fs.querySelector("input");
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }

      /* --------------------------------------------------------------
         WIRE THE REAL ENDPOINT HERE.
         e.g. fetch(form.action, { method: 'POST', body: new FormData(form) })
                .then(showSuccess).catch(showError);
         Until then we simply show the success state.
         -------------------------------------------------------------- */
      showSuccess();

      function showSuccess() {
        wrap.classList.add("is-submitted");
        var ok = wrap.querySelector(".form-success");
        ok.setAttribute("tabindex", "-1");
        ok.focus();
      }
    });
  });

  /* ---------- Plan buttons pre-select the matching package in the quote form ---------- */
  document.querySelectorAll("[data-package]").forEach(function (link) {
    link.addEventListener("click", function () {
      var target = document.querySelector(link.getAttribute("href"));
      var select = target && target.querySelector('select[name="package"]');
      if (select) select.value = link.dataset.package;
    });
  });

  /* ---------- Sticky mobile CTA: visible once the user scrolls past the hero,
     hidden while any quote form is on screen ---------- */
  var sticky = document.querySelector(".sticky-cta");
  if (sticky && "IntersectionObserver" in window) {
    var visible = new Set();
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) visible.add(en.target);
          else visible.delete(en.target);
        });
        sticky.classList.toggle("is-visible", visible.size === 0);
      },
      { threshold: 0.05 },
    );
    io.observe(hero);
    document.querySelectorAll(".form-card, .site-footer").forEach(function (el) {
      io.observe(el);
    });
  }
})();
