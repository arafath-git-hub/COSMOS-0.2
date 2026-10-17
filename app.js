
/* ==========================================
   COSMOS — Global JavaScript
   Home | Planets | Missions | Research
   GitHub Pages compatible
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
  const links = $$(
    "header nav a, .main-nav a, .nav-links a, " +
    ".nav-menu a, .links a, .nav a, nav ul a"
  );

  if (!links.length) return;

  const currentFile =
    window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const href = link.getAttribute("href");

    if (
      !href ||
      href.startsWith("#") ||
      href.startsWith("javascript:")
    ) {
      return;
    }

    try {
      const url = new URL(href, window.location.href);
      const linkFile = url.pathname.split("/").pop() || "index.html";

      if (
        url.origin === window.location.origin &&
        linkFile.toLowerCase() === currentFile.toLowerCase()
      ) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");

        if (link.getAttribute("aria-current") === "page") {
          link.removeAttribute("aria-current");
        }
      }
    } catch (error) {
      console.warn("COSMOS: Invalid navigation URL.", href);
    }
  });
}

/* ---------- 4. Responsive Navigation ---------- */

function findNavigationForToggle(toggle) {
  // First preference: navigation referenced by aria-controls.
  const controlledId = toggle.getAttribute("aria-controls");

  if (controlledId) {
    const controlledElement = document.getElementById(controlledId);

    if (controlledElement) return controlledElement;
  }

  // Support the common navigation IDs used across COSMOS pages.
  const knownIds = [
    "cosmosNav",
    "mainNav",
    "navMenu",
    "navLinks",
    "navList"
  ];

  for (const id of knownIds) {
    const element = document.getElementById(id);

    if (element) {
      const sameHeader =
        !toggle.closest("header") ||
        toggle.closest("header").contains(element);

      if (sameHeader) return element;
    }
  }

  // Search within the same header before searching the whole page.
  const header = toggle.closest("header");

  const navigationSelector = [
    "nav.main-nav",
    "nav.nav-menu",
    "nav.nav-links",
    "nav.links",
    "nav#mainNav",
    "nav#cosmosNav",
    "nav#navMenu",
    "nav#navLinks",
    "nav[aria-label='Main navigation']",
    "nav"
  ].join(", ");

  if (header) {
    const headerNavigation = $(navigationSelector, header);

    if (headerNavigation) return headerNavigation;
  }

  // Fallback for pages whose navigation sits outside a header.
  return (
    $(navigationSelector) ||
    $(".main-nav") ||
    $(".nav-menu") ||
    $(".nav-links") ||
    $(".links")
  );
}

function initMobileNavigation() {
  const toggles = $$(
    "#menuToggle, #navToggle, .menu-toggle, " +
    ".nav-toggle, [data-menu-toggle]"
  );

  if (!toggles.length) return;

  toggles.forEach((toggle) => {
    // Prevent duplicate listeners if initialization runs again.
    if (toggle.dataset.cosmosMenuInitialized === "true") return;

    const navigation = findNavigationForToggle(toggle);

    if (!navigation) {
      console.warn(
        "COSMOS: Navigation not found for menu button.",
        toggle
      );
      return;
    }

    toggle.dataset.cosmosMenuInitialized = "true";

    if (!toggle.hasAttribute("aria-expanded")) {
      toggle.setAttribute("aria-expanded", "false");
    }

    if (!toggle.hasAttribute("aria-label")) {
      toggle.setAttribute("aria-label", "Open navigation menu");
    }

    const initiallyOpen =
      navigation.classList.contains("is-open") ||
      navigation.classList.contains("open") ||
      navigation.classList.contains("show");

    toggle.setAttribute("aria-expanded", String(initiallyOpen));

    function isOpen() {
      return (
        navigation.classList.contains("is-open") ||
        navigation.classList.contains("open") ||
        navigation.classList.contains("show") ||
        navigation.classList.contains("active")
      );
    }

    function setMenuState(open) {
      // Multiple class names support the different COSMOS page styles.
      navigation.classList.toggle("is-open", open);
      navigation.classList.toggle("open", open);
      navigation.classList.toggle("show", open);
      navigation.classList.toggle("active", open);

      toggle.classList.toggle("open", open);
      toggle.classList.toggle("active", open);

      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute(
        "aria-label",
        open ? "Close navigation menu" : "Open navigation menu"
      );

      // Keep keyboard navigation consistent with the menu state.
      if (open) {
        navigation.removeAttribute("inert");
      } else {
        navigation.removeAttribute("inert");
      }
    }

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();

      setMenuState(!isOpen());
    });

    navigation.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        setMenuState(false);
      });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && isOpen()) {
        setMenuState(false);
        toggle.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        isOpen() &&
        !navigation.contains(event.target) &&
        !toggle.contains(event.target)
      ) {
        setMenuState(false);
      }
    });

    // Close the menu when switching to a wider layout.
    window.addEventListener("resize", () => {
      if (window.innerWidth > 900 && isOpen()) {
        setMenuState(false);
      }
    });

    // Keep the button state synchronized with the actual menu state.
    setMenuState(isOpen());
  });
}

/* ---------- 5. Shared Card Collection ---------- */

function getSearchableCards() {
  return [
    ...new Set([
      ...$$("[data-searchable]"),
      ...$$(".planet-card"),
      ...$$(".mission-card"),
      ...$$(".research-card"),
      ...$$(".info-card"),
      ...$$(".content-card")
    ])
  ];
}

/* ---------- 6. Card Search ---------- */

function initCardSearch() {
  const inputs = [
    ...$$("[data-search-input]"),
    $("#searchInput"),
    $("#planetSearch"),
    $("#missionSearch"),
    $("#researchSearch")
  ].filter(Boolean);

  const searchInputs = [...new Set(inputs)];
  const cards = getSearchableCards();

  if (!searchInputs.length || !cards.length) return;

  searchInputs.forEach((input) => {
    if (input.dataset.cosmosSearchInitialized === "true") return;

    input.dataset.cosmosSearchInitialized = "true";

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

/* ---------- 7. Category Filters ---------- */

function initCategoryFilters() {
  const buttons = $$(
    "[data-filter], .filter-btn, .filter-button, .category-btn"
  );

  if (!buttons.length) return;

  const cards = getSearchableCards();

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
    if (button.dataset.cosmosFilterInitialized === "true") return;

    button.dataset.cosmosFilterInitialized = "true";

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

  if (
    searchInput &&
    searchInput.dataset.cosmosFilterSearchInitialized !== "true"
  ) {
    searchInput.dataset.cosmosFilterSearchInitialized = "true";
    searchInput.addEventListener("input", applyFilters);
  }

  applyFilters();
}

/* ---------- 8. Scroll Reveal ---------- */

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

/* ---------- 9. Back to Top ---------- */

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

  if (button.dataset.cosmosBackToTopInitialized === "true") return;

  button.dataset.cosmosBackToTopInitialized = "true";

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

/* ---------- 10. Clickable Cards ---------- */

function initClickableCards() {
  $$("[data-card-link]").forEach((card) => {
    if (card.dataset.cosmosCardInitialized === "true") return;

    card.dataset.cosmosCardInitialized = "true";

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

/* ---------- 11. FAQ Accordion ---------- */

function initFAQ() {
  $$(".faq-question, [data-faq-toggle]").forEach((button) => {
    if (button.dataset.cosmosFAQInitialized === "true") return;

    button.dataset.cosmosFAQInitialized = "true";

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

/* ---------- 12. Copy Buttons ---------- */

function initCopyButtons() {
  $$("[data-copy]").forEach((button) => {
    if (button.dataset.cosmosCopyInitialized === "true") return;

    button.dataset.cosmosCopyInitialized = "true";

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

/* ---------- 13. Image Fallback ---------- */

function initImageFallbacks() {
  $$("img").forEach((image) => {
    if (image.dataset.cosmosImageInitialized === "true") return;

    image.dataset.cosmosImageInitialized = "true";

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

/* ---------- 14. Smooth Anchor Scrolling ---------- */

function initSmoothAnchors() {
  $$('a[href^="#"]').forEach((link) => {
    if (link.dataset.cosmosAnchorInitialized === "true") return;

    link.dataset.cosmosAnchorInitialized = "true";

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

/* ---------- 15. Page Loading State ---------- */

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

/* ---------- 16. Global Error Reporting ---------- */

window.addEventListener("error", (event) => {
  console.error("COSMOS JavaScript error:", event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  console.error("COSMOS asynchronous error:", event.reason);
});

/* ---------- 17. Initialize All Features ---------- */

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
