# Tanit — Old Front End and Old Admin Page (archive)

A copy of two earlier versions of the Tanit Lounge site, kept for reuse in a new project. Every file
below is the exact source from the Git history of this repository (`maadjocode0/tanit`).

- **Part A — Old front end (QR ordering site)**, commit `cb22348`: the customer pages as they were
  just before the redesign from `FRONTEND-BLUEPRINT.md`. Customers scan the QR code on their table,
  browse the menu, fill a cart, confirm their table by scanning its QR code, send the order to the
  kitchen and follow it live. It reads the menu from the `categories` / `items` tables of
  `ADMIN-BLUEPRINT.md`.
- **Part B — Old admin page ("Gestion du menu")**, commit `8d26763`: the staff page that existed
  before the admin was rebuilt from `ADMIN-BLUEPRINT.md`. The menu itself lives in `menu-data.js`;
  the page only stores overrides (sold out, price override, category photo).

**The two parts belong to different data models.** Part A reads `categories` / `items` (edited by the
new admin of `ADMIN-BLUEPRINT.md`). Part B writes `menu_items` / `category_images`, which only the
Part B version of `script.js` reads. To reuse Part B, take its own `script.js`, `supabase.js`,
`menu-data.js` and `supabase-setup.sql` together.

Files not copied here are unchanged elsewhere in the repository: the staff POS (`pos.html`,
`pos-script.js`), the report (`report.*`), the table QR generator (`qr.html`), `icon.svg`,
`favicon.svg` and `logo-tanit.jpg`. To get any file of these versions:
`git show cb22348:<file>` or `git show 8d26763:<file>`.

---

# PART A — OLD FRONT END (QR ORDERING), commit `cb22348`

## How it works

1. Each table has a printed QR code pointing to `index.html?table=N` (made with `qr.html`); the menu
   page saves the table number (`tanit_table`).
2. The menu comes from Supabase (`categories` with embedded `items`), shown from the copy saved on the
   phone first, with `menu-data.js` as the fallback.
3. `+` adds a line to the cart in `localStorage` (`tanit_cart`: `[{ name, price, qty }]`). A product
   whose name exists in several categories is named "Name (Category)".
4. `cart.html`: quantities, note, table confirmation by camera QR scan (jsQR; manual entry is flagged
   "non vérifiée"), then `createOrder()` inserts a `pending` order with an id made in the browser.
5. `track.html?id=…` polls `get_order(id)` every 5 s and asks for a 1–5 rating when the order is done.
6. Staff follow orders on `pos.html` (admins only).

## Setup

- Supabase: the schema and seed of `ADMIN-BLUEPRINT.md`, the `orders` and `feedback` tables of
  `supabase-setup.sql` (Part B), then `supabase/hardening.sql`.
- Put the project URL and publishable key at the top of `supabase.js`.
- Serve over HTTPS (camera and service worker need it). Bump `CACHE` in `sw.js` on every deploy.

## Files

### `index.html`

Menu page: hero, category nav, collapsible categories, search, floating cart and "Suivre ma commande" buttons, footer.

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1a3a2a" />
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="apple-touch-icon" href="icon.svg" />
  <title>Tanit Lounge | Megrine</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>

  <header class="site-header" id="siteHeader">
    <div class="header-hero">
      <p class="hh-eyebrow">Megrine</p>
      <h1 class="hh-title">Tanit Lounge</h1>
      <p class="hh-tagline">Reserved by Tanit</p>
    </div>
    <div class="header-bar">
      <a class="brand" href="index.html">
        <span class="brand-text">
          <span class="brand-name">Tanit Lounge</span>
          <span class="brand-sub">Megrine</span>
        </span>
      </a>
      <nav class="header-nav">
        <a href="#menu">Menu</a>
        <a href="#contact">Nous trouver</a>
      </nav>
      <button class="header-cart" id="headerCart" onclick="window.location.href='cart.html'" aria-label="Voir le panier">
        <i class="fa-solid fa-basket-shopping"></i>
        <span class="cart-count" id="cartBadge">0</span>
      </button>
    </div>
    <div class="header-search" id="headerSearch">
      <button class="search-toggle" id="searchToggle" aria-label="Rechercher">
        <i class="fa-solid fa-magnifying-glass"></i>
        <span class="search-label">Rechercher</span>
      </button>
      <div class="search-inner">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="searchInput" placeholder="Rechercher un article..." />
        <button class="search-close" id="searchClose" aria-label="Fermer la recherche"><i class="fa-solid fa-xmark"></i></button>
      </div>
    </div>
  </header>

  <nav class="category-nav">
    <div id="categoryNav" class="nav-pills"></div>
  </nav>

  <a class="floating-track" id="floatingTrack" href="track.html" style="display:none">
    <i class="fa-solid fa-location-arrow"></i>
    <span>Suivre ma commande</span>
  </a>

  <a class="floating-cart" id="floatingCart" href="cart.html" style="display:none" aria-label="Voir le panier">
    <i class="fa-solid fa-basket-shopping"></i>
    <span id="floatingCartBadge">0</span>
  </a>

  <main class="container">
    <section class="section" id="menu">
      <div id="menuContainer"></div>
    </section>
  </main>

  <footer class="site-footer" id="contact">
    <div class="footer-inner">
      <div class="footer-brand">
        <div class="footer-logo-frame">
          <img src="logo-tanit.jpg" alt="Tanit Lounge — Megrine" class="footer-logo" />
        </div>
        <p class="footer-tagline">Reserved by Tanit</p>
        <div class="footer-socials">
          <a href="https://www.facebook.com/profile.php?id=100057483458328&locale=fr_FR" target="_blank" rel="noopener" aria-label="Facebook"><i class="fa-brands fa-facebook-f"></i></a>
          <a href="https://www.instagram.com/tanitmegrine/" target="_blank" rel="noopener" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a>
          <a href="https://www.tiktok.com/@tanit.lounge.megrine" target="_blank" rel="noopener" aria-label="TikTok"><i class="fa-brands fa-tiktok"></i></a>
          <a href="tel:+21698368065" aria-label="Appeler"><i class="fa-solid fa-phone"></i></a>
          <a href="https://www.google.com/maps/place/Tanit+Lounge+Megrine" target="_blank" rel="noopener" aria-label="Localisation"><i class="fa-solid fa-location-dot"></i></a>
        </div>
      </div>

      <div class="footer-cols">
        <div class="footer-col">
          <h4>Horaires</h4>
          <p>Lundi – Dimanche</p>
          <p>08:00 – 12:00</p>
        </div>
        <div class="footer-col">
          <h4>Contact</h4>
          <p><a href="tel:+21698368065"><i class="fa-solid fa-phone"></i> +216 98 368 065</a></p>
          <p><a href="https://maps.google.com/?cid=12753523637681861375" target="_blank" rel="noopener"><i class="fa-solid fa-location-dot"></i> Megrine, Tunisie</a></p>
          <p><a href="https://maps.google.com/?cid=12753523637681861375" target="_blank" rel="noopener"><i class="fa-solid fa-star"></i> Laisser un avis</a></p>
        </div>
        <div class="footer-col">
          <h4>Menu</h4>
          <p><a href="index.html"><i class="fa-solid fa-utensils"></i> Voir la carte</a></p>
          <p><a href="cart.html"><i class="fa-solid fa-basket-shopping"></i> Mon panier</a></p>
        </div>
      </div>
    </div>

    <div class="footer-bottom">
      <span>© <span id="footerYear">2026</span> Tanit Lounge — Tous droits réservés. · <span class="footer-credit">Réalisé par Youssef Maazaoui</span></span>
      <span class="footer-made">Megrine, Tunisie</span>
    </div>
  </footer>

  <script src="menu-data.js"></script>
  <script src="supabase.js"></script>
  <script src="script.js"></script>
  <script>document.getElementById("footerYear").textContent = new Date().getFullYear();</script>
</body>
</html>
````

### `styles.css`

Styles of the menu page (also used by cart.html and track.html).

````css
:root {
  --bg: #f5f2eb;
  --bg-soft: #ede8dc;
  --surface: #ffffff;
  --line: #e0d8c8;
  --text: #1a1a0e;
  --muted: #6b6347;
  --accent: #c9a84c;
  --accent-soft: #d4b86a;
  --green: #1a3a2a;
  --green-light: #2a5a3a;
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 16px;
  --shadow-soft: 0 16px 44px rgba(26, 58, 42, 0.12);
  --shadow-card: 0 10px 30px rgba(26, 58, 42, 0.08);
}

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: "Inter", -apple-system, sans-serif;
  color: var(--text);
  background: var(--bg);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  min-height: 100vh;
}

h1, h2, h3, h4, p { margin: 0; }

.container {
  width: min(680px, 100%);
  margin: 0 auto;
  padding-bottom: 4rem;
}

.hero {
  padding: 1.5rem 1rem;
  background: var(--green);
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    45deg,
    rgba(201, 168, 76, 0.03) 0px,
    rgba(201, 168, 76, 0.03) 1px,
    transparent 1px,
    transparent 12px
  );
}

.hero-card {
  position: relative;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(201, 168, 76, 0.4);
  border-radius: var(--radius-xl);
  padding: 2.5rem 1.5rem;
  text-align: center;
  animation: fadeUp 0.55s ease;
  max-width: 680px;
  margin: 0 auto;
}

.eyebrow {
  color: var(--accent);
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  font-weight: 600;
}

.hero h1 {
  margin-top: 0.5rem;
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.8rem, 11vw, 4.5rem);
  letter-spacing: 0.06em;
  line-height: 1;
  color: #ffffff;
  font-weight: 600;
}

.hero-text {
  margin: 0.85rem auto 0;
  color: var(--accent);
  font-size: 0.85rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  font-style: italic;
  font-family: "Cormorant Garamond", serif;
  font-size: 1.1rem;
}
.category-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--green);
  border-bottom: 1px solid rgba(201, 168, 76, 0.3);
  padding: 0.6rem 0;
}

.nav-pills {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0 1rem;
  scrollbar-width: none;
}

.nav-pills::-webkit-scrollbar { display: none; }

.nav-pill {
  flex-shrink: 0;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: rgba(255,255,255,0.75);
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 0.04em;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.nav-pill:hover,
.nav-pill.active {
  background: var(--accent);
  color: var(--green);
  border-color: var(--accent);
}

.section {
  margin: 0;
  padding: 1.25rem 1rem;
}

.section-head { margin-bottom: 1rem; }

.section-head h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--green);
}

.menu-category {
  margin-bottom: 1rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  background: var(--surface);
}

.category-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  position: relative;
  min-height: 110px;
  overflow: hidden;
  text-align: left;
}

.category-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.category-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to top,
    rgba(26, 58, 42, 0.95) 0%,
    rgba(26, 58, 42, 0.4) 60%,
    transparent 100%
  );
}

.category-toggle-inner {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.1rem;
}

.category-toggle h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.03em;
}

.toggle-arrow {
  font-size: 0.75rem;
  color: var(--accent);
  transition: transform 0.25s ease;
  display: inline-block;
}

.toggle-arrow.open { transform: rotate(180deg); }

.category-items {
  overflow: hidden;
  max-height: 3000px;
  opacity: 1;
  transition: max-height 0.4s ease, opacity 0.3s ease;
}

.category-items.collapsed {
  max-height: 0;
  opacity: 0;
}

.menu-list { padding: 0.25rem 0; }

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background 0.2s ease;
}

.menu-item:last-child { border-bottom: none; }
.menu-item:hover { background: var(--bg-soft); }

.menu-item.expanded {
  background: var(--bg-soft);
  align-items: flex-start;
}

.menu-item-left { flex: 1; }

.menu-item-left h4 {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text);
}

.menu-item-desc {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  font-size: 0.78rem;
  color: var(--muted);
  line-height: 1.4;
  font-style: italic;
  transition: max-height 0.3s ease, opacity 0.25s ease, margin-top 0.25s ease;
  margin-top: 0;
}

.menu-item.expanded .menu-item-desc {
  max-height: 200px;
  opacity: 1;
  margin-top: 0.3rem;
}

.item-price {
  font-weight: 700;
  font-size: 0.92rem;
  color: var(--accent);
  white-space: nowrap;
  flex-shrink: 0;
}

.item-price-double {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.15rem;
  flex-shrink: 0;
}

.item-price-double span {
  font-weight: 700;
  font-size: 0.82rem;
  color: var(--accent);
  white-space: nowrap;
}

.item-price-double .price-label {
  font-size: 0.65rem;
  color: var(--muted);
  font-weight: 500;
}

.info-card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
}

.info-card p { font-size: 0.95rem; }
.info-card p + p { margin-top: 0.5rem; }

.map-card {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--line);
  line-height: 0;
}

.map-frame {
  width: 100%;
  height: 300px;
  border: 0;
  display: block;
}

.social-links {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.social-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1.1rem;
  border-radius: 999px;
  font-size: 0.88rem;
  font-weight: 600;
  text-decoration: none;
  transition: filter 0.2s ease, transform 0.2s ease;
  flex: 1;
  justify-content: center;
}

.social-btn:hover {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.instagram-btn {
  background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045);
  color: #fff;
}

.facebook-btn {
  background: #1877f2;
  color: #fff;
}


@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 600px) {
  .category-toggle { min-height: 130px; }
}
.search-bar-wrapper {
  position: sticky;
  top: 53px;
  z-index: 99;
  background: rgba(26, 58, 42, 0.97);
  backdrop-filter: blur(12px);
  padding: 0.6rem 1rem;
  border-bottom: 1px solid rgba(201, 168, 76, 0.2);
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 999px;
  padding: 0.55rem 1rem;
  max-width: 680px;
  margin: 0 auto;
}

.search-icon {
  color: rgba(255,255,255,0.4);
  font-size: 0.85rem;
  flex-shrink: 0;
}

.search-bar input {
  background: none;
  border: none;
  outline: none;
  color: #fff;
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
  width: 100%;
}

.search-bar input::placeholder {
  color: rgba(255,255,255,0.35);
}

.no-results {
  text-align: center;
  color: var(--muted);
  padding: 2rem 1rem;
  font-size: 0.95rem;
  font-style: italic;
}
.floating-cart {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  background: var(--accent);
  color: #fff;
  border-radius: 999px;
  padding: 0.85rem 1.25rem;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  box-shadow: 0 8px 24px rgba(201, 168, 76, 0.4);
  z-index: 200;
  transition: transform 0.2s, filter 0.2s;
}

.floating-cart:hover {
  transform: translateY(-2px);
  filter: brightness(1.08);
}

#floatingCartBadge {
  background: #fff;
  color: var(--accent);
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
  font-size: 0.78rem;
  font-weight: 700;
}

.floating-cart.bump { animation: cartBump 0.45s ease; }

.floating-track {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--green);
  color: #fff;
  border-radius: 999px;
  padding: 0.75rem 1.1rem;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 8px 24px rgba(26, 58, 42, 0.4);
  z-index: 200;
  transition: transform 0.2s, filter 0.2s;
}

.floating-track:hover { transform: translateY(-2px); filter: brightness(1.1); }
.floating-track i { color: var(--accent); }
.item-right {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.btn-add {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--accent);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.15s, filter 0.15s;
  flex-shrink: 0;
}

.btn-add:hover {
  transform: scale(1.1);
  filter: brightness(1.1);
}

.item-qty-control {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.qty-btn-inline {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1.5px solid var(--accent);
  background: transparent;
  color: var(--accent);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.15s, color 0.15s;
  flex-shrink: 0;
}

.qty-btn-inline:hover {
  background: var(--accent);
  color: #fff;
}

.qty-num-inline {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  min-width: 18px;
  text-align: center;
}

.toast {
  position: fixed;
  bottom: 5.5rem;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  background: rgba(26, 58, 42, 0.95);
  color: #fff;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.88rem;
  opacity: 0;
  pointer-events: none;
  transition: all 0.25s ease;
  white-space: nowrap;
  z-index: 300;
}

.toast.show {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
@media (min-width: 768px) {
  .hero { padding: 2.5rem 1.5rem; }
  .section { padding: 1.5rem; }
  .category-toggle { min-height: 150px; }
}

.item-right-variants {
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.variant-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  justify-content: flex-end;
}

.variant-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  min-width: 3.2rem;
  text-align: right;
}

.sold-out-badge {
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #b42318;
  background: #fdeceb;
  border: 1px solid #f3c2bd;
  border-radius: 999px;
  padding: 0.2rem 0.6rem;
  white-space: nowrap;
}

.variant-row.sold-out .item-price,
.variant-row.sold-out .variant-label {
  opacity: 0.45;
  text-decoration: line-through;
}
/* ===== Footer ===== */
.site-footer {
  position: relative;
  margin-top: 2.5rem;
  background: var(--green);
  color: rgba(255, 255, 255, 0.82);
  overflow: hidden;
  border-top: 2px solid rgba(201, 168, 76, 0.4);
}

.site-footer::before {
  content: "";
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(45deg,
    rgba(201, 168, 76, 0.045) 0px, rgba(201, 168, 76, 0.045) 1px,
    transparent 1px, transparent 14px);
  pointer-events: none;
}

.footer-inner {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 2.75rem 1.5rem 1.75rem;
  display: grid;
  grid-template-columns: minmax(200px, 260px) 1fr;
  gap: 2.5rem;
  align-items: center;
}

.footer-brand { text-align: center; }

.footer-logo-frame {
  width: 118px;
  height: 118px;
  margin: 0 auto 0.9rem;
  border-radius: 24px;
  border: 2px solid var(--accent);
  padding: 6px;
  background: #0d0d0d;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.35), 0 0 0 6px rgba(201, 168, 76, 0.06);
  overflow: hidden;
}

.footer-logo { width: 100%; height: 100%; object-fit: contain; border-radius: 18px; display: block; }

.footer-tagline {
  color: var(--accent);
  font-family: "Cormorant Garamond", serif;
  font-style: italic;
  font-size: 1.05rem;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
}

.footer-socials { display: flex; justify-content: center; gap: 0.6rem; }

.footer-socials a {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(201, 168, 76, 0.35);
  color: var(--accent);
  text-decoration: none;
  transition: background 0.2s, color 0.2s, transform 0.2s;
}

.footer-socials a:hover { background: var(--accent); color: var(--green); transform: translateY(-2px); }

.footer-cols {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 1.25rem 1.5rem;
}

.footer-col h4 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.15rem;
  color: var(--accent);
  margin-bottom: 0.7rem;
  letter-spacing: 0.03em;
}

.footer-col p { font-size: 0.86rem; margin-bottom: 0.4rem; }

.footer-col a {
  color: rgba(255, 255, 255, 0.82);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.footer-col a:hover { color: var(--accent); }
.footer-col a i { color: var(--accent); width: 1rem; text-align: center; font-size: 0.85rem; }

.footer-bottom {
  position: relative;
  max-width: 960px;
  margin: 0 auto;
  padding: 1rem 1.5rem 1.4rem;
  border-top: 1px solid rgba(201, 168, 76, 0.18);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.55);
}

.footer-made {
  color: var(--accent);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.68rem;
}

@media (max-width: 760px) {
  .footer-inner { grid-template-columns: 1fr; gap: 2rem; }
  .footer-bottom { justify-content: center; text-align: center; }
}

.footer-credit { color: var(--accent); }

/* ===== Sticky site header (brand + nav + cart + search) ===== */
html { scroll-behavior: smooth; }

.site-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: var(--green);
  border-bottom: 1px solid rgba(201, 168, 76, 0.3);
  box-shadow: 0 6px 22px rgba(26, 58, 42, 0.22);
}

.header-inner {
  max-width: 900px;
  margin: 0 auto;
  padding: 0.6rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand { display: flex; align-items: center; gap: 0.6rem; text-decoration: none; flex-shrink: 0; }
.brand-logo {
  width: 44px; height: 44px;
  border-radius: 12px;
  border: 1.5px solid var(--accent);
  background: #0d0d0d;
  padding: 3px;
  display: grid; place-items: center;
  overflow: hidden; flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.brand-logo img { width: 100%; height: 100%; object-fit: contain; border-radius: 8px; display: block; }
.brand-text { display: flex; flex-direction: column; line-height: 1.05; }
.brand-name {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem; font-weight: 700; color: #fff; letter-spacing: 0.02em;
}
.brand-sub { font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-top: 2px; }

.header-nav { display: flex; gap: 0.3rem; margin-left: auto; }
.header-nav a {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.82rem; font-weight: 600;
  padding: 0.45rem 0.8rem; border-radius: 999px;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}
.header-nav a:hover { background: rgba(255, 255, 255, 0.08); color: var(--accent); }

.header-cart {
  position: relative;
  flex-shrink: 0;
  width: 46px; height: 46px;
  border-radius: 13px;
  border: 1px solid rgba(201, 168, 76, 0.4);
  background: rgba(255, 255, 255, 0.06);
  color: var(--accent);
  font-size: 1.05rem;
  cursor: pointer;
  display: grid; place-items: center;
  transition: background 0.2s, color 0.2s;
}
.header-cart:hover { background: var(--accent); color: var(--green); }

.cart-count {
  position: absolute; top: -7px; right: -7px;
  min-width: 21px; height: 21px; padding: 0 5px;
  background: var(--accent); color: var(--green);
  border: 2px solid var(--green);
  border-radius: 999px;
  font-size: 0.7rem; font-weight: 800;
  display: grid; place-items: center;
}

@keyframes cartBump {
  0% { transform: scale(1); }
  30% { transform: scale(1.22) rotate(-6deg); }
  55% { transform: scale(0.9); }
  100% { transform: scale(1) rotate(0); }
}
.header-cart.bump { animation: cartBump 0.45s ease; }
.header-cart.bump .cart-count { animation: cartBump 0.45s ease; }

.header-search { max-width: 900px; margin: 0 auto; padding: 0 1rem 0.7rem; }
.search-inner {
  display: flex; align-items: center; gap: 0.6rem;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.3);
  border-radius: 999px;
  padding: 0.6rem 1rem;
}
.search-inner i { color: rgba(255, 255, 255, 0.45); font-size: 0.85rem; flex-shrink: 0; }
.search-inner input {
  background: none; border: none; outline: none;
  color: #fff; font-size: 0.9rem; font-family: "Inter", sans-serif; width: 100%;
}
.search-inner input::placeholder { color: rgba(255, 255, 255, 0.4); }

/* Category pills stick right below the header */
.category-nav { top: var(--header-h, 96px); }

#menu { scroll-margin-top: calc(var(--header-h, 96px) + 52px); }
#contact { scroll-margin-top: var(--header-h, 96px); }

@media (max-width: 480px) {
  .header-inner { gap: 0.5rem; padding: 0.55rem 0.8rem; }
  .brand-logo { width: 38px; height: 38px; }
  .brand-name { font-size: 1.08rem; }
  .header-nav { gap: 0.15rem; }
  .header-nav a { font-size: 0.74rem; padding: 0.35rem 0.55rem; }
  .header-cart { width: 42px; height: 42px; }
}

/* ===== Header merge: big hero (top) collapses into compact bar (scrolled) ===== */
.header-hero {
  text-align: center;
  padding: 1.6rem 1rem 1.1rem;
  max-height: 340px;
  opacity: 1;
  overflow: hidden;
  transition: max-height 0.45s ease, opacity 0.3s ease, padding 0.45s ease, transform 0.45s ease;
}
.hh-eyebrow { color: var(--accent); font-size: 0.68rem; letter-spacing: 0.25em; text-transform: uppercase; font-weight: 600; }
.hh-title {
  font-family: "Cormorant Garamond", serif;
  font-size: clamp(2.2rem, 9vw, 3.1rem);
  color: #fff; line-height: 1; margin-top: 0.3rem; letter-spacing: 0.04em; font-weight: 700;
}
.hh-tagline {
  color: var(--accent); font-family: "Cormorant Garamond", serif; font-style: italic;
  font-size: 1.05rem; letter-spacing: 0.1em; margin-top: 0.4rem;
}

.header-bar {
  max-width: 900px; margin: 0 auto;
  display: flex; align-items: center; gap: 0.9rem;
  max-height: 0; opacity: 0; overflow: hidden;
  padding: 0 1rem;
  transition: max-height 0.45s ease, opacity 0.35s ease, padding 0.45s ease;
}

.site-header.scrolled .header-hero {
  max-height: 0; opacity: 0; padding-top: 0; padding-bottom: 0; transform: translateY(-10px);
}
.site-header.scrolled .header-bar {
  max-height: 66px; opacity: 1; padding: 0.55rem 1rem;
}

@media (max-width: 480px) {
  .header-bar { gap: 0.5rem; }
  .site-header.scrolled .header-bar { padding: 0.5rem 0.8rem; }
}

/* ===== Search: icon → hover label → expanded bar ===== */
.header-search {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 54px;
}

.search-toggle {
  display: inline-flex;
  align-items: center;
  height: 44px;
  padding: 0 0.95rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(201, 168, 76, 0.3);
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: background 0.2s, border-color 0.2s, color 0.2s;
}
.search-toggle i { font-size: 0.95rem; }
.search-toggle:hover, .search-toggle:focus-visible {
  border-color: var(--accent);
  color: var(--accent);
  background: rgba(201, 168, 76, 0.08);
}

.search-label {
  max-width: 0;
  overflow: hidden;
  opacity: 0;
  white-space: nowrap;
  margin-left: 0;
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  transform: translateX(-8px);
  transition: max-width 0.35s ease, opacity 0.25s ease, transform 0.35s ease, margin-left 0.35s ease;
}
.search-toggle:hover .search-label,
.search-toggle:focus-visible .search-label {
  max-width: 120px;
  opacity: 1;
  transform: translateX(0);
  margin-left: 0.55rem;
}

.header-search .search-inner { display: none; width: 100%; }
.header-search.open .search-toggle { display: none; }
.header-search.open .search-inner {
  display: flex;
  animation: searchGrow 0.3s ease;
}
@keyframes searchGrow {
  from { transform: scaleX(0.7); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}

.search-close {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  font-size: 0.95rem;
  padding: 0.15rem 0.3rem;
  flex-shrink: 0;
  transition: color 0.2s;
}
.search-close:hover { color: var(--accent); }

/* ===== Search icon aligned inside the compact bar (scrolled state) ===== */
.header-bar .header-search {
  min-height: 0;
  margin: 0;
  padding: 0;
  flex: 0 0 auto;
  justify-content: flex-start;
}
.header-bar .header-search.open { flex: 1 1 auto; min-width: 0; }
.header-bar .header-search.open .search-inner { width: 100%; }
.header-bar.searching .header-nav { display: none; }
.header-bar.searching .brand-text { display: none; }

/* Search only appears in the compact bar (hidden at the top / hero state) */
.site-header > .header-search { display: none; }
````

### `script.js`

Menu page logic: loads categories/items from Supabase (cache + menu-data.js fallback), regroups variants, per-line availability, cart in localStorage (`tanit_cart`), table capture from `?table=`, search, scroll-spy.

````js

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
````

### `menu-data.js`

Built-in copy of the menu (fallback) and shared helpers: `formatPrice`, `slugify`, `baseName`, `itemCategory`, `flatMenuItems`.

````js



const MENU_DATA = [
  { category: "Petit Déjeuner", image: "", items: [
    { name: "Classique", price: 7.5, desc: "Café au choix - Eau 1/2 - 1 Viennoiserie - Jus" },
    { name: "Le Bonjour", price: 15, desc: "Café au choix - Eau 1/2 - Viennoiserie - Assiette charcuterie & fromages - Jus - Omelette fromage" },
    { name: "Familly", price: 28, desc: "2 cafés au choix - 2 jus - Eau 1L - 2 viennoiseries - Assiette charcuterie & fromages - 2 mini crêpes - 2 omelettes fromage - Corbeille de pain" }
  ]},
  { category: "Café", image: "", items: [
    { name: "Express", price: 3.5, desc: "" },
    { name: "Capucin", price: 4, desc: "" },
    { name: "Café Crème", price: 4.5, desc: "" },
    { name: "Americain", price: 4.5, desc: "" },
    { name: "Café Turc", price: 6.5, desc: "" },
    { name: "Chocolat au lait", price: 4.5, desc: "" },
    { name: "Nescafé", price: 4.5, desc: "" },
    { name: "Cappuccino", price: 7.5, desc: "" },
    { name: "Café Glacé", price: 7, desc: "Noisette - Vanille - Caramel" }
  ]},
  { category: "Thé", image: "", items: [
    { name: "Thé à la menthe", price: 3.5, desc: "" },
    { name: "Thé aux amandes", price: 7.5, desc: "" },
    { name: "Thé aux pignons", price: 10, desc: "" },
    { name: "Thé Baklawa", price: 13, desc: "" },
    { name: "Thé infusion", price: 4.5, desc: "" },
    { name: "Supplément Nestlé", price: 3, desc: "Supplément" },
    { name: "Supplément Arôme", price: 2.5, desc: "Supplément" }
  ]},
  { category: "Drinks", image: "", items: [
    { name: "Eau 1/2L", price: 2, desc: "" },
    { name: "Eau 1L", price: 3.5, desc: "" },
    { name: "Soda", price: 4.5, desc: "" },
    { name: "Boisson Énergétique", price: 10, desc: "" }
  ]},
  { category: "Chocolat", image: "", items: [
    { name: "Chocolat Classique", price: 7, desc: "Chaud ou glacé" },
    { name: "Chocolat Nutella", price: 9, desc: "Chaud ou glacé" },
    { name: "Chocolat Au choix", price: 11, desc: "Oreo - Snickers - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Dessert", image: "", items: [
    { name: "Cheesecake", price: 8, desc: "Nutella - Oreo - Spéculoos - Ferrero" },
    { name: "Gâteau", price: 11, desc: "" },
    { name: "Jwajem", price: 13, desc: "" },
    { name: "Saint Sébastien", price: 13, desc: "" },
    { name: "Assiette de fruits", price: 25, desc: "" }
  ]},
  { category: "Mojito", image: "", items: [
    { name: "Mojito Virgin", price: 10, desc: "" },
    { name: "Mojito Bleu", price: 12, desc: "" },
    { name: "Mojito Red", price: 12, desc: "" },
    { name: "Mojito Black", price: 12, desc: "" },
    { name: "Mojito Énergétique", price: 18, desc: "" },
    { name: "Suppléments Arôme", price: 2.5, desc: "" },
    { name: "Suppléments Nestlé", price: 3, desc: "" },
    { name: "Suppléments Chantilly", price: 3.5, desc: "" },
    { name: "Suppléments Amandes", price: 4, desc: "" },
    { name: "Suppléments Pignons", price: 6.5, desc: "" }
  ]},
  { category: "Jus", image: "", items: [
    { name: "Citronnade", price: 6.5, desc: "" },
    { name: "Jus d'orange", price: 6, desc: "" },
    { name: "Jus de fraise", price: 7, desc: "" },
    { name: "Citronnade à la menthe", price: 7.5, desc: "" },
    { name: "Citronnade aux amandes", price: 10, desc: "" },
    { name: "Jus fruits de saison", price: 10, desc: "Banane / Ananas / Kiwi / Pomme / Fruit rouge" }
  ]},
  { category: "Detox", image: "", items: [
    { name: "Detox Strong", price: 13, desc: "Pomme - Carotte - Gingembre" },
    { name: "Detox Red", price: 13, desc: "Betterave - Fraise - Citron" },
    { name: "Detox Green", price: 13, desc: "Concombre - Kiwi - Menthe - Citron" }
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
    { name: "Chicken Burger", desc: "", variants: [ { label: "Simple", price: 10 }, { label: "Double", price: 14 } ] },
    { name: "Beef Burger", desc: "", variants: [ { label: "Simple", price: 13 }, { label: "Double", price: 18 } ] }
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
    { name: "Grillade Fruit de Mer", desc: "", variants: [ { label: "1 personne", price: 36 }, { label: "2 personnes", price: 48 } ] },
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
  "Formule Tanit": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Café": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "Thé": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  "Drinks": "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80",
  "Chocolat": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
  "Dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
  "Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
  "Jus": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  "Detox": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80"
};



function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
}


function baseName(name) {
  return String(name).replace(/\s*\([^()]*\)\s*$/, "").trim();
}


function itemCategory(name) {
  const suffix = String(name).match(/\(([^()]*)\)\s*$/);
  if (suffix && MENU_DATA.some(b => b.category === suffix[1])) return suffix[1];
  const base = baseName(name);
  for (const block of MENU_DATA) {
    if (block.items.some(it => it.name === name || it.name === base)) {
      return block.category;
    }
  }
  return "";
}


function flatMenuItems() {
  const out = [];
  for (const block of MENU_DATA) {
    for (const it of block.items) {
      if (it.variants && it.variants.length) {
        it.variants.forEach(v => out.push({
          category: block.category,
          name: `${it.name} (${v.label})`,
          baseName: it.name,
          price: v.price
        }));
      } else {
        out.push({ category: block.category, name: it.name, baseName: it.name, price: it.price });
      }
    }
  }
  return out;
}
````

### `supabase.js`

All network calls: `createOrder` (browser-made id, no read-back), `getOrderById` via `get_order()`, order status, feedback, admin-only token check, service worker registration.

````js
const SUPABASE_URL = "https://wuiimhdiqsrvwnoovoxg.supabase.co";
const SUPABASE_KEY = "sb_publishable_aPa4RDt8MV4ybjFmZkt9AQ_-e8vHCa2";

function getAuthToken() {
  return sessionStorage.getItem("tanit_token") || SUPABASE_KEY;
}

async function supabaseRequest(method, path, body = null, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${getAuthToken()}`,
    ...extraHeaders
  };
  if (method === "POST" || method === "PATCH") {
    headers["Prefer"] = extraHeaders["Prefer"] || "return=representation";
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, options);
  if (!res.ok) {
    const err = new Error((await res.text()) || res.statusText);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function getOrders() {
  return supabaseRequest("GET", "/orders?select=*&order=created_at.desc");
}

async function getOrderById(id) {
  const rows = await supabaseRequest("POST", "/rpc/get_order", { p_id: id });
  return rows[0] || null;
}

async function createOrder(tableNumber, items, total, notes, tableVerified) {
  const id = crypto.randomUUID();
  const base = { id, table_number: tableNumber, items, total, status: "pending" };
  const withNotes = (notes && notes.trim()) ? { ...base, notes: notes.trim() } : { ...base };
  const full = { ...withNotes, table_verified: !!tableVerified };
  let lastError;
  for (const body of [full, withNotes, base]) {
    try {
      await supabaseRequest("POST", "/orders", body, { "Prefer": "return=minimal" });
      return { id };
    } catch (e) {
      if (e.status === 409) return { id };
      lastError = e;
    }
  }
  throw lastError;
}

async function updateOrderStatus(id, status) {
  return supabaseRequest("PATCH", `/orders?id=eq.${id}`, { status });
}

async function submitFeedback(orderId, rating) {
  return supabaseRequest("POST", "/feedback", { order_id: orderId || null, rating }, { "Prefer": "return=minimal" });
}

async function getFeedback() {
  return supabaseRequest("GET", "/feedback?select=*&order=created_at.desc");
}

async function validateToken(token) {
  if (!token || token === SUPABASE_KEY) return false;
  try {
    const headers = { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` };
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers });
    if (!res.ok) return false;
    const user = await res.json();
    const admin = await fetch(`${SUPABASE_URL}/rest/v1/admins?select=user_id&user_id=eq.${encodeURIComponent(user.id)}`, { headers });
    if (!admin.ok) return false;
    const rows = await admin.json();
    return Array.isArray(rows) && rows.length > 0;
  } catch {
    return false;
  }
}

function logout() {
  sessionStorage.removeItem("tanit_token");
  window.location.href = "login.html";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
````

### `cart.html`

Cart page: quantities, total, note to the kitchen, table confirmation by scanning the table QR code (or manual entry, flagged).

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1a3a2a" />
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="apple-touch-icon" href="icon.svg" />
  <title>Tanit Lounge | Panier</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="cart.css" />
</head>
<body>

  <header class="hero hero-small">
    <div class="hero-card">
      <a href="index.html" class="back-link">
        <i class="fa-solid fa-arrow-left"></i> Menu
      </a>
      <h1>Mon Panier</h1>
    </div>
  </header>

  <main class="container">
    <section class="section">
      <div id="cartContainer">
        <div id="cartItems"></div>
        <div id="cartSummary" style="display:none">
          <div class="summary-card">
            <div class="summary-row">
              <span>Total</span>
              <strong id="cartTotal">0.00 DT</strong>
            </div>
          </div>

          <div class="table-section">
            <h3>Votre table</h3>
            <p class="table-hint">Scannez le QR code posé sur votre table pour la confirmer.</p>
            <div id="tableDisplay" class="table-display" style="display:none">
              Table <strong id="tableNumber"></strong> <span id="tableVerifiedTag"></span>
            </div>
            <button type="button" class="btn-scan" onclick="startScan()">
              <i class="fa-solid fa-camera"></i> Scanner le QR de ma table
            </button>
            <details class="manual-table">
              <summary>Saisir le numéro manuellement</summary>
              <div class="table-input-row">
                <input type="number" id="tableInput" placeholder="Ex: 5" min="1" max="50" />
                <button class="btn-confirm-table" onclick="setTableManually()">Confirmer</button>
              </div>
            </details>
          </div>

          <div class="note-section">
            <h3>Note pour la cuisine <span>(optionnel)</span></h3>
            <textarea id="orderNote" maxlength="200" rows="2"
              placeholder="Ex : sans oignon, bien cuit, allergie aux fruits secs…"></textarea>
          </div>

          <button class="btn-order" id="orderBtn" onclick="submitOrder()" disabled>
            <i class="fa-solid fa-check"></i>
            Confirmer la commande
          </button>

          <div id="orderSuccess" class="order-success" style="display:none">
            <i class="fa-solid fa-circle-check"></i>
            <h2>Commande envoyée !</h2>
            <p>Votre commande a été transmise au personnel.</p>
            <div class="success-actions">
              <a id="trackLink" href="#" class="btn-track"><i class="fa-solid fa-location-arrow"></i> Suivre ma commande</a>
              <a href="index.html" class="btn-back-menu">Retour au menu</a>
            </div>
          </div>
        </div>

        <div id="cartEmpty" class="cart-empty">
          <i class="fa-solid fa-basket-shopping"></i>
          <p>Votre panier est vide.</p>
          <a href="index.html" class="btn-back-menu">Voir le menu</a>
        </div>
      </div>
    </section>
  </main>

  <div id="scanOverlay" class="scan-overlay" style="display:none">
    <div class="scan-header">
      <span>Visez le QR de votre table</span>
      <button class="scan-close" onclick="stopScan()" aria-label="Fermer"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <div class="scan-video-wrap">
      <video id="scanVideo" playsinline muted autoplay></video>
      <div class="scan-frame"></div>
    </div>
    <p id="scanStatus" class="scan-status"></p>
    <canvas id="scanCanvas" hidden></canvas>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js"></script>
  <script src="supabase.js"></script>
  <script src="cart-script.js"></script>
</body>
</html>
````

### `cart.css`

Styles of the cart page and QR scanner.

````css
.hero-small .hero-card {
  padding: 1.5rem;
  text-align: left;
}

.hero-small h1 {
  font-size: clamp(1.8rem, 7vw, 2.8rem);
  margin-top: 0.5rem;
}

.back-link {
  color: var(--accent);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  letter-spacing: 0.04em;
}

.back-link:hover { opacity: 0.8; }

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.9rem 1.1rem;
  border-bottom: 1px solid var(--line);
  background: var(--surface);
  gap: 2rem;
}

.cart-item:last-child { border-bottom: none; }

.cart-item-left { flex: 1; }

.cart-item-left h4 {
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--text);
}

.cart-item-left p {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 0.2rem;
}

.cart-item-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.qty-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qty-btn {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 1px solid var(--line);
  background: var(--bg-soft);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: background 0.2s;
}

.qty-btn:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

.qty-num {
  font-weight: 700;
  font-size: 0.9rem;
  min-width: 20px;
  text-align: center;
}

.item-subtotal {
  font-weight: 700;
  font-size: 0.9rem;
  color: var(--accent);
  min-width: 60px;
  text-align: right;
}

.cart-list {
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;
}

.summary-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.1rem 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.summary-row strong {
  font-size: 1.2rem;
  color: var(--accent);
}

.table-section {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;
}

.table-section h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.2rem;
  color: var(--green);
  margin-bottom: 0.4rem;
}

.table-hint {
  font-size: 0.82rem;
  color: var(--muted);
  margin-bottom: 0.85rem;
}

.table-display {
  background: var(--bg-soft);
  border: 1px solid var(--accent);
  border-radius: var(--radius-md);
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: var(--green);
  margin-bottom: 0.75rem;
}

.table-input-row {
  display: flex;
  gap: 0.6rem;
}

.table-input-row input {
  flex: 1;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 0.65rem 1rem;
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
  outline: none;
  color: var(--text);
  background: var(--bg);
}

.table-input-row input:focus {
  border-color: var(--accent);
}

.btn-confirm-table {
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: var(--radius-md);
  padding: 0.65rem 1.1rem;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.2s;
}

.btn-confirm-table:hover { filter: brightness(1.1); }

.btn-order {
  width: 100%;
  padding: 1rem;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: filter 0.2s, transform 0.2s;
  margin-bottom: 1rem;
}

.btn-order:hover:not(:disabled) {
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.btn-order:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.order-success {
  text-align: center;
  padding: 2rem 1rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.order-success > i {
  font-size: 3rem;
  color: var(--accent);
  margin-bottom: 1rem;
}

.order-success h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  color: var(--green);
  margin-bottom: 0.5rem;
}

.order-success p {
  color: var(--muted);
  font-size: 0.95rem;
  margin-bottom: 1.5rem;
}

.btn-back-menu {
  display: inline-block;
  background: var(--green);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  transition: filter 0.2s;
}

.btn-back-menu:hover { filter: brightness(1.1); }


.note-section {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
  margin-bottom: 1rem;
}

.note-section h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.2rem;
  color: var(--green);
  margin-bottom: 0.6rem;
}

.note-section h3 span {
  font-family: "Inter", sans-serif;
  font-size: 0.72rem;
  font-weight: 500;
  color: var(--muted);
}

.note-section textarea {
  width: 100%;
  border: 1px solid var(--line);
  border-radius: var(--radius-md);
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  font-family: "Inter", sans-serif;
  outline: none;
  color: var(--text);
  background: var(--bg);
  resize: vertical;
}

.note-section textarea:focus { border-color: var(--accent); }

.success-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-track {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--accent);
  color: #fff;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  text-decoration: none;
  font-weight: 700;
  font-size: 0.9rem;
  transition: filter 0.2s;
}

.btn-track:hover { filter: brightness(1.08); }

.cart-empty {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--muted);
}

.cart-empty i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: var(--accent);
  opacity: 0.5;
}

.cart-empty p {
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

.btn-scan {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--green);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.85rem;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  margin-bottom: 0.75rem;
  transition: filter 0.2s;
}
.btn-scan:hover { filter: brightness(1.1); }

.manual-table summary {
  cursor: pointer;
  font-size: 0.82rem;
  color: var(--muted);
  list-style: none;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.manual-table summary::-webkit-details-marker { display: none; }
.manual-table .table-input-row { margin-top: 0.75rem; }

.tag-verified, .tag-unverified {
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 999px;
  padding: 0.1rem 0.5rem;
  margin-left: 0.35rem;
  white-space: nowrap;
}
.tag-verified { color: #1a7f37; background: #e6f4ea; }
.tag-unverified { color: #b06b00; background: #fff3e0; }

.scan-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.92);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.1rem;
  padding: 1rem;
}

.scan-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  color: #fff;
  font-weight: 600;
  font-size: 0.95rem;
}

.scan-close {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: none;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
}

.scan-video-wrap {
  position: relative;
  width: min(85vw, 340px);
  aspect-ratio: 1;
  border-radius: 18px;
  overflow: hidden;
  background: #000;
}

#scanVideo { width: 100%; height: 100%; object-fit: cover; display: block; }

.scan-frame {
  position: absolute;
  inset: 12%;
  border: 3px solid rgba(201, 168, 76, 0.95);
  border-radius: 16px;
  pointer-events: none;
}

.scan-status {
  color: #fff;
  font-size: 0.9rem;
  text-align: center;
  max-width: 320px;
}
````

### `cart-script.js`

Cart logic: render, quantities, camera QR scan with jsQR, order validation and 30 s anti double-submit, sends the order.

````js
const CART_KEY = "tanit_cart";
const TABLE_KEY = "tanit_table";

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || "[]");
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function getTable() {
  return localStorage.getItem(TABLE_KEY) || "";
}

const VERIFIED_KEY = "tanit_table_verified";

function setTable(table, verified) {
  localStorage.setItem(TABLE_KEY, table);
  localStorage.setItem(VERIFIED_KEY, verified ? "1" : "0");
}

function isTableVerified() {
  return localStorage.getItem(VERIFIED_KEY) === "1";
}

function showTable(table) {
  document.getElementById("tableDisplay").style.display = "block";
  document.getElementById("tableNumber").textContent = table;
  const tag = document.getElementById("tableVerifiedTag");
  if (tag) {
    if (isTableVerified()) { tag.textContent = "✓ vérifiée"; tag.className = "tag-verified"; }
    else { tag.textContent = "non vérifiée"; tag.className = "tag-unverified"; }
  }
  document.getElementById("orderBtn").disabled = false;
}

function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function updateQty(index, delta) {
  const cart = getCart();
  cart[index].qty += delta;
  if (cart[index].qty <= 0) cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

function renderCart() {
  const cart = getCart();
  const cartItems = document.getElementById("cartItems");
  const cartSummary = document.getElementById("cartSummary");
  const cartEmpty = document.getElementById("cartEmpty");
  const orderBtn = document.getElementById("orderBtn");

  if (!cart.length) {
    cartEmpty.style.display = "block";
    cartSummary.style.display = "none";
    return;
  }

  cartEmpty.style.display = "none";
  cartSummary.style.display = "block";

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  document.getElementById("cartTotal").textContent = formatPrice(total);

  cartItems.innerHTML = `
    <div class="cart-list">
      ${cart.map((item, i) => `
        <div class="cart-item">
          <div class="cart-item-left">
            <h4>${item.name}</h4>
            <p>${formatPrice(item.price)} / unité</p>
          </div>
          <div class="cart-item-right">
            <div class="qty-controls">
              <button class="qty-btn" onclick="updateQty(${i}, -1)">−</button>
              <span class="qty-num">${item.qty}</span>
              <button class="qty-btn" onclick="updateQty(${i}, 1)">+</button>
            </div>
            <span class="item-subtotal">${formatPrice(item.price * item.qty)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;


  const table = getTable();
  if (table) showTable(table);
}

function setTableManually() {
  const input = document.getElementById("tableInput");
  const val = input.value.trim();
  if (!val || isNaN(val) || Number(val) < 1) {
    input.style.borderColor = "red";
    return;
  }
  input.style.borderColor = "";
  setTable(val, false);
  showTable(val);
}
const MAX_QTY_PER_ITEM = 20;
const MAX_ITEMS_IN_CART = 15;
const ORDER_COOLDOWN_MS = 30000;

function validateOrder(cart, table) {
  if (!cart.length) return "Panier vide.";
  if (cart.length > MAX_ITEMS_IN_CART) return "Trop d'articles différents.";
  if (cart.some(i => i.qty > MAX_QTY_PER_ITEM)) return "Quantité maximale dépassée.";
  if (!table || isNaN(table) || Number(table) < 1 || Number(table) > 50)
    return "Numéro de table invalide.";

  const lastOrder = localStorage.getItem("tanit_last_order");
  if (lastOrder && Date.now() - Number(lastOrder) < ORDER_COOLDOWN_MS)
    return "Commande déjà envoyée. Attendez 30 secondes.";

  return null;
}
async function submitOrder() {
  const cart = getCart();
  const table = getTable();
  const error = validateOrder(cart, table);
  if (error) { alert(error); return; }

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const note = (document.getElementById("orderNote")?.value || "").trim();
  const orderBtn = document.getElementById("orderBtn");
  orderBtn.disabled = true;
  orderBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Envoi...';

  try {
    const order = await createOrder(table, cart, total, note, isTableVerified());
    setCart([]);
    localStorage.removeItem(TABLE_KEY);
    localStorage.removeItem(VERIFIED_KEY);
    localStorage.setItem("tanit_last_order", Date.now());

    const trackLink = document.getElementById("trackLink");
    if (order && order.id) {
      localStorage.setItem("tanit_last_order_id", order.id);
      trackLink.href = `track.html?id=${order.id}`;
    } else {
      trackLink.style.display = "none";
    }

    document.getElementById("cartItems").innerHTML = "";
    document.querySelector(".summary-card").style.display = "none";
    document.querySelector(".table-section").style.display = "none";
    document.querySelector(".note-section").style.display = "none";
    document.getElementById("orderBtn").style.display = "none";
    document.getElementById("orderSuccess").style.display = "block";
  } catch (err) {
    orderBtn.disabled = false;
    orderBtn.innerHTML = '<i class="fa-solid fa-check"></i> Confirmer la commande';
    alert("Erreur lors de l'envoi. Réessayez.");
    console.error(err);
  }
}


function checkURLTable() {
  const params = new URLSearchParams(window.location.search);
  const table = params.get("table");
  if (table) setTable(table, false);
}

document.addEventListener("DOMContentLoaded", () => {
  checkURLTable();
  renderCart();
});

let scanStream = null;
let scanActive = false;

function parseTableFromQR(data) {
  try {
    const u = new URL(data);
    const t = u.searchParams.get("table");
    if (t && /^\d+$/.test(t) && Number(t) >= 1 && Number(t) <= 50) return String(Number(t));
  } catch (e) {
    const n = String(data).trim();
    if (/^\d+$/.test(n) && Number(n) >= 1 && Number(n) <= 50) return n;
  }
  return null;
}

async function startScan() {
  const overlay = document.getElementById("scanOverlay");
  const video = document.getElementById("scanVideo");
  const status = document.getElementById("scanStatus");
  if (typeof jsQR === "undefined") { alert("Scanner indisponible. Utilisez la saisie manuelle."); return; }
  overlay.style.display = "flex";
  status.textContent = "Démarrage de la caméra…";
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
    video.srcObject = scanStream;
    await video.play();
    scanActive = true;
    status.textContent = "Visez le QR code de votre table.";
    requestAnimationFrame(scanTick);
  } catch (err) {
    scanActive = false;
    status.textContent = "Accès caméra refusé. Fermez et saisissez le numéro manuellement.";
  }
}

function stopScan() {
  scanActive = false;
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
  const video = document.getElementById("scanVideo");
  if (video) video.srcObject = null;
  const overlay = document.getElementById("scanOverlay");
  if (overlay) overlay.style.display = "none";
}

function scanTick() {
  if (!scanActive) return;
  const video = document.getElementById("scanVideo");
  const canvas = document.getElementById("scanCanvas");
  const status = document.getElementById("scanStatus");
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
    if (code && code.data) {
      const table = parseTableFromQR(code.data);
      if (table) { onScanned(table); return; }
      status.textContent = "QR non reconnu. Visez le QR de votre table Tanit.";
    }
  }
  requestAnimationFrame(scanTick);
}

function onScanned(table) {
  setTable(table, true);
  stopScan();
  showTable(table);
}
````

### `track.html`

Order tracking page.

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#1a3a2a" />
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="apple-touch-icon" href="icon.svg" />
  <title>Tanit Lounge | Suivi de commande</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="stylesheet" href="track.css" />
</head>
<body>

  <header class="hero hero-small">
    <div class="hero-card">
      <a href="index.html" class="back-link"><i class="fa-solid fa-arrow-left"></i> Menu</a>
      <h1>Suivi de commande</h1>
    </div>
  </header>

  <main class="container">
    <section class="section">
      <div id="trackRoot">
        <p class="track-loading"><i class="fa-solid fa-spinner fa-spin"></i> Chargement…</p>
      </div>
    </section>
  </main>

  <script src="supabase.js"></script>
  <script src="track-script.js"></script>
</body>
</html>
````

### `track.css`

Styles of the tracking page.

````css
.track-loading, .track-empty {
  text-align: center;
  color: var(--muted);
  padding: 3rem 1rem;
}
.track-empty i { font-size: 2.5rem; color: var(--accent); opacity: 0.6; display: block; margin-bottom: 1rem; }
.track-empty p { margin-bottom: 1.25rem; }

.track-headline { text-align: center; margin-bottom: 1.5rem; }
.track-headline h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.8rem;
  color: var(--green);
}
.track-headline p { color: var(--muted); font-size: 0.92rem; margin-top: 0.25rem; }


.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.75rem;
  max-width: 420px;
}

.step { display: flex; flex-direction: column; align-items: center; gap: 0.45rem; flex-shrink: 0; }

.step-dot {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-size: 1.05rem;
  border: 2px solid var(--line);
  background: var(--surface);
  color: var(--muted);
  transition: all 0.3s ease;
}

.step-label { font-size: 0.74rem; font-weight: 600; color: var(--muted); }

.step.done .step-dot { background: var(--green); border-color: var(--green); color: #fff; }
.step.current .step-dot {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  box-shadow: 0 0 0 5px rgba(201, 168, 76, 0.18);
  animation: pulse 1.6s ease-in-out infinite;
}
.step.done .step-label, .step.current .step-label { color: var(--text); }

.step-bar {
  flex: 1;
  height: 3px;
  background: var(--line);
  margin: 0 0.4rem 1.4rem;
  border-radius: 2px;
  transition: background 0.3s ease;
}
.step-bar.done { background: var(--green); }

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 5px rgba(201, 168, 76, 0.18); }
  50% { box-shadow: 0 0 0 9px rgba(201, 168, 76, 0.05); }
}


.track-cancelled {
  background: #fdeceb;
  border: 1px solid #f3c2bd;
  color: #b42318;
  border-radius: var(--radius-md);
  padding: 0.85rem 1rem;
  text-align: center;
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}


.track-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: 1.25rem;
  box-shadow: var(--shadow-card);
}

.track-row, .track-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.track-row { padding-bottom: 0.75rem; border-bottom: 1px solid var(--line); }
.track-row strong { color: var(--green); }

.track-items { list-style: none; padding: 0.75rem 0; margin: 0; }
.track-items li {
  display: flex;
  justify-content: space-between;
  font-size: 0.88rem;
  color: var(--text);
  padding: 0.3rem 0;
}
.track-items li span:last-child { color: var(--accent); font-weight: 600; }

.track-note {
  background: var(--bg-soft);
  border-left: 3px solid var(--accent);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  color: var(--muted);
  font-style: italic;
  margin-bottom: 0.75rem;
}
.track-note i { color: var(--accent); margin-right: 0.35rem; font-style: normal; }

.track-total { padding-top: 0.75rem; border-top: 1px solid var(--line); font-size: 1rem; }
.track-total strong { font-size: 1.2rem; color: var(--accent); }

.track-refresh {
  text-align: center;
  color: var(--muted);
  font-size: 0.78rem;
  margin-top: 1rem;
}
.track-refresh i { margin-right: 0.3rem; }

.feedback {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  padding: 1.25rem 1rem;
  text-align: center;
  margin-bottom: 1rem;
}
.feedback h3 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  color: var(--green);
  margin-bottom: 0.9rem;
}
.faces { display: flex; justify-content: center; gap: 0.5rem; flex-wrap: wrap; }
.face {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: 2px solid transparent;
  background: var(--bg-soft);
  font-size: 1.6rem;
  line-height: 1;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: transform 0.15s, border-color 0.15s, background 0.15s;
}
.face span { display: block; }
.face:hover:not(:disabled) { transform: translateY(-3px) scale(1.12); }
.face:disabled { opacity: 0.45; cursor: default; }
.face.r1:hover { border-color: #e5484d; background: #fdeceb; }
.face.r2:hover { border-color: #f76808; background: #fdeee0; }
.face.r3:hover { border-color: #f5d90a; background: #fdf9e0; }
.face.r4:hover { border-color: #9bce4e; background: #f0f7e3; }
.face.r5:hover { border-color: #46a758; background: #e9f6ec; }

.feedback.done {
  background: #e9f6ec;
  border: 1px solid #bfe3c6;
  color: #2a6b39;
  border-radius: var(--radius-lg);
  padding: 1rem;
  text-align: center;
  font-weight: 600;
  margin-bottom: 1rem;
}
.feedback.done i { color: #e5484d; margin-right: 0.4rem; }
````

### `track-script.js`

Polls the order every 5 s, stepper Reçue → En préparation → Prête, sound + notification on change, 1–5 rating when done.

````js
const STEPS = [
  { key: "pending",   label: "Reçue",          icon: "fa-receipt" },
  { key: "preparing", label: "En préparation", icon: "fa-fire-burner" },
  { key: "done",      label: "Prête",          icon: "fa-bell-concierge" }
];

const FACES = [
  { rating: 1, emoji: "😡", label: "Mauvais" },
  { rating: 2, emoji: "🙁", label: "Moyen" },
  { rating: 3, emoji: "😐", label: "Correct" },
  { rating: 4, emoji: "🙂", label: "Bien" },
  { rating: 5, emoji: "😄", label: "Excellent" }
];

let lastStatus = null;
let pollTimer = null;

function getOrderId() {
  const fromUrl = new URLSearchParams(window.location.search).get("id");
  return fromUrl || localStorage.getItem("tanit_last_order_id") || null;
}

function fmt(price) { return `${Number(price).toFixed(2)} DT`; }

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function fbKey(id) { return `tanit_fb_${id}`; }

function renderNotFound() {
  document.getElementById("trackRoot").innerHTML = `
    <div class="track-empty">
      <i class="fa-solid fa-magnifying-glass"></i>
      <p>Commande introuvable.</p>
      <a href="index.html" class="btn-back-menu">Retour au menu</a>
    </div>`;
}

function stepperHTML(status) {
  if (status === "cancelled") {
    return `<div class="track-cancelled"><i class="fa-solid fa-circle-xmark"></i> Cette commande a été annulée.</div>`;
  }
  const activeIndex = Math.max(0, STEPS.findIndex(s => s.key === status));
  return `
    <div class="stepper">
      ${STEPS.map((s, i) => {
        const state = i < activeIndex ? "done" : (i === activeIndex ? "current" : "todo");
        return `
          <div class="step ${state}">
            <div class="step-dot"><i class="fa-solid ${s.icon}"></i></div>
            <span class="step-label">${s.label}</span>
          </div>
          ${i < STEPS.length - 1 ? `<div class="step-bar ${i < activeIndex ? "done" : ""}"></div>` : ""}`;
      }).join("")}
    </div>`;
}

function headlineHTML(status) {
  const map = {
    pending:   { t: "Commande reçue ✅",   s: "Le personnel a bien reçu votre commande." },
    preparing: { t: "En préparation 👨‍🍳", s: "Votre commande est en cuisine." },
    done:      { t: "C'est prêt ! 🔔",      s: "Votre commande est prête à être servie." },
    cancelled: { t: "Commande annulée",     s: "Contactez le personnel pour plus d'informations." }
  };
  const h = map[status] || map.pending;
  return `<div class="track-headline"><h2>${h.t}</h2><p>${h.s}</p></div>`;
}

function feedbackHTML(orderId) {
  if (localStorage.getItem(fbKey(orderId))) {
    return `<div class="feedback done"><i class="fa-solid fa-heart"></i> Merci pour votre retour !</div>`;
  }
  return `
    <div class="feedback" id="feedback">
      <h3>Comment évaluez-vous notre service ?</h3>
      <div class="faces">
        ${FACES.map(f => `
          <button class="face r${f.rating}" title="${f.label}" onclick="sendFeedback(${f.rating})">
            <span>${f.emoji}</span>
          </button>`).join("")}
      </div>
    </div>`;
}

function render(order) {
  const itemsHTML = (order.items || []).map(it =>
    `<li><span>${escapeHtml(it.name)} × ${it.qty}</span><span>${fmt(it.price * it.qty)}</span></li>`
  ).join("");

  document.getElementById("trackRoot").innerHTML = `
    ${headlineHTML(order.status)}
    ${stepperHTML(order.status)}
    ${order.status === "done" ? feedbackHTML(order.id) : ""}
    <div class="track-card">
      <div class="track-row"><span>Table</span><strong>${escapeHtml(order.table_number)}</strong></div>
      <ul class="track-items">${itemsHTML}</ul>
      ${order.notes ? `<div class="track-note"><i class="fa-solid fa-pen"></i> ${escapeHtml(order.notes)}</div>` : ""}
      <div class="track-total"><span>Total</span><strong>${fmt(order.total)}</strong></div>
    </div>
    ${order.status === "done" || order.status === "cancelled" ? "" : `<p class="track-refresh"><i class="fa-solid fa-rotate"></i> Mise à jour automatique</p>`}`;
}

async function sendFeedback(rating) {
  const id = getOrderId();
  const box = document.getElementById("feedback");
  if (box) box.querySelectorAll("button").forEach(b => b.disabled = true);
  try {
    await submitFeedback(id, rating);
    localStorage.setItem(fbKey(id), String(rating));
    localStorage.removeItem("tanit_last_order_id");
    if (box) box.outerHTML = `<div class="feedback done"><i class="fa-solid fa-heart"></i> Merci pour votre retour !</div>`;
  } catch (e) {
    if (box) box.querySelectorAll("button").forEach(b => b.disabled = false);
    alert("Impossible d'envoyer votre avis. Réessayez.");
  }
}

function notify(title, body) {
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      const n = new Notification(title, { body, icon: "icon.svg", tag: "tanit-track", renotify: true });
      n.onclick = () => { window.focus(); n.close(); };
    } catch (e) {}
  }
}

function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.start(); osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function onStatusChange(status) {
  if (status === "preparing") { notify("Tanit Lounge", "Votre commande est en préparation 👨‍🍳"); beep(); }
  else if (status === "done") { notify("Tanit Lounge", "Votre commande est prête ! 🔔"); beep(); }
  else if (status === "cancelled") { notify("Tanit Lounge", "Votre commande a été annulée."); }
}

async function refresh(id) {
  try {
    const order = await getOrderById(id);
    if (!order) { renderNotFound(); clearInterval(pollTimer); return; }
    if (lastStatus !== null && order.status !== lastStatus) onStatusChange(order.status);
    lastStatus = order.status;
    if (order.status === "cancelled") localStorage.removeItem("tanit_last_order_id");
    render(order);
    if (order.status === "done" || order.status === "cancelled") clearInterval(pollTimer);
  } catch (e) {
    if (lastStatus === null) { renderNotFound(); clearInterval(pollTimer); }
  }
}

function requestNotifications() {
  if (!("Notification" in window) || Notification.permission !== "default") return;
  const ask = () => { Notification.requestPermission().catch(() => {}); window.removeEventListener("pointerdown", ask); };
  window.addEventListener("pointerdown", ask, { once: true });
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getOrderId();
  if (!id) { renderNotFound(); return; }
  requestNotifications();
  refresh(id);
  pollTimer = setInterval(() => refresh(id), 5000);
});
````

### `manifest.json`

PWA manifest.

````json
{
  "name": "Tanit Lounge",
  "short_name": "Tanit",
  "description": "Menu & commandes — Tanit Lounge, Megrine",
  "start_url": "index.html",
  "scope": "./",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1a3a2a",
  "theme_color": "#1a3a2a",
  "icons": [
    { "src": "icon.svg", "sizes": "any", "type": "image/svg+xml", "purpose": "any maskable" }
  ]
}
````

### `sw.js`

Service worker: app-shell cache, stale-while-revalidate. Bump `CACHE` on every deploy.

````js

const CACHE = "tanit-v14";
const ASSETS = [
  "index.html", "cart.html", "track.html",
  "menu-data.js", "script.js", "supabase.js", "cart-script.js", "track-script.js",
  "styles.css", "cart.css", "track.css",
  "manifest.json", "icon.svg", "favicon.svg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  e.respondWith(
    caches.match(req).then((cached) => {
      const network = fetch(req).then((res) => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || network;
    })
  );
});
````

### `supabase/hardening.sql`

Security rules for orders / feedback (admins only, customers insert pending orders, `get_order()` for tracking).

````sql
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create or replace function public.get_order(p_id uuid)
returns table (
  id uuid,
  table_number text,
  items jsonb,
  total numeric,
  status text,
  notes text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select o.id, o.table_number, o.items, o.total, o.status, o.notes, o.created_at
  from public.orders o
  where o.id = p_id;
$$;

revoke execute on function public.get_order(uuid) from public;
grant execute on function public.get_order(uuid) to anon, authenticated;

drop policy if exists "orders_anon_insert" on public.orders;
drop policy if exists "orders_auth_all" on public.orders;
drop policy if exists "orders: customers place orders" on public.orders;
drop policy if exists "orders: admins manage" on public.orders;
create policy "orders: customers place orders" on public.orders for insert to anon, authenticated
  with check (status = 'pending' and jsonb_typeof(items) = 'array' and total >= 0);
create policy "orders: admins manage" on public.orders for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "feedback_auth_all" on public.feedback;
drop policy if exists "feedback: admins manage" on public.feedback;
create policy "feedback: admins manage" on public.feedback for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_auth_all" on public.menu_items;
drop policy if exists "menu_items: admins manage" on public.menu_items;
create policy "menu_items: admins manage" on public.menu_items for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "catimg_auth_all" on public.category_images;
drop policy if exists "category_images: admins manage" on public.category_images;
create policy "category_images: admins manage" on public.category_images for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "menu_photos_auth_insert" on storage.objects;
drop policy if exists "menu_photos_auth_update" on storage.objects;
drop policy if exists "menu_photos_auth_delete" on storage.objects;
create policy "menu_photos_auth_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'menu-photos' and public.is_admin());
create policy "menu_photos_auth_update" on storage.objects for update to authenticated
  using (bucket_id = 'menu-photos' and public.is_admin()) with check (bucket_id = 'menu-photos' and public.is_admin());
create policy "menu_photos_auth_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'menu-photos' and public.is_admin());

update public.categories c
   set image_url = ci.image_url
  from public.category_images ci
 where ci.category = c.name_fr
   and ci.image_url is not null
   and (c.image_url is null or c.image_url like 'https://images.unsplash.com/%');

drop policy if exists "orders_anon_select" on public.orders;
````

---

# PART B — OLD ADMIN PAGE ("GESTION DU MENU"), commit `8d26763`

## How it works

- Staff log in on `login.html`; the token is checked against `/auth/v1/user` on every staff page.
- `admin.html` lists every line of `menu-data.js` (variants as separate lines) by category, with a
  search box. Per line: an "Épuisé" switch and a price override (empty = the coded price), saved at once
  to `menu_items` (keyed by the line name).
- Per category: change the photo (from the phone, resized in the browser, uploaded to the
  `menu-photos` bucket), paste an image URL, or go back to the default photo (`category_images`).
- The public `script.js` of this version reads both tables and applies them over `menu-data.js`.

## Setup

- Run `supabase-setup.sql` in the Supabase SQL editor; turn off e-mail confirmation and sign-ups,
  then create the staff account(s).
- Put the project URL and publishable key at the top of `supabase.js`.
- In this version any logged-in account can write: keep sign-ups off, or restrict the policies to an
  `admins` table as in `supabase/hardening.sql`.

## Files

### `login.html`

Staff login (Supabase Auth e-mail + password), stores the token in sessionStorage (`tanit_token`).

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d1117" />
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="apple-touch-icon" href="icon.svg" />
  <title>Tanit | Staff Login</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: "Inter", sans-serif; background: #0d1117; display: grid;
           place-items: center; min-height: 100vh; }
    .login-card { background: #161b22; border: 1px solid #30363d; border-radius: 16px;
                  padding: 2rem; width: min(360px, 90vw); }
    h1 { font-size: 1.3rem; color: #c9a84c; margin-bottom: 0.4rem; }
    p { font-size: 0.82rem; color: #8b949e; margin-bottom: 1.5rem; }
    label { font-size: 0.8rem; color: #8b949e; display: block; margin-bottom: 0.3rem; }
    input { width: 100%; background: #0d1117; border: 1px solid #30363d; border-radius: 8px;
            padding: 0.65rem 1rem; color: #f0f0f0; font-size: 0.9rem;
            font-family: "Inter", sans-serif; margin-bottom: 1rem; outline: none; }
    input:focus { border-color: #c9a84c; }
    button { width: 100%; background: #c9a84c; color: #1a3a2a; border: none;
             border-radius: 999px; padding: 0.75rem; font-weight: 700;
             font-size: 0.9rem; cursor: pointer; }
    .error { color: #f85149; font-size: 0.82rem; margin-bottom: 1rem; display: none; }
  </style>
</head>
<body>
  <div class="login-card">
    <h1>Tanit Lounge</h1>
    <p>Accès staff uniquement</p>
    <p class="error" id="errorMsg">Email ou mot de passe incorrect.</p>
    <label>Email</label>
    <input type="email" id="email" placeholder="staff@tanit.tn" />
    <label>Mot de passe</label>
    <input type="password" id="password" />
    <button onclick="login()">Se connecter</button>
  </div>

  <script src="supabase.js"></script>
  <script>
    async function login() {
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      try {
        const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "apikey": SUPABASE_KEY },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error_description);
        sessionStorage.setItem("tanit_token", data.access_token);
        window.location.href = "pos.html";
      } catch (err) {
        document.getElementById("errorMsg").style.display = "block";
      }
    }
  </script>
</body>
</html>
````

### `admin.html`

Old "Gestion du menu" page: search, per-item sold-out switch and price override, one photo per category.

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="theme-color" content="#0d1117" />
  <link rel="manifest" href="manifest.json" />
  <link rel="icon" type="image/svg+xml" href="favicon.svg" />
  <link rel="apple-touch-icon" href="icon.svg" />
  <title>Tanit | Gestion du menu</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="pos.css" />
  <link rel="stylesheet" href="admin.css" />
</head>
<body class="pos-body">
  <div class="pos-shell">

    <div class="pos-topbar">
      <div class="pos-brand">
        <strong>Tanit Lounge</strong>
        <span>Gestion du menu</span>
      </div>
      <div class="pos-right">
        <div class="nav-dropdown">
          <button class="nav-dropdown-toggle" id="navToggle" aria-haspopup="true" aria-expanded="false">
            <i class="fa-solid fa-sliders"></i> Menu <i class="fa-solid fa-chevron-down nav-caret"></i>
          </button>
          <div class="nav-dropdown-menu">
            <a href="pos.html"><i class="fa-solid fa-table-columns"></i> POS</a>
            <a href="report.html"><i class="fa-solid fa-chart-line"></i> Rapport</a>
            <a href="admin.html" class="active"><i class="fa-solid fa-sliders"></i> Menu</a>
            <a href="qr.html"><i class="fa-solid fa-qrcode"></i> QR</a>
          </div>
        </div>
        <button class="pos-logout" onclick="logout()"><i class="fa-solid fa-right-from-bracket"></i></button>
      </div>
    </div>

    <div class="admin-toolbar">
      <div class="admin-search">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input type="text" id="adminSearch" placeholder="Rechercher un article…" />
      </div>
      <span id="saveStatus" class="save-status"></span>
    </div>

    <div id="adminList" class="admin-list">
      <p class="empty-pos">Chargement…</p>
    </div>

  </div>

  <script src="menu-data.js"></script>
  <script src="supabase.js"></script>
  <script src="nav.js"></script>
  <script src="admin-script.js"></script>
</body>
</html>
````

### `admin.css`

Styles of the old admin page (dark theme, on top of pos.css).

````css


.admin-toolbar {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-search {
  flex: 1;
  min-width: 220px;
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 999px;
  padding: 0.55rem 1rem;
}
.admin-search i { color: #8b949e; font-size: 0.85rem; }
.admin-search input {
  background: none; border: none; outline: none; width: 100%;
  color: #f0f0f0; font-size: 0.9rem; font-family: "Inter", sans-serif;
}

.save-status {
  font-size: 0.8rem;
  font-weight: 600;
  color: #3fb950;
  opacity: 0;
  transition: opacity 0.2s;
  white-space: nowrap;
}
.save-status.show { opacity: 1; }
.save-status.error { color: #f85149; }

.admin-list { display: flex; flex-direction: column; gap: 1.25rem; }

.admin-cat h2 {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.25rem;
  color: #c9a84c;
  margin: 0 0 0.6rem;
}


.admin-cat-head {
  display: flex;
  gap: 0.9rem;
  align-items: center;
  margin-bottom: 0.6rem;
}

.cat-photo {
  position: relative;
  width: 84px;
  height: 64px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #161b22;
  border: 1px solid #30363d;
}
.cat-thumb { width: 100%; height: 100%; object-fit: cover; display: block; }
.cat-thumb.broken { visibility: hidden; }

.cat-photo-tag {
  position: absolute;
  bottom: 4px; left: 4px;
  background: #c9a84c;
  color: #1a3a2a;
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 1px 5px;
  border-radius: 999px;
}

.cat-photo-body { flex: 1; min-width: 0; }
.cat-photo-body h2 { margin-bottom: 0.4rem; }

.cat-photo-actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }

.photo-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: #1a3a2a;
  color: #c9a84c;
  border: 1px solid #c9a84c44;
  border-radius: 999px;
  padding: 0.4rem 0.85rem;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.2s, color 0.2s;
}
.photo-btn:hover { background: #c9a84c; color: #1a3a2a; }

.cat-url {
  flex: 1;
  min-width: 160px;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 0.4rem 0.7rem;
  font-size: 0.78rem;
  color: #c9d1d9;
  font-family: "Inter", sans-serif;
  outline: none;
}
.cat-url:focus { border-color: #c9a84c; }

.photo-reset {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  flex-shrink: 0;
}
.photo-reset:hover { color: #c9a84c; border-color: #c9a84c; }

.admin-rows {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  overflow: hidden;
}

.admin-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #21262d;
  transition: background 0.2s;
}
.admin-row:last-child { border-bottom: none; }
.admin-row.is-out { background: #1a1518; }
.admin-row.is-out .name { color: #8b949e; text-decoration: line-through; }

.admin-row-name { display: flex; flex-direction: column; gap: 0.15rem; }
.admin-row-name .name { font-size: 0.9rem; font-weight: 600; color: #f0f0f0; }
.admin-row-name .base-price { font-size: 0.72rem; color: #6e7681; }

.admin-row-controls { display: flex; align-items: center; gap: 0.85rem; }

.price-field {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: #0d1117;
  border: 1px solid #30363d;
  border-radius: 8px;
  padding: 0.3rem 0.55rem;
}
.price-field input {
  width: 64px;
  background: none; border: none; outline: none;
  color: #c9a84c; font-size: 0.85rem; font-weight: 600;
  font-family: "Inter", sans-serif; text-align: right;
}
.price-field input:focus { color: #f0f0f0; }
.price-field span { font-size: 0.72rem; color: #6e7681; }

.state-label { font-size: 0.72rem; color: #8b949e; width: 3rem; }


.switch { position: relative; display: inline-block; width: 42px; height: 24px; flex-shrink: 0; }
.switch input { opacity: 0; width: 0; height: 0; }
.slider {
  position: absolute; cursor: pointer; inset: 0;
  background: #30363d; border-radius: 999px; transition: background 0.2s;
}
.slider::before {
  content: ""; position: absolute; height: 18px; width: 18px;
  left: 3px; bottom: 3px; background: #8b949e; border-radius: 50%; transition: transform 0.2s, background 0.2s;
}
.switch input:checked + .slider { background: #1a3a2a; }
.switch input:checked + .slider::before { transform: translateX(18px); background: #c9a84c; }

@media (max-width: 520px) {
  .admin-row { flex-wrap: wrap; }
  .price-field input { width: 52px; }
}
````

### `admin-script.js`

Old admin logic: auth guard, availability / price overrides in `menu_items`, category photo upload (resized in the browser) to the `menu-photos` bucket or by URL, stored in `category_images`.

````js


let overrides = {};
let catImages = {};

async function ensureAuth() {
  const token = sessionStorage.getItem("tanit_token");
  if (!token) { window.location.href = "login.html"; return false; }
  const ok = await validateToken(token);
  if (!ok) { sessionStorage.removeItem("tanit_token"); window.location.href = "login.html"; return false; }
  return true;
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function jsStr(str) { return String(str).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }

function flash(msg, isError) {
  const el = document.getElementById("saveStatus");
  el.textContent = msg;
  el.className = "save-status show" + (isError ? " error" : "");
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { el.className = "save-status"; }, 2200);
}

async function loadData() {
  overrides = {}; catImages = {};
  try {
    const rows = await getMenuItems();
    rows.forEach(r => { overrides[r.name] = r; });
  } catch (e) {
    if (e.status === 401) { logout(); return; }
    flash("Table menu_items absente — lancez le SQL", true);
  }
  try {
    const imgs = await getCategoryImages();
    imgs.forEach(r => { if (r.image_url) catImages[r.category] = r.image_url; });
  } catch (e) {
    if (e.status === 401) { logout(); return; }

  }
}

function currentCatImage(cat) {
  return catImages[cat] || CATEGORY_PLACEHOLDERS[cat] || "";
}

function catPhotoHTML(cat) {
  const c = jsStr(cat);
  const custom = catImages[cat] || "";
  return `
    <div class="cat-photo">
      <img class="cat-thumb" src="${escapeHtml(currentCatImage(cat))}" alt="" loading="lazy"
           onerror="this.classList.add('broken')" />
      ${custom ? `<span class="cat-photo-tag">perso</span>` : ``}
    </div>
    <div class="cat-photo-body">
      <h2>${escapeHtml(cat)}</h2>
      <div class="cat-photo-actions">
        <label class="photo-btn">
          <input type="file" accept="image/*" hidden onchange="onPhotoFile(this, '${c}')" />
          <i class="fa-solid fa-camera"></i> Changer la photo
        </label>
        <input type="text" class="cat-url" placeholder="ou coller un lien d'image…"
               value="${escapeHtml(custom)}" onchange="onPhotoUrl(this, '${c}')" />
        <button class="photo-reset" title="Photo par défaut" onclick="onPhotoReset('${c}')">
          <i class="fa-solid fa-rotate-left"></i>
        </button>
      </div>
    </div>`;
}

function render() {
  const root = document.getElementById("adminList");
  const items = flatMenuItems();

  const byCat = new Map();
  items.forEach(it => {
    if (!byCat.has(it.category)) byCat.set(it.category, []);
    byCat.get(it.category).push(it);
  });

  root.innerHTML = [...byCat.entries()].map(([cat, list]) => `
    <section class="admin-cat" data-cat="${escapeHtml(cat)}">
      <div class="admin-cat-head">${catPhotoHTML(cat)}</div>
      <div class="admin-rows">
        ${list.map(it => {
          const o = overrides[it.name] || {};
          const available = o.available !== false;
          const priceVal = (o.price_override != null) ? o.price_override : "";
          return `
            <div class="admin-row ${available ? "" : "is-out"}" data-name="${escapeHtml(it.name)}">
              <div class="admin-row-name">
                <span class="name">${escapeHtml(it.name)}</span>
                <span class="base-price">défaut ${formatPrice(it.price)}</span>
              </div>
              <div class="admin-row-controls">
                <div class="price-field">
                  <input type="number" step="0.5" min="0" inputmode="decimal"
                    value="${priceVal}" placeholder="${Number(it.price).toFixed(2)}"
                    data-name="${escapeHtml(it.name)}" onchange="onPriceChange(this)" />
                  <span>DT</span>
                </div>
                <label class="switch" title="Disponible / Épuisé">
                  <input type="checkbox" ${available ? "checked" : ""}
                    data-name="${escapeHtml(it.name)}" onchange="onToggle(this)" />
                  <span class="slider"></span>
                </label>
                <span class="state-label">${available ? "Dispo" : "Épuisé"}</span>
              </div>
            </div>`;
        }).join("")}
      </div>
    </section>
  `).join("");
}

function catSection(cat) {
  return [...document.querySelectorAll(".admin-cat")].find(s => s.dataset.cat === cat);
}

function refreshCatPhoto(cat) {
  const section = catSection(cat);
  if (!section) return;
  const img = section.querySelector(".cat-thumb");
  if (img) { img.classList.remove("broken"); img.src = currentCatImage(cat); }
  const url = section.querySelector(".cat-url");
  if (url) url.value = catImages[cat] || "";
  const tag = section.querySelector(".cat-photo-tag");
  if (catImages[cat] && !tag) {
    const span = document.createElement("span");
    span.className = "cat-photo-tag"; span.textContent = "perso";
    section.querySelector(".cat-photo").appendChild(span);
  } else if (!catImages[cat] && tag) {
    tag.remove();
  }
}

function resizeImage(file, maxW = 1000) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const scale = Math.min(1, maxW / img.width);
      const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w; canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      canvas.toBlob(b => b ? resolve(b) : reject(new Error("toBlob failed")), "image/jpeg", 0.82);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load failed")); };
    img.src = url;
  });
}

async function onPhotoFile(input, cat) {
  const file = input.files && input.files[0];
  if (!file) return;
  flash("Envoi de la photo…");
  try {
    const blob = await resizeImage(file);
    const url = await uploadPhoto(blob, "jpg");
    await upsertCategoryImage(cat, url);
    catImages[cat] = url;
    refreshCatPhoto(cat);
    flash(`Photo mise à jour : ${cat}`);
  } catch (e) {
    if (e.status === 401) return logout();
    flash("Échec de l'envoi (table/bucket manquant ?)", true);
  } finally {
    input.value = "";
  }
}

async function onPhotoUrl(input, cat) {
  const url = input.value.trim();
  try {
    await upsertCategoryImage(cat, url || null);
    if (url) catImages[cat] = url; else delete catImages[cat];
    refreshCatPhoto(cat);
    flash(url ? `Photo mise à jour : ${cat}` : `Photo par défaut : ${cat}`);
  } catch (e) {
    if (e.status === 401) return logout();
    flash("Échec de l'enregistrement", true);
  }
}

async function onPhotoReset(cat) {
  try {
    await upsertCategoryImage(cat, null);
    delete catImages[cat];
    refreshCatPhoto(cat);
    flash(`Photo par défaut : ${cat}`);
  } catch (e) {
    if (e.status === 401) return logout();
    flash("Échec de l'enregistrement", true);
  }
}

async function onToggle(input) {
  const name = input.dataset.name;
  const available = input.checked;
  const row = input.closest(".admin-row");
  row.classList.toggle("is-out", !available);
  row.querySelector(".state-label").textContent = available ? "Dispo" : "Épuisé";
  overrides[name] = { ...(overrides[name] || {}), name, available };
  try {
    await upsertMenuItem({ name, available });
    flash(available ? `${name} : disponible` : `${name} : épuisé`);
  } catch (e) {
    if (e.status === 401) return logout();
    flash("Échec de l'enregistrement", true);
  }
}

async function onPriceChange(input) {
  const name = input.dataset.name;
  const raw = input.value.trim();
  const price_override = raw === "" ? null : Number(raw);
  if (raw !== "" && (isNaN(price_override) || price_override < 0)) {
    flash("Prix invalide", true);
    return;
  }
  overrides[name] = { ...(overrides[name] || {}), name, price_override };
  try {
    await upsertMenuItem({ name, price_override });
    flash(price_override == null ? `${name} : prix par défaut` : `${name} : ${formatPrice(price_override)}`);
  } catch (e) {
    if (e.status === 401) return logout();
    flash("Échec de l'enregistrement", true);
  }
}

function setupSearch() {
  const input = document.getElementById("adminSearch");
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    document.querySelectorAll(".admin-cat").forEach(cat => {
      const catMatch = cat.dataset.cat.toLowerCase().includes(q);
      let any = catMatch;
      cat.querySelectorAll(".admin-row").forEach(row => {
        const match = catMatch || row.dataset.name.toLowerCase().includes(q);
        row.style.display = match ? "" : "none";
        if (match) any = true;
      });
      cat.style.display = any ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await ensureAuth())) return;
  await loadData();
  render();
  setupSearch();
});
````

### `pos.css`

Shared dark staff theme (topbar, nav dropdown) loaded by the admin page.

````css
* { box-sizing: border-box; margin: 0; padding: 0; }

body.pos-body {
  font-family: "Inter", sans-serif;
  background: #0d1117;
  color: #f0f0f0;
  min-height: 100vh;
}

.pos-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
}


.pos-topbar {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pos-brand strong {
  font-family: "Cormorant Garamond", serif;
  font-size: 1.3rem;
  color: #c9a84c;
  display: block;
}

.pos-brand span { font-size: 0.8rem; color: #8b949e; }

.pos-time { font-size: 0.95rem; color: #c9a84c; font-variant-numeric: tabular-nums; }


.pos-right { display: flex; align-items: center; gap: 0.75rem; }

.nav-dropdown { position: relative; }

.nav-dropdown-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8b949e;
  background: transparent;
  text-decoration: none;
  padding: 0.4rem 0.75rem;
  border: 1px solid #30363d;
  border-radius: 999px;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  transition: color 0.2s, border-color 0.2s;
}
.nav-dropdown-toggle:hover,
.nav-dropdown.open .nav-dropdown-toggle { color: #c9a84c; border-color: #c9a84c; }

.nav-caret { font-size: 0.62rem; transition: transform 0.2s ease; }
.nav-dropdown.open .nav-caret { transform: rotate(180deg); }

.nav-dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  min-width: 175px;
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  padding: 0.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  box-shadow: 0 14px 32px rgba(0, 0, 0, 0.4);
  opacity: 0;
  transform: translateY(-6px);
  pointer-events: none;
  transition: opacity 0.18s ease, transform 0.18s ease;
  z-index: 50;
}
.nav-dropdown.open .nav-dropdown-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.nav-dropdown-menu a {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.55rem 0.7rem;
  border-radius: 9px;
  font-size: 0.82rem;
  font-weight: 600;
  color: #c9d1d9;
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}
.nav-dropdown-menu a i { width: 1rem; text-align: center; color: #8b949e; transition: color 0.15s; }
.nav-dropdown-menu a:hover { background: #1c2128; color: #c9a84c; }
.nav-dropdown-menu a:hover i { color: #c9a84c; }
.nav-dropdown-menu a.active { color: #c9a84c; background: #1a3a2a; }
.nav-dropdown-menu a.active i { color: #c9a84c; }

.pos-logout {
  background: transparent;
  border: 1px solid #30363d;
  color: #8b949e;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  cursor: pointer;
  display: grid;
  place-items: center;
  transition: color 0.2s, border-color 0.2s;
}
.pos-logout:hover { color: #f85149; border-color: #f85149; }


.stats-bar {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
}

.stat-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 14px;
  padding: 0.9rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.stat-card.highlight {
  border-color: #c9a84c44;
  background: #1a1f26;
}

.stat-label { font-size: 0.72rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; }
.stat-value { font-size: 1.35rem; font-weight: 700; color: #c9a84c; }


.filter-tabs {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-tab {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  color: #8b949e;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  transition: all 0.2s;
  font-family: "Inter", sans-serif;
}

.filter-tab:hover { border-color: #c9a84c; color: #c9a84c; }
.filter-tab.active { background: #c9a84c; border-color: #c9a84c; color: #1a3a2a; }

.tab-badge {
  background: #1a3a2a;
  color: #c9a84c;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.72rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.filter-tab.active .tab-badge { background: #1a3a2a; color: #c9a84c; }


.pos-orders {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  align-content: start;
  flex: 1;
}

.empty-pos {
  color: #8b949e;
  font-size: 0.95rem;
  grid-column: 1/-1;
  text-align: center;
  padding: 3rem;
}


.order-card {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 16px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  animation: slideIn 0.3s ease;
}

.order-card.new { border-color: #c9a84c; box-shadow: 0 0 0 1px #c9a84c33; }

.order-card.order-late {
  border-color: #f85149;
  box-shadow: 0 0 0 1px #f8514933;
}

.order-card.order-done { opacity: 0.6; border-color: #238636; }
.order-card.order-cancelled { opacity: 0.5; border-color: #6e7681; }

.order-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-head h3 { font-size: 1rem; color: #f0f0f0; display: flex; align-items: center; gap: 0.4rem; }
.order-head h3 i { color: #c9a84c; font-size: 0.85rem; }

.tbl-badge {
  font-size: 0.6rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  padding: 0.14rem 0.45rem;
  border-radius: 999px;
  margin-left: 0.4rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  vertical-align: middle;
}
.tbl-badge i { font-size: 0.6rem; }
.tbl-badge.ok { color: #3fb950; background: #23863622; border: 1px solid #23863644; }
.tbl-badge.warn { color: #e3a008; background: #e3a00822; border: 1px solid #e3a00844; }
.order-head strong { color: #c9a84c; font-size: 0.95rem; }


.late-warning {
  background: #f8514922;
  border: 1px solid #f8514944;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.8rem;
  color: #f85149;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-weight: 600;
}


.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 0.3rem 0.75rem;
  border-radius: 999px;
}

.status-badge.preparing { background: #c9a84c22; color: #c9a84c; border: 1px solid #c9a84c44; }
.status-badge.done { background: #23863622; color: #3fb950; border: 1px solid #23863644; }
.status-badge.cancelled { background: #6e768122; color: #8b949e; border: 1px solid #6e768144; }


.order-card.order-preparing { border-color: #c9a84c66; }


.order-note {
  background: #1c2128;
  border: 1px solid #30363d;
  border-left: 3px solid #c9a84c;
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  font-size: 0.82rem;
  color: #d6c79a;
  display: flex;
  align-items: flex-start;
  gap: 0.45rem;
}
.order-note i { color: #c9a84c; margin-top: 0.15rem; font-size: 0.75rem; }


.order-items { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 0.25rem; }
.order-items li { font-size: 0.85rem; color: #c9d1d9; padding: 0.25rem 0; border-bottom: 1px solid #21262d; }
.order-items li:last-child { border-bottom: none; }
.item-subtotal-pos { color: #8b949e; font-size: 0.8rem; }


.order-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.order-time { font-size: 0.78rem; color: #8b949e; display: flex; align-items: center; gap: 0.3rem; }

.order-actions { display: flex; gap: 0.5rem; }

.btn-done {
  background: #1a3a2a;
  color: #c9a84c;
  border: 1px solid #c9a84c44;
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background 0.2s, color 0.2s;
}

.btn-done:hover { background: #c9a84c; color: #1a3a2a; }

.btn-start {
  background: #c9a84c;
  color: #1a3a2a;
  border: 1px solid #c9a84c;
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: filter 0.2s;
}
.btn-start:hover { filter: brightness(1.08); }

.btn-cancel {
  background: transparent;
  color: #8b949e;
  border: 1px solid #30363d;
  border-radius: 999px;
  padding: 0.45rem 1rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  font-family: "Inter", sans-serif;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.btn-cancel:hover { background: #f8514922; color: #f85149; border-color: #f85149; }


@media (max-width: 600px) {
  .pos-shell { padding: 0.75rem; gap: 0.6rem; }
  .pos-topbar { flex-wrap: wrap; gap: 0.6rem; padding: 0.85rem 1rem; }
  .pos-brand strong { font-size: 1.15rem; }
  .pos-right { flex-wrap: wrap; gap: 0.4rem; }
  .nav-dropdown-toggle { padding: 0.35rem 0.65rem; font-size: 0.72rem; }
  .pos-time { font-size: 0.85rem; }
  .stats-bar { grid-template-columns: repeat(2, 1fr); }
  .pos-orders { grid-template-columns: 1fr; }
  .filter-tab { padding: 0.45rem 0.8rem; font-size: 0.78rem; }
}


@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
````

### `nav.js`

Staff nav dropdown (POS / Rapport / Menu / QR).

````js
function setupNavDropdown() {
  const dropdown = document.querySelector(".nav-dropdown");
  const toggle = document.getElementById("navToggle");
  if (!dropdown || !toggle) return;

  function setOpen(open) {
    dropdown.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }

  toggle.addEventListener("click", (e) => {
    e.stopPropagation();
    setOpen(!dropdown.classList.contains("open"));
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setOpen(false);
  });
}

document.addEventListener("DOMContentLoaded", setupNavDropdown);
````

### `supabase.js`

Network helpers of that version, including `getMenuItems`, `upsertMenuItem`, `getCategoryImages`, `upsertCategoryImage`, `uploadPhoto`.

````js
const SUPABASE_URL = "https://wuiimhdiqsrvwnoovoxg.supabase.co";
const SUPABASE_KEY = "sb_publishable_aPa4RDt8MV4ybjFmZkt9AQ_-e8vHCa2";

function getAuthToken() {
  return sessionStorage.getItem("tanit_token") || SUPABASE_KEY;
}

async function supabaseRequest(method, path, body = null, extraHeaders = {}) {
  const headers = {
    "Content-Type": "application/json",
    "apikey": SUPABASE_KEY,
    "Authorization": `Bearer ${getAuthToken()}`,
    ...extraHeaders
  };
  if (method === "POST" || method === "PATCH") {
    headers["Prefer"] = extraHeaders["Prefer"] || "return=representation";
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, options);
  if (!res.ok) {
    const err = new Error((await res.text()) || res.statusText);
    err.status = res.status;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function getOrders() {
  return supabaseRequest("GET", "/orders?select=*&order=created_at.desc");
}

async function getOrderById(id) {
  const rows = await supabaseRequest("GET", `/orders?id=eq.${id}&select=*`);
  return rows[0] || null;
}

async function createOrder(tableNumber, items, total, notes, tableVerified) {
  const base = { table_number: tableNumber, items, total, status: "pending" };
  const withNotes = (notes && notes.trim()) ? { ...base, notes: notes.trim() } : { ...base };
  const full = { ...withNotes, table_verified: !!tableVerified };
  try {
    return (await supabaseRequest("POST", "/orders", full))[0] || null;
  } catch (e1) {
    try {
      return (await supabaseRequest("POST", "/orders", withNotes))[0] || null;
    } catch (e2) {
      return (await supabaseRequest("POST", "/orders", base))[0] || null;
    }
  }
}

async function updateOrderStatus(id, status) {
  return supabaseRequest("PATCH", `/orders?id=eq.${id}`, { status });
}

async function getMenuItems() {
  return supabaseRequest("GET", "/menu_items?select=*");
}

async function upsertMenuItem(row) {
  return supabaseRequest(
    "POST", "/menu_items",
    { ...row, updated_at: new Date().toISOString() },
    { "Prefer": "resolution=merge-duplicates,return=representation" }
  );
}

async function getCategoryImages() {
  return supabaseRequest("GET", "/category_images?select=*");
}

async function upsertCategoryImage(category, image_url) {
  return supabaseRequest(
    "POST", "/category_images",
    { category, image_url, updated_at: new Date().toISOString() },
    { "Prefer": "resolution=merge-duplicates,return=representation" }
  );
}

function publicPhotoUrl(path) {
  return `${SUPABASE_URL}/storage/v1/object/public/menu-photos/${path}`;
}

async function uploadPhoto(fileOrBlob, ext = "jpg") {
  const path = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/menu-photos/${path}`, {
    method: "POST",
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${getAuthToken()}`,
      "Content-Type": fileOrBlob.type || "image/jpeg",
      "x-upsert": "true"
    },
    body: fileOrBlob
  });
  if (!res.ok) {
    const err = new Error((await res.text()) || res.statusText);
    err.status = res.status;
    throw err;
  }
  return publicPhotoUrl(path);
}

async function submitFeedback(orderId, rating) {
  return supabaseRequest("POST", "/feedback", { order_id: orderId || null, rating }, { "Prefer": "return=minimal" });
}

async function getFeedback() {
  return supabaseRequest("GET", "/feedback?select=*&order=created_at.desc");
}

async function validateToken(token) {
  if (!token || token === SUPABASE_KEY) return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}

function logout() {
  sessionStorage.removeItem("tanit_token");
  window.location.href = "login.html";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
````

### `menu-data.js`

The menu in code (the old admin only stores overrides on top of it).

````js



const MENU_DATA = [
  { category: "Petit Déjeuner", image: "", items: [
    { name: "Classique", price: 7.5, desc: "Café au choix - Eau 1/2 - 1 Viennoiserie - Jus" },
    { name: "Le Bonjour", price: 15, desc: "Café au choix - Eau 1/2 - Viennoiserie - Assiette charcuterie & fromages - Jus - Omelette fromage" },
    { name: "Familly", price: 28, desc: "2 cafés au choix - 2 jus - Eau 1L - 2 viennoiseries - Assiette charcuterie & fromages - 2 mini crêpes - 2 omelettes fromage - Corbeille de pain" }
  ]},
  { category: "Café", image: "", items: [
    { name: "Express", price: 3.5, desc: "" },
    { name: "Capucin", price: 4, desc: "" },
    { name: "Café Crème", price: 4.5, desc: "" },
    { name: "Americain", price: 4.5, desc: "" },
    { name: "Café Turc", price: 6.5, desc: "" },
    { name: "Chocolat au lait", price: 4.5, desc: "" },
    { name: "Nescafé", price: 4.5, desc: "" },
    { name: "Cappuccino", price: 7.5, desc: "" },
    { name: "Café Glacé", price: 7, desc: "Noisette - Vanille - Caramel" }
  ]},
  { category: "Thé", image: "", items: [
    { name: "Thé à la menthe", price: 3.5, desc: "" },
    { name: "Thé aux amandes", price: 7.5, desc: "" },
    { name: "Thé aux pignons", price: 10, desc: "" },
    { name: "Thé Baklawa", price: 13, desc: "" },
    { name: "Thé infusion", price: 4.5, desc: "" },
    { name: "Supplément Nestlé", price: 3, desc: "Supplément" },
    { name: "Supplément Arôme", price: 2.5, desc: "Supplément" }
  ]},
  { category: "Drinks", image: "", items: [
    { name: "Eau 1/2L", price: 2, desc: "" },
    { name: "Eau 1L", price: 3.5, desc: "" },
    { name: "Soda", price: 4.5, desc: "" },
    { name: "Boisson Énergétique", price: 10, desc: "" }
  ]},
  { category: "Chocolat", image: "", items: [
    { name: "Chocolat Classique", price: 7, desc: "Chaud ou glacé" },
    { name: "Chocolat Nutella", price: 9, desc: "Chaud ou glacé" },
    { name: "Chocolat Au choix", price: 11, desc: "Oreo - Snickers - Kinder - Spéculoos - Ferrero" }
  ]},
  { category: "Dessert", image: "", items: [
    { name: "Cheesecake", price: 8, desc: "Nutella - Oreo - Spéculoos - Ferrero" },
    { name: "Gâteau", price: 11, desc: "" },
    { name: "Jwajem", price: 13, desc: "" },
    { name: "Saint Sébastien", price: 13, desc: "" },
    { name: "Assiette de fruits", price: 25, desc: "" }
  ]},
  { category: "Mojito", image: "", items: [
    { name: "Mojito Virgin", price: 10, desc: "" },
    { name: "Mojito Bleu", price: 12, desc: "" },
    { name: "Mojito Red", price: 12, desc: "" },
    { name: "Mojito Black", price: 12, desc: "" },
    { name: "Mojito Énergétique", price: 18, desc: "" },
    { name: "Suppléments Arôme", price: 2.5, desc: "" },
    { name: "Suppléments Nestlé", price: 3, desc: "" },
    { name: "Suppléments Chantilly", price: 3.5, desc: "" },
    { name: "Suppléments Amandes", price: 4, desc: "" },
    { name: "Suppléments Pignons", price: 6.5, desc: "" }
  ]},
  { category: "Jus", image: "", items: [
    { name: "Citronnade", price: 6.5, desc: "" },
    { name: "Jus d'orange", price: 6, desc: "" },
    { name: "Jus de fraise", price: 7, desc: "" },
    { name: "Citronnade à la menthe", price: 7.5, desc: "" },
    { name: "Citronnade aux amandes", price: 10, desc: "" },
    { name: "Jus fruits de saison", price: 10, desc: "Banane / Ananas / Kiwi / Pomme / Fruit rouge" }
  ]},
  { category: "Detox", image: "", items: [
    { name: "Detox Strong", price: 13, desc: "Pomme - Carotte - Gingembre" },
    { name: "Detox Red", price: 13, desc: "Betterave - Fraise - Citron" },
    { name: "Detox Green", price: 13, desc: "Concombre - Kiwi - Menthe - Citron" }
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
    { name: "Chicken Burger", desc: "", variants: [ { label: "Simple", price: 10 }, { label: "Double", price: 14 } ] },
    { name: "Beef Burger", desc: "", variants: [ { label: "Simple", price: 13 }, { label: "Double", price: 18 } ] }
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
    { name: "Grillade Fruit de Mer", desc: "", variants: [ { label: "1 personne", price: 36 }, { label: "2 personnes", price: 48 } ] },
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
  "Formule Tanit": "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  "Café": "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
  "Thé": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&q=80",
  "Drinks": "https://images.unsplash.com/photo-1437418747212-8d9709afab22?w=800&q=80",
  "Chocolat": "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=800&q=80",
  "Dessert": "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=800&q=80",
  "Mojito": "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=800&q=80",
  "Jus": "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800&q=80",
  "Detox": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&q=80"
};



function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");
}


function baseName(name) {
  return String(name).replace(/\s*\([^()]*\)\s*$/, "").trim();
}


function itemCategory(name) {
  const base = baseName(name);
  for (const block of MENU_DATA) {
    if (block.items.some(it => it.name === name || it.name === base)) {
      return block.category;
    }
  }
  return "";
}


function flatMenuItems() {
  const out = [];
  for (const block of MENU_DATA) {
    for (const it of block.items) {
      if (it.variants && it.variants.length) {
        it.variants.forEach(v => out.push({
          category: block.category,
          name: `${it.name} (${v.label})`,
          baseName: it.name,
          price: v.price
        }));
      } else {
        out.push({ category: block.category, name: it.name, baseName: it.name, price: it.price });
      }
    }
  }
  return out;
}
````

### `script.js`

The public menu script of that version, which reads the overrides (`menu_items`) and category photos (`category_images`).

````js

let MENU_OVERRIDES = {};
let CATEGORY_IMAGES = {};

async function loadOverrides() {
  try {
    const rows = await getMenuItems();
    MENU_OVERRIDES = {};
    rows.forEach(r => { MENU_OVERRIDES[r.name] = r; });
  } catch (e) {
    MENU_OVERRIDES = {};
  }
  try {
    const imgs = await getCategoryImages();
    CATEGORY_IMAGES = {};
    imgs.forEach(r => { if (r.image_url) CATEGORY_IMAGES[r.category] = r.image_url; });
  } catch (e) {
    CATEGORY_IMAGES = {};
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
  renderNavbar();
  renderMenu();
  updateCartBadge();
  updateTrackButton();
  await loadOverrides();
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
````

### `supabase-setup.sql`

Database for that version: orders, menu_items, category_images, feedback, RLS, `menu-photos` bucket.

````sql
-- =====================================================================
-- TANIT LOUNGE — Supabase setup
-- Run this in your Supabase dashboard:  SQL Editor → New query → paste → Run
-- Project: wuiimhdiqsrvwnoovoxg
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) ORDERS — add columns for notes and (optional) a stable order code
-- ---------------------------------------------------------------------
alter table public.orders
  add column if not exists notes text;

-- Whether the customer confirmed their table by scanning its QR (anti-fraud).
alter table public.orders
  add column if not exists table_verified boolean not null default false;

-- The app uses these status values: pending | preparing | done | cancelled
-- If you have a CHECK constraint on status, replace it so "preparing" is allowed:
do $$
begin
  if exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'orders' and column_name = 'status'
      and constraint_name = 'orders_status_check'
  ) then
    alter table public.orders drop constraint orders_status_check;
  end if;
end $$;

alter table public.orders
  add constraint orders_status_check
  check (status in ('pending','preparing','done','cancelled'));

-- ---------------------------------------------------------------------
-- 2) MENU_ITEMS — back-office: availability + price override per item
--    Keyed by the item name as it appears in menu-data.js.
-- ---------------------------------------------------------------------
create table if not exists public.menu_items (
  name           text primary key,
  available      boolean not null default true,
  price_override numeric,            -- null = use the price coded in menu-data.js
  updated_at     timestamptz not null default now()
);

-- =====================================================================
-- 3) SECURITY (Row Level Security)
--    Run this block LAST and test the app right after.
--    Rollback if anything breaks:  the two "disable row level security"
--    lines at the bottom of this file.
-- =====================================================================

-- First wipe ANY pre-existing policies on these tables. (A leftover
-- "allow all" policy from the table's initial setup would otherwise keep
-- granting anon writes, because RLS policies are combined with OR.)
do $$
declare pol record;
begin
  for pol in select policyname, tablename from pg_policies
             where schemaname = 'public' and tablename in ('orders','menu_items') loop
    execute format('drop policy if exists %I on public.%I', pol.policyname, pol.tablename);
  end loop;
end $$;

-- ORDERS ------------------------------------------------------------
alter table public.orders enable row level security;

-- Customers (anon) may place an order and read order(s) — needed for the
-- order-tracking page. They may NOT modify or delete.
create policy "orders_anon_insert" on public.orders
  for insert to anon with check (true);

create policy "orders_anon_select" on public.orders
  for select to anon using (true);

-- Staff (logged-in) may do everything.
create policy "orders_auth_all" on public.orders
  for all to authenticated using (true) with check (true);

-- MENU_ITEMS --------------------------------------------------------
alter table public.menu_items enable row level security;

-- Anyone can read availability / price overrides (the public menu needs it).
create policy "menu_anon_select" on public.menu_items
  for select to anon using (true);

-- Only staff can change availability / prices.
create policy "menu_auth_all" on public.menu_items
  for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------
-- 4) CATEGORY IMAGES — custom photo per menu category + photo storage
-- ---------------------------------------------------------------------
create table if not exists public.category_images (
  category   text primary key,
  image_url  text,
  updated_at timestamptz not null default now()
);

alter table public.category_images enable row level security;

drop policy if exists "catimg_anon_select" on public.category_images;
create policy "catimg_anon_select" on public.category_images
  for select to anon using (true);

drop policy if exists "catimg_auth_all" on public.category_images;
create policy "catimg_auth_all" on public.category_images
  for all to authenticated using (true) with check (true);

-- Public storage bucket for uploaded dish photos.
insert into storage.buckets (id, name, public)
values ('menu-photos', 'menu-photos', true)
on conflict (id) do nothing;

-- Anyone can view photos; only staff (authenticated) can upload/replace.
drop policy if exists "menu_photos_public_read" on storage.objects;
create policy "menu_photos_public_read" on storage.objects
  for select to public using (bucket_id = 'menu-photos');

drop policy if exists "menu_photos_auth_insert" on storage.objects;
create policy "menu_photos_auth_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'menu-photos');

drop policy if exists "menu_photos_auth_update" on storage.objects;
create policy "menu_photos_auth_update" on storage.objects
  for update to authenticated using (bucket_id = 'menu-photos') with check (bucket_id = 'menu-photos');

drop policy if exists "menu_photos_auth_delete" on storage.objects;
create policy "menu_photos_auth_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'menu-photos');

-- ---------------------------------------------------------------------
-- 5) FEEDBACK — customer service rating (1-5) submitted from track.html
-- ---------------------------------------------------------------------
create table if not exists public.feedback (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid,
  rating     smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now()
);

alter table public.feedback enable row level security;

drop policy if exists "feedback_anon_insert" on public.feedback;
create policy "feedback_anon_insert" on public.feedback
  for insert to anon with check (rating between 1 and 5);

drop policy if exists "feedback_auth_all" on public.feedback;
create policy "feedback_auth_all" on public.feedback
  for all to authenticated using (true) with check (true);

-- =====================================================================
-- ROLLBACK (only if the app breaks after enabling RLS) — run these two:
-- alter table public.orders disable row level security;
-- alter table public.menu_items disable row level security;
-- =====================================================================
````
