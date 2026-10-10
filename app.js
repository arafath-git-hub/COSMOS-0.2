
/* ==========================================
   COSMOS — Global JavaScript
   Space Science Website
   ========================================== */

"use strict";

/* ---------- 1. DOM Helpers ---------- */

const $ = (selector, parent = document) =>
  parent.querySelector(selector);

const $$ = (selector, parent = document) =>
  Array.from(parent.querySelectorAll(selector));

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

  $$("[data-current-year], #currentYear, .current-year").forEach((element) => {
    element.textContent = year;
  });
}

/* ---------- 3. Mobile Navigation ---------- */

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

  function closeMenu() {
    navigation.classList.remove("open", "active", "show");
    toggle.classList.remove("open", "active");
    toggle.setAttribute("aria-expanded", "false");
  }

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

/* ---------- 4. Search and Card Filtering ---------- */

function initCardSearch() {
  const searchInputs = [
    ...$$("[data-search-input]"),
    ...$$("#searchInput"),
    ...$$("#planetSearch"),
    ...$$("#missionSearch"),
    ...$$("#researchSearch")
  ];

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
        const searchableText = (
          (card.dataset.search || "") +
          " " +
          card.textContent
        ).toLowerCase();

        const matches = searchableText.includes(query);

        card.hidden = !matches;

        if (matches) visibleCount++;
      });

      const counter =
        $("[data-results-count]") ||
        $("#resultsCount") ||
        $(".results-count");

      if (counter) {
        counter.textContent =
          `Showing ${visibleCount} ${visibleCount === 1 ? "result" : "results"}`;
      }

      const emptyState =
        $("[data-empty-state]") ||
        $("#emptyState") ||
        $(".empty-state");

      if (emptyState) {
        emptyState.classList.toggle("visible", visibleCount === 0);
      }
    });
  });
}

/* ---------- 5. Category Filters ---------- */

function initCategoryFilters() {
  const filterButtons = $$(
    "[data-filter], .filter-btn, .filter-button, .category-btn"
  );

  if (!filterButtons.length) return;

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

  function applyFilters() {
    const searchInput =
      $("#searchInput") ||
      $("#planetSearch") ||
      $("#missionSearch") ||
      $("#researchSearch") ||
      $("[data-search-input]");

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

      const searchableText = (
        (card.dataset.search || "") +
        " " +
        card.textContent
      ).toLowerCase();

      const matchesCategory =
        activeFilter === "all" ||
        category === activeFilter ||
        category.split(/\s+/).includes(activeFilter);

      const matchesSearch =
        !query || searchableText.includes(query);

      const visible = matchesCategory && matchesSearch;

      card.hidden = !visible;

      if (visible) visibleCount++;
    });

    const counter =
      $("[data-results-count]") ||
      $("#resultsCount") ||
      $(".results-count");

    if (counter) {
      counter.textContent =
        `Showing ${visibleCount} ${visibleCount === 1 ? "result" : "results"}`;
    }

    const emptyState =
      $("[data-empty-state]") ||
      $("#emptyState") ||
      $(".empty-state");

    if (emptyState) {
      emptyState.classList.toggle("visible", visibleCount === 0);
    }
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      activeFilter =
        button.dataset.filter ||
        button.dataset.category ||
        "all";

      filterButtons.forEach((item) => {
        const active = item === button;

        item.classList.toggle("active", active);

        if (item.hasAttribute("aria-pressed")) {
          item.setAttribute("aria-pressed", String(active));
        }
      });

      applyFilters();
    });
  });

  const searchInput =
    $("#searchInput") ||
    $("#planetSearch") ||
    $("#missionSearch") ||
    $("#researchSearch") ||
    $("[data-search-input]");

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  applyFilters();
}

/* ---------- 6. Scroll Reveal Animation ---------- */

function initScrollReveal() {
  const elements = $$(
    ".reveal, .fade-in, .animate-on-scroll, [data-reveal]"
  );

  if (!elements.length) return;

  if (
    !("IntersectionObserver" in window) ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
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

  elements.forEach((element) => {
    observer.observe(element);
  });
}

/* ---------- 7. Back to Top ---------- */

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
      boxShadow: "0 8px 25px rgba(0,0,0,.25)"
    });

    document.body.appendChild(button);
  }

  button.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches
        ? "auto"
        : "smooth"
    });
  });

  function updateButton() {
    const visible = window.scrollY > 400;

    button.style.display = visible ? "flex" : "none";
  }

  window.addEventListener("scroll", updateButton, {
    passive: true
  });

  updateButton();
}

/* ---------- 8. Active Navigation Link ---------- */

function initActiveNavigation() {
  const links = $$(
    ".nav-links a, .nav-menu a, nav ul a"
  );

  if (!links.length) return;

  const currentFile =
    window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href || href.startsWith("#")) return;

    try {
      const linkFile = new URL(href, window.location.href)
        .pathname.split("/")
        .pop();

      if (linkFile === currentFile) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    } catch {
      // Ignore invalid navigation URLs.
    }
  });
}

/* ---------- 9. Card Click Support ---------- */

function initClickableCards() {
  const cards = $$("[data-card-link]");

  cards.forEach((card) => {
    card.addEventListener("click", (event) => {
      if (event.target.closest("a, button, input, select")) {
        return;
      }

      const destination = card.dataset.cardLink;

      if (destination) {
        window.location.href = destination;
      }
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

        const destination = card.dataset.cardLink;

        if (destination) {
          window.location.href = destination;
        }
      }
    });
  });
}

/* ---------- 10. FAQ Accordion ---------- */

function initFAQ() {
  const faqButtons = $$(
    ".faq-question, [data-faq-toggle]"
  );

  faqButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const answerId = button.getAttribute("aria-controls");

      let answer = answerId
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

/* ---------- 11. Copy Text ---------- */

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
        console.error("Could not copy text:", error);
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
        behavior: window.matchMedia(
          "(prefers-reduced-motion: reduce)"
        ).matches
          ? "auto"
          : "smooth",
        block: "start"
      });

      if (history.replaceState) {
        history.replaceState(null, "", href);
      }
    });
  });
}

/* ---------- 14. Loading State ---------- */

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

/* ---------- 15. Initialize Everything ---------- */

onReady(() => {
  updateCurrentYear();
  initMobileNavigation();
  initCardSearch();
  initCategoryFilters();
  initScrollReveal();
  initBackToTop();
  initActiveNavigation();
  initClickableCards();
  initFAQ();
  initCopyButtons();
  initImageFallbacks();
  initSmoothAnchors();
  initPageLoadedState();

  console.info("COSMOS JavaScript initialized.");
});
