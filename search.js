
"use strict";

/*
 * COSMOS Global Search + Favorites
 * Storage key is uniquely prefixed to avoid collisions with other projects.
 */

const COSMOS_SEARCH_CONFIG = {
  storageKey: "cosmosGlobalSearchFavoritesV1",
  homeUrl: "./index.html"
};

const COSMOS_CATALOG = [
  {
    id: "home",
    title: "COSMOS Home",
    category: "site",
    icon: "✦",
    description: "Return to the main COSMOS experience and discover the universe.",
    url: "./index.html",
    destination: "Main website",
    keywords: "home cosmos universe space landing welcome"
  },
  {
    id: "planets",
    title: "Explore Planets",
    category: "planets",
    icon: "🪐",
    description: "Explore the planets of our Solar System and learn about their worlds.",
    url: "./planets.html",
    destination: "Solar System",
    keywords: "planet planets mercury venus earth mars jupiter saturn uranus neptune solar system orbit atmosphere"
  },
  {
    id: "missions",
    title: "Space Missions",
    category: "missions",
    icon: "🚀",
    description: "Discover spacecraft, exploration missions and humanity's journey into space.",
    url: "./missions.html",
    destination: "Mission control",
    keywords: "mission missions nasa spacecraft satellite rover rocket moon mars voyager exploration launch astronaut"
  },
  {
    id: "research",
    title: "Space Research",
    category: "research",
    icon: "🔬",
    description: "Explore scientific ideas, astronomy, cosmic discoveries and space research.",
    url: "./research.html",
    destination: "Research lab",
    keywords: "research science astronomy astrophysics galaxy galaxies black hole nebula star stars universe cosmology"
  },
  {
    id: "about",
    title: "About COSMOS",
    category: "site",
    icon: "🌌",
    description: "Learn about the COSMOS project, its purpose and the people behind it.",
    url: "./about.html",
    destination: "About the project",
    keywords: "about project team information purpose contact cosmos"
  },
  {
    id: "mercury",
    title: "Mercury",
    category: "planets",
    icon: "☿",
    description: "Discover the smallest planet and the closest world to the Sun.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "mercury smallest planet closest sun rocky terrestrial"
  },
  {
    id: "venus",
    title: "Venus",
    category: "planets",
    icon: "♀",
    description: "Explore the hot, cloud-covered world with an extremely dense atmosphere.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "venus atmosphere greenhouse effect hottest planet clouds"
  },
  {
    id: "earth",
    title: "Earth",
    category: "planets",
    icon: "🌍",
    description: "Learn about our home planet, its oceans, atmosphere and place in space.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "earth home planet life oceans atmosphere water blue planet"
  },
  {
    id: "mars",
    title: "Mars",
    category: "planets",
    icon: "🔴",
    description: "Investigate the Red Planet, its surface, ancient water and robotic explorers.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "mars red planet rover curiosity perseverance water exploration nasa"
  },
  {
    id: "jupiter",
    title: "Jupiter",
    category: "planets",
    icon: "🟠",
    description: "Explore the Solar System's largest planet and its powerful storms.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "jupiter gas giant great red spot moons europa ganymede"
  },
  {
    id: "saturn",
    title: "Saturn",
    category: "planets",
    icon: "🪐",
    description: "Discover Saturn's spectacular rings and its many moons.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "saturn rings titan enceladus gas giant moons"
  },
  {
    id: "uranus",
    title: "Uranus",
    category: "planets",
    icon: "🔵",
    description: "Explore the distant ice giant that rotates on an unusual tilt.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "uranus ice giant atmosphere rotation tilt outer planet"
  },
  {
    id: "neptune",
    title: "Neptune",
    category: "planets",
    icon: "🔹",
    description: "Travel to the distant blue ice giant at the edge of the planetary region.",
    url: "./planets.html",
    destination: "Planet guide",
    keywords: "neptune blue ice giant winds outer solar system"
  },
  {
    id: "nasa",
    title: "NASA Exploration",
    category: "missions",
    icon: "🛰️",
    description: "Find the COSMOS missions section and explore humanity's space exploration.",
    url: "./missions.html",
    destination: "Mission control",
    keywords: "nasa space agency missions rovers probes astronauts moon mars voyager"
  },
  {
    id: "galaxies",
    title: "Galaxies & the Universe",
    category: "research",
    icon: "🌌",
    description: "Explore enormous collections of stars and the structure of the universe.",
    url: "./research.html",
    destination: "Research lab",
    keywords: "galaxy galaxies milky way universe stars deep space cosmology"
  },
  {
    id: "black-holes",
    title: "Black Holes",
    category: "research",
    icon: "⚫",
    description: "Investigate regions of space where gravity is so strong that light cannot escape.",
    url: "./research.html",
    destination: "Research lab",
    keywords: "black hole gravity event horizon astrophysics singularity space science"
  },
  {
    id: "stars",
    title: "Stars & Nebulae",
    category: "research",
    icon: "⭐",
    description: "Learn how stars form, evolve and illuminate vast clouds of cosmic gas and dust.",
    url: "./research.html",
    destination: "Research lab",
    keywords: "stars nebula star formation supernova gas dust astronomy"
  }
];

const searchInput = document.getElementById("searchInput");
const clearSearchButton = document.getElementById("clearSearch");
const resultsGrid = document.getElementById("resultsGrid");
const resultCounter = document.getElementById("resultCounter");
const favoriteCount = document.getElementById("favoriteCount");
const favoritesToggle = document.getElementById("favoritesToggle");
const activeStatus = document.getElementById("activeStatus");
const emptyState = document.getElementById("emptyState");
const emptyTitle = document.getElementById("emptyTitle");
const emptyMessage = document.getElementById("emptyMessage");
const resetSearchButton = document.getElementById("resetSearch");

let activeFilter = "all";
let favoritesOnly = false;
let favoriteIds = loadFavorites();

const CATEGORY_LABELS = {
  planets: "Planets",
  missions: "Missions",
  research: "Research",
  site: "COSMOS"
};

const CATEGORY_STYLES = {
  planets: {
    accent: "#72e6ff",
    glow: "rgba(114, 230, 255, .13)",
    surface: "rgba(114, 230, 255, .07)",
    border: "rgba(114, 230, 255, .18)"
  },
  missions: {
    accent: "#a99aff",
    glow: "rgba(169, 154, 255, .14)",
    surface: "rgba(169, 154, 255, .07)",
    border: "rgba(169, 154, 255, .19)"
  },
  research: {
    accent: "#70f2c2",
    glow: "rgba(112, 242, 194, .12)",
    surface: "rgba(112, 242, 194, .06)",
    border: "rgba(112, 242, 194, .18)"
  },
  site: {
    accent: "#ff83c7",
    glow: "rgba(255, 131, 199, .13)",
    surface: "rgba(255, 131, 199, .06)",
    border: "rgba(255, 131, 199, .18)"
  }
};

function loadFavorites() {
  try {
    const saved = localStorage.getItem(COSMOS_SEARCH_CONFIG.storageKey);
    const parsed = saved ? JSON.parse(saved) : [];

    if (!Array.isArray(parsed)) {
      return new Set();
    }

    const validIds = new Set(COSMOS_CATALOG.map(item => item.id));
    return new Set(parsed.filter(id => validIds.has(id)));
  } catch (error) {
    console.warn("COSMOS: favorites could not be loaded.", error);
    return new Set();
  }
}

function saveFavorites() {
  try {
    localStorage.setItem(
      COSMOS_SEARCH_CONFIG.storageKey,
      JSON.stringify([...favoriteIds])
    );
  } catch (error) {
    console.warn("COSMOS: favorites could not be saved.", error);
    activeStatus.hidden = false;
    activeStatus.textContent =
      "Your browser could not save favorites. Check your browser storage settings.";
  }
}

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getVisibleItems() {
  const query = normalizeText(searchInput.value);
  const terms = query.split(/\s+/).filter(Boolean);

  return COSMOS_CATALOG.filter(item => {
    const matchesCategory =
      activeFilter === "all" || item.category === activeFilter;

    const matchesFavorites =
      !favoritesOnly || favoriteIds.has(item.id);

    const searchableText = normalizeText([
      item.title,
      item.category,
      CATEGORY_LABELS[item.category],
      item.description,
      item.destination,
      item.keywords
    ].join(" "));

    const matchesQuery = terms.every(term => searchableText.includes(term));

    return matchesCategory && matchesFavorites && matchesQuery;
  });
}

function createCard(item, index) {
  const style = CATEGORY_STYLES[item.category] || CATEGORY_STYLES.site;
  const isFavorite = favoriteIds.has(item.id);

  const card = document.createElement("article");
  card.className = "result-card";
  card.style.animationDelay = `${Math.min(index * 35, 280)}ms`;
  card.style.setProperty("--card-accent", style.accent);
  card.style.setProperty("--card-glow", style.glow);
  card.style.setProperty("--card-surface", style.surface);
  card.style.setProperty("--card-border", style.border);

  const top = document.createElement("div");
  top.className = "card-top";

  const category = document.createElement("span");
  category.className = "category-label";
  category.textContent = CATEGORY_LABELS[item.category] || "COSMOS";

  const favoriteButton = document.createElement("button");
  favoriteButton.type = "button";
  favoriteButton.className = `favorite-btn${isFavorite ? " is-favorite" : ""}`;
  favoriteButton.setAttribute("aria-pressed", String(isFavorite));
  favoriteButton.setAttribute(
    "aria-label",
    isFavorite
      ? `Remove ${item.title} from favorites`
      : `Add ${item.title} to favorites`
  );
  favoriteButton.title = isFavorite ? "Remove from favorites" : "Add to favorites";
  favoriteButton.textContent = isFavorite ? "♥" : "♡";

  favoriteButton.addEventListener("click", () => {
    toggleFavorite(item.id);
  });

  top.append(category, favoriteButton);

  const symbol = document.createElement("div");
  symbol.className = "card-symbol";
  symbol.setAttribute("aria-hidden", "true");
  symbol.textContent = item.icon;

  const title = document.createElement("h3");
  title.textContent = item.title;

  const description = document.createElement("p");
  description.className = "card-description";
  description.textContent = item.description;

  const footer = document.createElement("div");
  footer.className = "card-footer";

  const destination = document.createElement("span");
  destination.className = "card-destination";
  destination.textContent = item.destination;

  const link = document.createElement("a");
  link.className = "card-link";
  link.href = item.url;
  link.textContent = "Explore ";

  const arrow = document.createElement("span");
  arrow.textContent = "↗";
  arrow.setAttribute("aria-hidden", "true");
  link.appendChild(arrow);

  footer.append(destination, link);
  card.append(top, symbol, title, description, footer);

  return card;
}

function renderResults() {
  const items = getVisibleItems();
  const fragment = document.createDocumentFragment();

  items.forEach((item, index) => {
    fragment.appendChild(createCard(item, index));
  });

  resultsGrid.replaceChildren(fragment);

  const count = items.length;
  resultCounter.textContent =
    `${count} ${count === 1 ? "discovery" : "discoveries"}`;

  favoriteCount.textContent = String(favoriteIds.size);
  favoritesToggle.setAttribute("aria-pressed", String(favoritesOnly));
  clearSearchButton.hidden = searchInput.value.length === 0;

  const hasQuery = searchInput.value.trim().length > 0;

  if (favoritesOnly) {
    activeStatus.hidden = false;
    activeStatus.textContent =
      `Showing saved favorites${hasQuery ? ` matching “${searchInput.value.trim()}”` : ""}.`;
  } else if (hasQuery) {
    activeStatus.hidden = false;
    activeStatus.textContent =
      `Search results for “${searchInput.value.trim()}”.`;
  } else {
    activeStatus.hidden = true;
    activeStatus.textContent = "";
  }

  emptyState.hidden = count !== 0;

  if (count === 0) {
    if (favoritesOnly && favoriteIds.size === 0) {
      emptyTitle.textContent = "Your favorites list is empty";
      emptyMessage.textContent =
        "Press the heart on any discovery card to save it here.";
    } else if (favoritesOnly) {
      emptyTitle.textContent = "No matching favorites";
      emptyMessage.textContent =
        "Try a different search or explore all your saved discoveries.";
    } else {
      emptyTitle.textContent = "No discoveries found";
      emptyMessage.textContent =
        "Try another search term or select a different category.";
    }
  }
}

function toggleFavorite(id) {
  if (favoriteIds.has(id)) {
    favoriteIds.delete(id);
  } else {
    favoriteIds.add(id);
  }

  saveFavorites();
  renderResults();
}

function setFilter(filter) {
  activeFilter = filter;

  document.querySelectorAll(".filter-btn").forEach(button => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  renderResults();
}

searchInput.addEventListener("input", renderResults);

clearSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  renderResults();
});

document.querySelectorAll(".filter-btn").forEach(button => {
  button.addEventListener("click", () => {
    setFilter(button.dataset.filter);
  });
});

document.querySelectorAll(".tag[data-query]").forEach(button => {
  button.addEventListener("click", () => {
    searchInput.value = button.dataset.query;
    favoritesOnly = false;
    renderResults();
    searchInput.focus();
  });
});

favoritesToggle.addEventListener("click", () => {
  favoritesOnly = !favoritesOnly;
  renderResults();
});

resetSearchButton.addEventListener("click", () => {
  searchInput.value = "";
  activeFilter = "all";
  favoritesOnly = false;
  setFilter("all");
  renderResults();
  searchInput.focus();
});

document.addEventListener("keydown", event => {
  const target = event.target;
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
     ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !isTyping && !event.ctrlKey &&
      !event.metaKey && !event.altKey) {
    event.preventDefault();
    searchInput.focus();
  }

  if (event.key === "Escape" && target === searchInput) {
    if (searchInput.value) {
      searchInput.value = "";
      renderResults();
    } else {
      searchInput.blur();
    }
  }
});

/* Update the page if favorites are changed in another COSMOS tab. */
window.addEventListener("storage", event => {
  if (event.key === COSMOS_SEARCH_CONFIG.storageKey) {
    favoriteIds = loadFavorites();
    renderResults();
  }
});

/* First render */
document.querySelectorAll(".filter-btn").forEach(button => {
  button.setAttribute(
    "aria-pressed",
    String(button.dataset.filter === activeFilter)
  );
});

renderResults();
