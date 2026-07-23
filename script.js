const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");
const navLinks = [...document.querySelectorAll(".desktop-nav a")];
const copyButtons = [...document.querySelectorAll(".copy-button")];
const year = document.querySelector("#year");
const aboutSection = document.querySelector("#about");
const heroSection = document.querySelector(".hero");
const heroReveal = document.querySelector(".hero-reveal");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function updateHeader() {
  const switchPoint = aboutSection.offsetTop - Math.min(window.innerHeight * 0.3, 220);
  header.classList.toggle("is-scrolled", window.scrollY >= switchPoint);
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.hidden = true;
  header.classList.remove("menu-open");
  document.body.classList.remove("menu-locked");
}

const spotlight = {
  targetX: 0,
  targetY: 0,
  currentX: 0,
  currentY: 0,
  frame: 0,
  initialized: false,
};

function writeSpotlightPosition(x, y) {
  heroSection.style.setProperty("--spot-x", `${x}px`);
  heroSection.style.setProperty("--spot-y", `${y}px`);

  if (!reduceMotion.matches) {
    const rect = heroSection.getBoundingClientRect();
    const sceneX = (0.5 - x / Math.max(rect.width, 1)) * 12;
    const sceneY = (0.5 - y / Math.max(rect.height, 1)) * 7;
    heroSection.style.setProperty("--scene-x", `${sceneX}px`);
    heroSection.style.setProperty("--scene-y", `${sceneY}px`);
  }
}

function setInitialSpotlight() {
  const rect = heroSection.getBoundingClientRect();
  spotlight.targetX = rect.width * 0.68;
  spotlight.targetY = rect.height * 0.49;
  spotlight.currentX = spotlight.targetX;
  spotlight.currentY = spotlight.targetY;
  spotlight.initialized = true;
  writeSpotlightPosition(spotlight.currentX, spotlight.currentY);
}

function renderSpotlight() {
  spotlight.currentX += (spotlight.targetX - spotlight.currentX) * 0.1;
  spotlight.currentY += (spotlight.targetY - spotlight.currentY) * 0.1;
  writeSpotlightPosition(spotlight.currentX, spotlight.currentY);

  const distance = Math.abs(spotlight.targetX - spotlight.currentX) + Math.abs(spotlight.targetY - spotlight.currentY);
  if (distance > 0.2) {
    spotlight.frame = window.requestAnimationFrame(renderSpotlight);
  } else {
    spotlight.frame = 0;
  }
}

function moveSpotlight(event) {
  if (!heroReveal) return;
  heroSection.classList.add("is-interacting");
  const rect = heroSection.getBoundingClientRect();
  spotlight.targetX = Math.min(Math.max(event.clientX - rect.left, 0), rect.width);
  spotlight.targetY = Math.min(Math.max(event.clientY - rect.top, 0), rect.height);

  if (reduceMotion.matches) {
    spotlight.currentX = spotlight.targetX;
    spotlight.currentY = spotlight.targetY;
    writeSpotlightPosition(spotlight.currentX, spotlight.currentY);
    return;
  }

  if (!spotlight.frame) spotlight.frame = window.requestAnimationFrame(renderSpotlight);
}

setInitialSpotlight();
updateHeader();
year.textContent = String(new Date().getFullYear());
window.addEventListener("scroll", updateHeader, { passive: true });
window.addEventListener("resize", () => {
  updateHeader();
  if (!spotlight.initialized || window.scrollY < heroSection.offsetHeight) setInitialSpotlight();
});
heroSection.addEventListener("pointerenter", (event) => {
  heroSection.classList.add("is-interacting");
  moveSpotlight(event);
}, { passive: true });
heroSection.addEventListener("pointermove", moveSpotlight, { passive: true });
heroSection.addEventListener("pointerleave", () => {
  heroSection.classList.remove("is-interacting");
  if (spotlight.frame) window.cancelAnimationFrame(spotlight.frame);
  spotlight.frame = 0;
  heroSection.style.setProperty("--scene-x", "0px");
  heroSection.style.setProperty("--scene-y", "0px");
}, { passive: true });

menuButton.addEventListener("click", () => {
  const willOpen = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(willOpen));
  mobileMenu.hidden = !willOpen;
  header.classList.toggle("menu-open", willOpen);
  document.body.classList.toggle("menu-locked", willOpen);
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-42% 0px -52% 0px", threshold: 0 }
);

document.querySelectorAll("main section[id]").forEach((section) => sectionObserver.observe(section));

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  },
  { rootMargin: "0px 0px -8%", threshold: 0.08 }
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const approachFan = document.querySelector("[data-approach-fan]");

if (approachFan) {
  const fanTabs = [...approachFan.querySelectorAll(".fan-sector")];
  const fanContent = approachFan.querySelector(".fan-content");
  const fanCount = approachFan.querySelector(".fan-count");
  const fanTitle = fanContent.querySelector("h3");
  const fanDescription = fanContent.querySelector("p");
  const fanPrevious = approachFan.querySelector("[data-fan-prev]");
  const fanNext = approachFan.querySelector("[data-fan-next]");
  let fanIndex = 0;
  let fanChangeTimer = 0;

  function showApproach(nextIndex) {
    fanIndex = (nextIndex + fanTabs.length) % fanTabs.length;
    const activeTab = fanTabs[fanIndex];
    approachFan.dataset.active = String(fanIndex);
    fanTabs.forEach((tab, index) => tab.classList.toggle("is-active", index === fanIndex));
    fanContent.classList.add("is-changing");
    window.clearTimeout(fanChangeTimer);
    fanChangeTimer = window.setTimeout(() => {
      fanCount.textContent = `${String(fanIndex + 1).padStart(2, "0")} / ${String(fanTabs.length).padStart(2, "0")}`;
      fanTitle.textContent = activeTab.dataset.title;
      fanDescription.textContent = activeTab.dataset.description;
      fanContent.classList.remove("is-changing");
    }, reduceMotion.matches ? 0 : 150);
  }

  fanTabs.forEach((tab, index) => {
    tab.addEventListener("pointerenter", () => showApproach(index), { passive: true });
    tab.addEventListener("click", () => showApproach(index));
    tab.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      showApproach(index);
    });
  });
  fanPrevious.addEventListener("click", () => showApproach(fanIndex - 1));
  fanNext.addEventListener("click", () => showApproach(fanIndex + 1));
}

const trailStage = document.querySelector("[data-trail-stage]");

if (trailStage) {
  const trailImages = [
    "assets/xiangcanyan/portfolio-03.webp",
    "assets/xiangcanyan/portfolio-05.webp",
    "assets/xiangcanyan/portfolio-07.webp",
    "assets/xiangcanyan/portfolio-09.webp",
    "assets/xiangcanyan/portfolio-11.webp",
    "assets/xiangcanyan/portfolio-13.webp",
    "assets/xiangcanyan/portfolio-15.webp",
    "assets/xiangcanyan/portfolio-17.webp",
    "assets/xiangcanyan/portfolio-19.webp",
    "assets/xiangcanyan/portfolio-21.webp",
    "assets/xiangcanyan/portfolio-23.webp",
  ];
  const canTrail = window.matchMedia("(hover: hover) and (pointer: fine)");
  let trailIndex = 0;
  let trailLayer = 10;
  let previousPoint = null;
  const activeTrailCards = [];
  const spacing = reduceMotion.matches ? 52 : 36;
  const cardLimit = reduceMotion.matches ? 10 : 16;

  const removeTrailCard = (image) => {
    const cardIndex = activeTrailCards.indexOf(image);
    if (cardIndex >= 0) activeTrailCards.splice(cardIndex, 1);
    image.remove();
  };

  const spawnTrailCard = (x, y, direction = 0) => {
    const image = document.createElement("img");
    image.className = "trail-card";
    image.src = trailImages[trailIndex % trailImages.length];
    image.alt = "";
    image.setAttribute("aria-hidden", "true");
    image.style.setProperty("--trail-x", `${x}px`);
    image.style.setProperty("--trail-y", `${y}px`);
    image.style.setProperty("--trail-rotate", `${Math.round(Math.random() * 10 - 5)}deg`);
    image.style.setProperty("--trail-drift-x", `${Math.cos(direction) * -18}px`);
    image.style.setProperty("--trail-drift-y", `${Math.sin(direction) * -18 - 12}px`);
    image.style.zIndex = `${trailLayer}`;
    trailStage.appendChild(image);
    activeTrailCards.push(image);
    trailIndex += 1;
    trailLayer += 1;

    image.addEventListener("animationend", () => removeTrailCard(image), { once: true });
    if (activeTrailCards.length > cardLimit) {
      const oldestCard = activeTrailCards.shift();
      oldestCard.classList.add("trail-card-expire");
    }
  };

  trailStage.addEventListener("pointerenter", (event) => {
    if (!canTrail.matches) return;
    const rect = trailStage.getBoundingClientRect();
    previousPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    trailStage.classList.add("is-tracing");
    spawnTrailCard(previousPoint.x, previousPoint.y);
  }, { passive: true });

  trailStage.addEventListener("pointermove", (event) => {
    if (!canTrail.matches) return;
    const rect = trailStage.getBoundingClientRect();
    const currentPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    if (!previousPoint) previousPoint = currentPoint;

    const deltaX = currentPoint.x - previousPoint.x;
    const deltaY = currentPoint.y - previousPoint.y;
    const distance = Math.hypot(deltaX, deltaY);
    if (distance < spacing) return;

    const direction = Math.atan2(deltaY, deltaX);
    const steps = Math.min(4, Math.floor(distance / spacing));
    for (let step = 1; step <= steps; step += 1) {
      const progress = step / steps;
      spawnTrailCard(
        previousPoint.x + deltaX * progress,
        previousPoint.y + deltaY * progress,
        direction,
      );
    }
    previousPoint = currentPoint;
  }, { passive: true });

  trailStage.addEventListener("pointerleave", () => {
    previousPoint = null;
    trailStage.classList.remove("is-tracing");
    activeTrailCards.forEach((card) => card.classList.add("trail-card-expire"));
  }, { passive: true });
}

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  const copied = document.execCommand("copy");
  field.remove();
  if (!copied) throw new Error("Copy failed");
}

copyButtons.forEach((copyButton) => {
  copyButton.addEventListener("click", async () => {
    const originalText = copyButton.textContent;
    try {
      await copyText(copyButton.dataset.copy);
      copyButton.textContent = "已复制";
      copyButton.classList.add("is-copied");
    } catch {
      copyButton.textContent = "请手动复制";
    }

    window.setTimeout(() => {
      copyButton.textContent = originalText;
      copyButton.classList.remove("is-copied");
    }, 1800);
  });
});

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("figure img");
const lightboxCount = lightbox.querySelector(".lightbox-count");
const lightboxTitle = lightbox.querySelector(".lightbox-title");
const closeButton = lightbox.querySelector(".lightbox-close");
const previousButton = lightbox.querySelector(".lightbox-prev");
const nextButton = lightbox.querySelector(".lightbox-next");
const galleries = new Map();
let activeGallery = [];
let activeIndex = 0;

document.querySelectorAll("[data-gallery-id]").forEach((container) => {
  galleries.set(
    container.dataset.galleryId,
    [...container.querySelectorAll("img")].map((image) => ({ src: image.src, alt: image.alt }))
  );
});

function renderLightbox() {
  const item = activeGallery[activeIndex];
  if (!item) return;
  lightboxImage.src = item.src;
  lightboxImage.alt = item.alt;
  lightboxCount.textContent = `${activeIndex + 1} / ${activeGallery.length}`;
  lightboxTitle.textContent = item.alt;
  previousButton.disabled = activeIndex === 0;
  nextButton.disabled = activeIndex === activeGallery.length - 1;
}

function openLightbox(galleryId, index) {
  activeGallery = galleries.get(galleryId) || [];
  activeIndex = Math.min(Math.max(index, 0), activeGallery.length - 1);
  if (!activeGallery.length) return;
  renderLightbox();
  lightbox.showModal();
  document.body.classList.add("lightbox-open");
}

function closeLightbox() {
  lightbox.close();
  document.body.classList.remove("lightbox-open");
}

document.querySelectorAll("[data-gallery]").forEach((button) => {
  button.addEventListener("click", () => {
    openLightbox(button.dataset.gallery, Number(button.dataset.index || 0));
  });
});

closeButton.addEventListener("click", closeLightbox);
previousButton.addEventListener("click", () => {
  if (activeIndex > 0) {
    activeIndex -= 1;
    renderLightbox();
  }
});
nextButton.addEventListener("click", () => {
  if (activeIndex < activeGallery.length - 1) {
    activeIndex += 1;
    renderLightbox();
  }
});

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

lightbox.addEventListener("close", () => {
  document.body.classList.remove("lightbox-open");
});

window.addEventListener("keydown", (event) => {
  if (!lightbox.open) return;
  if (event.key === "ArrowLeft" && activeIndex > 0) {
    activeIndex -= 1;
    renderLightbox();
  }
  if (event.key === "ArrowRight" && activeIndex < activeGallery.length - 1) {
    activeIndex += 1;
    renderLightbox();
  }
});
