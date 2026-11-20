
let CATEGORY_IMAGES = {};

const MENU_CACHE_KEY = "tanit-menu-v1";
const MENU_TIMEOUT_MS = 30000;

function menuFromRows(rows) {
  const blocks = rows
    .filter((c) => c && Array.isArray(c.items) && c.items.length > 0)
    .map((c) => {
      const category = String(c.name_fr || "").trim();
      const lines = c.items.map((it) => {
        const name = String(it.name_fr || "").trim();
        const base = baseName(name);
        const label = base !== name ? name.slice(base.length).trim().replace(/^\(|\)$/g, "") : "";
        return { name, base, label, price: Number(it.price), desc: it.description_fr || "", available: it.available !== false };
      });

      const items = [];
      for (let i = 0; i < lines.length; ) {
        const first = lines[i];
        let j = i + 1;
        if (first.label) {
          while (j < lines.length && lines[j].label && lines[j].base === first.base) j++;
        }
        if (first.label && j - i >= 2) {
          items.push({
            name: first.base,
            desc: first.desc,
            variants: lines.slice(i, j).map((l) => ({ label: l.label, price: l.price, available: l.available, cartName: l.name }))
          });
        } else {
          items.push({ name: first.name, price: first.price, desc: first.desc, available: first.available, cartName: first.name });
          j = i + 1;
        }
        i = j;
      }

      return { category, image: c.image_url || "", items };
    });

  const seen = {};
  const eachLine = (fn) => blocks.forEach((b) => b.items.forEach((it) =>
    (it.variants || [it]).forEach((line) => fn(line, b.category))));
  eachLine((line) => { seen[line.cartName] = (seen[line.cartName] || 0) + 1; });
  eachLine((line, category) => {
    if (seen[line.cartName] > 1) line.cartName = `${line.cartName} (${category})`;
  });
  return blocks;
}

function applyMenuRows(rows) {
  const blocks = menuFromRows(rows);
  if (!blocks.length || !blocks.some((b) => b.items.length > 0)) {
    throw new Error("La base n'a renvoyé aucune carte");
  }
  MENU_DATA.splice(0, MENU_DATA.length, ...blocks);
}

function loadCachedMenu() {
  try {
    const rows = JSON.parse(localStorage.getItem(MENU_CACHE_KEY) || "null");
    if (Array.isArray(rows)) applyMenuRows(rows);
  } catch (e) {
    localStorage.removeItem(MENU_CACHE_KEY);
  }
}

async function fetchMenuRows() {
  const columns = "id,name_fr,name_en,image_url,position," +
    "items(id,name_fr,name_en,description_fr,description_en,price,image_url,available,position)";
  const url = SUPABASE_URL + "/rest/v1/categories?select=" + encodeURIComponent(columns) +
    "&order=position.asc&items.order=position.asc";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), MENU_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { apikey: SUPABASE_KEY }, signal: controller.signal, cache: "no-store" });
    if (!res.ok) throw new Error("Supabase answered " + res.status);
    const rows = await res.json();
    if (!Array.isArray(rows)) throw new Error("Supabase sent no menu");
    return rows;
  } finally {
    clearTimeout(timer);
  }
}

async function loadMenu() {
  try {
    const rows = await fetchMenuRows();
    applyMenuRows(rows);
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(rows));
  } catch (e) {
    console.warn("Menu indisponible depuis la base, copie locale utilisée :", e);
  }
}


function getCart() {
  return JSON.parse(localStorage.getItem("tanit_cart") || "[]");
}

function setCart(cart) {
  localStorage.setItem("tanit_cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const total = getCart().reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById("cartBadge");
  if (badge) {
    badge.textContent = total;
    badge.style.display = total > 0 ? "grid" : "none";
  }
  const fbadge = document.getElementById("floatingCartBadge");
  if (fbadge) fbadge.textContent = total;
  updateFloatingCart(total);
}

// Floating cart is shown only when there are items AND the header bar
// (with its own cart) is not yet visible — i.e. at the top of the page.
function updateFloatingCart(total) {
  const fc = document.getElementById("floatingCart");
  if (!fc) return;
  if (total === undefined) total = getCart().reduce((s, i) => s + i.qty, 0);
  const header = document.querySelector(".site-header");
  const scrolled = header && header.classList.contains("scrolled");
  fc.style.display = (total > 0 && !scrolled) ? "flex" : "none";
}

function pulseCart() {
  ["headerCart", "floatingCart"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("bump");
    void el.offsetWidth;
    el.classList.add("bump");
  });
}

function escName(name) {
  return String(name).replace(/'/g, "\\'");
}


function addControlHTML(name, price, qty) {
  if (qty > 0) {
    return `
      <div class="item-qty-control" data-name="${name}" data-price="${price}">
        <button class="qty-btn-inline" onclick="event.stopPropagation(); changeQtyInMenu('${escName(name)}', ${price}, -1)">−</button>
        <span class="qty-num-inline">${qty}</span>
        <button class="qty-btn-inline" onclick="event.stopPropagation(); changeQtyInMenu('${escName(name)}', ${price}, 1)">+</button>
      </div>`;
  }
  return `<button class="btn-add" data-name="${name}" onclick="event.stopPropagation(); addToCart('${escName(name)}', ${price})">+</button>`;
}

function cartQty(name) {
  const item = getCart().find(i => i.name === name);
  return item ? item.qty : 0;
}

function addToCart(name, price) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ name, price, qty: 1 });
  }
  setCart(cart);
  updateCartBadge();
  pulseCart();

  const control = document.querySelector(`.btn-add[data-name="${CSS.escape(name)}"], .item-qty-control[data-name="${CSS.escape(name)}"]`);
  if (control) control.outerHTML = addControlHTML(name, price, cartQty(name));

  showToast(`${name} ajouté au panier`);
}

function changeQtyInMenu(name, price, delta) {
  const cart = getCart();
  const existing = cart.find(i => i.name === name);
  if (!existing) return;

  existing.qty += delta;
  if (existing.qty <= 0) cart.splice(cart.indexOf(existing), 1);
  setCart(cart);
  updateCartBadge();
  if (delta > 0) pulseCart();

  const control = document.querySelector(`.item-qty-control[data-name="${CSS.escape(name)}"], .btn-add[data-name="${CSS.escape(name)}"]`);
  if (control) control.outerHTML = addControlHTML(name, price, cartQty(name));
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
}

function getCategoryImage(block) {
  if (CATEGORY_IMAGES[block.category]) return CATEGORY_IMAGES[block.category];
  if (block.image && block.image.trim() !== "") return block.image;
  return CATEGORY_PLACEHOLDERS[block.category] ||
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80";
}

function renderNavbar() {
  const nav = document.getElementById("categoryNav");
  if (!nav) return;
  nav.innerHTML = MENU_DATA.map((block) => {
    const id = slugify(block.category);
    return `<a class="nav-pill" href="#${id}">${block.category}</a>`;
  }).join("");
}

function lineHTML(displayLabel, lineName, price, available) {
  const soldOut = available === false;
  const labelHTML = displayLabel ? `<span class="variant-label">${displayLabel}</span>` : "";
  if (soldOut) {
    return `
      <div class="variant-row sold-out">
        ${labelHTML}
        <span class="item-price">${formatPrice(price)}</span>
        <span class="sold-out-badge">Épuisé</span>
      </div>`;
  }
  return `
    <div class="variant-row">
      ${labelHTML}
      <span class="item-price">${formatPrice(price)}</span>
      ${addControlHTML(lineName, price, cartQty(lineName))}
    </div>`;
}

function itemRightHTML(item) {
  if (item.variants && item.variants.length) {
    return `<div class="item-right item-right-variants">
      ${item.variants.map(v => lineHTML(v.label, v.cartName || `${item.name} (${v.label})`, v.price, v.available)).join("")}
    </div>`;
  }
  return `<div class="item-right">${lineHTML("", item.cartName || item.name, item.price, item.available)}</div>`;
}

function renderMenu() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) return;

  menuContainer.innerHTML = MENU_DATA.map((block) => {
    const id = slugify(block.category);
    const imgSrc = getCategoryImage(block);

    return `
      <article class="menu-category" id="${id}">
        <button class="category-toggle" data-target="${id}-items" aria-expanded="true">
          <img class="category-bg" src="${imgSrc}" alt="${block.category}" loading="lazy" />
          <div class="category-overlay"></div>
          <div class="category-toggle-inner">
            <h3>${block.category}</h3>
            <span class="toggle-arrow open">▼</span>
          </div>
        </button>
        <div class="category-items" id="${id}-items">
          <div class="menu-list">
            ${block.items.map((item) => `
              <div class="menu-item">
                <div class="menu-item-left">
                  <h4>${item.name}</h4>
                  ${item.desc ? `<div class="menu-item-desc">${item.desc}</div>` : ""}
                </div>
                ${itemRightHTML(item)}
              </div>
            `).join("")}
          </div>
        </div>
      </article>
    `;
  }).join("");


  menuContainer.querySelectorAll(".category-toggle").forEach((btn) => {
    btn.addEventListener("click", () => {
      const items = document.getElementById(btn.dataset.target);
      const arrow = btn.querySelector(".toggle-arrow");
      const isOpen = !items.classList.contains("collapsed");
      items.classList.toggle("collapsed", isOpen);
      arrow.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  menuContainer.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const isExpanded = item.classList.contains("expanded");
      item.closest(".menu-list").querySelectorAll(".menu-item").forEach(s => s.classList.remove("expanded"));
      if (!isExpanded) item.classList.add("expanded");
    });
  });
}

function setupScrollSpy() {
  const pills = document.querySelectorAll(".nav-pill");
  const categories = document.querySelectorAll(".menu-category");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach((pill) => {
          pill.classList.toggle("active", pill.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  categories.forEach((cat) => observer.observe(cat));
}

function setupSearch() {
  const input = document.getElementById("searchInput");
  if (!input) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();

    if (!query) {
      document.querySelectorAll(".menu-category").forEach(el => el.style.display = "");
      document.querySelectorAll(".menu-item").forEach(el => el.style.display = "");
      const noResults = document.getElementById("noResults");
      if (noResults) noResults.style.display = "none";
      return;
    }

    let anyVisible = false;

    document.querySelectorAll(".menu-category").forEach((catEl) => {
      let catHasMatch = false;

      catEl.querySelectorAll(".menu-item").forEach((itemEl) => {
        const name = itemEl.querySelector("h4")?.textContent.toLowerCase() || "";
        const desc = itemEl.querySelector(".menu-item-desc")?.textContent.toLowerCase() || "";
        const matches = name.includes(query) || desc.includes(query);
        itemEl.style.display = matches ? "" : "none";
        if (matches) catHasMatch = true;
      });

      catEl.style.display = catHasMatch ? "" : "none";

      if (catHasMatch) {
        anyVisible = true;
        const itemsContainer = catEl.querySelector(".category-items");
        const arrow = catEl.querySelector(".toggle-arrow");
        if (itemsContainer) itemsContainer.classList.remove("collapsed");
        if (arrow) arrow.classList.add("open");
      }
    });

    let noResults = document.getElementById("noResults");
    if (!noResults) {
      noResults = document.createElement("p");
      noResults.id = "noResults";
      noResults.className = "no-results";
      noResults.textContent = "Aucun résultat trouvé.";
      document.getElementById("menuContainer").appendChild(noResults);
    }
    noResults.style.display = anyVisible ? "none" : "block";
  });
}



function updateTrackButton() {
  const btn = document.getElementById("floatingTrack");
  if (!btn) return;
  btn.style.display = localStorage.getItem("tanit_last_order_id") ? "flex" : "none";
}

function captureTableFromURL() {
  const table = new URLSearchParams(window.location.search).get("table");
  if (table && !isNaN(table)) {
    localStorage.setItem("tanit_table", table);
    showToast(`Table ${table} 👋`);
  }
}

function setupSearchToggle() {
  const wrap = document.getElementById("headerSearch");
  const toggle = document.getElementById("searchToggle");
  const closeBtn = document.getElementById("searchClose");
  const input = document.getElementById("searchInput");
  if (!wrap || !toggle || !input) return;

  toggle.addEventListener("click", () => {
    wrap.classList.add("open");
    const bar = wrap.parentElement;
    if (bar && bar.classList.contains("header-bar")) bar.classList.add("searching");
    setTimeout(() => input.focus(), 80);
  });

  function collapseSearch() {
    if (!wrap.classList.contains("open")) return;
    wrap.classList.remove("open");
    const bar = document.querySelector(".header-bar");
    if (bar) bar.classList.remove("searching");
    if (input.value) {
      input.value = "";
      input.dispatchEvent(new Event("input"));
    }
    syncHeader();
  }

  if (closeBtn) closeBtn.addEventListener("click", collapseSearch);
  input.addEventListener("keydown", (e) => { if (e.key === "Escape") collapseSearch(); });
  input.addEventListener("blur", () => {
    setTimeout(() => { if (!input.value.trim()) collapseSearch(); }, 150);
  });
}

function syncHeader() {
  const header = document.querySelector(".site-header");
  if (!header) return;
  const scrolled = window.scrollY > 40;
  header.classList.toggle("scrolled", scrolled);

  const search = document.getElementById("headerSearch");
  const bar = header.querySelector(".header-bar");
  const cart = document.getElementById("headerCart");
  if (search && bar && cart && !search.classList.contains("open")) {
    if (scrolled && search.parentElement !== bar) {
      bar.insertBefore(search, cart);
    } else if (!scrolled && search.parentElement === bar) {
      header.appendChild(search);
    }
  }

  document.documentElement.style.setProperty("--header-h", header.offsetHeight + "px");
  updateFloatingCart();
}

async function init() {
  captureTableFromURL();
  syncHeader();
  loadCachedMenu();
  renderNavbar();
  renderMenu();
  updateCartBadge();
  updateTrackButton();
  await loadMenu();
  renderNavbar();
  renderMenu();
  setupScrollSpy();
  setupSearch();
  setupSearchToggle();
  window.addEventListener("scroll", syncHeader, { passive: true });
  window.addEventListener("resize", syncHeader);
  window.addEventListener("load", syncHeader);
  const header = document.querySelector(".site-header");
  if (header) header.addEventListener("transitionend", syncHeader);
}

document.addEventListener("DOMContentLoaded", init);
