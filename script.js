// =====================================================================
// Public menu page (index.html)
// Depends on: menu-data.js (MENU_DATA, helpers) and supabase.js (overrides)
// =====================================================================

// Availability / price overrides loaded from Supabase (menu_items table),
// keyed by orderable line name (e.g. "Beef Burger (Double)"). Empty = all
// available at coded prices, so the menu still works if the DB is offline.
let MENU_OVERRIDES = {};

async function loadOverrides() {
  try {
    const rows = await getMenuItems();
    MENU_OVERRIDES = {};
    rows.forEach(r => { MENU_OVERRIDES[r.name] = r; });
  } catch (e) {
    MENU_OVERRIDES = {};
  }
}

function override(name) {
  return MENU_OVERRIDES[name] || null;
}

function effectivePrice(name, coded) {
  const o = override(name);
  return (o && o.price_override != null) ? Number(o.price_override) : coded;
}

function isSoldOut(name) {
  const o = override(name);
  return !!(o && o.available === false);
}

// =============================================
// CART
// =============================================

function getCart() {
  return JSON.parse(localStorage.getItem("tanit_cart") || "[]");
}

function setCart(cart) {
  localStorage.setItem("tanit_cart", JSON.stringify(cart));
}

function updateCartBadge() {
  const cart = getCart();
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  const badge = document.getElementById("cartBadge");
  const floatingCart = document.getElementById("floatingCart");
  if (badge) badge.textContent = total;
  if (floatingCart) floatingCart.style.display = total > 0 ? "flex" : "none";
}

function escName(name) {
  return String(name).replace(/'/g, "\\'");
}

// Markup for the add (+) button or the −/qty/+ control for one orderable line.
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

// =============================================
// MENU
// =============================================

function getCategoryImage(block) {
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

// One orderable line (a plain item, or one variant of an item).
function lineHTML(displayLabel, lineName, codedPrice) {
  const price = effectivePrice(lineName, codedPrice);
  const soldOut = isSoldOut(lineName);
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
      ${item.variants.map(v => lineHTML(v.label, `${item.name} (${v.label})`, v.price)).join("")}
    </div>`;
  }
  return `<div class="item-right">${lineHTML("", item.name, item.price)}</div>`;
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

  // Toggle category collapse
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

  // Expand item description on tap
  menuContainer.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", () => {
      const isExpanded = item.classList.contains("expanded");
      item.closest(".menu-list").querySelectorAll(".menu-item").forEach(s => s.classList.remove("expanded"));
      if (!isExpanded) item.classList.add("expanded");
    });
  });
}

// =============================================
// SCROLL SPY
// =============================================

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

// =============================================
// TABLE FROM QR (index.html?table=N)
// =============================================

function captureTableFromURL() {
  const table = new URLSearchParams(window.location.search).get("table");
  if (table && !isNaN(table)) {
    localStorage.setItem("tanit_table", table);
    showToast(`Table ${table} 👋`);
  }
}

// =============================================
// INIT
// =============================================

async function init() {
  captureTableFromURL();
  renderNavbar();
  renderMenu();          // instant render with coded prices
  updateCartBadge();
  await loadOverrides(); // then apply sold-out / price overrides
  renderMenu();
  setupScrollSpy();
  setupSearch();
}

document.addEventListener("DOMContentLoaded", init);
