const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const mobileMenu = document.querySelector("#mobile-menu");
const navLinks = [...document.querySelectorAll(".nav-links a")];
const copyButton = document.querySelector(".copy-button");
const year = document.querySelector("#year");

function updateHeader() {
  header.classList.toggle("is-scrolled", window.scrollY > 24);
}

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  mobileMenu.hidden = true;
  header.classList.remove("menu-open");
  document.body.classList.remove("menu-locked");
}

updateHeader();
year.textContent = String(new Date().getFullYear());
window.addEventListener("scroll", updateHeader, { passive: true });

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  mobileMenu.hidden = isOpen;
  header.classList.toggle("menu-open", !isOpen);
  document.body.classList.toggle("menu-locked", !isOpen);
});

mobileMenu.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", closeMenu);
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
);

document.querySelectorAll("main section[id]").forEach((section) => observer.observe(section));

async function copyText(value) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      // Fall back below when the browser blocks clipboard permissions.
    }
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

  if (!copied) {
    throw new Error("Copy command failed");
  }
}

copyButton.addEventListener("click", async () => {
  const value = copyButton.dataset.copy;
  const originalText = copyButton.textContent;

  try {
    await copyText(value);
    copyButton.textContent = "已复制";
    copyButton.classList.add("is-copied");
  } catch {
    copyButton.textContent = "请手动复制上方邮箱";
  }

  window.setTimeout(() => {
    copyButton.textContent = originalText;
    copyButton.classList.remove("is-copied");
  }, 1800);
});
