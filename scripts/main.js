//   main.js — Emmanuel Alo Portfolio
//   Modules: Cursor · Nav · Counter · Skill Bars · Scroll Reveal · Form · Carousel

"use strict";
/* ── HELPERS ── */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // 1. CUSTOM CURSOR
(function initCursor() {
  const isFine = window.matchMedia("(pointer: fine)").matches;
  if (!isFine) return;

  const dot = qs("#cursor-dot");
  const ring = qs("#cursor-ring");
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + "px";
    dot.style.top = mouseY + "px";
  });

  function tick() {
    ringX += (mouseX - ringX) * 0.11;
    ringY += (mouseY - ringY) * 0.11;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";
    requestAnimationFrame(tick);
  }
  tick();

  const hoverTargets = "a, button, .work-item, .service-card, input, textarea, .nav-logo";

  document.addEventListener("mouseover", (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.add("expanded");
      ring.classList.add("expanded");
    }
  });

  document.addEventListener("mouseout", (e) => {
    if (e.target.closest(hoverTargets)) {
      dot.classList.remove("expanded");
      ring.classList.remove("expanded");
    }
  });

  document.addEventListener("mouseleave", () => {
    dot.style.opacity = "0";
    ring.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    dot.style.opacity = "1";
    ring.style.opacity = "1";
  });
})();

  // 2. NAV
(function initNav() {
  const nav = qs("#main-nav");
  const toggle = qs("#nav-toggle");
  const links = qs("#nav-links");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const isOpen = links.classList.toggle("open");
      toggle.classList.toggle("open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
    });

    links.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("click", (e) => {
      if (!nav.contains(e.target)) {
        links.classList.remove("open");
        toggle.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  const sections = qsa("section[id], div[id]");
  const navAs = qsa(".nav-links a");

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navAs.forEach((a) => {
          a.classList.toggle("active", a.getAttribute("href") === "#" + id);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  sections.forEach((s) => sectionObserver.observe(s));
})();

  // 3. SCROLL-REVEAL
(function initScrollReveal() {
  const els = qsa(".fade-up");
  if (!els.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const siblings = qsa(".fade-up", entry.target.parentElement);
        const idx = siblings.indexOf(entry.target);
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, idx * 90);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach((el) => observer.observe(el));
})();

  // 4. ANIMATED COUNTERS
(function initCounters() {
  const counters = qsa(".stat-num[data-count]");
  if (!counters.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    counters.forEach((el) => { el.textContent = el.dataset.count + "+"; });
    return;
  }

  function easeOutQuart(t) { return 1 - Math.pow(1 - t, 4); }

  function animateCounter(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1600;
    const suffix = el.dataset.suffix || "+";
    let start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);
      const current = Math.round(eased * target);
      el.textContent = current + (progress === 1 ? suffix : "");
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach((el) => observer.observe(el));
})();

  // 5. SKILL BARS
(function initSkillBars() {
  const bars = qsa(".skill-bar-fill[data-width]");
  if (!bars.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    bars.forEach((bar) => { bar.style.width = bar.dataset.width + "%"; });
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        setTimeout(() => { entry.target.style.width = entry.target.dataset.width + "%"; }, 200);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  bars.forEach((bar) => observer.observe(bar));
})();

  // 6. CONTACT FORM
(function initForm() {
  const form = qs("#contact-form");
  if (!form) return;

  const nameEl = qs("#name", form);
  const emailEl = qs("#email", form);
  const msgEl = qs("#message", form);
  const submitBtn = qs("#form-submit", form);
  const successEl = qs("#form-success", form);

  const errors = {
    name: qs("#name-error", form),
    email: qs("#email-error", form),
    message: qs("#message-error", form),
  };

  function validateEmail(val) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()); }

  function showError(field, el, msg) {
    el.classList.add("error");
    field.textContent = msg;
    field.style.display = "block";
  }

  function clearError(field, el) {
    el.classList.remove("error");
    field.textContent = "";
  }

  nameEl.addEventListener("blur", () => {
    nameEl.value.trim() ? clearError(errors.name, nameEl) : showError(errors.name, nameEl, "Name is required.");
  });

  emailEl.addEventListener("blur", () => {
    if (!emailEl.value.trim()) showError(errors.email, emailEl, "Email is required.");
    else if (!validateEmail(emailEl.value)) showError(errors.email, emailEl, "Please enter a valid email.");
    else clearError(errors.email, emailEl);
  });

  msgEl.addEventListener("blur", () => {
    msgEl.value.trim().length >= 10
      ? clearError(errors.message, msgEl)
      : showError(errors.message, msgEl, "Please tell me a bit more (min. 10 characters).");
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let valid = true;

    if (!nameEl.value.trim()) { showError(errors.name, nameEl, "Name is required."); valid = false; }
    else clearError(errors.name, nameEl);

    if (!emailEl.value.trim()) { showError(errors.email, emailEl, "Email is required."); valid = false; }
    else if (!validateEmail(emailEl.value)) { showError(errors.email, emailEl, "Please enter a valid email."); valid = false; }
    else clearError(errors.email, emailEl);

    if (msgEl.value.trim().length < 10) { showError(errors.message, msgEl, "Please tell me a bit more (min. 10 characters)."); valid = false; }
    else clearError(errors.message, msgEl);

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.textContent = "Sending…";
    successEl.textContent = "";

    await new Promise((resolve) => setTimeout(resolve, 1400));

    submitBtn.textContent = "Message Sent";
    successEl.textContent = "Thank you — I'll be in touch within 48 hours.";
    form.reset();

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send Message";
    }, 5000);
  });
})();

  // 7. MARQUEE
(function initMarquee() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const track = qs(".marquee-track");
    if (track) track.style.animationPlayState = "paused";
  }
})();

  // 8. CAROUSEL
(function initCarousels() {
  qsa(".carousel").forEach((carousel) => {
    const track = carousel.querySelector(".carousel-track");
    const slides = carousel.querySelectorAll(".carousel-slide");
    const dotsContainer = carousel.querySelector(".carousel-dots");
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");
    let current = 0;
    const total = slides.length;

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.classList.add("carousel-dot");
      if (i === 0) dot.classList.add("active");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", (e) => { e.stopPropagation(); goTo(i); });
      dotsContainer.appendChild(dot);
    });

    if (total <= 1) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "none";
      dotsContainer.style.display = "none";
      return;
    }

    function goTo(index) {
      current = (index + total) % total;
      track.style.transform = `translateX(-${current * 100}%)`;
      dotsContainer.querySelectorAll(".carousel-dot")
        .forEach((d, i) => d.classList.toggle("active", i === current));
    }

    prevBtn.addEventListener("click", (e) => { e.stopPropagation(); goTo(current - 1); });
    nextBtn.addEventListener("click", (e) => { e.stopPropagation(); goTo(current + 1); });

    // Swipe support
    let startX = 0;
    carousel.addEventListener("touchstart", (e) => { startX = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener("touchend", (e) => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) goTo(diff > 0 ? current + 1 : current - 1);
    });
  });
})();
// 9. PROJECT MODAL
(function initProjectModal() {
  const modal = $("#project-modal");

  if (!modal.length) return;

  modal.iziModal({
    width: "92%",
    maxWidth: 1200,
    radius: 0,
    background: "#1B1A17",
    overlayColor: "rgba(0,0,0,0.82)",
    headerColor: "#1B1A17",
    padding: 0,
    fullscreen: false,
    transitionIn: "fadeInUp",
    transitionOut: "fadeOutDown",
    closeButton: true,
    restoreDefaultContent: true,
  });

  document.querySelectorAll(".work-item").forEach((item) => {
    item.addEventListener("click", () => {
      const title =
        item.querySelector(".work-overlay-title")?.textContent || "";

      const tech =
        item.querySelector(".work-cat")?.textContent || "";

      const year =
        item.querySelector(".work-year")?.textContent || "";

      const images = [
        ...item.querySelectorAll(".carousel-slide")
      ].map((img) => img.src);

      const slides = images.map((src) => `
        <div class="modal-slide">
          <img src="${src}" alt="">
        </div>
      `).join("");

      modal.iziModal("setTitle", title);

      modal.iziModal("setContent", `
        <div class="project-modal-content">

          <div class="project-modal-gallery">
            ${slides}
          </div>

          <div class="project-modal-info">
            <div class="project-modal-tech">${tech}</div>
            <div class="project-modal-year">${year}</div>
          </div>

        </div>
      `);

      modal.iziModal("open");
    });
  });
})();