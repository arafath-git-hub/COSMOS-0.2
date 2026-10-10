
/* =========================================
   COSMOS — Shared JavaScript
   Lightweight interactions and animations
========================================= */

(() => {
  "use strict";

  function initRevealAnimations() {
    const elements = document.querySelectorAll(
      ".reveal, [data-reveal]"
    );

    if (!elements.length) return;

    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      elements.forEach((element) => {
        element.classList.add("visible", "is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries, currentObserver) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible", "is-visible");
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

  function initCurrentNavigation() {
    const currentFile = (
      window.location.pathname.split("/").pop() || "index.html"
    ).toLowerCase();

    document.querySelectorAll("nav a[href]").forEach((link) => {
      const href = link.getAttribute("href");

      if (!href || href.startsWith("http") || href.startsWith("#")) {
        return;
      }

      const linkFile = href.split("/").pop().split("?")[0].toLowerCase();

      if (linkFile === currentFile) {
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function initBackToTop() {
    const button = document.querySelector(
      "[data-back-to-top], #backToTop"
    );

    if (!button) return;

    button.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    });
  }

  function initExternalLinks() {
    document.querySelectorAll('a[target="_blank"]').forEach((link) => {
      const rel = new Set(
        (link.getAttribute("rel") || "").split(/\s+/).filter(Boolean)
      );

      rel.add("noopener");
      rel.add("noreferrer");

      link.setAttribute("rel", [...rel].join(" "));
    });
  }

  function init() {
    initRevealAnimations();
    initCurrentNavigation();
    initBackToTop();
    initExternalLinks();

    document.documentElement.classList.add("cosmos-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
