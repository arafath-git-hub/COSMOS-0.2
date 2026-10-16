
/* ==========================================
   COSMOS — Global JavaScript
   Compatible with index.html and other pages
   ========================================== */

"use strict";

/* ---------- 1. DOM Helpers ---------- */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback, {
      once: true
    });
  } else {
    callback();
  }
}

/* ---------- 2. Current Year ---------- */

function updateCurrentYear() {
  const year = new Date().getFullYear();

  $$("[data-current-year], #currentYear, .current-year")
    .forEach((element) => {
      element.textContent = year;
    });
}

/* ---------- 3. Active Navigation ---------- */

function initActiveNavigation() {
  const links = $$(".nav a, .nav-links a, .nav-menu a, nav ul a");

  if (!links.length) return;

  const currentFile =
    window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;

    try {
      const url = new URL(href, window.location.href);
      const linkFile = url.pathname.split("/").pop() || "index.html";

      if (url.origin === window.location.origin && linkFile === currentFile) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");

        if (link.getAttribute("aria-current") === "page") {
          link.removeAttribute("aria-current");
        }
      }
    } catch {
      // Ignore invalid URLs.
    }
  });
}

/* ---------- 4. Mobile Navigation ---------- */

function initMobileNavigation() {
  const toggle =
    $("#menuToggle") ||
    $("#navToggle") ||
    $(".menu-toggle") ||
    $(".nav-toggle") ||
    $("[data-menu-toggle]");

  const navigation =
    $("#navMenu") ||
    $("#navLinks") ||
    $(".nav-menu") ||
    $(".nav-links") ||
    $("[data-navigation]");

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    navigation.classList.remove("open", "active", "show");
    toggle.classList.remove("open", "active");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.setAttribute("aria-expanded", "false");

  toggle.addEventListener("click", () => {
    const isOpen =
      navigation.classList.contains("open") ||
      navigation.classList.contains("active") ||
      navigation.classList.contains("show");

    closeMenu();

    if (!isOpen) {
      navigation.classList.add("open");
      toggle.classList.add("open");
      toggle.setAttribute("aria-expanded", "true");
    }
  });

  $$("a", navigation).forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (
      !navigation.contains(event.target) &&
      !toggle.contains(event.target)
    ) {
      closeMenu();
    }
  });
}

/* ---------- 5. Search ---------- */

function initCardSearch() {
  const inputs = [
    ...$$("[data-search-input]"),
    ...$("#searchInput") ? [$("#searchInput")] : [],
    ...$("#planetSearch") ? [$("#planetSearch")] : [],
    ...$("#missionSearch") ? [$("#missionSearch")] : [],
    ...$("#researchSearch") ? [$("#researchSearch")] : []
  ];

  const searchInputs = [...new Set(inputs)];

  const cards = [
    ...new Set([
      ...$$("[data-searchable]"),
      ...$$(".planet-card"),
      ...$$(".mission-card"),
      ...$$(".research-card"),
      ...$$(".info-card"),
      ...$$(".content-card")
    ])
  ];

  if (!searchInputs.length || !cards.length) return;

  searchInputs.forEach((input) => {
    input.addEventListener("input", () => {
      const query = input.value.trim().toLowerCase();
      let visibleCount = 0;

      cards.forEach((card) => {
        const text = (
          (card.dataset.search || "") +
          " " +
          card.textContent
        ).toLowerCase();

        const matches = text.includes(query);

        card.hidden = !matches;

        if (matches) visibleCount++;
      });

      updateSearchStatus(visibleCount);
    });
  });
}

function updateSearchStatus(count) {
  const counter =
    $("[data-results-count]") ||
    $("#resultsCount") ||
    $(".results-count");

  if (counter) {
    counter.textContent =
      `Showing ${count} ${count === 1 ? "result" : "results"}`;
  }

  const emptyState =
    $("[data-empty-state]") ||
    $("#emptyState") ||
    $(".empty-state");

  if (emptyState) {
    emptyState.classList.toggle("visible", count === 0);
    emptyState.hidden = count !== 0;
  }
}

/* ---------- 6. Category Filters ---------- */

function initCategoryFilters() {
  const buttons = $$(
    "[data-filter], .filter-btn, .filter-button, .category-btn"
  );

  if (!buttons.length) return;

  const cards = [
    ...new Set([
      ...$$("[data-searchable]"),
      ...$$(".planet-card"),
      ...$$(".mission-card"),
      ...$$(".research-card"),
      ...$$(".info-card"),
      ...$$(".content-card")
    ])
  ];

  if (!cards.length) return;

  let activeFilter = "all";

  const searchInput =
    $("#searchInput") ||
    $("#planetSearch") ||
    $("#missionSearch") ||
    $("#researchSearch") ||
    $("[data-search-input]");

  function applyFilters() {
    const query = searchInput
      ? searchInput.value.trim().toLowerCase()
      : "";

    let visibleCount = 0;

    cards.forEach((card) => {
      const category = (
        card.dataset.category ||
        card.dataset.filterCategory ||
        "all"
      ).toLowerCase();

      const text = (
        (card.dataset.search || "") +
        " " +
        card.textContent
      ).toLowerCase();

      const matchesCategory =
        activeFilter === "all" ||
        category === activeFilter ||
        category.split(/\s+/).includes(activeFilter);

      const matchesSearch = text.includes(query);
      const visible = matchesCategory && matchesSearch;

      card.hidden = !visible;

      if (visible) visibleCount++;
    });

    updateSearchStatus(visibleCount);
  }

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter = (
        button.dataset.filter ||
        button.dataset.category ||
        "all"
      ).toLowerCase();

      buttons.forEach((item) => {
        const active = item === button;

        item.classList.toggle("active", active);

        if (item.hasAttribute("aria-pressed")) {
          item.setAttribute("aria-pressed", String(active));
        }
      });

      applyFilters();
    });
  });

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  applyFilters();
}

/* ---------- 7. Scroll Reveal ---------- */

function initScrollReveal() {
  const elements = $$(
    ".reveal, .fade-in, .animate-on-scroll, [data-reveal]"
  );

  if (!elements.length) return;

  if (
    !("IntersectionObserver" in window) ||
    prefersReducedMotion()
  ) {
    elements.forEach((element) => {
      element.classList.add("visible", "revealed");
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible", "revealed");
          currentObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px"
    }
  );

  elements.forEach((element) => observer.observe(element));
}

/* ---------- 8. Back to Top ---------- */

function initBackToTop() {
  let button =
    $("#backToTop") ||
    $(".back-to-top") ||
    $("[data-back-to-top]");

  if (!button) {
    button = document.createElement("button");
    button.type = "button";
    button.id = "backToTop";
    button.textContent = "↑";
    button.setAttribute("aria-label", "Back to top");

    Object.assign(button.style, {
      position: "fixed",
      right: "22px",
      bottom: "22px",
      width: "46px",
      height: "46px",
      zIndex: "99",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid rgba(160,185,255,.3)",
      borderRadius: "14px",
      background: "#17243d",
      color: "#f3f6ff",
      fontSize: "24px",
      cursor: "pointer",
      boxShadow: "0 8px 25px rgba(0,0,0,.25)"
    });

    document.body.appendChild(button);
  }

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion() ? "auto" : "smooth"
    });
  });

  function updateButton() {
    const visible = window.scrollY > 400;

    button.style.display = visible ? "flex" : "none";
    button.setAttribute("aria-hidden", String(!visible));
  }

  window.addEventListener("scroll", updateButton, {
    passive: true
  });

  updateButton();
}

/* ---------- 9. Clickable Cards ---------- */

function initClickableCards() {
  $$("[data-card-link]").forEach((card) => {
    const navigate = () => {
      const destination = card.dataset.cardLink;

      if (destination) {
        window.location.href = destination;
      }
    };

    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select, textarea")) {
        return;
      }

      navigate();
    });

    if (!card.hasAttribute("tabindex")) {
      card.setAttribute("tabindex", "0");
    }

    if (!card.hasAttribute("role")) {
      card.setAttribute("role", "link");
    }

    card.addEventListener("keydown", (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        event.target === card
      ) {
        event.preventDefault();
        navigate();
      }
    });
  });
}

/* ---------- 10. FAQ Accordion ---------- */

function initFAQ() {
  $$(".faq-question, [data-faq-toggle]").forEach((button) => {
    button.addEventListener("click", () => {
      const answerId = button.getAttribute("aria-controls");

      const answer = answerId
        ? document.getElementById(answerId)
        : button.nextElementSibling;

      if (!answer) return;

      const isOpen =
        button.getAttribute("aria-expanded") === "true";

      button.setAttribute("aria-expanded", String(!isOpen));
      answer.hidden = isOpen;
      button.classList.toggle("active", !isOpen);
    });
  });
}

/* ---------- 11. Copy Buttons ---------- */

function initCopyButtons() {
  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy;

      if (!text) return;

      try {
        await navigator.clipboard.writeText(text);

        const originalText = button.textContent;
        button.textContent = "Copied";

        window.setTimeout(() => {
          button.textContent = originalText;
        }, 1500);
      } catch (error) {
        console.error("COSMOS: Could not copy text.", error);
      }
    });
  });
}

/* ---------- 12. Image Fallback ---------- */

function initImageFallbacks() {
  $$("img").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-unavailable");
      image.setAttribute("data-image-error", "true");
    }, { once: true });

    if (image.complete && image.naturalWidth === 0 && image.src) {
      image.classList.add("image-unavailable");
      image.setAttribute("data-image-error", "true");
    }
  });
}

/* ---------- 13. Smooth Anchor Scrolling ---------- */

function initSmoothAnchors() {
  $$('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      const target = document.getElementById(href.slice(1));

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: prefersReducedMotion() ? "auto" : "smooth",
        block: "start"
      });

      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });
}

/* ---------- 14. Page Loading State ---------- */

function initPageLoadedState() {
  document.documentElement.classList.add("js-enabled");

  const markLoaded = () => {
    document.documentElement.classList.add("page-loaded");
    document.body.classList.add("page-loaded");
  };

  if (document.readyState === "complete") {
    markLoaded();
  } else {
    window.addEventListener("load", markLoaded, {
      once: true
    });
  }
}

/* ---------- 15. Global Error Reporting ---------- */

window.addEventListener("error", (event) => {
  console.error("COSMOS JavaScript error:", event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("COSMOS asynchronous error:", event.reason);
});

/* ---------- 16. Initialize ---------- */

onReady(() => {
  const initializers = [
    updateCurrentYear,
    initActiveNavigation,
    initMobileNavigation,
    initCardSearch,
    initCategoryFilters,
    initScrollReveal,
    initBackToTop,
    initClickableCards,
    initFAQ,
    initCopyButtons,
    initImageFallbacks,
    initSmoothAnchors,
    initPageLoadedState
  ];

  initializers.forEach((initialize) => {
    try {
      initialize();
    } catch (error) {
      console.error(
        `COSMOS: ${initialize.name} failed.`,
        error
      );
    }
  });

  console.info("COSMOS JavaScript initialized successfully.");
});

/* COSMOS — EMERGENCY HAMBURGER VISIBILITY FIX */

@media (max-width: 760px) {
  header.topbar,
  .topbar {
    display: flex !important;
    flex-wrap: wrap !important;
    align-items: center !important;
    justify-content: space-between !important;
    position: sticky !important;
    top: 0;
    z-index: 9999 !important;
  }

  header.topbar button.menu-toggle,
  header.topbar #menuToggle,
  header.topbar #navToggle,
  .topbar .menu-toggle,
  .topbar .nav-toggle,
  .topbar #menuToggle,
  .topbar #navToggle {
    display: flex !important;
    visibility: visible !important;
    opacity: 1 !important;
    position: relative !important;
    z-index: 10001 !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 5px !important;
    width: 44px !important;
    height: 44px !important;
    min-width: 44px !important;
    padding: 10px !important;
    margin-left: auto !important;
    border: 1px solid #526a9f !important;
    border-radius: 12px !important;
    color: #f4f6ff !important;
    background: #101626 !important;
    cursor: pointer !important;
  }

  header.topbar button.menu-toggle span,
  header.topbar #menuToggle span,
  header.topbar #navToggle span,
  .topbar .menu-toggle span,
  .topbar .nav-toggle span {
    display: block !important;
    width: 20px !important;
    height: 2px !important;
    min-height: 2px !important;
    background: #69e0ff !important;
    border-radius: 3px !important;
    opacity: 1 !important;
  }
}
