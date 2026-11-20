# Café Menu Website (Front End) — Blueprint

A ready-to-build public menu page for a café: phone first, French / English, with a sticky header
(☰ menu, logo, search, FR / EN), a hero, a category bar, collapsible photo categories, a search panel,
a "Ma sélection" list with a total, and a footer with the café's contact details. The menu and the
details come from a Supabase project that the owner edits on an admin page; without Supabase the page
runs on a built-in copy of the menu.

This file holds the complete, working source of that page, taken from a live café site, with every
café-specific detail (name, logo, colours, fonts, texts, links, menu, keys) replaced by a placeholder
such as `{{BRAND_NAME}}`.

**Companion file:** `ADMIN-BLUEPRINT.md` holds the owner's admin page, the Supabase database
(`schema.sql`, setup, seed tool) and the data contract this page follows. Both files use the same
placeholder names for shared values (colours, fonts, currency, Supabase), so one set of values fills
both. This page also works alone: leave `supabase-config.js` empty and it shows `menu-data.js`.

- **Part 0** — Rules and build steps.
- **Part 1** — Placeholder dictionary.
- **Part 2** — What the page does (specification).
- **Part 3** — The menu: `menu-data.js`.
- **Part 4** — Complete source files, with placeholders.
- **Part 5** — Testing.
- **Part 6** — Pitfalls already solved.
- **Part 7** — Acceptance checks.

---

# PART 0 — RULES AND BUILD STEPS

## 0.1 Rules

1. **Same page, new café.** Keep every file, function, rule and behaviour of Part 4. Change only the
   placeholder values, the menu, the logo and the photos. Do not add, remove or "improve" features while
   building; propose them separately once the page works.
2. **No framework, no build step, no npm packages, no server code.** Plain HTML, CSS and JavaScript:
   four classic scripts at the end of `<body>`, in this order: `menu-data.js`, `translations.js`,
   `supabase-config.js`, `script.js`. External resources: Google Fonts, Font Awesome 6.5.0 (footer
   icons, from cdnjs) and the café's Supabase project (one `fetch` for the menu, one for the details).
3. **No comments in the code files.** The source in Part 4 is comment-free on purpose; keep it that way.
4. **Text safety.** Text from the menu or the database is always inserted with `textContent` (the
   `el()` helper), never `innerHTML`. `innerHTML` is used only for the fixed `+` / `−` SVG icons.
5. **Never invent** names, prices, descriptions, hours, addresses or links: they come from the owner or
   the menu. Anything unknown is left out (see each placeholder) and listed for the owner to confirm.
6. **Languages:** French is the default, English the second language. The brand name and subtitle are
   never translated; the café's own creations keep their name in both languages.
7. **Only the publishable Supabase key** goes in `supabase-config.js`, never the secret key.

## 0.2 Build steps

1. Collect a value for every placeholder of Part 1 (those shared with `ADMIN-BLUEPRINT.md` have the
   same names and values).
2. Write the menu as `menu-data.js` (Part 3) and check every price against the café's menu twice.
3. Create the files of Part 4 with the placeholders replaced, at the root of the site folder, plus the
   logo file at `{{LOGO_PATH}}`.
4. Check nothing is left: `grep -rn "{{" index.html styles.css script.js translations.js menu-data.js supabase-config.js`
   must print nothing.
5. Check the brand name's width (Part 2.1): header at 375, 360 and 320 px wide, hero title at 320 px.
6. Test with `supabase-config.js` empty (built-in menu), then with the Supabase project of
   `ADMIN-BLUEPRINT.md` (Part 5).
7. Run the acceptance checks (Part 7) on a 375 × 812 phone screen and on desktop, in French and English.

---

# PART 1 — PLACEHOLDER DICTIONARY

**The same value is written differently per file.** In `index.html` write `&` as `&amp;` and `"` as
`&quot;` (e.g. `Coffee &amp; Bakery`). In the `.js` files (`translations.js`, `script.js`) write the
plain characters (e.g. `Coffee & Bakery`): the page sets the browser title from `translations.js`, so
`&amp;` there would show literally. Every `.js` placeholder sits inside double quotes: a straight
double quote in a value must be written `\"` (better: use « » or “ ”).

### Identity and texts

| Placeholder | Meaning and format |
|---|---|
| `{{BRAND_NAME}}` | The café's short name as on its sign. Header, hero, footer, page title. Shown in capitals in the header and hero (CSS), as written in the footer. Never translated. |
| `{{BRAND_SUB}}` | Subtitle: the type of place, e.g. `Coffee & Bakery` (`Coffee &amp; Bakery` in `index.html`). Hero, footer, page title, copyright. Never translated. |
| `{{SITE_SLUG}}` | Lowercase id (a–z, 0–9, `-`), unique per café: browser storage keys `{{SITE_SLUG}}-lang`, `-menu-v1`, `-info-v1`, `-selection`. |
| `{{LOGO_PATH}}` | Path of the logo image (header 34 px, hero 104 / 120 px, footer 84 px). The page crops it to a circle (`border-radius: 50%` on `.brand img`, `.hero-logo`, `.site-footer-logo`); remove those radii if the logo is not round. |
| `{{FAVICON_PATH}}` | Path of the browser-tab icon (often the logo file). |
| `{{TAGLINE_FR}}` / `{{TAGLINE_EN}}` | One short sentence under the brand in the footer, in the café's voice, e.g. "Votre pause café au cœur de …" / "Your coffee break in the heart of …". |
| `{{SEARCH_EXAMPLE_FR}}` / `{{SEARCH_EXAMPLE_EN}}` | Placeholder of the search field: "Ex." / "e.g." followed by three products of this menu and "…", e.g. `Ex. cappuccino, crêpe, mojito…` |
| `{{CREDIT_NAME}}` | Name in the footer credit "Réalisé par …" / "Made by …" (the person or studio that built the site). |
| `{{YEAR}}` | Copyright year in the footer, e.g. `2026`. |

### Contact (footer; the admin's "Infos" tab replaces them once saved)

| Placeholder | Meaning and format |
|---|---|
| `{{PHONE}}` | Phone as shown, e.g. `+33 6 12 34 56 78`. No phone: remove the whole phone `<li>` in the footer. |
| `{{PHONE_TEL}}` | The same number for the `tel:` link: digits and a leading `+` only, e.g. `+33612345678`. |
| `{{ADDRESS}}` | Street address as the owner writes it. |
| `{{MAPS_URL}}` | The café's Google Maps link (`https://maps.app.goo.gl/…` or `https://www.google.com/maps/…`). Used by the address, the Maps button, and as the fallback link of the ☰ menu's address. |
| `{{HOURS_FR}}` / `{{HOURS_EN}}` | Opening hours line, e.g. `Lun-Dim, 07:00 - 23:00` / `Mon-Sun, 07:00 - 23:00`, or `Lun-Ven, 08:00 - 20:00 · Sam-Dim, 09:00 - 22:00`. |
| `{{REVIEW_URL}}` | Direct Google review link ("Laisser un avis"); `{{MAPS_URL}}` until the owner gives it. |
| `{{INSTAGRAM_URL}}` | Instagram profile, e.g. `https://www.instagram.com/<account>/` (the ☰ menu shows `@<account>` from it). |
| `{{FACEBOOK_URL}}` | Facebook page. No page: remove the Facebook button in the footer. |

### Colours (`:root` of `styles.css`)

Check every text pair with a contrast checker (WCAG AA, 4.5:1 for text).

| Placeholder | CSS token and role |
|---|---|
| `{{COLOR_PRIMARY}}` | `--navy`: header, hero, category bar, footer, selection pill, buttons; also `theme-color` in `index.html`. Must be dark: white text on it ≥ 4.5:1. |
| `{{COLOR_PRIMARY_DEEP}}` | `--navy-deep`: bottom glow of the hero, button hover (about 30 % darker). |
| `{{COLOR_BACKGROUND}}` | `--bg`: page background (off-white), active FR / EN button. |
| `{{COLOR_SURFACE}}` | `--bg-soft`: row hover, "not updated" note, badges (one step deeper than the background). |
| `{{COLOR_HAIRLINE}}` | `--line`: lines between rows, borders (one more step deeper). |
| `{{COLOR_TEXT}}` | `--text`: main text, toast background (near-black in the palette's hue). |
| `{{COLOR_TEXT_MUTED}}` | `--muted`: descriptions and small text on white cards (≥ 4.5:1 on white). |
| `{{COLOR_TEXT_SOFT}}` | `--muted-dark`: small secondary text on the page background (≥ 4.5:1 on `{{COLOR_BACKGROUND}}`). |
| `{{COLOR_ACCENT}}` | `--accent`: prices, active category chip, footer titles and icons, decoration. |
| `{{COLOR_ACCENT_LIGHT}}` | `--accent-soft`: small text and icons on the dark header (≥ 4.5:1 on the primary). |
| `{{RGB_PRIMARY}}` | `{{COLOR_PRIMARY}}` written `r, g, b` (shadows, overlays, focus rings), e.g. `18, 52, 86`. |
| `{{RGB_ACCENT}}` | `{{COLOR_ACCENT}}` written `r, g, b` (thin borders on dark areas, search highlight). |
| `{{RGB_ACCENT_LIGHT}}` | `{{COLOR_ACCENT_LIGHT}}` written `r, g, b` (glow at the top of the hero). |
| `{{RGB_TEXT}}` | `{{COLOR_TEXT}}` written `r, g, b` (dark backdrop behind sheets). |

### Fonts

| Placeholder | Meaning and format |
|---|---|
| `{{GOOGLE_FONTS_URL}}` | Google Fonts stylesheet for both fonts, with the display font's italic 600 (titles in the ☰ menu and the selection sheet are italic), e.g. `https://fonts.googleapis.com/css2?family=<Display>:ital,wght@0,400;0,600;0,700;1,600&family=<Body>:wght@400;500;600;700&display=swap` (in `index.html` write each `&` as `&amp;`). |
| `{{FONT_DISPLAY}}` | CSS font stack of the display font, e.g. `"<Display font>", Georgia, "Times New Roman", serif` |
| `{{FONT_BODY}}` | CSS font stack of the text font, e.g. `"<Body font>", -apple-system, sans-serif` |

### Money and menu

| Placeholder | Meaning and format |
|---|---|
| `{{CURRENCY}}` | Unit written after every price, e.g. `DT`, `€`. |
| `{{PRICE_DECIMALS}}` | Decimals shown: `2` or `3` (same as the database and the admin). |
| `{{DEFAULT_CATEGORY_IMAGE}}` | Photo address used for a category that has none (a generic café photo, ~800 px wide). |
| `{{MENU_CATEGORIES}}` | The whole menu, written as in Part 3. |
| `{{CATEGORY_PHOTOS}}` | One line per category: `"<French category name>": "<photo address>",` (Part 3). |

### Database

| Placeholder | Meaning and format |
|---|---|
| `{{SUPABASE_URL}}` | The project address `https://<project-ref>.supabase.co`, or `""` (empty) to run on `menu-data.js` only. |
| `{{SUPABASE_PUBLISHABLE_KEY}}` | The project's publishable key `sb_publishable_…`, or `""` when the address is empty. |

---

# PART 2 — WHAT THE PAGE DOES

## 2.1 Header (always visible)

Sticky at the top, `{{COLOR_PRIMARY}}`, 60 px tall plus the phone's safe area. Left: the ☰ button, the
round logo (34 px) and the brand name (display font, capitals, letter-spaced; a link to the top of the
page). Right: a round search button (44 px) and the FR / EN switch (the active language on a light
background, state in `aria-pressed`).

The name's size was tuned for a 7-letter name: 1.25rem with 0.16em spacing, 1.1rem / 0.1em from 374 px
down, hidden under 345 px; 1.4rem / 0.24em from 768 px. For another name, check at 375, 360 and 320 px
that the name never runs into the search button (adjust those sizes and the two breakpoints in
`styles.css`), and that the hero title (`clamp(2.9rem, 14vw, 5.75rem)`, 0.18em spacing) fits at 320 px.

## 2.2 Hero

`{{COLOR_PRIMARY}}` with two soft glows (accent-light at the top, primary-deep at the bottom); the logo
(104 px, 120 px from 600 px wide) with a shadow; the brand name in large spaced capitals; the subtitle in
small spaced capitals, accent-light.

## 2.3 Category bar and menu

- **Category bar**: sticky under the header, one pill per category (link to `#<category id>`); the
  category on screen is highlighted (`IntersectionObserver`).
- **Categories** start closed. Each is a photo banner (button) with the name and an arrow; a tap
  unfolds the list (several can be open; they stay open after a redraw or a language switch).
- **Rows**: optional product photo (48 px, the small `-480.` copy), name, "Indisponible" badge when the
  product is switched off (name and price faded, no `+`), price in `{{CURRENCY}}` with
  `{{PRICE_DECIMALS}}` decimals, and the `+` / `−` stepper. A tap on a row with a description reveals it.
- Categories without products are not shown. A shared link `#<category id>` scrolls to that category
  once the menu is drawn.
- "Chargement de la carte…" while the first answer is awaited; a "La carte n'a pas pu être mise à jour"
  note while an older copy of the menu is on screen.

## 2.4 Ma sélection

A list the customer shows to the server; nothing is sent, it is not an order. `+` adds one (max 99), the
`+` turns into `(−) 2 (+)` once chosen; toast "Ajouté : <name>" / "Retiré : <name>". A pill at the
bottom ("Ma sélection", count, total) opens a sheet: rows with `−` / quantity / `+` and the line total,
"Vider la sélection", the total. Saved in `localStorage` (`{{SITE_SLUG}}-selection`). When the menu
changes source (built-in copy → database), chosen products are carried over by category and French
name; removed or unavailable products are dropped.

## 2.5 Search panel

The magnifier opens a panel dropping from the top. Typing finds products whose names (French and
English), description or category contain words **starting with** the typed words; accents and
doubled letters do not matter ("capucino" finds "Cappuccino"). Up to 40 results with category and price
(or "Indisponible"). Enter or a tap closes the panel, opens the product's category, centres the row and
lights it up for 2.4 s. Esc closes the panel at once.

## 2.6 ☰ menu

Slides in from the left: **Horaires** (one "Tous les jours" row when both lines match), **Wi-Fi**
(network, password, "Copier le mot de passe"), **Nous trouver** (address opening Maps, phone `tel:` link,
Instagram `@account`). A card or row shows only once its detail is filled in on the admin's "Infos" tab;
Instagram always shows. Esc, × and a tap beside the panel close it.

## 2.7 Footer

Brand block (logo, name, subtitle, tagline), Navigation (Accueil, Menu), Contact (phone, address →
Maps, hours, "Laisser un avis"), Suivez-nous (Instagram, Facebook, Google Maps buttons), copyright,
credit and "Retour en haut". The phone, address, Maps link and hours are the built-in values until the
admin's "Infos" tab has them: a detail saved there replaces the footer's text; a detail saved empty
hides its row.

## 2.8 Languages

Order: `?lang=fr|en` in the address → the saved choice (`{{SITE_SLUG}}-lang`) → the phone's first
French or English language → French. `data-i18n="key"` sets an element's text from `translations.js`;
`data-i18n-attr="aria-label:key"` sets attributes. Menu names use `name_en` / `en` when present, else
French.

## 2.9 Data

Exactly as in `ADMIN-BLUEPRINT.md`, Part 4: one menu request and one details request with the
publishable key; the copy saved on the phone is shown first; `menu-data.js` when Supabase is not
configured, never reached, or slower than 6 s on a first visit (the real menu replaces it when it
arrives, up to 30 s); a retry on the browser's `online` event; an empty answer is never shown or saved.

---

# PART 3 — THE MENU: `menu-data.js`

`{{MENU_CATEGORIES}}` is the whole menu, one object per category, in the menu's order:

```js
  { category: "Cafés", en: "Coffees", image: "", items: [
    { name: "Espresso", price: 3.5, desc: "" },
    { name: "Café crème", en: "Coffee with cream", price: 4.5, desc: "Lait chaud", descEn: "Hot milk" }
  ]},
  { category: "Thés", en: "Teas", image: "", items: [
    { name: "Thé à la menthe", en: "Mint tea", price: 3, desc: "" }
  ]}
```

- `category` and `name`: as printed on the café's menu (only obvious typos fixed, and listed).
- `en` / `descEn`: only when the English differs. Generic names and categories are translated; the
  café's own creations keep their name.
- `price`: a number, exactly as printed (`6.5` for "6,500" or "6.50").
- `desc`: only descriptions the owner wrote; `""` otherwise.
- `image`: leave `""` and give the photo in `{{CATEGORY_PHOTOS}}`.
- The category id on the page is `slugify(<French category name>)`, e.g. `nos-cafes`; names must be
  unique.

`{{CATEGORY_PHOTOS}}` gives each category its banner photo (~800 px wide):

```js
  "Cafés": "https://…/photo-of-coffee.jpg",
  "Thés": "https://…/photo-of-tea.jpg"
```

Use the café's own photos, or free stock photos (e.g. Unsplash, `?w=800&q=80`) listed for the owner to
replace. Once the database is seeded from this file (seed tool in `ADMIN-BLUEPRINT.md`), the owner
changes photos on the admin page.

---

# PART 4 — SOURCE FILES (WITH PLACEHOLDERS)

Create each file with exactly this content, replacing every `{{…}}` (Part 1). UTF-8, LF line endings.

## `index.html`

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>{{BRAND_NAME}} | {{BRAND_SUB}}</title>
  <meta name="theme-color" content="{{COLOR_PRIMARY}}" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="{{GOOGLE_FONTS_URL}}" rel="stylesheet" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
  <link rel="stylesheet" href="styles.css" />
  <link rel="icon" href="{{FAVICON_PATH}}" />
</head>
<body>
  <header class="site-header" id="siteHeader">
    <div class="header-start">
      <button class="header-menu" type="button" id="sideMenuOpen" aria-haspopup="dialog" aria-controls="sideMenu"
              data-i18n-attr="aria-label:side.open" aria-label="Ouvrir le menu">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16"/></svg>
      </button>
      <a class="brand" href="#top" data-i18n-attr="aria-label:brand.home" aria-label="{{BRAND_NAME}}, retour en haut de la page">
        <img src="{{LOGO_PATH}}" alt="" width="34" height="34" />
        <span class="brand-name">{{BRAND_NAME}}</span>
      </a>
    </div>
    <div class="header-actions">
      <button class="header-search" type="button" id="searchOpen" aria-haspopup="dialog" aria-controls="searchDialog"
              data-i18n-attr="aria-label:search.open" aria-label="Rechercher dans la carte">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.5 15.5L20 20"/></svg>
      </button>
      <div class="lang-switch" role="group" data-i18n-attr="aria-label:lang.group" aria-label="Langue">
        <button type="button" data-lang="fr" lang="fr" aria-pressed="true" title="Français">FR</button>
        <button type="button" data-lang="en" lang="en" aria-pressed="false" title="English">EN</button>
      </div>
    </div>
  </header>

  <section class="hero" id="top" aria-labelledby="heroTitle">
    <img class="hero-logo" src="{{LOGO_PATH}}" alt="" width="120" height="120" />
    <h1 class="hero-title" id="heroTitle"><span class="hero-name">{{BRAND_NAME}}</span> <span class="hero-sub">{{BRAND_SUB}}</span></h1>
  </section>

  <nav class="category-nav" data-i18n-attr="aria-label:menu.categories" aria-label="Catégories de la carte">
    <div id="categoryNav" class="nav-pills"></div>
  </nav>

  <main class="container">
    <section class="section" id="menu">
      <p class="menu-stale" id="menuStale" role="status" hidden data-i18n="menu.stale">La carte n'a pas pu être mise à jour : certains prix ont peut-être changé.</p>
      <div id="menuContainer"></div>
      <noscript><p class="menu-loading">Activez JavaScript pour afficher la carte. / Please turn on JavaScript to see the menu.</p></noscript>
    </section>
  </main>

  <footer class="site-footer">
    <div class="site-footer-inner">

      <div class="site-footer-brand">
        <img src="{{LOGO_PATH}}" alt="{{BRAND_NAME}} {{BRAND_SUB}}" class="site-footer-logo" />
        <h3 class="site-footer-name">{{BRAND_NAME}}</h3>
        <p class="site-footer-tagline">{{BRAND_SUB}}</p>
        <p class="site-footer-desc" data-i18n="footer.desc">{{TAGLINE_FR}}</p>
      </div>

      <div class="site-footer-grid">
        <div class="site-footer-col">
          <h4 data-i18n="footer.nav">Navigation</h4>
          <ul>
            <li><a href="#top" data-i18n="footer.home">Accueil</a></li>
            <li><a href="#menu" data-i18n="footer.menu">Menu</a></li>
          </ul>
        </div>

        <div class="site-footer-col">
          <h4 data-i18n="footer.contact">Contact</h4>
          <ul>
            <li>
              <a href="tel:{{PHONE_TEL}}" id="footerPhone">
                <i class="fa-solid fa-phone"></i> {{PHONE}}
              </a>
            </li>
            <li>
              <a href="{{MAPS_URL}}" target="_blank" rel="noopener" id="footerAddress" data-maps>
                <i class="fa-solid fa-location-dot"></i> {{ADDRESS}}
              </a>
            </li>
            <li>
              <span id="footerHours"><i class="fa-regular fa-clock"></i> {{HOURS_FR}}</span>
            </li>
            <li>
              <a href="{{REVIEW_URL}}" target="_blank" rel="noopener">
                <i class="fa-solid fa-star"></i> <span data-i18n="footer.review">Laisser un avis</span>
              </a>
            </li>
          </ul>
        </div>

        <div class="site-footer-col">
          <h4 data-i18n="footer.follow">Suivez-nous</h4>
          <div class="site-footer-socials">
            <a href="{{INSTAGRAM_URL}}" target="_blank" rel="noopener" aria-label="Instagram" id="instagramLink">
              <i class="fa-brands fa-instagram"></i>
            </a>
            <a href="{{FACEBOOK_URL}}" target="_blank" rel="noopener" aria-label="Facebook">
              <i class="fa-brands fa-facebook-f"></i>
            </a>
            <a href="{{MAPS_URL}}" target="_blank" rel="noopener" aria-label="Google Maps" data-maps>
              <i class="fa-solid fa-map-location-dot"></i>
            </a>
          </div>
        </div>
      </div>

      <div class="site-footer-divider"></div>

      <div class="site-footer-bottom">
        <p>&copy; {{YEAR}} {{BRAND_NAME}} {{BRAND_SUB}}. <span data-i18n="footer.rights">Tous droits réservés. Réalisé par {{CREDIT_NAME}}</span></p>
        <a href="#top" class="site-footer-top"><span data-i18n="footer.top">Retour en haut</span> <i class="fa-solid fa-arrow-up"></i></a>
      </div>

    </div>
  </footer>

  <button class="sel-pill" id="selectionOpen" type="button" hidden>
    <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 21s-7.5-4.6-9.6-9.1C.9 8.6 2.9 5 6.4 5c2 0 3.6 1.1 4.6 2.6.3.4.7.4 1 0C13 6.1 14.6 5 16.6 5c3.5 0 5.5 3.6 4 6.9C19.5 16.4 12 21 12 21z"/></svg>
    <span data-i18n="sel.open">Ma sélection</span>
    <span class="sel-pill-count" id="selectionCount">0</span>
    <span class="sel-pill-total" id="selectionTotal">0 {{CURRENCY}}</span>
  </button>

  <dialog class="sel-sheet" id="selectionDialog" aria-labelledby="selectionTitle">
    <div class="sel-inner">
      <div class="sel-head">
        <h2 id="selectionTitle" data-i18n="sel.title">Ma sélection</h2>
        <button class="icon-btn" type="button" id="selectionClose" data-i18n-attr="aria-label:sel.close" aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="sel-hint" data-i18n="sel.hint">Montrez cette liste à votre serveur pour commander. Elle reste enregistrée sur votre téléphone.</p>
      <ul class="sel-list" id="selectionList"></ul>
      <p class="sel-empty" id="selectionEmpty" data-i18n="sel.empty">Votre sélection est vide. Touchez + sur la carte pour ajouter un produit.</p>
      <div class="sel-foot">
        <button class="text-btn" type="button" id="selectionClear" data-i18n="sel.clear">Vider la sélection</button>
        <p class="sel-total"><span data-i18n="sel.total">Total</span> <strong id="selectionSum">0 {{CURRENCY}}</strong></p>
      </div>
    </div>
  </dialog>

  <div class="toast" id="toast" role="status" aria-live="polite"></div>

  <dialog class="search-sheet" id="searchDialog" aria-labelledby="searchTitle">
    <div class="search-inner">
      <h2 class="visually-hidden" id="searchTitle" data-i18n="search.title">Rechercher dans la carte</h2>
      <div class="search-bar">
        <label class="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2"/><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M15.5 15.5L20 20"/></svg>
          <span class="visually-hidden" data-i18n="search.label">Rechercher un produit</span>
          <input type="search" id="searchInput" autocomplete="off" spellcheck="false" enterkeyhint="search"
                 data-i18n-attr="placeholder:search.placeholder" placeholder="{{SEARCH_EXAMPLE_FR}}" />
        </label>
        <button class="icon-btn" type="button" id="searchClose" data-i18n-attr="aria-label:search.close" aria-label="Fermer la recherche">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="search-status" id="searchStatus" role="status" aria-live="polite"></p>
      <ul class="search-results" id="searchResults"></ul>
    </div>
  </dialog>

  <dialog class="side-menu" id="sideMenu" aria-labelledby="sideMenuTitle">
    <div class="side-inner">
      <div class="side-head">
        <h2 id="sideMenuTitle" data-i18n="side.title">Menu</h2>
        <button class="icon-btn" type="button" id="sideMenuClose" data-i18n-attr="aria-label:side.close" aria-label="Fermer le menu">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>

      <section class="side-card" id="sideHours" aria-labelledby="hoursTitle" hidden>
        <h3 id="hoursTitle">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 7.5V12l3 2"/></svg>
          <span data-i18n="hours.title">Horaires</span>
        </h3>
        <dl class="side-rows" id="hoursRows"></dl>
      </section>

      <section class="side-card" id="sideWifi" aria-labelledby="wifiTitle" hidden>
        <h3 id="wifiTitle">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M3.5 9.5a12 12 0 0 1 17 0M6.5 12.5a8 8 0 0 1 11 0M9.5 15.5a4 4 0 0 1 5 0"/><circle cx="12" cy="18.5" r="1.2" fill="currentColor"/></svg>
          <span data-i18n="wifi.title">Wi-Fi</span>
        </h3>
        <dl class="side-rows">
          <div><dt data-i18n="wifi.network">Réseau</dt><dd id="wifiName"></dd></div>
          <div id="wifiPasswordRow"><dt data-i18n="wifi.password">Mot de passe</dt><dd class="wifi-password" id="wifiPassword"></dd></div>
        </dl>
        <button class="side-btn" type="button" id="wifiCopy" data-i18n="wifi.copy">Copier le mot de passe</button>
        <p class="side-note wifi-status" id="wifiStatus" role="status" aria-live="polite"></p>
      </section>

      <section class="side-card" id="sideFind" aria-labelledby="findTitle">
        <h3 id="findTitle">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>
          <span data-i18n="find.title">Nous trouver</span>
        </h3>
        <dl class="side-rows">
          <div id="findAddressRow" hidden><dt data-i18n="find.address">Adresse</dt><dd><a id="findAddress" target="_blank" rel="noopener" data-maps></a></dd></div>
          <div id="findPhoneRow" hidden><dt data-i18n="find.phone">Téléphone</dt><dd><a id="findPhone"></a></dd></div>
          <div><dt>Instagram</dt><dd><a id="findInstagram" href="{{INSTAGRAM_URL}}" target="_blank" rel="noopener"></a></dd></div>
        </dl>
      </section>
    </div>
  </dialog>

  <script src="menu-data.js"></script>
  <script src="translations.js"></script>
  <script src="supabase-config.js"></script>
  <script src="script.js"></script>
</body>
</html>
````

## `styles.css`

````css
:root {
  --bg: {{COLOR_BACKGROUND}};
  --bg-soft: {{COLOR_SURFACE}};
  --surface: #ffffff;
  --line: {{COLOR_HAIRLINE}};
  --text: {{COLOR_TEXT}};
  --muted: {{COLOR_TEXT_MUTED}};
  --accent: {{COLOR_ACCENT}};
  --accent-soft: {{COLOR_ACCENT_LIGHT}};
  --navy: {{COLOR_PRIMARY}};
  --navy-deep: {{COLOR_PRIMARY_DEEP}};
  --muted-dark: {{COLOR_TEXT_SOFT}};
  --radius-xl: 28px;
  --radius-lg: 20px;
  --radius-md: 16px;
  --shadow-soft: 0 16px 44px rgba({{RGB_PRIMARY}}, 0.1);
  --shadow-card: 0 10px 30px rgba({{RGB_PRIMARY}}, 0.08);
  --header-h: 60px;
  --header-total: calc(var(--header-h) + env(safe-area-inset-top, 0px));
  --font-display: {{FONT_DISPLAY}};
}

html { scroll-behavior: smooth; }

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  font-family: {{FONT_BODY}};
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

.site-header {
  position: sticky;
  top: 0;
  z-index: 200;
  height: var(--header-total);
  padding: env(safe-area-inset-top, 0px) 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  background: var(--navy);
  color: #fff;
  border-bottom: 1px solid rgba({{RGB_ACCENT}}, 0.25);
}

.header-start { display: flex; align-items: center; gap: 4px; min-width: 0; }

.header-menu {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 40px;
  height: 44px;
  margin-left: -8px;
  border: 0;
  border-radius: 12px;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background-color 0.2s;
}
.header-menu svg { width: 24px; height: 24px; }
.header-menu:hover { background: rgba(0, 0, 0, 0.18); }

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  color: #fff;
  text-decoration: none;
}
.brand img {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}
.brand-name {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
}

.header-actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }

.header-search {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid rgba({{RGB_ACCENT}}, 0.35);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.18);
  color: var(--accent-soft);
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s;
}
.header-search svg { width: 20px; height: 20px; }
.header-search:hover { color: #fff; border-color: rgba({{RGB_ACCENT}}, 0.7); }

.lang-switch {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid rgba({{RGB_ACCENT}}, 0.35);
}
.lang-switch button {
  min-width: 42px;
  min-height: 36px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--accent-soft);
  font: inherit;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;
}
.lang-switch button[aria-pressed="true"] { background: var(--bg); color: var(--navy); }

.site-header :focus-visible,
.hero :focus-visible { outline: 3px solid var(--accent-soft); outline-offset: 3px; }

@media (max-width: 374px) {
  .brand-name { font-size: 1.1rem; letter-spacing: 0.1em; }
  .lang-switch button { min-width: 38px; }
}
@media (max-width: 344px) {
  .brand-name { display: none; }
}

.hero {
  position: relative;
  overflow: hidden;
  padding: 36px 1rem 60px;
  text-align: center;
  color: #fff;
  background:
    radial-gradient(90% 55% at 50% 0%, rgba({{RGB_ACCENT_LIGHT}}, 0.16), transparent 70%),
    radial-gradient(120% 90% at 50% 100%, var(--navy-deep), transparent 70%),
    var(--navy);
}

.hero-logo {
  display: block;
  width: 104px;
  height: 104px;
  margin: 12px auto 22px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.35);
}

.hero-title {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1;
}
.hero-name {
  display: block;
  font-size: clamp(2.9rem, 14vw, 5.75rem);
  letter-spacing: 0.18em;
  margin-right: -0.18em;
  text-transform: uppercase;
}
.hero-sub {
  display: block;
  margin-top: 14px;
  margin-right: -0.34em;
  font-family: {{FONT_BODY}};
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.34em;
  text-transform: uppercase;
  color: var(--accent-soft);
}

.category-nav {
  position: sticky;
  top: var(--header-total);
  z-index: 100;
  background: var(--navy);
  border-bottom: 1px solid rgba({{RGB_ACCENT}}, 0.2);
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
  background: rgba(255,255,255,0.07);
  border: 1px solid rgba({{RGB_ACCENT}}, 0.25);
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
  color: #fff;
  border-color: var(--accent);
}

.section {
  margin: 0;
  padding: 1.25rem 1rem;
}

.section-head { margin-bottom: 1rem; }

.section-head h2 {
  font-family: {{FONT_DISPLAY}};
  font-size: clamp(1.5rem, 5vw, 2rem);
  color: var(--navy);
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
    rgba({{RGB_PRIMARY}}, 0.92) 0%,
    rgba({{RGB_PRIMARY}}, 0.4) 60%,
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
  font-family: {{FONT_DISPLAY}};
  font-size: 1.2rem;
  color: #fff;
  font-weight: 600;
  margin: 0;
  letter-spacing: 0.02em;
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

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
}

@media (min-width: 600px) {
  .category-toggle { min-height: 130px; }
}

@media (min-width: 600px) {
  .hero { padding-top: 56px; padding-bottom: 80px; }
  .hero-logo { width: 120px; height: 120px; }
}

@media (min-width: 768px) {
  .site-header { padding-left: 1.5rem; padding-right: 1.5rem; }
  .brand-name { font-size: 1.4rem; letter-spacing: 0.24em; }
  .section { padding: 1.5rem; }
  .category-toggle { min-height: 150px; }
}

.menu-loading {
  text-align: center;
  color: var(--muted);
  padding: 2rem 1rem;
  font-size: 0.95rem;
  font-style: italic;
}

.menu-stale {
  margin-bottom: 1rem;
  padding: 0.65rem 1rem;
  border-radius: var(--radius-md);
  background: var(--bg-soft);
  color: var(--muted);
  font-size: 0.82rem;
  text-align: center;
}

.menu-item-photo {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  align-self: center;
}

.menu-item.is-unavailable h4,
.menu-item.is-unavailable .item-price { opacity: 0.5; }

.menu-item.is-unavailable .menu-item-photo { filter: grayscale(1); opacity: 0.6; }

.item-badge {
  display: inline-block;
  margin-top: 0.25rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--navy);
  font-size: 0.65rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.visually-hidden {
  position: absolute !important;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.icon-btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--muted-dark);
  cursor: pointer;
}
.icon-btn svg { width: 22px; height: 22px; }
.icon-btn:hover { background: var(--line); color: var(--text); }

.search-sheet {
  width: 100%;
  max-width: min(640px, 100%);
  max-height: 85vh;
  margin: 0 auto auto;
  padding: 0;
  border: 0;
  border-radius: 0 0 24px 24px;
  background: var(--bg);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}
.search-sheet[open] { animation: sheet-down 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); }
.search-sheet::backdrop { background: rgba({{RGB_TEXT}}, 0.55); }
@keyframes sheet-down { from { transform: translateY(-24px); opacity: 0; } }

.search-inner { display: flex; flex-direction: column; max-height: 85vh; padding-top: env(safe-area-inset-top, 0px); }
.search-sheet .search-bar { display: flex; align-items: center; gap: 6px; padding: 14px 10px 8px 16px; }
.search-field {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 50px;
  padding: 0 16px;
  border: 1.5px solid var(--line);
  border-radius: 999px;
  background: var(--surface);
  color: var(--muted-dark);
  cursor: text;
}
.search-field:focus-within { border-color: var(--navy); box-shadow: 0 0 0 3px rgba({{RGB_PRIMARY}}, 0.15); }
.search-field svg { flex-shrink: 0; width: 20px; height: 20px; }
.search-field input {
  flex: 1;
  min-width: 0;
  border: 0;
  outline: none;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 1rem;
}
.search-status { padding: 2px 20px 10px; color: var(--muted-dark); font-size: 0.85rem; }
.search-status:empty { display: none; }
.search-results { margin: 0; padding: 0 8px 14px; overflow-y: auto; list-style: none; }
.search-result {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  padding: 10px 12px;
  border: 0;
  border-radius: 14px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}
.search-result:hover { background: var(--bg-soft); }
.search-result-main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.search-result-name { font-weight: 500; line-height: 1.35; }
.search-result-where { color: var(--muted-dark); font-size: 0.8rem; }
.search-result .item-price { font-size: 0.9rem; }
.search-result.is-unavailable .search-result-name { opacity: 0.6; }

.menu-item.is-found { animation: found 2.4s ease; }
@keyframes found {
  0%, 40% { background: rgba({{RGB_ACCENT}}, 0.2); box-shadow: inset 4px 0 0 var(--accent); }
  100% { background: transparent; box-shadow: inset 4px 0 0 transparent; }
}

.menu-category.no-anim .category-items,
.menu-category.no-anim .toggle-arrow { transition: none; }

.side-menu {
  width: min(380px, 92vw);
  max-width: none;
  height: 100%;
  max-height: none;
  margin: 0;
  inset: 0 auto 0 0;
  padding: 0;
  overflow-y: auto;
  border: 0;
  border-radius: 0 24px 24px 0;
  background: var(--bg);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}
.side-menu[open] { animation: side-in 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.side-menu::backdrop { background: rgba({{RGB_TEXT}}, 0.55); }
@keyframes side-in { from { transform: translateX(-100%); } }

.side-inner {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100%;
  padding: calc(12px + env(safe-area-inset-top, 0px)) 16px calc(24px + env(safe-area-inset-bottom, 0px));
}
.side-head { display: flex; align-items: center; justify-content: space-between; padding-left: 4px; }
.side-head h2 {
  font-family: var(--font-display);
  font-size: 2rem;
  font-style: italic;
  font-weight: 600;
  color: var(--navy);
}

.side-card { padding: 16px 18px; border-radius: 18px; background: var(--surface); box-shadow: var(--shadow-card); }
.side-card[hidden] { display: none; }
.side-card h3 {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
  font-size: 1.05rem;
  font-weight: 600;
}
.side-card h3 svg { flex-shrink: 0; width: 20px; height: 20px; color: var(--accent); }
.side-note { color: var(--muted-dark); font-size: 0.85rem; }

.side-rows { margin: 0; }
.side-rows > div { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 9px 0; }
.side-rows > div + div { border-top: 1px solid var(--line); }
.side-rows > div[hidden] { display: none; }
.side-rows dt { color: var(--muted-dark); }
.side-rows dd { margin: 0; min-width: 0; text-align: right; font-weight: 500; overflow-wrap: anywhere; }
.side-rows .side-time { flex-shrink: 0; white-space: nowrap; font-variant-numeric: tabular-nums; }
.side-rows a { color: var(--navy); text-decoration: none; }
.side-rows a:hover { text-decoration: underline; text-underline-offset: 3px; }
.wifi-password { font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace; letter-spacing: 0.04em; }

.side-btn {
  min-height: 44px;
  margin-top: 8px;
  padding: 0 20px;
  border: 0;
  border-radius: 999px;
  background: var(--navy);
  color: #fff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}
.side-btn:hover { background: var(--navy-deep); }
.side-btn[hidden] { display: none; }
.wifi-status:empty { display: none; }
.wifi-status { margin-top: 8px; }

.stepper {
  display: flex;
  align-items: center;
  align-self: center;
  flex-shrink: 0;
  gap: 4px;
}
.stepper [hidden] { display: none; }

.add-btn {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1.5px solid var(--navy);
  border-radius: 50%;
  background: transparent;
  color: var(--navy);
  cursor: pointer;
  transition: background-color 0.15s, color 0.15s, transform 0.15s;
}
.add-btn svg { width: 16px; height: 16px; }
.add-btn:hover { background: var(--navy); color: #fff; }
.add-btn:active { transform: scale(0.9); }
.add-btn.is-added { background: var(--accent); border-color: var(--accent); color: #fff; }
.add-btn:disabled,
.add-btn:disabled:hover { border-color: var(--line); background: transparent; color: var(--line); cursor: not-allowed; }

.stepper-qty {
  min-width: 22px;
  text-align: center;
  color: var(--navy);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.sel-pill {
  position: fixed;
  z-index: 150;
  left: 50%;
  bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: calc(100% - 32px);
  padding: 8px 8px 8px 18px;
  border: 0;
  border-radius: 999px;
  background: var(--navy);
  color: #fff;
  font: inherit;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: 0 12px 30px rgba({{RGB_PRIMARY}}, 0.35);
  cursor: pointer;
}
.sel-pill[hidden] { display: none; }
.sel-pill svg { width: 18px; height: 18px; color: var(--accent-soft); }
.sel-pill-count {
  display: grid;
  place-items: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 999px;
  background: var(--bg);
  color: var(--navy);
  font-size: 0.85rem;
}
.sel-pill-total { padding: 7px 12px; border-radius: 999px; background: rgba(0, 0, 0, 0.25); font-variant-numeric: tabular-nums; }
.sel-pill.bump { animation: bump 0.35s ease; }
@keyframes bump { 50% { transform: translateX(-50%) scale(1.07); } }

body.has-selection .site-footer { padding-bottom: calc(80px + env(safe-area-inset-bottom, 0px)); }

.sel-sheet {
  width: 100%;
  max-width: min(520px, 100%);
  max-height: 86vh;
  margin: auto auto 0;
  padding: 0;
  border: 0;
  border-radius: 24px 24px 0 0;
  background: var(--bg);
  color: var(--text);
  box-shadow: var(--shadow-soft);
}
.sel-sheet[open] { animation: sheet-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.sel-sheet::backdrop { background: rgba({{RGB_TEXT}}, 0.55); }
@keyframes sheet-up { from { transform: translateY(40px); opacity: 0; } }

.sel-inner { display: flex; flex-direction: column; max-height: 86vh; padding-bottom: env(safe-area-inset-bottom, 0px); }
.sel-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 4px; }
.sel-head h2 { font-family: var(--font-display); font-size: 2rem; font-style: italic; font-weight: 600; color: var(--navy); }
.sel-hint { padding: 0 20px 14px; color: var(--muted-dark); font-size: 0.875rem; }
.sel-list { margin: 0; padding: 0; overflow-y: auto; list-style: none; border-top: 1px solid var(--line); }
.sel-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid var(--line);
}
.sel-row-name { min-width: 0; font-weight: 500; line-height: 1.35; overflow-wrap: anywhere; }
.sel-row-cat { display: block; color: var(--muted-dark); font-size: 0.8rem; font-weight: 400; }
.sel-row-side { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
.sel-qty { display: flex; align-items: center; gap: 4px; }
.sel-row .item-price { min-width: 72px; text-align: right; }
.sel-empty { padding: 28px 20px; text-align: center; color: var(--muted-dark); }
.sel-empty[hidden] { display: none; }
.sel-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px 20px; }
.sel-total { font-size: 1.05rem; }
.sel-total strong { margin-left: 6px; font-family: var(--font-display); font-size: 1.6rem; color: var(--navy); font-variant-numeric: tabular-nums; }

.text-btn {
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: var(--muted-dark);
  font: inherit;
  font-size: 0.875rem;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.text-btn:hover { color: var(--navy); }
.text-btn[hidden] { display: none; }

.toast {
  position: fixed;
  z-index: 160;
  left: 50%;
  bottom: calc(80px + env(safe-area-inset-bottom, 0px));
  max-width: calc(100% - 32px);
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--text);
  color: #fff;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 8px);
  transition: opacity 0.2s, transform 0.2s;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }

@media (min-width: 600px) {
  .search-sheet { margin-top: calc(var(--header-total) + 12px); border-radius: 24px; }
  .sel-sheet { margin: auto; border-radius: 24px; }
}

.menu-category,
#menu {
  scroll-margin-top: calc(var(--header-total) + 65px);
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  .menu-item.is-found { background: rgba({{RGB_ACCENT}}, 0.2); box-shadow: inset 4px 0 0 var(--accent); }
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

.site-footer {
  background: var(--navy);
  border-top: 3px solid var(--accent);
  color: rgba(255, 255, 255, 0.75);
  margin-top: 2rem;
}

.site-footer-inner {
  max-width: 980px;
  margin: 0 auto;
  padding: 2.75rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.site-footer-brand {
  text-align: center;
}

.site-footer-logo {
  width: 84px;
  height: 84px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba({{RGB_ACCENT}}, 0.5);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
}

.site-footer-name {
  margin-top: 0.75rem;
  font-family: {{FONT_DISPLAY}};
  font-size: 2rem;
  font-weight: 600;
  color: #fff;
  letter-spacing: 0.05em;
}

.site-footer-tagline {
  color: var(--accent);
  font-size: 0.72rem;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-weight: 600;
  margin-top: 0.2rem;
}

.site-footer-desc {
  margin: 0.85rem auto 0;
  font-size: 0.88rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.55);
  max-width: 38ch;
}

.site-footer-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.75rem;
  text-align: center;
}

.site-footer-col h4 {
  font-family: {{FONT_DISPLAY}};
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--accent);
  letter-spacing: 0.06em;
  margin-bottom: 0.75rem;
}

.site-footer-col ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.site-footer-col a,
.site-footer-col li > span {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  font-size: 0.88rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.2s ease;
}

.site-footer-col a:hover {
  color: var(--accent-soft);
}

.site-footer-col i {
  color: var(--accent);
  font-size: 0.8rem;
  width: 1rem;
  text-align: center;
}

.site-footer-socials {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.site-footer-socials a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba({{RGB_ACCENT}}, 0.35);
  color: rgba(255, 255, 255, 0.85);
  font-size: 1rem;
  text-decoration: none;
  transition: background 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.site-footer-socials a:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  transform: translateY(-2px);
}

.site-footer-divider {
  height: 1px;
  background: rgba({{RGB_ACCENT}}, 0.25);
}

.site-footer-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
}

.site-footer-top {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  transition: color 0.2s ease;
}

.site-footer-top:hover {
  color: var(--accent-soft);
}

@media (min-width: 640px) {
  .site-footer-grid {
    grid-template-columns: repeat(3, 1fr);
    text-align: left;
  }

  .site-footer-socials {
    justify-content: flex-start;
  }

  .site-footer-bottom {
    flex-direction: row;
    justify-content: space-between;
  }
}
````

## `script.js`

````js
const LANGS = ["fr", "en"];
const LANG_KEY = "{{SITE_SLUG}}-lang";
const MENU_CACHE_KEY = "{{SITE_SLUG}}-menu-v1";
const INFO_CACHE_KEY = "{{SITE_SLUG}}-info-v1";
const FALLBACK_AFTER_MS = 6000;
const DB_TIMEOUT_MS = 30000;
const DB_READY = typeof SUPABASE_URL === "string" && SUPABASE_URL !== "" &&
  typeof SUPABASE_KEY === "string" && SUPABASE_KEY !== "";
const DEFAULT_CATEGORY_IMAGE = "{{DEFAULT_CATEGORY_IMAGE}}";

let menu = null;
let shownJson = null;
let firstRender = true;
let lang = "fr";
const ITEMS = new Map();
const openCategories = new Set();
let scrollSpy = null;

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

function formatPrice(price) {
  return `${Number(price).toFixed({{PRICE_DECIMALS}})} {{CURRENCY}}`;
}

function t(key, values) {
  let text = TEXT[lang][key] ?? TEXT.fr[key] ?? key;
  for (const name in values) text = text.replace("{" + name + "}", () => values[name]);
  return text;
}

function pick(value) {
  if (!value) return "";
  return typeof value === "string" ? value : (value[lang] || value.fr);
}
function isText(value) {
  return typeof value === "string" || (value !== null && typeof value === "object" && typeof value.fr === "string");
}

function el(tag, props, ...children) {
  const node = document.createElement(tag);
  for (const key in props) {
    if (key === "attrs") for (const name in props.attrs) node.setAttribute(name, props.attrs[name]);
    else if (key === "dataset") Object.assign(node.dataset, props.dataset);
    else node[key] = props[key];
  }
  node.append(...children.filter((child) => child !== null && child !== undefined));
  return node;
}

function getCategoryImage(category) {
  return category.image || DEFAULT_CATEGORY_IMAGE;
}

function smallPhoto(url) {
  return url && url.includes("-800.") ? url.replace("-800.", "-480.") : url;
}

function fromMenuData(data) {
  const both = (fr, en) => (en ? { fr, en } : fr);
  return data.map((block) => ({
    id: slugify(block.category),
    name: both(block.category, block.en),
    image: block.image && block.image.trim() !== "" ? block.image : CATEGORY_PLACEHOLDERS[block.category] || null,
    items: block.items.map((item) => ({
      id: slugify(block.category) + "/" + slugify(item.name),
      name: both(item.name, item.en),
      price: item.price,
      desc: item.desc ? both(item.desc, item.descEn) : "",
      image: null,
      available: true
    }))
  }));
}

function fromDatabase(rows) {
  const both = (fr, en) => (en ? { fr, en } : fr);
  return rows.map((category) => ({
    id: category.id,
    name: both(category.name_fr, category.name_en),
    image: category.image_url || CATEGORY_PLACEHOLDERS[category.name_fr] || null,
    items: (category.items || []).map((item) => ({
      id: item.id,
      name: both(item.name_fr, item.name_en),
      price: Number(item.price),
      desc: item.description_fr ? both(item.description_fr, item.description_en) : "",
      image: item.image_url || null,
      available: item.available !== false
    }))
  }));
}

function isMenu(data) {
  return Array.isArray(data) &&
    data.some((category) => category && Array.isArray(category.items) && category.items.length > 0) &&
    data.every((category) => category && typeof category.id === "string" && isText(category.name) &&
      Array.isArray(category.items) &&
      category.items.every((item) => item && typeof item.id === "string" && isText(item.name) &&
        typeof item.price === "number" && Number.isFinite(item.price)));
}

async function fetchMenuFromDatabase() {
  const columns = "id,name_fr,name_en,image_url,position," +
    "items(id,name_fr,name_en,description_fr,description_en,price,image_url,available,position)";
  const url = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/categories?select=" + encodeURIComponent(columns) +
    "&order=position.asc&items.order=position.asc";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);
  try {
    const response = await fetch(url, { headers: { apikey: SUPABASE_KEY }, signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("Supabase answered " + response.status);
    const rows = await response.json();
    const data = Array.isArray(rows) ? fromDatabase(rows) : [];
    if (!isMenu(data)) throw new Error("Supabase sent no menu");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

function readCachedMenu() {
  let data;
  try { data = JSON.parse(storage.get(MENU_CACHE_KEY) || "null"); } catch { data = undefined; }
  if (data !== null && !isMenu(data)) {
    storage.remove(MENU_CACHE_KEY);
    return null;
  }
  return data;
}

async function loadMenu() {
  if (!DB_READY) {
    showMenu(fromMenuData(MENU_DATA));
    return;
  }
  const cached = readCachedMenu();
  if (cached) {
    try {
      showMenu(cached);
      shownJson = JSON.stringify(cached);
    } catch (error) {
      console.warn("The saved menu could not be shown and was thrown away:", error);
      storage.remove(MENU_CACHE_KEY);
      menu = null;
    }
  }
  if (!menu) showLoading();
  const slow = setTimeout(() => {
    if (menu) return;
    showMenu(fromMenuData(MENU_DATA));
    setStale(true);
  }, FALLBACK_AFTER_MS);
  await refreshMenu();
  clearTimeout(slow);
}

async function refreshMenu() {
  try {
    const fresh = await fetchMenuFromDatabase();
    const json = JSON.stringify(fresh);
    if (json !== shownJson) {
      showMenu(fresh);
      shownJson = json;
      storage.set(MENU_CACHE_KEY, json);
    }
    setStale(false);
  } catch (error) {
    console.warn("Could not load the menu from Supabase:", error);
    if (!menu) showMenu(fromMenuData(MENU_DATA));
    setStale(true);
    window.addEventListener("online", refreshMenu, { once: true });
  }
}

function setStale(isStale) {
  document.getElementById("menuStale").hidden = !isStale;
}

function showLoading() {
  document.getElementById("menuContainer").replaceChildren(
    el("p", { className: "menu-loading" }, t("menu.loading")));
}

function showMenu(data) {
  menu = data.filter((category) => category.items.length > 0);
  const oldKeys = new Map();
  for (const [id, { item, category }] of ITEMS) oldKeys.set(id, itemKey(category, item));
  ITEMS.clear();
  const idByKey = new Map();
  for (const category of menu) {
    for (const item of category.items) {
      ITEMS.set(item.id, { item, category });
      const key = itemKey(category, item);
      if (!idByKey.has(key)) idByKey.set(key, item.id);
    }
  }
  for (const [id, qty] of [...selection]) {
    if (ITEMS.has(id)) continue;
    const sameProduct = idByKey.get(oldKeys.get(id) || id);
    if (!sameProduct) continue;
    selection.delete(id);
    selection.set(sameProduct, Math.min((selection.get(sameProduct) || 0) + qty, MAX_QTY));
  }
  for (const id of [...selection.keys()]) {
    const entry = ITEMS.get(id);
    if (!entry || !entry.item.available) selection.delete(id);
  }
  saveSelection();
  drawMenu();
  renderSelection();
  if (searchDialog().open) renderSearch();
  if (firstRender) {
    firstRender = false;
    jumpToSharedLink();
  }
}

function detectLanguage() {
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (LANGS.includes(fromUrl)) return fromUrl;
  const saved = storage.get(LANG_KEY);
  if (LANGS.includes(saved)) return saved;
  const preferred = (navigator.languages || [navigator.language || ""])
    .find((code) => /^(fr|en)/i.test(code));
  return preferred ? preferred.slice(0, 2).toLowerCase() : "fr";
}

function applyLanguage(newLang) {
  lang = newLang;
  document.documentElement.lang = lang;
  document.title = t("meta.title");

  for (const node of document.querySelectorAll("[data-i18n]")) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of document.querySelectorAll("[data-i18n-attr]")) {
    for (const pair of node.dataset.i18nAttr.split(";")) {
      const [attr, key] = pair.split(":").map((part) => part.trim());
      node.setAttribute(attr, t(key));
    }
  }
  for (const button of document.querySelectorAll("[data-lang]")) {
    button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
  }

  if (menu) {
    drawMenu();
    renderSelection();
  }
  else if (document.querySelector("#menuContainer .menu-loading")) showLoading();
  if (searchDialog().open) renderSearch();
  renderInfo();
}

function setupLanguage() {
  for (const button of document.querySelectorAll("[data-lang]")) {
    button.addEventListener("click", () => {
      const chosen = button.dataset.lang;
      if (chosen === lang) return;
      storage.set(LANG_KEY, chosen);
      const url = new URL(location.href);
      if (url.searchParams.has("lang")) {
        url.searchParams.set("lang", chosen);
        history.replaceState(null, "", url);
      }
      applyLanguage(chosen);
    });
  }
}

function drawMenu() {
  renderNavbar();
  renderMenu();
  setupScrollSpy();
  updateSteppers();
}

function renderNavbar() {
  const nav = document.getElementById("categoryNav");
  if (!nav) return;
  nav.replaceChildren(...menu.map((category) =>
    el("a", { className: "nav-pill", href: `#${category.id}` }, pick(category.name))));
}

function renderItem(item) {
  return el("div", { className: "menu-item" + (item.available ? "" : " is-unavailable"), dataset: { item: item.id } },
    item.image ? el("img", {
      className: "menu-item-photo", alt: "", width: 48, height: 48,
      loading: "lazy", decoding: "async", src: smallPhoto(item.image)
    }) : null,
    el("div", { className: "menu-item-left" },
      el("h4", {}, pick(item.name)),
      item.available ? null : el("span", { className: "item-badge" }, t("menu.unavailable")),
      item.desc ? el("div", { className: "menu-item-desc" }, pick(item.desc)) : null),
    el("span", { className: "item-price" }, formatPrice(item.price)),
    item.available ? stepper(item) : null);
}

function stepper(item) {
  const name = pick(item.name);
  return el("div", { className: "stepper", dataset: { stepper: item.id } },
    el("button", {
      type: "button", className: "add-btn", hidden: true,
      dataset: { less: item.id }, attrs: { "aria-label": t("sel.less", { name }) }
    }, icon("minus")),
    el("span", { className: "stepper-qty", hidden: true }),
    el("button", {
      type: "button", className: "add-btn",
      dataset: { add: item.id }, attrs: { "aria-label": t("sel.add", { name }) }
    }, icon("plus")));
}

function renderCategory(category) {
  const open = openCategories.has(category.id);
  return el("article", { className: "menu-category", id: category.id, dataset: { category: category.id } },
    el("button", {
      className: "category-toggle",
      dataset: { toggle: category.id },
      attrs: { "aria-expanded": String(open), "aria-controls": `${category.id}-items` }
    },
      el("img", { className: "category-bg", alt: "", loading: "lazy", src: getCategoryImage(category) }),
      el("div", { className: "category-overlay" }),
      el("div", { className: "category-toggle-inner" },
        el("h3", {}, pick(category.name)),
        el("span", { className: "toggle-arrow" + (open ? " open" : ""), attrs: { "aria-hidden": "true" } }, "▼"))),
    el("div", { className: "category-items" + (open ? "" : " collapsed"), id: `${category.id}-items` },
      el("div", { className: "menu-list" }, ...category.items.map(renderItem))));
}

function renderMenu() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) return;
  menuContainer.replaceChildren(...menu.map(renderCategory));
}

function categorySection(id) {
  return document.querySelector(`.menu-category[data-category="${CSS.escape(id)}"]`);
}

function setCategoryOpen(id, open, animate = true) {
  const section = categorySection(id);
  if (!section) return;
  if (open) openCategories.add(id);
  else openCategories.delete(id);
  if (!animate) section.classList.add("no-anim");
  section.querySelector(".category-items").classList.toggle("collapsed", !open);
  section.querySelector(".toggle-arrow").classList.toggle("open", open);
  section.querySelector(".category-toggle").setAttribute("aria-expanded", String(open));
  if (!animate) {
    void section.offsetHeight;
    section.classList.remove("no-anim");
  }
}

function setupMenuClicks() {
  const menuContainer = document.getElementById("menuContainer");
  if (!menuContainer) return;

  menuContainer.addEventListener("click", (event) => {
    if (event.target.closest(".stepper")) return;
    const btn = event.target.closest("[data-toggle]");
    if (btn) {
      const id = btn.dataset.toggle;
      setCategoryOpen(id, !openCategories.has(id));
      return;
    }

    const item = event.target.closest(".menu-item");
    if (item) {
      const isExpanded = item.classList.contains("expanded");
      const siblings = item.closest(".menu-list").querySelectorAll(".menu-item");
      siblings.forEach((s) => s.classList.remove("expanded"));
      if (!isExpanded) item.classList.add("expanded");
    }
  });
}

function jumpToSharedLink() {
  let id = "";
  try { id = decodeURIComponent(location.hash.slice(1)); } catch { return; }
  if (!id || !menu.some((category) => category.id === id)) return;
  const target = categorySection(id);
  if (target) target.scrollIntoView({ behavior: "instant" });
}

function setupScrollSpy() {
  if (scrollSpy) scrollSpy.disconnect();
  const pills = document.querySelectorAll(".nav-pill");
  const categories = document.querySelectorAll(".menu-category");

  scrollSpy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        pills.forEach((pill) => {
          pill.classList.toggle("active", pill.getAttribute("href") === `#${id}`);
        });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });

  categories.forEach((cat) => scrollSpy.observe(cat));
}

function searchDialog() {
  return document.getElementById("searchDialog");
}

function normalize(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/(.)\1+/g, "$1");
}
function wordsOf(text) {
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean);
}
function bothLanguages(value) {
  if (!value) return "";
  return typeof value === "string" ? value : value.fr + " " + (value.en || "");
}

function findItems(query) {
  const typed = wordsOf(query);
  if (!typed.length) return [];
  const results = [];
  for (const [id, { item, category }] of ITEMS) {
    const nameWords = wordsOf(bothLanguages(item.name));
    const allWords = nameWords.concat(wordsOf(bothLanguages(item.desc) + " " + bothLanguages(category.name)));
    if (!typed.every((word) => allWords.some((w) => w.startsWith(word)))) continue;
    const score = normalize(pick(item.name)).startsWith(typed[0]) ? 0
      : nameWords.some((w) => w.startsWith(typed[0])) ? 1 : 2;
    results.push({ id, score });
  }
  return results.sort((a, b) => a.score - b.score).slice(0, 40);
}

function renderSearch() {
  const list = document.getElementById("searchResults");
  const status = document.getElementById("searchStatus");
  const query = document.getElementById("searchInput").value.trim();
  if (!menu || !query) {
    list.replaceChildren();
    status.textContent = menu ? t("search.hint") : t("menu.loading");
    return;
  }
  const results = findItems(query);
  status.textContent = results.length === 0 ? t("search.none", { q: query })
    : results.length === 1 ? t("search.one") : t("search.count", { n: results.length });
  list.replaceChildren(...results.map(({ id }) => {
    const { item, category } = ITEMS.get(id);
    return el("li", {}, el("button", {
      type: "button",
      className: "search-result" + (item.available ? "" : " is-unavailable"),
      dataset: { goto: id }
    },
      el("span", { className: "search-result-main" },
        el("span", { className: "search-result-name" }, pick(item.name)),
        el("span", { className: "search-result-where" }, pick(category.name))),
      item.available
        ? el("span", { className: "item-price" }, formatPrice(item.price))
        : el("span", { className: "item-badge" }, t("menu.unavailable"))));
  }));
}

function openSearch() {
  const dialog = searchDialog();
  const input = document.getElementById("searchInput");
  renderSearch();
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
  input.focus();
  input.select();
}
function closeSearch() {
  const dialog = searchDialog();
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

let foundTimer = null;
function goToItem(id) {
  closeSearch();
  if (!ITEMS.has(id)) return;
  setCategoryOpen(ITEMS.get(id).category.id, true, false);
  const row = document.querySelector(`.menu-item[data-item="${CSS.escape(id)}"]`);
  if (!row) return;
  row.scrollIntoView({ block: "center", behavior: "instant" });
  document.querySelectorAll(".menu-item.is-found").forEach((node) => node.classList.remove("is-found"));
  void row.offsetWidth;
  row.classList.add("is-found");
  clearTimeout(foundTimer);
  foundTimer = setTimeout(() => row.classList.remove("is-found"), 2500);
  row.tabIndex = -1;
  row.focus({ preventScroll: true });
}

function setupSearch() {
  const dialog = searchDialog();
  const input = document.getElementById("searchInput");
  document.getElementById("searchOpen").addEventListener("click", openSearch);
  document.getElementById("searchClose").addEventListener("click", closeSearch);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeSearch();
  });
  input.addEventListener("input", renderSearch);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      closeSearch();
      return;
    }
    if (event.key !== "Enter") return;
    const first = document.querySelector("#searchResults [data-goto]");
    if (first) {
      event.preventDefault();
      goToItem(first.dataset.goto);
    }
  });
  document.getElementById("searchResults").addEventListener("click", (event) => {
    const result = event.target.closest("[data-goto]");
    if (result) goToItem(result.dataset.goto);
  });
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAPS_LINK = /^https:\/\/((www\.)?google\.[a-z.]{2,8}\/maps|maps\.google\.[a-z.]{2,8}|maps\.app\.goo\.gl|goo\.gl\/maps)\//i;
const PHONE = /^\+?[0-9][0-9 .-]{5,18}$/;
const HOURS_KEYS = ["hours_week_open", "hours_week_close", "hours_weekend_open", "hours_weekend_close"];

let info = {};
let defaultMaps = "";
let copyTimer = null;

function hasInfo(key) {
  return typeof info[key] === "string";
}
function infoText(key, maxLength) {
  return hasInfo(key) ? info[key].trim().slice(0, maxLength) : "";
}

function openingHours() {
  const span = (days) => {
    const open = infoText("hours_" + days + "_open", 5);
    const close = infoText("hours_" + days + "_close", 5);
    return TIME.test(open) && TIME.test(close) ? [open, close] : null;
  };
  const week = span("week");
  const weekend = span("weekend");
  if (week && weekend && week.join() === weekend.join()) return [["hours.everyday", ...week]];
  return [["hours.week", week], ["hours.weekend", weekend]].filter(([, time]) => time)
    .map(([key, time]) => [key, ...time]);
}

function setRowText(node, text) {
  node.replaceChildren(node.querySelector("i"), " " + text);
}

function renderInfo() {
  const hours = openingHours();
  document.getElementById("hoursRows").replaceChildren(...hours.map(([key, open, close]) =>
    el("div", {}, el("dt", {}, t(key)), el("dd", { className: "side-time" }, open + " – " + close))));
  document.getElementById("sideHours").hidden = hours.length === 0;
  const footerHours = document.getElementById("footerHours");
  if (!HOURS_KEYS.some(hasInfo)) {
    setRowText(footerHours, t("footer.hours"));
  } else {
    footerHours.closest("li").hidden = hours.length === 0;
    setRowText(footerHours, hours.map(([key, open, close]) => t(key + "Short") + ", " + open + " - " + close).join(" · "));
  }

  const wifiName = infoText("wifi_name", 60);
  const wifiPassword = infoText("wifi_password", 100);
  document.getElementById("sideWifi").hidden = !wifiName;
  document.getElementById("wifiName").textContent = wifiName;
  document.getElementById("wifiPassword").textContent = wifiPassword;
  document.getElementById("wifiPasswordRow").hidden = !wifiPassword;
  document.getElementById("wifiCopy").hidden = !wifiPassword;

  const mapsUrl = infoText("maps_url", 300);
  for (const link of document.querySelectorAll("[data-maps]")) link.href = MAPS_LINK.test(mapsUrl) ? mapsUrl : defaultMaps;

  const address = infoText("address", 120);
  document.getElementById("findAddress").textContent = address;
  document.getElementById("findAddressRow").hidden = !address;
  if (hasInfo("address")) {
    const row = document.getElementById("footerAddress");
    row.closest("li").hidden = !address;
    if (address) setRowText(row, address);
  }

  const phone = infoText("phone", 20);
  const hasPhone = PHONE.test(phone);
  const findPhone = document.getElementById("findPhone");
  document.getElementById("findPhoneRow").hidden = !hasPhone;
  findPhone.textContent = hasPhone ? phone : "";
  if (hasPhone) findPhone.href = "tel:" + phone.replace(/[^+0-9]/g, "");
  else findPhone.removeAttribute("href");
  if (hasInfo("phone")) {
    const link = document.getElementById("footerPhone");
    link.closest("li").hidden = !hasPhone;
    if (hasPhone) {
      link.href = "tel:" + phone.replace(/[^+0-9]/g, "");
      setRowText(link, phone);
    }
  }
}

async function loadInfo() {
  if (!DB_READY) return;
  try {
    const saved = JSON.parse(storage.get(INFO_CACHE_KEY) || "null");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      info = saved;
      renderInfo();
    }
  } catch {}

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DB_TIMEOUT_MS);
  try {
    const url = SUPABASE_URL.replace(/\/$/, "") + "/rest/v1/settings?select=key,value";
    const response = await fetch(url, { headers: { apikey: SUPABASE_KEY }, signal: controller.signal, cache: "no-store" });
    if (!response.ok) throw new Error("Supabase answered " + response.status);
    const rows = await response.json();
    if (!Array.isArray(rows)) throw new Error("Supabase sent no details");
    info = Object.fromEntries(rows.filter((row) => row && typeof row.key === "string" && typeof row.value === "string")
      .map((row) => [row.key, row.value]));
    storage.set(INFO_CACHE_KEY, JSON.stringify(info));
    renderInfo();
  } catch (error) {
    console.warn("Could not load the café details from Supabase:", error);
    window.addEventListener("online", loadInfo, { once: true });
  } finally {
    clearTimeout(timer);
  }
}

async function copyWifiPassword() {
  const password = infoText("wifi_password", 100);
  let copied = false;
  try {
    await navigator.clipboard.writeText(password);
    copied = true;
  } catch {
    const field = el("textarea", { value: password, readOnly: true, className: "visually-hidden" });
    document.getElementById("sideMenu").append(field);
    field.select();
    try { copied = document.execCommand("copy"); } catch {}
    field.remove();
    document.getElementById("wifiCopy").focus();
  }
  const status = document.getElementById("wifiStatus");
  status.textContent = t(copied ? "wifi.copied" : "wifi.copyFailed");
  clearTimeout(copyTimer);
  copyTimer = setTimeout(() => { status.textContent = ""; }, 4000);
}

function setupSideMenu() {
  const sideMenu = document.getElementById("sideMenu");
  const close = () => {
    if (typeof sideMenu.close === "function") sideMenu.close();
    else sideMenu.removeAttribute("open");
  };
  document.getElementById("sideMenuOpen").addEventListener("click", () => {
    if (typeof sideMenu.showModal === "function") sideMenu.showModal();
    else sideMenu.setAttribute("open", "");
  });
  document.getElementById("sideMenuClose").addEventListener("click", close);
  sideMenu.addEventListener("click", (event) => {
    if (event.target === sideMenu) close();
  });
  document.getElementById("wifiCopy").addEventListener("click", copyWifiPassword);

  const instagram = document.getElementById("findInstagram");
  instagram.textContent = "@" + new URL(instagram.href).pathname.split("/").filter(Boolean)[0];

  defaultMaps = document.querySelector("[data-maps]").getAttribute("href");
}

const SELECTION_KEY = "{{SITE_SLUG}}-selection";
const MAX_QTY = 99;
const selection = new Map();

const ICONS = {
  plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 5v14M5 12h14"/></svg>',
  minus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M5 12h14"/></svg>'
};
function icon(name) {
  const holder = document.createElement("span");
  holder.innerHTML = ICONS[name];
  return holder.firstElementChild;
}

function itemKey(category, item) {
  const name = typeof item.name === "string" ? item.name : item.name.fr;
  return category.id + "/" + slugify(name);
}

function loadSelection() {
  try {
    const saved = JSON.parse(storage.get(SELECTION_KEY) || "[]");
    if (!Array.isArray(saved)) return;
    for (const pair of saved) {
      if (!Array.isArray(pair)) continue;
      const [id, qty] = pair;
      if (typeof id === "string" && Number.isInteger(qty) && qty > 0) selection.set(id, Math.min(qty, MAX_QTY));
    }
  } catch {}
}

function saveSelection() {
  storage.set(SELECTION_KEY, JSON.stringify([...selection]));
}

function selectionName(id) {
  const entry = ITEMS.get(id);
  return entry ? pick(entry.item.name) : "";
}

function updateSteppers() {
  for (const box of document.querySelectorAll("[data-stepper]")) {
    const id = box.dataset.stepper;
    const qty = selection.get(id) || 0;
    const name = selectionName(id);
    const less = box.querySelector("[data-less]");
    const count = box.querySelector(".stepper-qty");
    const add = box.querySelector("[data-add]");
    less.hidden = qty === 0;
    count.hidden = qty === 0;
    count.textContent = String(qty);
    add.disabled = qty >= MAX_QTY;
    add.setAttribute("aria-label", t(qty ? "sel.more" : "sel.add", { name }));
  }
}

function renderSelection() {
  let count = 0;
  let total = 0;
  const rows = [];
  for (const [id, qty] of selection) {
    const entry = ITEMS.get(id);
    if (!entry) continue;
    count += qty;
    total += qty * entry.item.price;
    const name = pick(entry.item.name);
    rows.push(el("li", { className: "sel-row" },
      el("p", { className: "sel-row-name" }, name, el("span", { className: "sel-row-cat" }, pick(entry.category.name))),
      el("div", { className: "sel-row-side" },
        el("div", { className: "sel-qty" },
          el("button", { type: "button", className: "add-btn", dataset: { qty: id, delta: "-1" }, attrs: { "aria-label": t("sel.less", { name }) } }, icon("minus")),
          el("span", { className: "stepper-qty" }, String(qty)),
          el("button", {
            type: "button", className: "add-btn", disabled: qty >= MAX_QTY,
            dataset: { qty: id, delta: "1" }, attrs: { "aria-label": t("sel.more", { name }) }
          }, icon("plus"))),
        el("span", { className: "item-price" }, formatPrice(qty * entry.item.price)))));
  }
  document.getElementById("selectionList").replaceChildren(...rows);
  document.getElementById("selectionEmpty").hidden = rows.length > 0;
  document.getElementById("selectionClear").hidden = rows.length === 0;
  document.getElementById("selectionSum").textContent = formatPrice(total);

  const pill = document.getElementById("selectionOpen");
  pill.hidden = count === 0;
  document.getElementById("selectionCount").textContent = String(count);
  document.getElementById("selectionTotal").textContent = formatPrice(total);
  pill.setAttribute("aria-label", t("sel.openLabel", { n: count, price: formatPrice(total) }));
  document.body.classList.toggle("has-selection", count > 0);
  updateSteppers();
}

let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function addToSelection(id, button) {
  if (!ITEMS.has(id)) return;
  const qty = selection.get(id) || 0;
  if (qty >= MAX_QTY) return;
  selection.set(id, qty + 1);
  saveSelection();
  renderSelection();
  showToast(t("sel.added", { name: selectionName(id) }));
  if (button) {
    button.classList.add("is-added");
    setTimeout(() => button.classList.remove("is-added"), 700);
  }
  const pill = document.getElementById("selectionOpen");
  pill.classList.remove("bump");
  void pill.offsetWidth;
  pill.classList.add("bump");
}

function removeFromSelection(id) {
  const qty = selection.get(id) || 0;
  if (!qty) return;
  if (qty > 1) selection.set(id, qty - 1);
  else selection.delete(id);
  saveSelection();
  renderSelection();
  showToast(t("sel.removed", { name: selectionName(id) }));
  if (qty === 1) {
    const add = document.querySelector(`[data-stepper="${CSS.escape(id)}"] [data-add]`);
    if (add) add.focus();
  }
}

function changeQuantity(id, delta) {
  const qty = Math.min((selection.get(id) || 0) + delta, MAX_QTY);
  if (qty <= 0) selection.delete(id);
  else selection.set(id, qty);
  saveSelection();
  renderSelection();
}

function setupSelection() {
  const dialog = document.getElementById("selectionDialog");
  const closeButton = document.getElementById("selectionClose");
  const close = () => {
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
  };
  document.getElementById("selectionOpen").addEventListener("click", () => {
    renderSelection();
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  });
  closeButton.addEventListener("click", close);
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) close();
  });
  document.getElementById("selectionClear").addEventListener("click", () => {
    selection.clear();
    saveSelection();
    renderSelection();
    closeButton.focus();
  });

  document.addEventListener("click", (event) => {
    const add = event.target.closest("[data-add]");
    if (add) {
      addToSelection(add.dataset.add, add);
      return;
    }
    const less = event.target.closest("[data-less]");
    if (less) {
      removeFromSelection(less.dataset.less);
      return;
    }
    const qtyButton = event.target.closest("[data-qty]");
    if (qtyButton) {
      const { qty: id, delta } = qtyButton.dataset;
      changeQuantity(id, Number(delta));
      const buttons = [...document.querySelectorAll("#selectionList [data-qty]")].filter((button) => button.dataset.qty === id);
      const same = buttons.find((button) => button.dataset.delta === delta);
      (same && !same.disabled ? same : buttons.find((button) => !button.disabled) || closeButton).focus();
    }
  });
}

function init() {
  if (typeof MENU_DATA === "undefined" || typeof TEXT === "undefined") {
    console.error("menu-data.js or translations.js did not load.");
    return;
  }
  setupMenuClicks();
  setupSearch();
  setupSideMenu();
  setupSelection();
  setupLanguage();
  loadSelection();
  applyLanguage(detectLanguage());
  loadMenu();
  loadInfo();
}

document.addEventListener("DOMContentLoaded", init);
````

## `translations.js`

````js
const TEXT = {
  fr: {
    "meta.title": "{{BRAND_NAME}} | {{BRAND_SUB}}",
    "brand.home": "{{BRAND_NAME}}, retour en haut de la page",
    "lang.group": "Langue",

    "side.open": "Ouvrir le menu",
    "side.title": "Menu",
    "side.close": "Fermer le menu",
    "hours.title": "Horaires",
    "hours.week": "Lundi – Vendredi",
    "hours.weekend": "Samedi – Dimanche",
    "hours.everyday": "Tous les jours",
    "hours.weekShort": "Lun-Ven",
    "hours.weekendShort": "Sam-Dim",
    "hours.everydayShort": "Lun-Dim",
    "wifi.title": "Wi-Fi",
    "wifi.network": "Réseau",
    "wifi.password": "Mot de passe",
    "wifi.copy": "Copier le mot de passe",
    "wifi.copied": "Mot de passe copié",
    "wifi.copyFailed": "Copie impossible : recopiez le mot de passe ci-dessus.",
    "find.title": "Nous trouver",
    "find.address": "Adresse",
    "find.phone": "Téléphone",

    "search.open": "Rechercher dans la carte",
    "search.title": "Rechercher dans la carte",
    "search.label": "Rechercher un produit",
    "search.placeholder": "{{SEARCH_EXAMPLE_FR}}",
    "search.close": "Fermer la recherche",
    "search.hint": "Tapez le nom d'un produit, d'un parfum ou d'une catégorie.",
    "search.one": "1 résultat",
    "search.count": "{n} résultats",
    "search.none": "Aucun produit trouvé pour «\u00a0{q}\u00a0».",

    "menu.categories": "Catégories de la carte",
    "menu.loading": "Chargement de la carte…",
    "menu.stale": "La carte n'a pas pu être mise à jour : certains prix ont peut-être changé.",
    "menu.unavailable": "Indisponible",

    "footer.desc": "{{TAGLINE_FR}}",
    "footer.nav": "Navigation",
    "footer.home": "Accueil",
    "footer.menu": "Menu",
    "footer.contact": "Contact",
    "footer.hours": "{{HOURS_FR}}",
    "footer.review": "Laisser un avis",
    "footer.follow": "Suivez-nous",
    "footer.rights": "Tous droits réservés. Réalisé par {{CREDIT_NAME}}",
    "footer.top": "Retour en haut",

    "sel.open": "Ma sélection",
    "sel.openLabel": "Ouvrir ma sélection : {n} produit(s), {price}",
    "sel.title": "Ma sélection",
    "sel.hint": "Montrez cette liste à votre serveur pour commander. Elle reste enregistrée sur votre téléphone.",
    "sel.empty": "Votre sélection est vide. Touchez + sur la carte pour ajouter un produit.",
    "sel.total": "Total",
    "sel.clear": "Vider la sélection",
    "sel.close": "Fermer",
    "sel.add": "Ajouter {name} à ma sélection",
    "sel.more": "Ajouter un {name}",
    "sel.less": "Retirer un {name}",
    "sel.added": "Ajouté : {name}",
    "sel.removed": "Retiré : {name}"
  },

  en: {
    "meta.title": "{{BRAND_NAME}} | {{BRAND_SUB}}",
    "brand.home": "{{BRAND_NAME}}, back to the top of the page",
    "lang.group": "Language",

    "side.open": "Open the menu",
    "side.title": "Menu",
    "side.close": "Close the menu",
    "hours.title": "Opening hours",
    "hours.week": "Monday – Friday",
    "hours.weekend": "Saturday – Sunday",
    "hours.everyday": "Every day",
    "hours.weekShort": "Mon-Fri",
    "hours.weekendShort": "Sat-Sun",
    "hours.everydayShort": "Mon-Sun",
    "wifi.title": "Wi-Fi",
    "wifi.network": "Network",
    "wifi.password": "Password",
    "wifi.copy": "Copy the password",
    "wifi.copied": "Password copied",
    "wifi.copyFailed": "Could not copy: please type the password above.",
    "find.title": "Find us",
    "find.address": "Address",
    "find.phone": "Phone",

    "search.open": "Search the menu",
    "search.title": "Search the menu",
    "search.label": "Search for an item",
    "search.placeholder": "{{SEARCH_EXAMPLE_EN}}",
    "search.close": "Close search",
    "search.hint": "Type the name of an item, a flavour or a category.",
    "search.one": "1 result",
    "search.count": "{n} results",
    "search.none": "No item found for “{q}”.",

    "menu.categories": "Menu categories",
    "menu.loading": "Loading the menu…",
    "menu.stale": "The menu could not be updated: some prices may have changed.",
    "menu.unavailable": "Unavailable",

    "footer.desc": "{{TAGLINE_EN}}",
    "footer.nav": "Navigation",
    "footer.home": "Home",
    "footer.menu": "Menu",
    "footer.contact": "Contact",
    "footer.hours": "{{HOURS_EN}}",
    "footer.review": "Leave a review",
    "footer.follow": "Follow us",
    "footer.rights": "All rights reserved. Made by {{CREDIT_NAME}}",
    "footer.top": "Back to top",

    "sel.open": "My selection",
    "sel.openLabel": "Open my selection: {n} item(s), {price}",
    "sel.title": "My selection",
    "sel.hint": "Show this list to your server to order. It stays saved on your phone.",
    "sel.empty": "Your selection is empty. Tap + on the menu to add an item.",
    "sel.total": "Total",
    "sel.clear": "Clear selection",
    "sel.close": "Close",
    "sel.add": "Add {name} to my selection",
    "sel.more": "Add one more {name}",
    "sel.less": "Remove one {name}",
    "sel.added": "Added: {name}",
    "sel.removed": "Removed: {name}"
  }
};
````

## `menu-data.js`

````js
const MENU_DATA = [
{{MENU_CATEGORIES}}
];

const CATEGORY_PLACEHOLDERS = {
{{CATEGORY_PHOTOS}}
};
````

## `supabase-config.js`

````js
const SUPABASE_URL = "{{SUPABASE_URL}}";
const SUPABASE_KEY = "{{SUPABASE_PUBLISHABLE_KEY}}";
````

## `.vercelignore`

````text
supabase/
README.md
````

---

# PART 5 — TESTING

- Serve the folder with any static server (e.g. `npx serve .`) and open it; never open `index.html` as
  a file (the browser blocks some features on `file://`).
- **Built-in menu**: with `supabase-config.js` empty, every category and price of `menu-data.js` shows,
  with no "not updated" note.
- **Database path without touching the real data**: in the browser console, answer the menu request
  yourself, then ask the page to refresh:

```js
const rows = MENU_DATA.map((c, ci) => ({ id: slugify(c.category), name_fr: c.category, name_en: c.en || null,
  image_url: CATEGORY_PLACEHOLDERS[c.category] || null, position: ci + 1,
  items: c.items.map((it, i) => ({ id: crypto.randomUUID(), name_fr: it.name, name_en: it.en || null,
    description_fr: it.desc || null, description_en: it.descEn || null, price: String(it.price),
    image_url: null, available: i !== 0, position: i + 1 })) }));
const realFetch = window.fetch;
window.fetch = async (url, opts) => String(url).includes('/rest/v1/categories')
  ? new Response(JSON.stringify(rows), { status: 200, headers: { 'Content-Type': 'application/json' } })
  : realFetch(url, opts);
await refreshMenu();
```

  The first product of every category then shows "Indisponible" and ids become uuids. Products chosen
  in "Ma sélection" before the refresh stay selected, except those first products, which are dropped
  because they are now unavailable. Reload the page to undo.
- With the real Supabase project: the page makes one request to `/rest/v1/categories` and one to
  `/rest/v1/settings`; changes made on the admin page show on the next load.
- Clear the site's `localStorage` after testing (saved menu, language and selection).

---

# PART 6 — PITFALLS ALREADY SOLVED (KEEP THESE FIXES)

1. **A sticky element inside an `overflow: hidden/auto` ancestor does not stick**: the header and the
   category bar are direct children of `<body>`.
2. **Links to content drawn by JavaScript** (`#<category id>`) need a manual instant scroll after the
   first drawing (`jumpToSharedLink()`); a link that cannot be decoded (`#%E0`) is ignored.
3. **`localStorage` can throw** (private browsing): every access goes through `storage` with
   `try/catch`.
4. **A damaged saved menu must be thrown away**, or the page never recovers; check its shape
   (`isMenu()`) and draw it inside `try/catch`.
5. **An empty answer is not a menu**: treat "no product" as a failure, or a bad answer blanks the page
   and overwrites the good saved copy.
6. **Do not abort a slow request just to show a fallback**: show the built-in copy after 6 s but keep
   waiting (30 s) and swap in the real menu.
7. **The built-in copy and the database use different ids**: carry the selection over by category and
   French name (`itemKey()`).
8. **A `display` set by a class beats the `hidden` attribute** (`.add-btn`, `.sel-pill`, `.side-card`,
   `.text-btn`): those components have their own `[hidden] { display: none }`.
9. **Jumping into a panel that is still unfolding lands in the wrong place**: the search opens the
   category without animation (`no-anim` class, forced reflow) before scrolling.
10. **In a search field the browser's first Esc only clears the text**: the page handles Esc itself.
11. **`String.replace` with a text replacement reads `$&`, `$'`…**: interface texts are filled with a
    function (`t()`), so "$&" typed in the search is shown as typed.
12. **A toast cannot show over an open modal dialog**: the Wi-Fi copy status is a line inside the ☰
    menu.
13. **Copying needs a real tap and https (or localhost)**: test "Copier le mot de passe" by hand.
14. **A footer link's inner `<span>` must not get the footer's span colour**, or it ignores the link's
    hover colour: the rule is `.site-footer-col li > span`.
15. **French guillemets use no-break spaces** (`\u00a0` in `translations.js`), so « and » never end a
    line; **file-writing tools can turn backslash-u escapes into raw characters** (also the accent range
    in `slugify()` and `normalize()`): write them from a script and check the files hold the escapes.
16. **Substring search is too loose**: typed words must match the start of words ("nut" finds
    "Nutella" but not "Coconut").

---

# PART 7 — ACCEPTANCE CHECKS

1. `grep -rn "{{" index.html styles.css script.js translations.js menu-data.js supabase-config.js`
   prints nothing; the logo, colours, fonts, texts, links and menu are this café's.
2. The categories appear in the menu's order with every product and price of the menu — nothing missing,
   nothing invented; categories start closed; a tap opens one, its first product is visible.
3. At 375, 360 and 320 px wide: no sideways scrolling; the header fits on one line (the name hides only
   under 345 px); the hero title fits.
4. FR / EN switch: interface, categories and generic product names change; the choice is remembered
   after a reload; `?lang=fr` forces French.
5. Search: "capu" finds the cappuccino (if the menu has one), an English word finds the product in French
   mode, an unknown word shows "Aucun produit trouvé pour « … »."; Enter opens the category and lights
   up the product; one Esc closes the panel.
6. Ma sélection: two products (one of them twice) give the right total; counts survive a reload and a
   language switch; "Vider la sélection" empties it and hides the pill; the pill never covers "Retour en
   haut".
7. ☰ menu: with nothing filled in on the admin's "Infos" tab only "Nous trouver" with Instagram shows;
   once filled in, hours, Wi-Fi (copy works with a real tap), address and phone appear, and the footer
   shows the same address, hours and phone.
8. Data: Part 5's tests pass; with Supabase unreachable the saved copy (or `menu-data.js`) shows with
   the "not updated" note — never a blank menu.
9. `/#<category id>` lands on that category; no console errors; the footer links (phone, Maps, review,
   Instagram, Facebook) are this café's.
