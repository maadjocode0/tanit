const MENU_DATA = [
  { category: "Petit Déjeuner", image: "", items: [
    { name: "Classique", price: 7.5, desc: "Café au choix - Eau 1/2 - 1 Viennoiserie - Jus" },
    { name: "Le Bonjour", price: 15, desc: "Café au choix - Eau 1/2 - Viennoiserie - Assiette charcuterie & fromages - Jus - Omelette fromage" },
    { name: "Familly", price: 28, desc: "2 cafés au choix - 2 jus - Eau 1L - 2 viennoiseries - Assiette charcuterie & fromages - 2 mini crêpes - 2 omelettes fromage - Corbeille de pain" }
  ]},
  { category: "Cocktails", image: "", items: [
    { name: "Pina Colada", price: 10, desc: "" },
    { name: "Fraise - Banane", price: 12, desc: "" },
    { name: "Kiwi - Banane", price: 12, desc: "" },
    { name: "Trio", price: 15, desc: "Ananas, Mangue, Kiwi" },
    { name: "Power", price: 16, desc: "Banane, Datte, Fruit Sec" }
  ]},
  { category: "Smoothies", image: "", items: [
    { name: "Red", price: 13, desc: "Fraise, Banane, Fruits rouges" },
    { name: "Fraicheur", price: 14, desc: "Kiwi, Pomme, Ananas" }
  ]},
  { category: "Milkshake", image: "", items: [
    { name: "Classique", price: 8, desc: "Chocolat / Fraise / Vanille" },
    { name: "Nutella", price: 10, desc: "" },
    { name: "Au choix", price: 12, desc: "Oreo - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Frappuccino", image: "", items: [
    { name: "Classique", price: 7, desc: "" },
    { name: "Nutella", price: 9, desc: "" },
    { name: "Au choix", price: 11, desc: "Oreo - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Crêpes Sucrées", image: "", items: [
    { name: "Crêpe Chocolat", price: 8, desc: "" },
    { name: "Nutella", price: 12, desc: "" },
    { name: "Nutella Banane", price: 14, desc: "" },
    { name: "Nutella Fruits Sec", price: 14, desc: "" },
    { name: "Nutella Banane Fruits Sec", price: 16, desc: "" },
    { name: "Au choix", price: 14, desc: "Oreo - Kinder - Spéculoos - Ferrero" },
    { name: "Dubai", price: 15, desc: "" },
    { name: "Over Dose", price: 18, desc: "" }
  ]},
  { category: "Crêpes Salées", image: "", items: [
    { name: "Thon Fromage", price: 10, desc: "" },
    { name: "Jambon Fromage", price: 10, desc: "" },
    { name: "Crêpe Tanit", price: 13, desc: "Thon, Jambon, Fromage" },
    { name: "Crêpe Sauce Blanche et Champignon", price: 18, desc: "" }
  ]},
  { category: "Gaufres", image: "", items: [
    { name: "Chocolat", price: 9, desc: "" },
    { name: "Nutella", price: 13, desc: "" },
    { name: "Nutella Banane", price: 15, desc: "" },
    { name: "Nutella Fruits Secs", price: 15, desc: "" },
    { name: "Nutella Banane Fruits Secs", price: 17, desc: "" },
    { name: "Au choix", price: 14, desc: "Oreo - Kinder - Spéculoos - Ferrero" },
    { name: "Over Dose", price: 20, desc: "" }
  ]},
  { category: "Pancakes", image: "", items: [
    { name: "Nutella", price: 12, desc: "" },
    { name: "Over Dose", price: 18, desc: "" }
  ]},
  { category: "Omelettes", image: "", items: [
    { name: "Fromage", price: 9, desc: "" },
    { name: "Thon Fromage", price: 11, desc: "" },
    { name: "Jambon Fromage", price: 11, desc: "" },
    { name: "Végétarienne", price: 12, desc: "" }
  ]},
  { category: "Burgers", image: "", items: [
    { name: "Chicken Burger", price: 10, priceDouble: 14, desc: "" },
    { name: "Beef Burger", price: 13, priceDouble: 18, desc: "" }
  ]},
  { category: "Makloub", image: "", items: [
    { name: "Makloub Thon", price: 10, desc: "" },
    { name: "Makloub Jambon", price: 10, desc: "" },
    { name: "Makloub Escalope Grillé", price: 11, desc: "" },
    { name: "Makloub Escalope Pané", price: 12, desc: "" },
    { name: "Makloub Kabeb Fromage", price: 14, desc: "" }
  ]},
  { category: "Tacos", image: "", items: [
    { name: "Poulet Grillé", price: 10, desc: "" },
    { name: "Poulet Pané", price: 12, desc: "" },
    { name: "Viande Hachée", price: 14, desc: "" }
  ]},
  { category: "Les Plats", image: "", items: [
    { name: "Poulet Grillé", price: 15, desc: "" },
    { name: "Poulet Pané", price: 16, desc: "" },
    { name: "Mexicain", price: 16, desc: "" },
    { name: "Kebab", price: 20, desc: "" },
    { name: "Cordon Bleu", price: 18, desc: "" },
    { name: "Poulet aux Champignons", price: 20, desc: "" },
    { name: "Steak de Veau", price: 26, desc: "" },
    { name: "Dourade", price: 22, desc: "" },
    { name: "Loup", price: 25, desc: "" },
    { name: "Grillade Mixte", price: 33, desc: "" },
    { name: "Grillade Fruit de Mer", price: 36, desc: "1 personne 36 DT / 2 personnes 48 DT" },
    { name: "Crispy Poulet", price: 22, desc: "" }
  ]},
  { category: "Ojja", image: "", items: [
    { name: "Ojja Merguez", price: 15, desc: "" },
    { name: "Ojja Poulet", price: 17, desc: "" },
    { name: "Ojja Fruit de Mer", price: 25, desc: "" },
    { name: "Ojja Royale", price: 25, desc: "Merguez, poulet, champignons" }
  ]},
  { category: "Les Salades", image: "", items: [
    { name: "Salade Mechouia", price: 10, desc: "" },
    { name: "Salade César", price: 14, desc: "" },
    { name: "Healthy", price: 14, desc: "" }
  ]},
  { category: "Gratin", image: "", items: [
    { name: "Poulet", price: 16, desc: "" },
    { name: "Lasagne", price: 18, desc: "" },
    { name: "Fruit de Mer", price: 25, desc: "" }
  ]},
  { category: "Pâtes", image: "", items: [
    { name: "Spaghetti Puttanesca", price: 16, desc: "" },
    { name: "Spaghetti Carbonara", price: 18, desc: "" },
    { name: "Spaghetti Bolognaise", price: 18, desc: "" },
    { name: "Spaghetti 4 Fromages", price: 22, desc: "" },
    { name: "Spaghetti Fruit de Mer", price: 28, desc: "" },
    { name: "Pasta Pesto", price: 24, desc: "" }
  ]},
  { category: "Pizza", image: "", items: [
    { name: "Margueritta", price: 12, desc: "Sauce tomate, fromage" },
    { name: "Neptune", price: 15, desc: "Sauce tomate, fromage, thon" },
    { name: "Mexicaine", price: 19, desc: "Sauce tomate, fromage, viande hachée" },
    { name: "4 Saisons", price: 19, desc: "Sauce tomate, fromage, thon, champignon, légume" },
    { name: "Peperoni", price: 16, desc: "" },
    { name: "Sauce Blanche - Champignon", price: 19, desc: "" },
    { name: "Fruit de Mer", price: 25, desc: "Sauce tomate fraiche, mozzarella, moule, crevette, calamar, blanc de seiche, huile d'olive" }
  ]},
  { category: "Baguettes Farcies", image: "", items: [
    { name: "Baguette Farcie Poulet Grillé", price: 12, desc: "" },
    { name: "Baguette Farcie Poulet Pané", price: 14, desc: "" }
  ]},
  { category: "Chicha", image: "", items: [
    { name: "Parfum au Choix", price: 8, desc: "" },
    { name: "Chicha Orientale", price: 12, desc: "Avec glaçon" },
    { name: "BOSS", price: 25, desc: "Avec glaçon et assiette de fruits" }
  ]},
  { category: "Formule Tanit", image: "", items: [
    { name: "Offre Duo — Crêpe Nutella Fruits Sec", price: 23, desc: "2 cafés + eau 1L + crêpe Nutella fruits sec" },
    { name: "Offre Duo — 2 Assida", price: 25, desc: "2 cafés + eau 1L + 2 Assida" },
    { name: "Offre Chicha — Chicha + Mojito", price: 16, desc: "" },
    { name: "Offre Chicha — Chicha + Thé + Eau 1/2", price: 12.5, desc: "" },
    { name: "Offre Chicha — Chicha + Café + Eau 1/2", price: 13, desc: "" }
  ]}
];

const CATEGORY_PLACEHOLDERS = {
  "Petit Déjeuner": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&q=80",
  "Cocktails": "https://images.unsplash.com/photo-1497534446932-c925b458314e?w=800&q=80",
  "Smoothies": "https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80",
  "Milkshake": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800&q=80",
  "Frappuccino": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=80",
  "Crêpes Sucrées": "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&q=80",
  "Crêpes Salées": "https://images.unsplash.com/photo-1528736235302-52922df5c122?w=800&q=80",
  "Gaufres": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=800&q=80",
  "Pancakes": "https://images.unsplash.com/photo-1506084868230-bb9d95c24759?w=800&q=80",
  "Omelettes": "https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&q=80",
  "Burgers": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
  "Makloub": "https://images.unsplash.com/photo-1561651188-d207bbec4ec3?w=800&q=80",
  "Tacos": "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
  "Les Plats": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  "Ojja": "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
  "Les Salades": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
  "Gratin": "https://images.unsplash.com/photo-1621510456681-2330135e5871?w=800&q=80",
  "Pâtes": "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=800&q=80",
  "Pizza": "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
  "Baguettes Farcies": "https://images.unsplash.com/photo-1559054663-e8d23213f55c?w=800&q=80",
  "Chicha": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "Formule Tanit": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80"
};

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
  showToast(`${name} ajouté au panier`);
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
  setTimeout(() => toast.classList.remove("show"), 1800);
}

// =============================================
// MENU
// =============================================

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

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
                <div class="item-right">
                  ${item.priceDouble ? `
                    <div class="item-price-double">
                      <span><span class="price-label">Simple </span>${formatPrice(item.price)}</span>
                      <span><span class="price-label">Double </span>${formatPrice(item.priceDouble)}</span>
                    </div>
                  ` : `<span class="item-price">${formatPrice(item.price)}</span>`}
                  <button class="btn-add" onclick="event.stopPropagation(); addToCart('${item.name.replace(/'/g, "\\'")}', ${item.price})">+</button>
                </div>
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
      const targetId = btn.dataset.target;
      const items = document.getElementById(targetId);
      const arrow = btn.querySelector(".toggle-arrow");
      const isOpen = !items.classList.contains("collapsed");
      items.classList.toggle("collapsed", isOpen);
      arrow.classList.toggle("open", !isOpen);
      btn.setAttribute("aria-expanded", String(!isOpen));
    });
  });

  // Expand item on tap
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

// =============================================
// SEARCH
// =============================================

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

function init() {
  renderNavbar();
  renderMenu();
  setupScrollSpy();
  setupSearch();
  updateCartBadge();
}

document.addEventListener("DOMContentLoaded", init);