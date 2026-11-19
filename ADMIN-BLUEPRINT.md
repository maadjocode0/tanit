# Café Admin Page — Blueprint

A ready-to-build owner admin page for a café menu website: the owner logs in on their phone and
edits the menu (prices, availability, photos, products, categories, their order) and the café's
details (opening hours, Wi-Fi, address, Google Maps link, phone). Everything is stored in one
Supabase project; the public menu page reads it.

This file holds the complete, working source of that admin page, taken from a live café site, with
every café-specific detail (name, logo, colours, fonts, currency, database keys) replaced by a
placeholder such as `{{BRAND_NAME}}`.

- **Part 0** — Rules and build steps for the session that builds the new admin.
- **Part 1** — Placeholder dictionary.
- **Part 2** — What the admin does (specification).
- **Part 3** — Database (Supabase): tables, rules, setup, seed.
- **Part 4** — Connecting the public menu page (data contract + reference loading code).
- **Part 5** — Complete source files, with placeholders.
- **Part 6** — Testing without a real login.
- **Part 7** — Pitfalls already solved.
- **Part 8** — Acceptance checks.

---

# PART 0 — RULES AND BUILD STEPS

## 0.1 Rules

1. **Same admin, new café.** Keep every file, function, rule and behaviour of Part 5. Change only
   the placeholder values. Do not add, remove or "improve" features while building; propose them
   separately once the admin works.
2. **No framework, no build step, no npm packages, no server code of your own.** The admin page
   loads exactly two libraries from jsDelivr, pinned with integrity hashes (supabase-js and
   SortableJS, see `admin.html`). Everything else is plain HTML, CSS and JavaScript.
3. **No comments in the code files.** The source in Part 5 is comment-free on purpose; keep it that
   way (explanations belong in the README or in this file).
4. **Text safety.** Text that comes from the database is always inserted with `textContent` (the
   `el()` helper), never `innerHTML`. `innerHTML` is used only for the fixed SVG icon strings.
5. **Security lives in the database.** Who may change what is decided only by the row-level
   security rules in `supabase/schema.sql`. The admin page protects nothing by itself. Never put the
   Supabase secret (service_role) key in any file; only the **publishable** key goes in
   `supabase-config.js`. Sign-ups must be turned off (Part 3.3, step 3).
6. **Never invent** names, prices, descriptions, hours, addresses or links: they come from the
   owner or the menu. Anything unknown stays empty and is listed for the owner to confirm.
7. **The admin page is in French** (the owner's language). Product and category names have an
   optional English version for a bilingual public site; empty English = the French name is shown.

## 0.2 Build steps

1. Collect a value for every placeholder of Part 1.
2. Create the files of Part 5 (`admin.html`, `admin.css`, `admin.js`, `supabase-config.js`,
   `supabase/schema.sql`, `.vercelignore`) with the placeholders replaced. Put them at the root of the
   café's website folder, next to its `index.html` (the admin's logo links to `index.html`).
3. Check nothing is left: `grep -rn "{{" admin.html admin.css admin.js supabase-config.js supabase/`
   must print nothing.
4. Write the menu as `menu-data.js` (Part 3.4) and generate `supabase/seed.sql` with the seed tool.
5. Set up Supabase (Part 3.3): project, `schema.sql`, `seed.sql`, sign-ups off, owner account, admin
   row, keys in `supabase-config.js`.
6. Connect the public menu page to the same data (Part 4).
7. Test the admin against a mocked database (Part 6), then run the acceptance checks (Part 8).
8. Hand over: the admin address (`/admin.html`), the owner's login (the owner sets the password),
   and the list of details still to confirm.

---

# PART 1 — PLACEHOLDER DICTIONARY

Every `{{…}}` in this file is listed here. Values go in as plain text (in `.html` files write `&` as
`&amp;`).

### Identity

| Placeholder | Meaning and format |
|---|---|
| `{{BRAND_NAME}}` | The café's short name as written on its sign. Admin page title, header, the "Voir le site …" label. |
| `{{SITE_SLUG}}` | Lowercase id (a–z, 0–9, `-`), unique per café. Browser storage keys of the public page: `{{SITE_SLUG}}-menu-v1`, `{{SITE_SLUG}}-info-v1`. |
| `{{LOGO_PATH}}` | Path of the logo image shown 34 × 34 px in the admin header, e.g. `logo.png` or `images/logo.svg`. The header crops it to a circle (`.brand img { border-radius: 50% }` in `admin.css`); remove that radius if the logo is not round. |
| `{{FAVICON_PATH}}` | Path of the browser-tab icon (often the same file as the logo). |

### Colours (`:root` of `admin.css`)

Token names are kept from the original site (`--wine` is simply the primary colour). Check every
text pair with a contrast checker: WCAG AA, 4.5:1 for text.

| Placeholder | CSS token and role | Rule |
|---|---|---|
| `{{COLOR_PRIMARY}}` | `--wine`: header background, buttons, titles, prices, focus borders; also `theme-color` in `admin.html` | Dark brand colour; `{{COLOR_BACKGROUND}}` text on it ≥ 4.5:1 |
| `{{COLOR_PRIMARY_DEEP}}` | `--wine-deep`: button hover | About 20 % darker than the primary |
| `{{COLOR_BACKGROUND}}` | `--cream`: text on dark, sheets, empty photo buttons | Off-white |
| `{{COLOR_SURFACE}}` | `--beige`: page background of the admin | One step deeper than the background, same hue |
| `{{COLOR_HAIRLINE}}` | `--sand`: tab bar, thin dividers | One more step deeper |
| `{{COLOR_BORDER}}` | `--line`: borders of fields, buttons and photo slots | One more step deeper |
| `{{COLOR_ACCENT}}` | `--gold`: decoration only | The brand's accent (metal, caramel, etc.) |
| `{{COLOR_ACCENT_LIGHT}}` | `--gold-light`: small text on the dark header (the logged-in e-mail) | ≥ 4.5:1 on the primary |
| `{{COLOR_TEXT}}` | `--ink`: main text, toast background | Near-black in the palette's hue |
| `{{COLOR_TEXT_SOFT}}` | `--ink-soft`: secondary text | ≥ 4.5:1 on `{{COLOR_SURFACE}}` |
| `{{COLOR_DANGER}}` | `--kiss`: error messages, red toast, delete hover | A red; white text on it ≥ 4.5:1 |
| `{{COLOR_SECONDARY}}` | `--teal`: section titles, availability switch, focus ring | Dark; may simply equal the primary |
| `{{COLOR_OFF_CARD}}` | Product card of an unavailable product | Between white and `{{COLOR_SURFACE}}` |
| `{{COLOR_DANGER_TINT}}` | Delete button background on hover | Very light red |
| `{{COLOR_SWITCH_OFF}}` | Availability switch when off | Mid grey in the palette's hue |
| `{{RGB_PRIMARY}}` | `{{COLOR_PRIMARY}}` written `r, g, b` (shadows, focus rings) | e.g. `18, 52, 86` |
| `{{RGB_ACCENT}}` | `{{COLOR_ACCENT}}` written `r, g, b` (thin borders on the dark header) | |
| `{{RGB_TEXT}}` | `{{COLOR_TEXT}}` written `r, g, b` (dark backdrop behind sheets) | |
| `{{RGB_BACKGROUND}}` | `{{COLOR_BACKGROUND}}` written `r, g, b` (veil over a photo while it uploads) | |

### Fonts

| Placeholder | Meaning and format |
|---|---|
| `{{GOOGLE_FONTS_URL}}` | The Google Fonts stylesheet address for both fonts, e.g. `https://fonts.googleapis.com/css2?family=<Display>:ital,wght@0,400;0,600;1,600&family=<Body>:wght@400;500;600;700&display=swap`. Include the italic 600 of the display font (titles are italic). |
| `{{FONT_DISPLAY}}` | CSS font stack of the titles, e.g. `'<Display font>', Georgia, 'Times New Roman', serif` |
| `{{FONT_BODY}}` | CSS font stack of the text, e.g. `'<Body font>', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif` |

Use the same fonts as the café's public site.

### Money

| Placeholder | Meaning and format |
|---|---|
| `{{CURRENCY}}` | Unit written after prices, e.g. `DT`, `€`, `MAD` |
| `{{CURRENCY_NAME_FR}}` | The currency in French words, for screen readers ("Prix de … en …"), e.g. `euros` |
| `{{PRICE_DECIMALS}}` | Decimals shown and stored: `2` or `3`. Used in `toFixed()` and in `numeric(7, …)` in `schema.sql`. Use the same number as the public site. |
| `{{PRICE_FACTOR}}` | `100` for 2 decimals, `1000` for 3 (rounding in `parsePrice()`) |
| `{{PRICE_STEP}}` | `0.01` for 2 decimals, `0.001` for 3 (price fields) |
| `{{PRICE_EXAMPLE}}` | A sample price with those decimals, e.g. `15.50` or `15.500` (field placeholder and error messages) |

### Café details and wording

| Placeholder | Meaning and format |
|---|---|
| `{{PHONE_EXAMPLE}}` | A sample phone number in the country's format, e.g. `+33 6 12 34 56 78` (field placeholder and error message) |
| `{{INFO_WHERE_FR}}` | Where the public site shows the "Infos" details, in French, ending the sentence "Ces informations s'affichent …". E.g. `dans le menu ☰ du site et en bas de page` or `en bas de page du site`. |

### Database

| Placeholder | Meaning and format |
|---|---|
| `{{SUPABASE_URL}}` | The project address, `https://<project-ref>.supabase.co` |
| `{{SUPABASE_PUBLISHABLE_KEY}}` | The project's **publishable** key, `sb_publishable_…` (public by design). Never the secret key. |
| `{{SUPABASE_PROJECT_REF}}` | The `<project-ref>` part of the address (only used by the test page of Part 6) |

### Seed (Part 3.4)

| Placeholder | Meaning and format |
|---|---|
| `{{HOURS_WEEK_OPEN}}`, `{{HOURS_WEEK_CLOSE}}` | Monday–Friday opening and closing, `HH:MM` (24 h). Leave the line out if unknown. |
| `{{HOURS_WEEKEND_OPEN}}`, `{{HOURS_WEEKEND_CLOSE}}` | Saturday–Sunday, same format |
| `{{ADDRESS}}` | Street address as the owner writes it (≤ 120 characters) |
| `{{MAPS_URL}}` | The café's Google Maps link (`https://maps.app.goo.gl/…` or `https://www.google.com/maps/…`) |
| `{{PHONE}}` | The café's phone number (digits, spaces, dots, dashes, optional leading `+`) |

---

# PART 2 — WHAT THE ADMIN DOES

French only, phone first, `noindex`, not linked from the public site (its header logo links back to
`index.html`). It loads only `admin.css` (self-contained: tokens, header, buttons, sheets, toast), not
the public site's stylesheet.

## 2.1 Screens

| Screen | When |
|---|---|
| "Chargement…" | While the session is checked |
| "Configuration manquante" | `supabase-config.js` is empty |
| "Problème de chargement" | A library or the database could not be loaded |
| "Administration" (login) | Not logged in: e-mail + password; wrong details → "E-mail ou mot de passe incorrect." |
| "Accès refusé" | Logged in, but the account is not in `public.admins`; shows the connected e-mail |
| Application | An admin: tabs **Produits**, **Catégories**, **Infos**; the header shows the e-mail (hidden under 520 px) and "Déconnexion" |

## 2.2 "Produits" tab

- Toolbar: a "Catégorie" filter (all categories or one) and "+ Ajouter un produit".
- Products are grouped by category ("<name> · N produits"). Products are listed in their `position`
  order.
- **Product card**: photo button (56 px; dashed camera icon when empty; a tap chooses a new photo,
  uploaded and saved at once), name with the French description in small text, a pencil (edit sheet)
  and a bin (delete after `confirm()`), a price field saved on change or Enter (invalid values are
  refused before sending), an availability switch saved on change. Every save shows a toast; an error
  shows a red toast and puts the field back.
- Messages and labels name the product as "<name> (<category>)", because the same name exists in
  several categories.
- **"Changer l'ordre"** (on each category that has 2 products or more): switches that category to a
  compact list (drag handle ⠿, name and price, ↑ / ↓). Every drop or arrow saves the whole order in one
  call to `reorder_items(ids)`; on failure the list goes back to the saved order. "Terminé" goes back
  to the cards. Keyboard focus stays on the moved row's arrow.
- **"Nouveau produit" sheet**: Catégorie *, Nom *, Nom en anglais, Description, Description en
  anglais, Prix *, Photo (preview, "Retirer"), Disponible. "Ajouter" uploads the photo, inserts the
  row (id made in the browser with `crypto.randomUUID()`, position = last + 1), closes the sheet and
  filters the list to that category. A failure deletes the uploaded photo and shows the error in the
  sheet.
- **"Modifier le produit" sheet** (pencil): Catégorie (moving the product puts it at the end of the
  new category), Nom *, Nom en anglais, Description, Description en anglais, Photo (change / remove).
  Nothing is saved until "Enregistrer"; only changed fields are sent; "Aucune modification" when
  nothing changed. Toasts: "Nom enregistré", "Description enregistrée", "Photo mise à jour", "Photo
  retirée", "Produit déplacé", or "Modifications enregistrées". The replaced photo is removed from
  storage.
- An English description without a French one is refused in both sheets.
- While a sheet is saving, Esc, ×, "Annuler" and a click on the dark area do nothing, so the owner
  sees the result.

## 2.3 "Catégories" tab

- "+ Ajouter une catégorie" → sheet: Nom *, Nom en anglais, Photo * (required: the public menu shows
  each category as a photo banner). Refused: empty name, a name already used (any case), no photo.
  The id is made from the French name ("Crêpes salées" → `crepes-salees`, then `-2`, `-3` when taken).
- One card per category: drag handle ⠿, photo button (changes the banner photo), name with
  "N produits" ("0 produit · pas encore sur la carte" for an empty one), pencil, bin, ↑ / ↓.
- Order: SortableJS drag (handle only) or the arrows; saved with one call to
  `reorder_categories(ids)`.
- **Pencil** → "Modifier la catégorie": Nom *, Nom en anglais, Photo ("Changer la photo"; a category
  always keeps a photo). The id (used in the public page's links) does not change on rename.
- **Bin** → deletes the category **with its products** (the database refuses products without a
  category), after a confirmation that says how many products go: "Supprimer la catégorie « … » et
  ses N produits ?" Uploaded photos of the category and its products are removed from storage.
- Phones: name on the whole first line, pencil / bin then arrows on the second. From 600 px: one line.

## 2.4 "Infos" tab

Hint: "Ces informations s'affichent {{INFO_WHERE_FR}}. Laissez vide ce qui ne s'applique pas : rien
ne s'affiche à la place." Three cards:

- **Horaires**: Lundi – Vendredi and Samedi – Dimanche, each "Ouverture" / "Fermeture" (`type=time`).
- **Wi-Fi**: network name and password (visible to everyone on the site).
- **Nous trouver**: address, Google Maps link, phone.

"Enregistrer" trims every value and refuses, with the focus on the field: an opening time without its
closing time (or the reverse), a time that is not `HH:MM`, a Wi-Fi password without a network name, a
link that is not a Google Maps link, a phone with other characters. Only changed details are sent, in
one `upsert` on `key`. If the `settings` table is missing, the tab shows a note and the other tabs work.

Remove the Wi-Fi card only if the public site has nowhere to show it.

## 2.5 Photos

- One shared, visually hidden `<input type="file" accept="image/*">` (not `display:none`, so phones
  open it).
- Shrunk in the browser on a white background into two copies, 800 px and 480 px wide (never
  enlarged), WebP quality 0.8; JPEG 0.82 when the browser cannot make WebP (Safari).
- Uploaded to the public bucket `menu` as `items/<id>-<timestamp>-800.webp` and `-480.webp`
  (categories: `categories/…`), one-year cache. `image_url` stores the 800 px address.
- Replaced, removed or deleted photos are removed from storage. Photos that are not in the bucket
  (e.g. stock photo addresses put in by the seed) are never touched.

## 2.6 Writes

Every update and delete asks for the changed rows back (`.select()`). An empty answer counts as
refused, because row-level security silently ignores writes from accounts that are not admins.

---

# PART 3 — DATABASE (SUPABASE)

## 3.1 Tables

| Table | Columns |
|---|---|
| `categories` | `id` text primary key (short name used in the public page's links), `name_fr` (1–60), `name_en` (empty = French), `image_url` (banner photo), `position` (order on the menu) |
| `items` | `id` uuid, `category_id` → `categories`, `group_fr` / `group_en` / `is_extra` (optional sections, not used by the admin UI), `name_fr` (1–80) / `name_en`, `description_fr` / `description_en` (≤ 300), `price` numeric(7, `{{PRICE_DECIMALS}}`) ≥ 0, `image_url`, `available` (default true), `featured` (not used yet), `position` (order inside the category) |
| `admins` | `user_id` → `auth.users`, `email`: the accounts allowed to edit |
| `settings` | `key` (`^[a-z_]{1,40}$`), `value` (≤ 300, empty = not shown), `updated_at` |

Settings keys: `hours_week_open`, `hours_week_close`, `hours_weekend_open`, `hours_weekend_close`
(`HH:MM`), `wifi_name`, `wifi_password`, `address`, `maps_url`, `phone`.

Functions: `is_admin()` (security definer, used by every write rule), `reorder_categories(text[])` and
`reorder_items(uuid[])` (refuse non-admins). Storage: public bucket `menu`, 3 MB per file, WebP / JPEG /
PNG only.

## 3.2 What the rules allow

| Who | `categories`, `items`, `settings` | `admins` | reorder functions | Photos (bucket `menu`) |
|---|---|---|---|---|
| Anyone (publishable key) | read | nothing | refused | view by address |
| Logged in, not an admin | read | own row (none) | "Not allowed" | view by address |
| Admin | read, add, change, delete | own row | allowed | upload, list, delete |

## 3.3 Setup (once per café — every café has its own Supabase project)

1. Create a project on supabase.com (free plan, region close to the café).
2. **SQL Editor → New query**: paste `supabase/schema.sql`, Run. Then `supabase/seed.sql` (Part 3.4);
   it refuses to run twice. `schema.sql` can be run again at any time: it only adds what is missing.
3. **Authentication → Sign In / Providers**: turn off "Allow new users to sign up". Check:
   `GET {{SUPABASE_URL}}/auth/v1/settings` with header `apikey: {{SUPABASE_PUBLISHABLE_KEY}}` must answer
   `"disable_signup": true`.
4. **Authentication → Users → Add user → Create new user**: the owner's e-mail and a strong password
   (the owner types it), "Auto Confirm User" ticked.
5. **SQL Editor**: give that account admin rights:

   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'owner@example.com';
   ```

6. **Project Settings → API Keys**: copy the project address and the **publishable** key into
   `supabase-config.js`.

Free plan notes for the owner: a project pauses after a week without activity (restore it from the
dashboard), and there is no automatic backup (export the `items` table now and then).

## 3.4 The menu: `menu-data.js` and the seed tool

The public site keeps a built-in copy of the menu in `menu-data.js` (used as a fallback, Part 4), and
the seed is generated from it. Shape (one object per category, in menu order; `en` / `descEn` only
when the English differs; prices as numbers):

```js
const MENU_DATA = [
  { category: "Cafés", en: "Coffees", image: "", items: [
    { name: "Espresso", price: 3.5, desc: "" },
    { name: "Café crème", en: "Coffee with cream", price: 4.5, desc: "Lait chaud", descEn: "Hot milk" }
  ]}
];

const CATEGORY_PLACEHOLDERS = {
  "Cafés": "https://…/a-photo-for-this-category.jpg"
};
```

- Every price exactly as on the café's menu; names as printed (only obvious typos fixed, and listed).
- `image` may hold a category photo address; otherwise `CATEGORY_PLACEHOLDERS[<French name>]` is used.
  Use photos the café owns or free stock photos (e.g. Unsplash), listed for the owner to replace.
- The category id is `slugify(<French name>)`; it must be the same function on the public page.

Save this Node.js tool **outside the project** and run `node make-seed.js <project folder>`; it writes
`supabase/seed.sql`. Fill the `SETTINGS` list with the details the owner gave (leave out unknown lines).

```js
const fs = require('fs');
const path = require('path');
const repo = process.argv[2];
const src = fs.readFileSync(path.join(repo, 'menu-data.js'), 'utf8');
const { MENU_DATA, CATEGORY_PLACEHOLDERS } = new Function(src + ';return { MENU_DATA, CATEGORY_PLACEHOLDERS }')();

const SETTINGS = [
  ['hours_week_open', '{{HOURS_WEEK_OPEN}}'],
  ['hours_week_close', '{{HOURS_WEEK_CLOSE}}'],
  ['hours_weekend_open', '{{HOURS_WEEKEND_OPEN}}'],
  ['hours_weekend_close', '{{HOURS_WEEKEND_CLOSE}}'],
  ['address', '{{ADDRESS}}'],
  ['maps_url', '{{MAPS_URL}}'],
  ['phone', '{{PHONE}}'],
];

const slugify = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-');
const q = (v) => (v === null || v === undefined || v === '' ? 'null' : "'" + String(v).replace(/'/g, "''") + "'");

const ids = new Set();
const catRows = MENU_DATA.map((c, i) => {
  const id = slugify(c.category);
  if (ids.has(id)) throw new Error('Duplicate category id ' + id);
  ids.add(id);
  const image = c.image && c.image.trim() !== '' ? c.image : (CATEGORY_PLACEHOLDERS || {})[c.category] || null;
  return `  (${q(id)}, ${q(c.category)}, ${q(c.en)}, ${q(image)}, ${i + 1})`;
});

const itemRows = [];
for (const c of MENU_DATA) {
  c.items.forEach((it, i) => {
    if (typeof it.price !== 'number' || !(it.price >= 0)) throw new Error('Bad price: ' + it.name);
    itemRows.push(`  (${q(slugify(c.category))}, ${q(it.name)}, ${q(it.en)}, ${q(it.desc)}, ${q(it.descEn)}, ${it.price.toFixed({{PRICE_DECIMALS}})}, ${i + 1})`);
  });
}

const settingsSql = SETTINGS.length
  ? `insert into public.settings (key, value) values\n${SETTINGS.map(([k, v]) => `  (${q(k)}, ${q(v)})`).join(',\n')}\non conflict (key) do nothing;\n`
  : '';

const sql = `do $$
begin
  if exists (select 1 from public.items) or exists (select 1 from public.categories) then
    raise exception 'The menu is already loaded: seed.sql must only be run once.';
  end if;
end;
$$;

insert into public.categories (id, name_fr, name_en, image_url, position) values
${catRows.join(',\n')};

insert into public.items (category_id, name_fr, name_en, description_fr, description_en, price, position) values
${itemRows.join(',\n')};

${settingsSql}`;
fs.mkdirSync(path.join(repo, 'supabase'), { recursive: true });
fs.writeFileSync(path.join(repo, 'supabase', 'seed.sql'), sql);
console.log('seed.sql:', MENU_DATA.length, 'categories,', itemRows.length, 'items,', SETTINGS.length, 'settings');
```

---

# PART 4 — CONNECTING THE PUBLIC MENU PAGE

The public page reads the same tables with the publishable key, with one `fetch` and no library.
Whatever its design, it must follow this contract so the owner's changes show up.

## 4.1 Data contract

- **Menu request** (one request, given up after 30 s):
  `GET {{SUPABASE_URL}}/rest/v1/categories?select=id,name_fr,name_en,image_url,position,items(id,name_fr,name_en,description_fr,description_en,price,image_url,available,position)&order=position.asc&items.order=position.asc`
  with header `apikey: {{SUPABASE_PUBLISHABLE_KEY}}`.
- **Details request**: `GET {{SUPABASE_URL}}/rest/v1/settings?select=key,value` (same header).
- Categories and products in `position` order; categories without products are not shown.
- `name_en` / `description_en` empty → show the French text in English.
- `available = false` → keep the product on the menu, greyed out, with "Indisponible" / "Unavailable".
- `image_url` of a product: when the address contains `-800.`, the `-480.` copy next to it is the one
  to use for small thumbnails.
- `price` arrives as a string: convert with `Number()` and show `{{PRICE_DECIMALS}}` decimals.
- Settings: an empty value is not shown; check every value again before use (time `HH:MM`, Google
  Maps link, phone characters), with the same rules as the admin.
- An answer with no product at all is a failure, never a menu: keep what is on screen.
- Fallbacks: show the copy saved on the phone first (`localStorage`), then the fresh answer; without
  Supabase (or never reached) use `menu-data.js`; after 6 s without an answer on a first visit, show
  `menu-data.js` and swap in the real menu when it arrives; show a "the menu could not be updated"
  note while an older copy is on screen; retry on the browser's `online` event.
- Text from the database is inserted with `textContent` only.

## 4.2 Reference loading code

Taken from the live public page (it expects `MENU_DATA` and `CATEGORY_PLACEHOLDERS` from
`menu-data.js`, and `SUPABASE_URL` / `SUPABASE_KEY` from `supabase-config.js`). The page supplies its
own `showMenu(data)` (draws the menu and sets `menu = data` without its empty categories),
`showLoading()`, `renderInfo()` (shows the details held in `info`), and a `#menuStale` note element;
it calls `loadMenu()` and `loadInfo()` once the page is ready. The menu
shape it produces is
`[{ id, name, image, items: [{ id, name, price, desc, image, available }] }]`, where `name` / `desc`
are a string or `{ fr, en }`.

```js
const MENU_CACHE_KEY = "{{SITE_SLUG}}-menu-v1";
const INFO_CACHE_KEY = "{{SITE_SLUG}}-info-v1";
const FALLBACK_AFTER_MS = 6000;
const DB_TIMEOUT_MS = 30000;
const DB_READY = typeof SUPABASE_URL === "string" && SUPABASE_URL !== "" &&
  typeof SUPABASE_KEY === "string" && SUPABASE_KEY !== "";

let menu = null;
let shownJson = null;

const storage = {
  get(key) { try { return localStorage.getItem(key); } catch { return null; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch {} },
  remove(key) { try { localStorage.removeItem(key); } catch {} }
};

function slugify(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-");
}

function isText(value) {
  return typeof value === "string" || (value !== null && typeof value === "object" && typeof value.fr === "string");
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

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAPS_LINK = /^https:\/\/((www\.)?google\.[a-z.]{2,8}\/maps|maps\.google\.[a-z.]{2,8}|maps\.app\.goo\.gl|goo\.gl\/maps)\//i;
const PHONE = /^\+?[0-9][0-9 .-]{5,18}$/;
const HOURS_KEYS = ["hours_week_open", "hours_week_close", "hours_weekend_open", "hours_weekend_close"];

let info = {};

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
```

## 4.3 Hosting

If the site is on Vercel, add the `.vercelignore` of Part 5 so `supabase/` and the README are not
published.

---

# PART 5 — SOURCE FILES (WITH PLACEHOLDERS)

Create each file with exactly this content, replacing every `{{…}}` (Part 1). UTF-8, LF line endings.

## `admin.html`

````html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="robots" content="noindex, nofollow">
  <title>{{BRAND_NAME}} — Administration</title>
  <meta name="theme-color" content="{{COLOR_PRIMARY}}">

  <link rel="icon" href="{{FAVICON_PATH}}">

  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="{{GOOGLE_FONTS_URL}}">
  <link rel="stylesheet" href="admin.css">

  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.117.3/dist/umd/supabase.js"
          integrity="sha384-BWcjm9OdFth9TbhCxZPdm+gAOUMAzQy9nmTs12ioXdCcbVnJaPMn+fMUoQCLt60R"
          crossorigin="anonymous" defer></script>
  <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.7/Sortable.min.js"
          integrity="sha384-DgmC6Xe2bSN2WjTDXzWYbUbxyhNP+NNkGDR/g78pCXV7E7rcVTGxVg0uIVCUUcBc"
          crossorigin="anonymous" defer></script>
  <script src="supabase-config.js" defer></script>
  <script src="admin.js" defer></script>
</head>
<body class="admin-page">
  <header class="admin-header on-dark">
    <a class="brand" href="index.html" aria-label="Voir le site {{BRAND_NAME}}">
      <img src="{{LOGO_PATH}}" alt="" width="34" height="34">
      <span class="brand-name">{{BRAND_NAME}}</span>
    </a>
    <div class="admin-user" id="admin-user" hidden>
      <span class="admin-email" id="admin-email"></span>
      <button class="admin-logout" type="button" id="logout">Déconnexion</button>
    </div>
  </header>

  <main class="admin">
    <p class="admin-status" id="view-loading">Chargement…</p>

    <section class="admin-card" id="view-setup" hidden>
      <h1>Configuration manquante</h1>
      <p>Renseignez l'adresse et la clé publique (publishable) de votre projet Supabase dans
        <code>supabase-config.js</code>, comme expliqué dans le README.</p>
    </section>

    <section class="admin-card" id="view-error" hidden>
      <h1>Problème de chargement</h1>
      <p id="error-text">La page n'a pas pu se charger. Vérifiez la connexion internet puis rechargez.</p>
    </section>

    <section class="admin-card" id="view-login" hidden aria-labelledby="login-title">
      <h1 id="login-title">Administration</h1>
      <p class="admin-muted">Connectez-vous pour gérer la carte.</p>
      <form class="admin-form" id="login-form" novalidate>
        <label class="field">
          <span>E-mail</span>
          <input type="email" name="email" autocomplete="username" required>
        </label>
        <label class="field">
          <span>Mot de passe</span>
          <input type="password" name="password" autocomplete="current-password" required>
        </label>
        <button class="btn btn-wine" type="submit">Se connecter</button>
        <p class="form-error" id="login-error" role="alert"></p>
      </form>
    </section>

    <section class="admin-card" id="view-denied" hidden>
      <h1>Accès refusé</h1>
      <p>Ce compte n'a pas le droit de modifier la carte. Demandez à la personne qui gère le site
        de l'ajouter comme administrateur.</p>
      <p class="admin-muted">Compte connecté : <strong id="denied-email"></strong></p>
    </section>

    <section id="view-app" hidden>
      <div class="admin-tabs" role="tablist" aria-label="Sections de l'administration">
        <button type="button" role="tab" id="tab-btn-items" aria-controls="tab-items" aria-selected="true">Produits</button>
        <button type="button" role="tab" id="tab-btn-categories" aria-controls="tab-categories" aria-selected="false" tabindex="-1">Catégories</button>
        <button type="button" role="tab" id="tab-btn-info" aria-controls="tab-info" aria-selected="false" tabindex="-1">Infos</button>
      </div>

      <div class="admin-panel" role="tabpanel" id="tab-items" aria-labelledby="tab-btn-items">
        <div class="admin-toolbar">
          <label class="field field-inline">
            <span>Catégorie</span>
            <select id="filter-category"></select>
          </label>
          <button class="btn btn-wine" type="button" id="add-product">+ Ajouter un produit</button>
        </div>
        <p class="admin-muted admin-hint">Le prix et la disponibilité sont enregistrés dès que vous les changez.
          Touchez une photo pour la remplacer, ou le crayon <svg class="hint-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/></svg>
          pour modifier le nom, la description, la photo ou la catégorie. « Changer l'ordre » range les produits d'une catégorie.</p>
        <div id="items-list"></div>
      </div>

      <div class="admin-panel" role="tabpanel" id="tab-categories" aria-labelledby="tab-btn-categories" hidden>
        <div class="admin-toolbar">
          <button class="btn btn-wine" type="button" id="add-category">+ Ajouter une catégorie</button>
        </div>
        <p class="admin-muted admin-hint">Faites glisser <span class="drag-hint" aria-hidden="true">⠿</span> pour
          changer l'ordre des catégories sur la carte, ou utilisez les flèches. L'ordre est enregistré tout de suite.
          Le crayon <svg class="hint-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/></svg>
          change le nom ou la photo ; la corbeille supprime la catégorie avec ses produits.</p>
        <ul class="adm-cats" id="categories-list"></ul>
      </div>

      <div class="admin-panel" role="tabpanel" id="tab-info" aria-labelledby="tab-btn-info" hidden>
        <p class="admin-muted admin-hint">Ces informations s'affichent {{INFO_WHERE_FR}}.
          Laissez vide ce qui ne s'applique pas : rien ne s'affiche à la place.</p>
        <p class="admin-note" id="info-missing" hidden>Les informations ne sont pas encore disponibles : la table
          « settings » manque dans Supabase. Exécutez le script SQL indiqué dans le README, puis rechargez la page.</p>
        <form class="admin-form info-form" id="info-form" novalidate>
          <fieldset class="info-group">
            <legend>Horaires</legend>
            <div class="info-hours">
              <span class="info-days">Lundi – Vendredi</span>
              <label class="field"><span>Ouverture</span><input type="time" name="hours_week_open"></label>
              <label class="field"><span>Fermeture</span><input type="time" name="hours_week_close"></label>
            </div>
            <div class="info-hours">
              <span class="info-days">Samedi – Dimanche</span>
              <label class="field"><span>Ouverture</span><input type="time" name="hours_weekend_open"></label>
              <label class="field"><span>Fermeture</span><input type="time" name="hours_weekend_close"></label>
            </div>
            <p class="admin-muted">Mêmes horaires sur les deux lignes : le site les affiche sur une seule ligne (« Tous les jours »).</p>
          </fieldset>

          <fieldset class="info-group">
            <legend>Wi-Fi</legend>
            <label class="field">
              <span>Nom du réseau</span>
              <input name="wifi_name" maxlength="60" autocomplete="off" spellcheck="false">
            </label>
            <label class="field">
              <span>Mot de passe</span>
              <input name="wifi_password" maxlength="100" autocomplete="off" spellcheck="false" autocapitalize="off">
            </label>
            <p class="admin-muted">Le mot de passe est visible par tous sur le site, avec un bouton pour le copier.</p>
          </fieldset>

          <fieldset class="info-group">
            <legend>Nous trouver</legend>
            <label class="field">
              <span>Adresse</span>
              <input name="address" maxlength="120" autocomplete="off" placeholder="ex. Rue …, ville">
            </label>
            <label class="field">
              <span>Lien Google Maps</span>
              <input name="maps_url" type="url" inputmode="url" maxlength="300" autocomplete="off" placeholder="https://maps.app.goo.gl/…">
            </label>
            <label class="field">
              <span>Téléphone</span>
              <input name="phone" type="tel" maxlength="20" autocomplete="off" placeholder="ex. {{PHONE_EXAMPLE}}">
            </label>
          </fieldset>

          <p class="form-error" id="info-error" role="alert"></p>
          <button class="btn btn-wine" type="submit" id="info-save">Enregistrer</button>
        </form>
      </div>
    </section>
  </main>

  <dialog class="sel-sheet admin-dialog" id="product-dialog" aria-labelledby="product-title">
    <form class="sel-inner" id="product-form" novalidate>
      <div class="sel-head">
        <h2 id="product-title">Nouveau produit</h2>
        <button class="icon-btn" type="button" data-close-dialog aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>

      <div class="admin-form admin-dialog-body">
        <label class="field">
          <span>Catégorie *</span>
          <select name="category" required></select>
        </label>

        <label class="field">
          <span>Nom *</span>
          <input name="nameFr" maxlength="80" required autocomplete="off">
        </label>
        <label class="field">
          <span>Nom en anglais</span>
          <input name="nameEn" maxlength="80" placeholder="Vide = nom français" autocomplete="off">
        </label>
        <label class="field">
          <span>Description</span>
          <textarea name="descFr" maxlength="300" rows="2"></textarea>
        </label>
        <label class="field">
          <span>Description en anglais</span>
          <textarea name="descEn" maxlength="300" rows="2" placeholder="Vide = description française"></textarea>
        </label>
        <label class="field">
          <span>Prix ({{CURRENCY}}) *</span>
          <input name="price" type="number" inputmode="decimal" min="0" max="9999" step="{{PRICE_STEP}}" required placeholder="ex. {{PRICE_EXAMPLE}}">
        </label>

        <div class="field">
          <span>Photo</span>
          <div class="photo-pick">
            <img class="photo-preview" id="product-photo-preview" alt="" hidden>
            <button class="btn btn-outline" type="button" id="product-photo-btn">Choisir une photo</button>
            <button class="text-btn" type="button" id="product-photo-clear" hidden>Retirer</button>
          </div>
        </div>

        <label class="check">
          <input type="checkbox" name="available" checked>
          <span>Disponible</span>
        </label>
        <p class="form-error" id="product-error" role="alert"></p>
      </div>

      <div class="sel-foot">
        <button class="text-btn" type="button" data-close-dialog>Annuler</button>
        <button class="btn btn-wine" type="submit" id="product-save">Ajouter</button>
      </div>
    </form>
  </dialog>

  <dialog class="sel-sheet admin-dialog" id="category-dialog" aria-labelledby="category-title">
    <form class="sel-inner" id="category-form" novalidate>
      <div class="sel-head">
        <h2 id="category-title">Nouvelle catégorie</h2>
        <button class="icon-btn" type="button" data-close-dialog aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="sel-hint edit-product">Elle s'ajoute à la fin de la carte et apparaît sur le site dès qu'elle contient un produit.</p>

      <div class="admin-form admin-dialog-body">
        <label class="field">
          <span>Nom *</span>
          <input name="nameFr" maxlength="60" required autocomplete="off" placeholder="ex. Crêpes">
        </label>
        <label class="field">
          <span>Nom en anglais</span>
          <input name="nameEn" maxlength="60" placeholder="Vide = nom français" autocomplete="off">
        </label>

        <div class="field">
          <span>Photo *</span>
          <div class="photo-pick">
            <img class="photo-preview" id="category-photo-preview" alt="" hidden>
            <button class="btn btn-outline" type="button" id="category-photo-btn">Choisir une photo</button>
            <button class="text-btn" type="button" id="category-photo-clear" hidden>Retirer</button>
          </div>
          <p class="admin-muted photo-note">Elle sert de bannière à la catégorie sur la carte.</p>
        </div>
        <p class="form-error" id="category-error" role="alert"></p>
      </div>

      <div class="sel-foot">
        <button class="text-btn" type="button" data-close-dialog>Annuler</button>
        <button class="btn btn-wine" type="submit" id="category-save">Ajouter</button>
      </div>
    </form>
  </dialog>

  <dialog class="sel-sheet admin-dialog" id="category-edit-dialog" aria-labelledby="category-edit-title">
    <form class="sel-inner" id="category-edit-form" novalidate>
      <div class="sel-head">
        <h2 id="category-edit-title">Modifier la catégorie</h2>
        <button class="icon-btn" type="button" data-close-dialog aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="sel-hint edit-product" id="category-edit-current"></p>

      <div class="admin-form admin-dialog-body">
        <label class="field">
          <span>Nom *</span>
          <input name="nameFr" maxlength="60" required autocomplete="off">
        </label>
        <label class="field">
          <span>Nom en anglais</span>
          <input name="nameEn" maxlength="60" placeholder="Vide = nom français" autocomplete="off">
        </label>

        <div class="field">
          <span>Photo</span>
          <div class="photo-pick">
            <img class="photo-preview" id="category-edit-photo-preview" alt="" hidden>
            <button class="btn btn-outline" type="button" id="category-edit-photo-btn">Changer la photo</button>
          </div>
          <p class="admin-muted photo-note">Elle sert de bannière à la catégorie sur la carte.</p>
        </div>
        <p class="form-error" id="category-edit-error" role="alert"></p>
      </div>

      <div class="sel-foot">
        <button class="text-btn" type="button" data-close-dialog>Annuler</button>
        <button class="btn btn-wine" type="submit" id="category-edit-save">Enregistrer</button>
      </div>
    </form>
  </dialog>

  <dialog class="sel-sheet admin-dialog" id="edit-dialog" aria-labelledby="edit-title">
    <form class="sel-inner" id="edit-form" novalidate>
      <div class="sel-head">
        <h2 id="edit-title">Modifier le produit</h2>
        <button class="icon-btn" type="button" data-close-dialog aria-label="Fermer">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <p class="sel-hint edit-product" id="edit-product"></p>

      <div class="admin-form admin-dialog-body">
        <label class="field">
          <span>Catégorie</span>
          <select name="category"></select>
        </label>
        <label class="field">
          <span>Nom *</span>
          <input name="nameFr" maxlength="80" required autocomplete="off">
        </label>
        <label class="field">
          <span>Nom en anglais</span>
          <input name="nameEn" maxlength="80" placeholder="Vide = nom français" autocomplete="off">
        </label>
        <label class="field">
          <span>Description</span>
          <textarea name="descFr" maxlength="300" rows="3"></textarea>
        </label>
        <label class="field">
          <span>Description en anglais</span>
          <textarea name="descEn" maxlength="300" rows="3" placeholder="Vide = description française"></textarea>
        </label>

        <div class="field">
          <span>Photo</span>
          <div class="photo-pick">
            <img class="photo-preview" id="edit-photo-preview" alt="" hidden>
            <button class="btn btn-outline" type="button" id="edit-photo-btn">Choisir une photo</button>
            <button class="text-btn" type="button" id="edit-photo-clear" hidden>Retirer la photo</button>
          </div>
          <p class="admin-muted photo-note" id="edit-photo-note" hidden>La photo sera retirée quand vous enregistrerez.</p>
        </div>
        <p class="form-error" id="edit-error" role="alert"></p>
      </div>

      <div class="sel-foot">
        <button class="text-btn" type="button" data-close-dialog>Annuler</button>
        <button class="btn btn-wine" type="submit" id="edit-save">Enregistrer</button>
      </div>
    </form>
  </dialog>

  <input class="file-input" type="file" id="photo-input" accept="image/*" tabindex="-1" aria-hidden="true">
  <div class="toast" id="toast" role="status" aria-live="polite"></div>
</body>
</html>
````

## `admin.css`

````css
:root {
  --wine: {{COLOR_PRIMARY}};
  --wine-deep: {{COLOR_PRIMARY_DEEP}};
  --cream: {{COLOR_BACKGROUND}};
  --beige: {{COLOR_SURFACE}};
  --sand: {{COLOR_HAIRLINE}};
  --line: {{COLOR_BORDER}};
  --gold: {{COLOR_ACCENT}};
  --gold-light: {{COLOR_ACCENT_LIGHT}};
  --ink: {{COLOR_TEXT}};
  --ink-soft: {{COLOR_TEXT_SOFT}};
  --white: #ffffff;
  --kiss: {{COLOR_DANGER}};
  --teal: {{COLOR_SECONDARY}};

  --font-display: {{FONT_DISPLAY}};
  --font-body: {{FONT_BODY}};

  --header-h: 60px;
  --header-total: calc(var(--header-h) + env(safe-area-inset-top, 0px));
  --page-pad: 16px;
  --radius: 20px;
  --shadow: 0 10px 30px rgba({{RGB_PRIMARY}}, 0.08);
  --shadow-lift: 0 16px 40px rgba({{RGB_PRIMARY}}, 0.16);
}

*, *::before, *::after { box-sizing: border-box; }

html { -webkit-text-size-adjust: 100%; }

body {
  margin: 0;
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.6;
  color: var(--ink);
  background: var(--cream);
  -webkit-font-smoothing: antialiased;
}

img, svg { display: block; max-width: 100%; }
img { height: auto; }
button { font: inherit; color: inherit; }
a { color: inherit; }
h1, h2, h3 { margin: 0; font-family: var(--font-display); font-weight: 600; line-height: 1.15; text-wrap: balance; }
p { margin: 0; text-wrap: pretty; }
ul { margin: 0; padding: 0; list-style: none; }

:focus-visible { outline: 3px solid var(--teal); outline-offset: 3px; }
.on-dark :focus-visible { outline-color: var(--gold-light); }

.admin-header {
  position: sticky; top: 0; z-index: 50;
  height: var(--header-total);
  padding: env(safe-area-inset-top, 0px) var(--page-pad) 0;
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  background: var(--wine);
  color: var(--cream);
  border-bottom: 1px solid rgba({{RGB_ACCENT}}, 0.25);
}
.brand { display: flex; align-items: center; gap: 10px; text-decoration: none; }
.brand img { width: 34px; height: 34px; border-radius: 50%; object-fit: cover; }
.brand-name { font-family: var(--font-display); font-size: 1.4rem; font-weight: 600; letter-spacing: 0.04em; color: var(--white); }

.btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 100%; max-width: 320px; min-height: 50px;
  padding: 0 30px;
  border: 1px solid transparent; border-radius: 999px;
  font-size: 0.95rem; font-weight: 600; letter-spacing: 0.02em;
  text-decoration: none;
  transition: transform 0.2s, background-color 0.2s, border-color 0.2s;
}

.sel-sheet {
  width: 100%; max-width: min(520px, 100%); max-height: 86vh;
  margin: auto auto 0;
  padding: 0;
  border: 0; border-radius: 24px 24px 0 0;
  background: var(--cream); color: var(--ink);
  box-shadow: var(--shadow-lift);
}
.sel-sheet[open] { animation: sheet-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }
.sel-sheet::backdrop { background: rgba({{RGB_TEXT}}, 0.55); }
@keyframes sheet-up { from { transform: translateY(40px); opacity: 0; } }

.sel-inner { display: flex; flex-direction: column; max-height: 86vh; padding-bottom: env(safe-area-inset-bottom, 0px); }
.sel-head { display: flex; align-items: center; justify-content: space-between; padding: 20px 20px 4px; }
.sel-head h2 { font-style: italic; font-size: 1.75rem; color: var(--wine); }
.icon-btn {
  display: grid; place-items: center;
  width: 44px; height: 44px; margin-right: -8px;
  border: 0; border-radius: 50%; background: transparent; color: var(--ink-soft);
  cursor: pointer;
}
.icon-btn svg { width: 22px; height: 22px; }
.icon-btn:hover { background: var(--sand); color: var(--ink); }
.sel-hint { padding: 0 20px 14px; color: var(--ink-soft); font-size: 0.875rem; }
.sel-foot { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 20px 20px; }

.text-btn {
  min-height: 44px; padding: 0 4px;
  border: 0; background: none; color: var(--ink-soft);
  font-size: 0.875rem; text-decoration: underline; text-underline-offset: 3px;
  cursor: pointer;
}
.text-btn:hover { color: var(--wine); }
.text-btn[hidden] { display: none; }

.toast {
  position: fixed; z-index: 70;
  left: 50%; bottom: calc(20px + env(safe-area-inset-bottom, 0px));
  max-width: calc(100% - 32px);
  padding: 8px 16px;
  border-radius: 999px;
  background: var(--ink); color: var(--cream);
  font-size: 0.875rem;
  text-align: center;
  opacity: 0; pointer-events: none;
  transform: translate(-50%, 8px);
  transition: opacity 0.2s, transform 0.2s;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }
.toast.is-error { background: var(--kiss); }

.admin-page { background: var(--beige); min-height: 100vh; }

.admin {
  max-width: 860px;
  margin: 0 auto;
  padding: 24px var(--page-pad) calc(48px + env(safe-area-inset-bottom, 0px));
}

.admin-status { padding: 48px 0; text-align: center; color: var(--ink-soft); }
.admin-muted { color: var(--ink-soft); font-size: 0.9rem; }
.admin-hint { margin: 4px 0 16px; }
.drag-hint { display: inline-block; color: var(--wine); font-weight: 600; }
.hint-icon { display: inline-block; width: 1em; height: 1em; vertical-align: -0.12em; color: var(--wine); }

.admin-user { display: flex; align-items: center; gap: 10px; min-width: 0; }
.admin-user[hidden] { display: none; }
.admin-email {
  max-width: 40vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  color: var(--gold-light); font-size: 0.8rem;
}
.admin-logout {
  min-height: 36px; padding: 0 14px;
  border: 1px solid rgba({{RGB_ACCENT}}, 0.5); border-radius: 999px;
  background: transparent; color: var(--cream);
  font-size: 0.8rem; font-weight: 600;
  cursor: pointer;
}
.admin-logout:hover { border-color: var(--cream); }

.admin-card {
  max-width: 420px;
  margin: 24px auto;
  padding: 28px 22px;
  border-radius: var(--radius);
  background: var(--white);
  box-shadow: var(--shadow);
}
.admin-card h1 { font-size: 2rem; font-style: italic; color: var(--wine); margin-bottom: 8px; }
.admin-card p { color: var(--ink-soft); }
.admin-card code { padding: 1px 6px; border-radius: 6px; background: var(--beige); font-size: 0.9em; }

.admin-form { display: grid; gap: 14px; margin-top: 18px; }
.field { display: grid; gap: 6px; }
.field > span { font-size: 0.8rem; font-weight: 600; color: var(--ink); }
.field input, .field select, .field textarea, .price-field input {
  width: 100%;
  min-height: 46px;
  padding: 10px 14px;
  border: 1.5px solid var(--line); border-radius: 12px;
  background: var(--white); color: var(--ink);
  font: inherit; font-size: 1rem;
}
.field textarea { min-height: 70px; resize: vertical; }
.field input:focus, .field select:focus, .field textarea:focus, .price-field input:focus {
  outline: none; border-color: var(--wine); box-shadow: 0 0 0 3px rgba({{RGB_PRIMARY}}, 0.15);
}
.field-inline { grid-template-columns: auto 1fr; align-items: center; gap: 10px; }

.check { display: flex; align-items: flex-start; gap: 10px; font-size: 0.95rem; cursor: pointer; }
.check input { width: 20px; height: 20px; margin-top: 2px; accent-color: var(--wine); flex-shrink: 0; }

.form-error { min-height: 1.2em; color: var(--kiss); font-size: 0.875rem; font-weight: 500; }

.btn-wine { background: var(--wine); color: var(--cream); width: auto; max-width: none; cursor: pointer; }
.btn-wine:hover { background: var(--wine-deep); }
.btn-wine:disabled { opacity: 0.6; cursor: wait; }
.btn-outline {
  width: auto; max-width: none; min-height: 44px; padding: 0 18px;
  border-color: var(--line); background: var(--white); color: var(--wine); cursor: pointer;
}
.btn-outline:hover { border-color: var(--wine); }

.admin-tabs {
  display: grid; grid-auto-columns: 1fr; grid-auto-flow: column; gap: 4px;
  padding: 4px;
  margin-bottom: 20px;
  border-radius: 999px;
  background: var(--sand);
}
.admin-tabs button {
  min-height: 44px;
  border: 0; border-radius: 999px;
  background: transparent; color: var(--ink-soft);
  font-weight: 600; cursor: pointer;
}
.admin-tabs button[aria-selected="true"] { background: var(--white); color: var(--wine); box-shadow: 0 2px 8px rgba({{RGB_PRIMARY}}, 0.08); }

.admin-toolbar { display: grid; gap: 12px; }

.adm-cat-block { margin-top: 24px; }
.adm-cat-head {
  display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 0 12px;
  margin-bottom: 8px;
}
.adm-cat-title { font-size: 1.5rem; font-style: italic; color: var(--wine); }
.adm-cat-title small { margin-left: 8px; font-family: var(--font-body); font-style: normal; font-size: 0.8rem; font-weight: 500; color: var(--ink-soft); }
.adm-order-toggle { font-weight: 600; color: var(--wine); }
.adm-order-toggle[aria-pressed="true"] {
  padding: 0 18px; border-radius: 999px; background: var(--wine); color: var(--cream); text-decoration: none;
}
.adm-order-hint { margin-bottom: 10px; }
.adm-order { display: grid; gap: 8px; }
.adm-order-row {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 2px 10px rgba({{RGB_PRIMARY}}, 0.05);
}
.adm-order-row.is-ghost { opacity: 0.4; }
.adm-order-row.is-chosen { box-shadow: var(--shadow-lift); }
.adm-order-row > .drag-handle,
.adm-order-row > .adm-cat-name,
.adm-order-row > .adm-cat-move { grid-area: auto; }
.adm-order-row > .adm-cat-move { padding-left: 0; border-left: 0; }
.adm-group-title {
  margin: 14px 0 6px;
  color: var(--teal);
  font-family: var(--font-body); font-size: 0.75rem; font-weight: 600; letter-spacing: 0.16em; text-transform: uppercase;
}

.adm-items { display: grid; gap: 8px; }
.adm-item {
  display: grid;
  grid-template-columns: 56px 1fr auto;
  grid-template-areas:
    "thumb name   actions"
    "thumb fields fields";
  align-items: center;
  gap: 8px 12px;
  padding: 10px 10px 10px 12px;
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 2px 10px rgba({{RGB_PRIMARY}}, 0.05);
}
.adm-item.is-off { background: {{COLOR_OFF_CARD}}; }
.adm-item.is-off .adm-item-name { color: var(--ink-soft); }

.adm-thumb {
  grid-area: thumb;
  position: relative;
  display: grid; place-items: center;
  width: 56px; height: 56px;
  padding: 0; overflow: hidden;
  border: 1.5px dashed var(--line); border-radius: 12px;
  background: var(--cream); color: var(--ink-soft);
  cursor: pointer;
}
.adm-thumb img { width: 100%; height: 100%; object-fit: cover; }
.adm-thumb svg { width: 22px; height: 22px; }
.adm-thumb:hover { border-color: var(--wine); color: var(--wine); }
.adm-thumb.has-photo { border-style: solid; border-color: transparent; }
.adm-thumb.is-busy::after {
  content: ''; position: absolute; inset: 0;
  background: rgba({{RGB_BACKGROUND}}, 0.75) center / 22px no-repeat;
  background-image: radial-gradient(circle, var(--wine) 30%, transparent 32%);
  animation: busy 0.9s ease-in-out infinite alternate;
}
@keyframes busy { from { opacity: 0.4; } to { opacity: 1; } }

.adm-item-name { grid-area: name; min-width: 0; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
.adm-item-name small { display: block; color: var(--ink-soft); font-size: 0.78rem; font-weight: 400; }

.adm-item-actions { grid-area: actions; display: flex; gap: 2px; }
.adm-icon-btn {
  display: grid; place-items: center;
  width: 40px; height: 40px;
  border: 0; border-radius: 50%;
  background: transparent; color: var(--ink-soft);
  cursor: pointer;
}
.adm-icon-btn svg { width: 20px; height: 20px; }
.adm-edit:hover { background: var(--beige); color: var(--wine); }
.adm-delete:hover { background: {{COLOR_DANGER_TINT}}; color: var(--kiss); }

.adm-fields { grid-area: fields; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; }

.price-field { display: flex; align-items: center; gap: 6px; font-weight: 600; color: var(--wine); }
.price-field input { width: 110px; min-height: 40px; padding: 6px 10px; text-align: right; font-variant-numeric: tabular-nums; }

.switch { display: inline-flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.875rem; color: var(--ink-soft); }
.switch input { position: absolute; opacity: 0; width: 1px; height: 1px; }
.switch-ui {
  position: relative; flex-shrink: 0;
  width: 44px; height: 26px;
  border-radius: 999px;
  background: {{COLOR_SWITCH_OFF}};
  transition: background-color 0.2s;
}
.switch-ui::after {
  content: ''; position: absolute; top: 3px; left: 3px;
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--white);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s;
}
.switch input:checked + .switch-ui { background: var(--teal); }
.switch input:checked + .switch-ui::after { transform: translateX(18px); }
.switch input:focus-visible + .switch-ui { outline: 3px solid var(--teal); outline-offset: 2px; }
.switch input:checked ~ .switch-text { color: var(--teal); font-weight: 600; }

.adm-empty { padding: 28px 0; text-align: center; color: var(--ink-soft); }

.adm-cats { display: grid; gap: 8px; }
.adm-cat {
  display: grid;
  grid-template-columns: auto 52px 1fr auto;
  grid-template-areas:
    "handle thumb name    name"
    "handle thumb actions move";
  align-items: center;
  gap: 4px 10px;
  padding: 8px 10px;
  border-radius: 16px;
  background: var(--white);
  box-shadow: 0 2px 10px rgba({{RGB_PRIMARY}}, 0.05);
}
.drag-handle {
  grid-area: handle;
  display: grid; place-items: center;
  width: 36px; height: 44px;
  color: var(--ink-soft); font-size: 1.3rem; line-height: 1;
  cursor: grab; touch-action: none; user-select: none;
}
.drag-handle:active { cursor: grabbing; }
.adm-cat .adm-thumb { width: 52px; height: 52px; }
.adm-cat-name { grid-area: name; min-width: 0; font-weight: 600; line-height: 1.3; overflow-wrap: anywhere; }
.adm-cat-name small { display: block; color: var(--ink-soft); font-size: 0.78rem; font-weight: 400; }
.adm-cat-actions { grid-area: actions; display: flex; gap: 2px; margin-left: -10px; }
.adm-cat-move { grid-area: move; display: flex; justify-content: flex-end; gap: 4px; }
.move-btn {
  display: grid; place-items: center;
  width: 40px; height: 40px;
  border: 1px solid var(--line); border-radius: 50%;
  background: var(--white); color: var(--wine);
  font-size: 1rem; cursor: pointer;
}
.move-btn:hover:not(:disabled) { border-color: var(--wine); }
.move-btn:disabled { opacity: 0.35; cursor: default; }
.adm-cat.is-ghost { opacity: 0.4; }
.adm-cat.is-chosen { box-shadow: var(--shadow-lift); }

.admin-dialog { max-width: min(560px, 100%); }
.admin-dialog-body { margin: 0; padding: 4px 20px 8px; overflow-y: auto; }
.photo-pick { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
.photo-preview { width: 72px; height: 72px; border-radius: 12px; object-fit: cover; }
.photo-preview[hidden] { display: none; }
.photo-note { font-size: 0.8rem; font-style: italic; }
.photo-note[hidden] { display: none; }
.edit-product { margin: 0; padding-bottom: 6px; overflow-wrap: anywhere; }

.file-input { position: fixed; left: -9999px; width: 1px; height: 1px; opacity: 0; }

.info-form { margin-top: 0; gap: 16px; }
.info-form[hidden] { display: none; }
.info-group {
  display: grid; gap: 12px;
  min-width: 0; margin: 0; padding: 18px 16px;
  border: 0; border-radius: var(--radius);
  background: var(--white);
  box-shadow: var(--shadow);
}
.info-group legend { float: left; width: 100%; padding: 0; font-family: var(--font-display); font-size: 1.35rem; font-style: italic; font-weight: 600; color: var(--wine); }
.info-group legend + * { clear: both; }
.info-hours { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; }
.info-days { grid-column: 1 / -1; font-weight: 600; }
.info-form > .btn-wine { justify-self: start; }
.admin-note { margin-bottom: 16px; padding: 12px 14px; border-radius: 12px; background: var(--white); color: var(--kiss); font-size: 0.9rem; }
.admin-note[hidden] { display: none; }

@media (max-width: 519px) {
  .admin-email { display: none; }
}

@media (min-width: 600px) {
  :root { --page-pad: 28px; }
  .sel-sheet { margin: auto; border-radius: 24px; }
  .admin { padding-top: 32px; }
  .admin-toolbar { grid-template-columns: 1fr auto; align-items: end; }
  .admin-toolbar > .btn:only-child { grid-column: 2; }
  .adm-cat {
    grid-template-columns: auto 52px 1fr auto auto;
    grid-template-areas: "handle thumb name actions move";
    gap: 10px;
  }
  .adm-cat-actions { margin-left: 0; }
  .adm-cat-move { padding-left: 10px; border-left: 1px solid var(--sand); }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
````

## `admin.js`

````js
(function () {
  'use strict';

  const BUCKET = 'menu';
  const PHOTO_SIZES = [800, 480];
  const VIEWS = ['view-loading', 'view-setup', 'view-error', 'view-login', 'view-denied', 'view-app'];
  const $ = (id) => document.getElementById(id);

  function showView(id) {
    for (const view of VIEWS) $(view).hidden = view !== id;
  }
  function showError(message) {
    $('error-text').textContent = message;
    showView('view-error');
  }

  if (typeof SUPABASE_URL !== 'string' || !SUPABASE_URL || typeof SUPABASE_KEY !== 'string' || !SUPABASE_KEY) {
    showView('view-setup');
    return;
  }
  if (typeof supabase === 'undefined' || typeof Sortable === 'undefined') {
    showError("Une bibliothèque n'a pas pu se charger (connexion internet ?). Rechargez la page.");
    return;
  }

  const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const STORAGE_PREFIX = SUPABASE_URL.replace(/\/$/, '') + '/storage/v1/object/public/' + BUCKET + '/';

  let categories = [];
  let items = [];
  let settings = null;
  let sortable = null;
  let photoTarget = null;
  let newProductPhoto = null;
  let newCategoryPhoto = null;
  let editingId = null;
  let editPhoto = { file: null, remove: false };
  let reorderingCategory = null;
  let itemSortable = null;
  let previewUrl = null;

  function el(tag, props, ...children) {
    const node = document.createElement(tag);
    for (const key in props) {
      if (key === 'attrs') for (const name in props.attrs) node.setAttribute(name, props.attrs[name]);
      else if (key === 'dataset') Object.assign(node.dataset, props.dataset);
      else node[key] = props[key];
    }
    node.append(...children.filter((child) => child !== null && child !== undefined));
    return node;
  }

  const ICONS = {
    camera: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" d="M4 8h3l1.5-2h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    trash: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>',
    pencil: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M4 20l1-4.5L15.5 5a2.1 2.1 0 0 1 3 3L8 18.5zM13.5 7l3 3"/></svg>',
  };
  function icon(name) {
    const holder = document.createElement('span');
    holder.innerHTML = ICONS[name];
    return holder.firstElementChild;
  }

  function formatPrice(amount) {
    return Number(amount).toFixed({{PRICE_DECIMALS}}) + ' {{CURRENCY}}';
  }
  function plural(n, word) {
    return n + ' ' + word + (n > 1 ? 's' : '');
  }
  function smallPhoto(url) {
    return url && url.includes('-800.') ? url.replace('-800.', '-480.') : url;
  }
  function parsePrice(text) {
    const value = Number(String(text).trim().replace(',', '.'));
    if (String(text).trim() === '' || !Number.isFinite(value) || value < 0 || value >= 10000) return null;
    return Math.round(value * {{PRICE_FACTOR}}) / {{PRICE_FACTOR}};
  }

  let toastTimer = null;
  function toast(message, isError) {
    const node = $('toast');
    node.textContent = message;
    node.classList.toggle('is-error', Boolean(isError));
    node.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => node.classList.remove('show'), isError ? 5000 : 2200);
  }
  function fail(error, what) {
    console.error(what, error);
    toast('Erreur : ' + what + (error && error.message ? ' (' + error.message + ')' : '') + '.', true);
  }

  async function useSession(session) {
    const user = session ? session.user : null;
    $('admin-user').hidden = !user;
    if (!user) {
      showView('view-login');
      return;
    }
    $('admin-email').textContent = user.email || '';
    showView('view-loading');
    const { data, error } = await db.from('admins').select('user_id').eq('user_id', user.id).maybeSingle();
    if (error) {
      showError('Impossible de vérifier vos droits : ' + error.message);
      return;
    }
    if (!data) {
      $('denied-email').textContent = user.email || '';
      showView('view-denied');
      return;
    }
    await loadAll();
  }

  $('login-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const button = form.querySelector('button[type="submit"]');
    const email = form.email.value.trim();
    const password = form.password.value;
    $('login-error').textContent = '';
    if (!email || !password) {
      $('login-error').textContent = 'Saisissez votre e-mail et votre mot de passe.';
      return;
    }
    button.disabled = true;
    const { data, error } = await db.auth.signInWithPassword({ email, password });
    button.disabled = false;
    form.password.value = '';
    if (error) {
      $('login-error').textContent = 'E-mail ou mot de passe incorrect.';
      form.password.focus();
      return;
    }
    await useSession(data.session);
  });

  $('logout').addEventListener('click', async () => {
    await db.auth.signOut();
    useSession(null);
  });

  async function loadAll() {
    const [cats, rows, info] = await Promise.all([
      db.from('categories').select('*').order('position'),
      db.from('items').select('*').order('position'),
      db.from('settings').select('key, value'),
    ]);
    if (cats.error || rows.error) {
      showError('Impossible de charger la carte : ' + (cats.error || rows.error).message);
      return;
    }
    categories = cats.data;
    items = rows.data;
    if (info.error) console.warn('Settings not loaded:', info.error);
    settings = info.error ? null : Object.fromEntries(info.data.map((row) => [row.key, row.value]));
    showView('view-app');
    renderCategoryFilter();
    renderItems();
    renderCategories();
    renderInfoForm();
  }

  function itemsOf(categoryId) {
    return items.filter((item) => item.category_id === categoryId).sort((a, b) => a.position - b.position);
  }

  function groupsOf(categoryId) {
    const groups = [];
    const byKey = new Map();
    for (const item of itemsOf(categoryId)) {
      const key = (item.group_fr || '') + '|' + item.is_extra;
      if (!byKey.has(key)) {
        const group = { fr: item.group_fr, extra: item.is_extra, items: [] };
        byKey.set(key, group);
        groups.push(group);
      }
      byKey.get(key).items.push(item);
    }
    return groups.sort((a, b) => Number(Boolean(a.fr || a.extra)) - Number(Boolean(b.fr || b.extra)));
  }

  function itemLabel(item) {
    const category = categories.find((row) => row.id === item.category_id);
    return item.name_fr + ' (' + (category ? category.name_fr : item.category_id)
      + (item.group_fr ? ' · ' + item.group_fr : '') + ')';
  }

  function renderCategoryFilter() {
    const select = $('filter-category');
    const current = select.value || 'all';
    select.replaceChildren(
      el('option', { value: 'all' }, 'Toutes les catégories'),
      ...categories.map((category) => el('option', { value: category.id }, category.name_fr)));
    select.value = [...select.options].some((option) => option.value === current) ? current : 'all';
  }

  function thumbButton(url, label, kind, id) {
    return el('button', {
      type: 'button',
      className: 'adm-thumb' + (url ? ' has-photo' : ''),
      attrs: { 'aria-label': label },
      dataset: { photoKind: kind, photoId: id },
    }, url ? el('img', { alt: '', loading: 'lazy', decoding: 'async', src: smallPhoto(url) }) : icon('camera'));
  }

  function itemThumb(item) {
    return thumbButton(item.image_url, (item.image_url ? 'Changer la photo de ' : 'Ajouter une photo à ') + itemLabel(item), 'item', item.id);
  }
  function categoryThumb(category) {
    return thumbButton(category.image_url, 'Changer la photo de la catégorie ' + category.name_fr, 'category', category.id);
  }

  function renderItemRow(item) {
    const label = itemLabel(item);
    return el('li', { className: 'adm-item' + (item.available ? '' : ' is-off'), dataset: { id: item.id } },
      itemThumb(item),
      el('p', { className: 'adm-item-name' }, item.name_fr,
        item.description_fr ? el('small', {}, item.description_fr) : null),
      el('div', { className: 'adm-item-actions' },
        el('button', {
          type: 'button',
          className: 'adm-icon-btn adm-edit',
          title: 'Nom, description et photo',
          attrs: { 'aria-label': 'Modifier ' + label },
          dataset: { editId: item.id },
        }, icon('pencil')),
        el('button', {
          type: 'button',
          className: 'adm-icon-btn adm-delete',
          attrs: { 'aria-label': 'Supprimer ' + label },
          dataset: { deleteId: item.id },
        }, icon('trash'))),
      el('div', { className: 'adm-fields' },
        el('label', { className: 'price-field' },
          el('input', {
            type: 'number', inputMode: 'decimal', min: '0', max: '9999', step: '{{PRICE_STEP}}',
            value: Number(item.price).toFixed({{PRICE_DECIMALS}}),
            attrs: { 'aria-label': 'Prix de ' + label + ' en {{CURRENCY_NAME_FR}}' },
            dataset: { priceFor: item.id },
          }),
          '{{CURRENCY}}'),
        el('label', { className: 'switch' },
          el('input', { type: 'checkbox', checked: item.available, dataset: { availableFor: item.id } }),
          el('span', { className: 'switch-ui', attrs: { 'aria-hidden': 'true' } }),
          el('span', { className: 'switch-text' }, item.available ? 'Disponible' : 'Indisponible'))));
  }

  function renderOrderRow(item, index, total) {
    return el('li', { className: 'adm-order-row', dataset: { id: item.id } },
      el('span', { className: 'drag-handle', attrs: { 'aria-hidden': 'true', title: 'Faire glisser' } }, '⠿'),
      el('p', { className: 'adm-cat-name' }, item.name_fr, el('small', {}, formatPrice(item.price))),
      el('div', { className: 'adm-cat-move' },
        el('button', {
          type: 'button', className: 'move-btn', disabled: index === 0,
          attrs: { 'aria-label': 'Monter ' + itemLabel(item) }, dataset: { itemMove: '-1' },
        }, '↑'),
        el('button', {
          type: 'button', className: 'move-btn', disabled: index === total - 1,
          attrs: { 'aria-label': 'Descendre ' + itemLabel(item) }, dataset: { itemMove: '1' },
        }, '↓')));
  }

  function renderItems() {
    if (itemSortable) {
      itemSortable.destroy();
      itemSortable = null;
    }
    const filter = $('filter-category').value;
    const blocks = categories
      .filter((category) => filter === 'all' || category.id === filter)
      .map((category) => {
        const own = itemsOf(category.id);
        const reordering = reorderingCategory === category.id;
        const children = [
          el('div', { className: 'adm-cat-head' },
            el('h2', { className: 'adm-cat-title' }, category.name_fr, el('small', {}, plural(own.length, 'produit'))),
            own.length > 1 ? el('button', {
              type: 'button',
              className: 'text-btn adm-order-toggle',
              attrs: { 'aria-pressed': String(reordering) },
              dataset: { reorder: category.id },
            }, reordering ? 'Terminé' : "Changer l'ordre") : null),
        ];
        if (own.length === 0) children.push(el('p', { className: 'adm-empty' }, 'Aucun produit dans cette catégorie.'));
        if (reordering) {
          children.push(el('p', { className: 'admin-muted adm-order-hint' },
            "Faites glisser ⠿ ou utilisez les flèches : l'ordre est enregistré tout de suite."));
          children.push(el('ul', { className: 'adm-order', dataset: { orderFor: category.id } },
            ...own.map((item, index) => renderOrderRow(item, index, own.length))));
        } else {
          children.push(...groupsOf(category.id).map((group) => el('div', {},
            group.fr || group.extra
              ? el('h3', { className: 'adm-group-title' }, (group.fr || 'Sans section') + (group.extra ? ' · suppléments' : ''))
              : null,
            el('ul', { className: 'adm-items' }, ...group.items.map(renderItemRow)))));
        }
        return el('section', { className: 'adm-cat-block', attrs: { 'aria-label': category.name_fr } }, ...children);
      });
    $('items-list').replaceChildren(...blocks);
    const orderList = $('items-list').querySelector('.adm-order');
    if (orderList) {
      itemSortable = Sortable.create(orderList, {
        handle: '.drag-handle',
        forceFallback: true,
        fallbackTolerance: 3,
        animation: 150,
        ghostClass: 'is-ghost',
        chosenClass: 'is-chosen',
        onEnd: () => saveItemOrder(orderList.dataset.orderFor),
      });
    }
  }

  function toggleReorder(categoryId) {
    reorderingCategory = reorderingCategory === categoryId ? null : categoryId;
    renderItems();
    const again = $('items-list').querySelector('[data-reorder="' + CSS.escape(categoryId) + '"]');
    if (again) again.focus();
  }

  function moveItem(row, delta) {
    const sibling = delta < 0 ? row.previousElementSibling : row.nextElementSibling;
    if (!sibling) return;
    if (delta < 0) sibling.before(row);
    else sibling.after(row);
    saveItemOrder(row.parentElement.dataset.orderFor, { id: row.dataset.id, delta });
  }

  async function saveItemOrder(categoryId, focus) {
    const list = $('items-list').querySelector('.adm-order');
    if (!list) return;
    const own = itemsOf(categoryId);
    const ids = [...list.children].map((row) => row.dataset.id);
    if (ids.join('|') === own.map((item) => item.id).join('|')) return;
    const { error } = await db.rpc('reorder_items', { ids });
    if (error) {
      fail(error, "l'ordre des produits n'a pas été enregistré");
      renderItems();
      return;
    }
    const byId = new Map(own.map((item) => [item.id, item]));
    ids.forEach((id, index) => { byId.get(id).position = index + 1; });
    renderItems();
    if (focus) {
      const row = $('items-list').querySelector('.adm-order-row[data-id="' + CSS.escape(focus.id) + '"]');
      const same = row && row.querySelector('[data-item-move="' + focus.delta + '"]');
      const other = row && row.querySelector('[data-item-move="' + -focus.delta + '"]');
      if (same || other) (same && !same.disabled ? same : other).focus();
    }
    toast('Ordre des produits enregistré');
  }

  async function savePrice(id, input) {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    const price = parsePrice(input.value);
    if (price === null) {
      toast('Prix invalide : indiquez par exemple {{PRICE_EXAMPLE}}', true);
      input.value = Number(item.price).toFixed({{PRICE_DECIMALS}});
      return;
    }
    if (price === Number(item.price)) {
      input.value = price.toFixed({{PRICE_DECIMALS}});
      return;
    }
    input.disabled = true;
    const { data, error } = await db.from('items').update({ price }).eq('id', id).select('id, price');
    input.disabled = false;
    if (error || !data || !data.length) {
      fail(error, "le prix n'a pas été enregistré");
      input.value = Number(item.price).toFixed({{PRICE_DECIMALS}});
      return;
    }
    item.price = data[0].price;
    input.value = Number(item.price).toFixed({{PRICE_DECIMALS}});
    toast('Prix enregistré : ' + itemLabel(item) + ' — ' + formatPrice(item.price));
  }

  async function saveAvailable(id, checkbox) {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    const available = checkbox.checked;
    checkbox.disabled = true;
    const { data, error } = await db.from('items').update({ available }).eq('id', id).select('id, available');
    checkbox.disabled = false;
    checkbox.focus();
    if (error || !data || !data.length) {
      fail(error, "la disponibilité n'a pas été enregistrée");
      checkbox.checked = item.available;
      return;
    }
    item.available = available;
    const row = checkbox.closest('.adm-item');
    row.classList.toggle('is-off', !available);
    row.querySelector('.switch-text').textContent = available ? 'Disponible' : 'Indisponible';
    toast(itemLabel(item) + (available ? ' est disponible' : ' est indisponible'));
  }

  async function deleteItem(id) {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    if (!confirm('Supprimer « ' + itemLabel(item) + ' » de la carte ?\nCette action est définitive.')) return;
    const { data, error } = await db.from('items').delete().eq('id', id).select('id');
    if (error || !data || !data.length) {
      fail(error, "le produit n'a pas été supprimé");
      return;
    }
    items = items.filter((row) => row.id !== id);
    await removeStoredPhoto(item.image_url);
    renderItems();
    renderCategories();
    toast('« ' + itemLabel(item) + ' » a été supprimé');
  }

  $('filter-category').addEventListener('change', () => {
    reorderingCategory = null;
    renderItems();
  });

  $('items-list').addEventListener('change', (event) => {
    const target = event.target;
    if (target.dataset.priceFor) savePrice(target.dataset.priceFor, target);
    else if (target.dataset.availableFor) saveAvailable(target.dataset.availableFor, target);
  });
  $('items-list').addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && event.target.dataset.priceFor) event.target.blur();
  });

  function loadImage(file) {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("ce fichier n'est pas une image lisible")); };
      img.src = url;
    });
  }

  function canvasToBlob(canvas, type, quality) {
    return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
  }

  async function preparePhotos(file) {
    if (!file.type.startsWith('image/')) throw new Error('choisissez une image (JPEG, PNG, WebP…)');
    const img = await loadImage(file);
    const copies = [];
    for (const width of PHOTO_SIZES) {
      const scale = Math.min(1, width / img.naturalWidth);
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      let blob = await canvasToBlob(canvas, 'image/webp', 0.8);
      if (!blob || blob.type !== 'image/webp') blob = await canvasToBlob(canvas, 'image/jpeg', 0.82);
      if (!blob) throw new Error("la photo n'a pas pu être préparée");
      copies.push({ width, blob, ext: blob.type === 'image/webp' ? 'webp' : 'jpg' });
    }
    return copies;
  }

  async function uploadPhotos(folder, id, file) {
    const copies = await preparePhotos(file);
    const base = folder + '/' + id + '-' + Date.now();
    const uploaded = [];
    try {
      for (const copy of copies) {
        const path = base + '-' + copy.width + '.' + copy.ext;
        const { error } = await db.storage.from(BUCKET).upload(path, copy.blob, {
          contentType: copy.blob.type,
          cacheControl: '31536000',
          upsert: false,
        });
        if (error) throw error;
        uploaded.push(path);
      }
    } catch (error) {
      if (uploaded.length) await db.storage.from(BUCKET).remove(uploaded);
      throw error;
    }
    return db.storage.from(BUCKET).getPublicUrl(base + '-800.' + copies[0].ext).data.publicUrl;
  }

  async function removeStoredPhoto(url) {
    if (!url || !url.startsWith(STORAGE_PREFIX)) return;
    const path = decodeURIComponent(url.slice(STORAGE_PREFIX.length));
    const { error } = await db.storage.from(BUCKET).remove([path, path.replace('-800.', '-480.')]);
    if (error) console.warn('Old photo not deleted:', error);
  }

  function choosePhoto(target) {
    photoTarget = target;
    const input = $('photo-input');
    input.value = '';
    input.click();
  }

  $('photo-input').addEventListener('change', () => {
    const file = $('photo-input').files[0];
    const target = photoTarget;
    photoTarget = null;
    if (!file || !target) return;
    if (target.kind === 'new') setNewProductPhoto(file);
    else if (target.kind === 'newCategory') setNewCategoryPhoto(file);
    else if (target.kind === 'edit') setEditPhoto({ file, remove: false });
    else if (target.kind === 'editCategory') setCategoryEditPhoto(file);
    else replacePhoto(target, file);
  });

  async function replacePhoto(target, file) {
    const isItem = target.kind === 'item';
    const rows = isItem ? items : categories;
    const row = rows.find((r) => r.id === target.id);
    if (!row) return;
    target.button.classList.add('is-busy');
    toast('Envoi de la photo…');
    let url;
    try {
      url = await uploadPhotos(isItem ? 'items' : 'categories', row.id, file);
    } catch (error) {
      target.button.classList.remove('is-busy');
      fail(error, "la photo n'a pas été envoyée");
      return;
    }
    const { data, error } = await db.from(isItem ? 'items' : 'categories')
      .update({ image_url: url }).eq('id', row.id).select('id, image_url');
    if (error || !data || !data.length) {
      await removeStoredPhoto(url);
      target.button.classList.remove('is-busy');
      fail(error, "la photo n'a pas été enregistrée");
      return;
    }
    const oldUrl = row.image_url;
    row.image_url = url;
    refreshThumbs(target.kind, row);
    toast('Photo mise à jour : ' + (isItem ? itemLabel(row) : row.name_fr));
    await removeStoredPhoto(oldUrl);
  }

  function refreshThumbs(kind, row) {
    const selector = '.adm-thumb[data-photo-kind="' + kind + '"][data-photo-id="' + CSS.escape(row.id) + '"]';
    for (const old of document.querySelectorAll(selector)) {
      const hadFocus = old === document.activeElement;
      const fresh = kind === 'item' ? itemThumb(row) : categoryThumb(row);
      old.replaceWith(fresh);
      if (hadFocus) fresh.focus();
    }
  }

  function renderCategories() {
    const list = $('categories-list');
    list.replaceChildren(...categories.map((category, index) => {
      const count = itemsOf(category.id).length;
      return el('li', { className: 'adm-cat', dataset: { id: category.id } },
        el('span', { className: 'drag-handle', attrs: { 'aria-hidden': 'true', title: 'Faire glisser' } }, '⠿'),
        categoryThumb(category),
        el('p', { className: 'adm-cat-name' }, category.name_fr,
          el('small', {}, plural(count, 'produit') + (count ? '' : ' · pas encore sur la carte'))),
        el('div', { className: 'adm-cat-actions' },
          el('button', {
            type: 'button',
            className: 'adm-icon-btn adm-edit',
            title: 'Nom et photo',
            attrs: { 'aria-label': 'Modifier la catégorie ' + category.name_fr },
            dataset: { editCategory: category.id },
          }, icon('pencil')),
          el('button', {
            type: 'button',
            className: 'adm-icon-btn adm-delete',
            attrs: { 'aria-label': 'Supprimer la catégorie ' + category.name_fr },
            dataset: { deleteCategory: category.id },
          }, icon('trash'))),
        el('div', { className: 'adm-cat-move' },
          el('button', {
            type: 'button', className: 'move-btn', disabled: index === 0,
            attrs: { 'aria-label': 'Monter ' + category.name_fr }, dataset: { move: '-1' },
          }, '↑'),
          el('button', {
            type: 'button', className: 'move-btn', disabled: index === categories.length - 1,
            attrs: { 'aria-label': 'Descendre ' + category.name_fr }, dataset: { move: '1' },
          }, '↓')));
    }));
    if (!sortable) {
      sortable = Sortable.create(list, {
        handle: '.drag-handle',
        forceFallback: true,
        fallbackTolerance: 3,
        animation: 150,
        ghostClass: 'is-ghost',
        chosenClass: 'is-chosen',
        onEnd: () => saveCategoryOrder(),
      });
    }
  }

  function moveCategory(row, delta) {
    const sibling = delta < 0 ? row.previousElementSibling : row.nextElementSibling;
    if (!sibling) return;
    if (delta < 0) sibling.before(row);
    else sibling.after(row);
    saveCategoryOrder({ id: row.dataset.id, delta });
  }

  async function saveCategoryOrder(focus) {
    const ids = [...$('categories-list').children].map((row) => row.dataset.id);
    if (ids.join('|') === categories.map((category) => category.id).join('|')) return;
    const { error } = await db.rpc('reorder_categories', { ids });
    if (error) {
      fail(error, "l'ordre n'a pas été enregistré");
      renderCategories();
      return;
    }
    const byId = new Map(categories.map((category) => [category.id, category]));
    categories = ids.map((id, index) => Object.assign(byId.get(id), { position: index + 1 }));
    renderCategories();
    renderCategoryFilter();
    renderItems();
    if (focus) {
      const row = $('categories-list').querySelector('[data-id="' + CSS.escape(focus.id) + '"]');
      const same = row && row.querySelector('[data-move="' + focus.delta + '"]');
      const other = row && row.querySelector('[data-move="' + -focus.delta + '"]');
      (same && !same.disabled ? same : other).focus();
    }
    toast('Ordre des catégories enregistré');
  }

  document.addEventListener('click', (event) => {
    const thumb = event.target.closest('.adm-thumb');
    if (thumb) {
      choosePhoto({ kind: thumb.dataset.photoKind, id: thumb.dataset.photoId, button: thumb });
      return;
    }
    const edit = event.target.closest('[data-edit-id]');
    if (edit) {
      openEditDialog(edit.dataset.editId);
      return;
    }
    const remove = event.target.closest('[data-delete-id]');
    if (remove) {
      deleteItem(remove.dataset.deleteId);
      return;
    }
    const reorder = event.target.closest('[data-reorder]');
    if (reorder) {
      toggleReorder(reorder.dataset.reorder);
      return;
    }
    const itemMove = event.target.closest('[data-item-move]');
    if (itemMove) {
      moveItem(itemMove.closest('.adm-order-row'), Number(itemMove.dataset.itemMove));
      return;
    }
    const editCategory = event.target.closest('[data-edit-category]');
    if (editCategory) {
      openCategoryEditDialog(editCategory.dataset.editCategory);
      return;
    }
    const removeCategory = event.target.closest('[data-delete-category]');
    if (removeCategory) {
      deleteCategory(removeCategory.dataset.deleteCategory);
      return;
    }
    const move = event.target.closest('[data-move]');
    if (move) moveCategory(move.closest('.adm-cat'), Number(move.dataset.move));
  });

  const TABS = [['tab-btn-items', 'tab-items'], ['tab-btn-categories', 'tab-categories'], ['tab-btn-info', 'tab-info']];
  function selectTab(buttonId) {
    for (const [button, panel] of TABS) {
      const on = button === buttonId;
      $(button).setAttribute('aria-selected', String(on));
      $(button).tabIndex = on ? 0 : -1;
      $(panel).hidden = !on;
    }
  }
  for (const [button] of TABS) {
    $(button).addEventListener('click', () => selectTab(button));
    $(button).addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      const index = TABS.findIndex(([id]) => id === button);
      const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : TABS.length - 1)) % TABS.length][0];
      selectTab(next);
      $(next).focus();
    });
  }

  function openDialog(dialog) {
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }
  function closeDialog(dialog) {
    if (dialog.dataset.busy) return;
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
  }
  function setBusy(dialog, busy) {
    if (busy) dialog.dataset.busy = 'true';
    else delete dialog.dataset.busy;
  }
  function sheetError(dialog, node, message) {
    node.textContent = message;
    if (!dialog.open) toast(message, true);
  }
  for (const dialog of document.querySelectorAll('.admin-dialog')) {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener('cancel', (event) => {
      if (dialog.dataset.busy) event.preventDefault();
    });
  }

  const EN_ONLY_DESCRIPTION = "Écrivez aussi la description en français : sans elle, la description anglaise n'est pas affichée.";
  for (const button of document.querySelectorAll('[data-close-dialog]')) {
    button.addEventListener('click', () => closeDialog(button.closest('dialog')));
  }

  function showPhotoPreview(prefix, photo) {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = photo instanceof Blob ? URL.createObjectURL(photo) : null;
    const src = previewUrl || photo || null;
    const preview = $(prefix + '-photo-preview');
    preview.hidden = !src;
    if (src) preview.src = src;
    else preview.removeAttribute('src');
    const clear = $(prefix + '-photo-clear');
    if (clear) clear.hidden = !src;
    $(prefix + '-photo-btn').textContent = src ? 'Changer la photo' : 'Choisir une photo';
  }

  const productDialog = $('product-dialog');
  const form = $('product-form');

  function setNewProductPhoto(file) {
    newProductPhoto = file;
    showPhotoPreview('product', file);
  }

  function openProductDialog() {
    form.reset();
    setNewProductPhoto(null);
    $('product-error').textContent = '';
    form.category.replaceChildren(...categories.map((category) => el('option', { value: category.id }, category.name_fr)));
    const filter = $('filter-category').value;
    if (filter !== 'all') form.category.value = filter;
    openDialog(productDialog);
    form.category.focus();
  }

  $('add-product').addEventListener('click', openProductDialog);
  $('product-photo-btn').addEventListener('click', () => choosePhoto({ kind: 'new' }));
  $('product-photo-clear').addEventListener('click', () => {
    setNewProductPhoto(null);
    $('product-photo-btn').focus();
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const showFormError = (message, field) => {
      $('product-error').textContent = message;
      if (field) field.focus();
    };

    const categoryId = form.category.value;
    const nameFr = form.nameFr.value.trim();
    const descFr = form.descFr.value.trim();
    const descEn = form.descEn.value.trim();
    const price = parsePrice(form.price.value);
    if (!categoryId) return showFormError('Choisissez une catégorie.', form.category);
    if (!nameFr) return showFormError('Le nom est obligatoire.', form.nameFr);
    if (descEn && !descFr) return showFormError(EN_ONLY_DESCRIPTION, form.descFr);
    if (price === null) return showFormError('Indiquez un prix valide, par exemple {{PRICE_EXAMPLE}}.', form.price);
    showFormError('');

    const saveButton = $('product-save');
    saveButton.disabled = true;
    saveButton.textContent = 'Enregistrement…';
    setBusy(productDialog, true);
    const id = crypto.randomUUID();
    let imageUrl = null;
    try {
      if (newProductPhoto) imageUrl = await uploadPhotos('items', id, newProductPhoto);
      const position = Math.max(0, ...itemsOf(categoryId).map((item) => item.position)) + 1;
      const { data, error } = await db.from('items').insert({
        id,
        category_id: categoryId,
        name_fr: nameFr,
        name_en: form.nameEn.value.trim() || null,
        description_fr: descFr || null,
        description_en: descEn || null,
        price,
        image_url: imageUrl,
        available: form.available.checked,
        featured: false,
        position,
      }).select().single();
      if (error) throw error;
      items.push(data);
      setBusy(productDialog, false);
      closeDialog(productDialog);
      $('filter-category').value = categoryId;
      renderItems();
      renderCategories();
      toast('« ' + itemLabel(data) + ' » a été ajouté à la carte');
    } catch (error) {
      console.error(error);
      if (imageUrl) await removeStoredPhoto(imageUrl);
      sheetError(productDialog, $('product-error'), "Le produit n'a pas été ajouté : " + (error.message || 'erreur inconnue') + '.');
    } finally {
      setBusy(productDialog, false);
      saveButton.disabled = false;
      saveButton.textContent = 'Ajouter';
    }
  });

  const categoryDialog = $('category-dialog');
  const categoryForm = $('category-form');

  function categoryIdFor(name) {
    const base = name.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
      .replace(/[^a-z0-9]+/g, '-').slice(0, 40).replace(/^-+|-+$/g, '') || 'categorie';
    let id = base;
    for (let n = 2; categories.some((category) => category.id === id); n += 1) id = base + '-' + n;
    return id;
  }

  function setNewCategoryPhoto(file) {
    newCategoryPhoto = file;
    showPhotoPreview('category', file);
  }

  function openCategoryDialog() {
    categoryForm.reset();
    setNewCategoryPhoto(null);
    $('category-error').textContent = '';
    openDialog(categoryDialog);
    categoryForm.nameFr.focus();
  }

  $('add-category').addEventListener('click', openCategoryDialog);
  $('category-photo-btn').addEventListener('click', () => choosePhoto({ kind: 'newCategory' }));
  $('category-photo-clear').addEventListener('click', () => {
    setNewCategoryPhoto(null);
    $('category-photo-btn').focus();
  });

  categoryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const showFormError = (message, field) => {
      $('category-error').textContent = message;
      if (field) field.focus();
    };

    const nameFr = categoryForm.nameFr.value.trim();
    const nameEn = categoryForm.nameEn.value.trim() || null;
    if (!nameFr) return showFormError('Le nom est obligatoire.', categoryForm.nameFr);
    if (categories.some((category) => category.name_fr.toLowerCase() === nameFr.toLowerCase())) {
      return showFormError('Une catégorie porte déjà ce nom.', categoryForm.nameFr);
    }
    if (!newCategoryPhoto) {
      return showFormError('Choisissez une photo pour la catégorie.', $('category-photo-btn'));
    }
    showFormError('');

    const saveButton = $('category-save');
    saveButton.disabled = true;
    saveButton.textContent = 'Enregistrement…';
    setBusy(categoryDialog, true);
    const id = categoryIdFor(nameFr);
    let imageUrl = null;
    try {
      imageUrl = await uploadPhotos('categories', id, newCategoryPhoto);
      const position = Math.max(0, ...categories.map((category) => category.position)) + 1;
      const { data, error } = await db.from('categories')
        .insert({ id, name_fr: nameFr, name_en: nameEn, image_url: imageUrl, position })
        .select().single();
      if (error) throw error;
      categories.push(data);
      setBusy(categoryDialog, false);
      closeDialog(categoryDialog);
      renderCategories();
      renderCategoryFilter();
      renderItems();
      toast('Catégorie « ' + data.name_fr + ' » ajoutée : ajoutez-y des produits');
    } catch (error) {
      console.error(error);
      if (imageUrl) await removeStoredPhoto(imageUrl);
      sheetError(categoryDialog, $('category-error'), "La catégorie n'a pas été ajoutée : " + (error.message || 'erreur inconnue') + '.');
    } finally {
      setBusy(categoryDialog, false);
      saveButton.disabled = false;
      saveButton.textContent = 'Ajouter';
    }
  });

  const categoryEditDialog = $('category-edit-dialog');
  const categoryEditForm = $('category-edit-form');
  let editingCategoryId = null;
  let categoryEditPhoto = null;

  function setCategoryEditPhoto(file) {
    categoryEditPhoto = file;
    const category = categories.find((row) => row.id === editingCategoryId);
    showPhotoPreview('category-edit', file || (category ? smallPhoto(category.image_url) : null));
  }

  function openCategoryEditDialog(id) {
    const category = categories.find((row) => row.id === id);
    if (!category) return;
    editingCategoryId = id;
    $('category-edit-current').textContent = category.name_fr + ' · ' + plural(itemsOf(id).length, 'produit');
    categoryEditForm.nameFr.value = category.name_fr;
    categoryEditForm.nameEn.value = category.name_en || '';
    $('category-edit-error').textContent = '';
    setCategoryEditPhoto(null);
    openDialog(categoryEditDialog);
  }

  $('category-edit-photo-btn').addEventListener('click', () => choosePhoto({ kind: 'editCategory' }));

  categoryEditForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const category = categories.find((row) => row.id === editingCategoryId);
    if (!category) return closeDialog(categoryEditDialog);

    const nameFr = categoryEditForm.nameFr.value.trim();
    const nameEn = categoryEditForm.nameEn.value.trim() || null;
    const refuse = (message, field) => {
      $('category-edit-error').textContent = message;
      field.focus();
    };
    if (!nameFr) return refuse('Le nom est obligatoire.', categoryEditForm.nameFr);
    if (categories.some((row) => row.id !== category.id && row.name_fr.toLowerCase() === nameFr.toLowerCase())) {
      return refuse('Une catégorie porte déjà ce nom.', categoryEditForm.nameFr);
    }
    const changes = {};
    if (nameFr !== category.name_fr) changes.name_fr = nameFr;
    if (nameEn !== (category.name_en || null)) changes.name_en = nameEn;
    if (!categoryEditPhoto && !Object.keys(changes).length) {
      closeDialog(categoryEditDialog);
      toast('Aucune modification');
      return;
    }

    const saveButton = $('category-edit-save');
    saveButton.disabled = true;
    saveButton.textContent = 'Enregistrement…';
    $('category-edit-error').textContent = '';
    setBusy(categoryEditDialog, true);
    let saved = null;
    let newUrl = null;
    try {
      if (categoryEditPhoto) newUrl = changes.image_url = await uploadPhotos('categories', category.id, categoryEditPhoto);
      const { data, error } = await db.from('categories').update(changes).eq('id', category.id)
        .select('id, name_fr, name_en, image_url');
      if (error) throw error;
      if (!data || !data.length) throw new Error('accès refusé');
      saved = data[0];
    } catch (error) {
      console.error(error);
      if (newUrl) await removeStoredPhoto(newUrl);
      sheetError(categoryEditDialog, $('category-edit-error'), "La catégorie n'a pas été modifiée : " + (error.message || 'erreur inconnue') + '.');
      return;
    } finally {
      setBusy(categoryEditDialog, false);
      saveButton.disabled = false;
      saveButton.textContent = 'Enregistrer';
    }

    const oldUrl = category.image_url;
    Object.assign(category, saved);
    closeDialog(categoryEditDialog);
    renderCategories();
    renderCategoryFilter();
    renderItems();
    const again = $('categories-list').querySelector('[data-edit-category="' + CSS.escape(category.id) + '"]');
    if (again) again.focus();
    const what = newUrl && Object.keys(changes).length > 1 ? 'Modifications enregistrées'
      : newUrl ? 'Photo mise à jour' : 'Nom enregistré';
    toast(what + ' : ' + category.name_fr);
    if (newUrl) await removeStoredPhoto(oldUrl);
  });

  async function deleteCategory(id) {
    const category = categories.find((row) => row.id === id);
    if (!category) return;
    const own = itemsOf(id);
    const question = own.length
      ? 'Supprimer la catégorie « ' + category.name_fr + ' » et ' + (own.length > 1 ? 'ses ' : 'son ') + plural(own.length, 'produit') + ' ?'
      : 'Supprimer la catégorie « ' + category.name_fr + ' » ?';
    if (!confirm(question + '\nCette action est définitive.')) return;

    if (own.length) {
      const { data, error } = await db.from('items').delete().eq('category_id', id).select('id, image_url');
      const gone = new Set((data || []).map((row) => row.id));
      items = items.filter((row) => !gone.has(row.id));
      for (const row of data || []) await removeStoredPhoto(row.image_url);
      if (error || gone.size !== own.length) {
        fail(error, "les produits de la catégorie n'ont pas tous été supprimés");
        renderItems();
        renderCategories();
        return;
      }
    }
    const { data, error } = await db.from('categories').delete().eq('id', id).select('id');
    if (error || !data || !data.length) {
      fail(error, "la catégorie n'a pas été supprimée");
      renderItems();
      renderCategories();
      return;
    }
    categories = categories.filter((row) => row.id !== id);
    await removeStoredPhoto(category.image_url);
    renderCategories();
    renderCategoryFilter();
    renderItems();
    $('add-category').focus();
    toast('Catégorie « ' + category.name_fr + ' » supprimée' + (own.length ? ' avec ' + plural(own.length, 'produit') : ''));
  }

  const INFO_KEYS = ['hours_week_open', 'hours_week_close', 'hours_weekend_open', 'hours_weekend_close',
    'wifi_name', 'wifi_password', 'address', 'maps_url', 'phone'];
  const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
  const MAPS_LINK = /^https:\/\/((www\.)?google\.[a-z.]{2,8}\/maps|maps\.google\.[a-z.]{2,8}|maps\.app\.goo\.gl|goo\.gl\/maps)\//i;
  const PHONE = /^\+?[0-9][0-9 .-]{5,18}$/;
  const infoForm = $('info-form');

  function renderInfoForm() {
    $('info-missing').hidden = Boolean(settings);
    infoForm.hidden = !settings;
    if (!settings) return;
    for (const key of INFO_KEYS) infoForm.elements[key].value = settings[key] || '';
    $('info-error').textContent = '';
  }

  infoForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = {};
    for (const key of INFO_KEYS) values[key] = infoForm.elements[key].value.trim();
    const refuse = (message, key) => {
      $('info-error').textContent = message;
      infoForm.elements[key].focus();
    };
    for (const days of ['week', 'weekend']) {
      const open = 'hours_' + days + '_open';
      const close = 'hours_' + days + '_close';
      if (Boolean(values[open]) !== Boolean(values[close])) {
        return refuse("Indiquez l'heure d'ouverture et celle de fermeture, ou laissez les deux vides.", values[open] ? close : open);
      }
      if (values[open] && !TIME.test(values[open])) return refuse('Heure invalide : écrivez-la par exemple 07:00.', open);
      if (values[close] && !TIME.test(values[close])) return refuse('Heure invalide : écrivez-la par exemple 23:00.', close);
    }
    if (values.wifi_password && !values.wifi_name) return refuse('Indiquez aussi le nom du réseau Wi-Fi.', 'wifi_name');
    if (values.maps_url && !MAPS_LINK.test(values.maps_url)) {
      return refuse('Collez le lien de partage Google Maps (il commence par https://maps.app.goo.gl/ ou https://www.google.com/maps/).', 'maps_url');
    }
    if (values.phone && !PHONE.test(values.phone)) return refuse('Numéro invalide : écrivez-le par exemple {{PHONE_EXAMPLE}}.', 'phone');
    $('info-error').textContent = '';

    const changed = INFO_KEYS.filter((key) => values[key] !== (settings[key] || ''));
    if (!changed.length) {
      toast('Aucune modification');
      return;
    }
    const saveButton = $('info-save');
    saveButton.disabled = true;
    saveButton.textContent = 'Enregistrement…';
    const now = new Date().toISOString();
    const { data, error } = await db.from('settings')
      .upsert(changed.map((key) => ({ key, value: values[key], updated_at: now })), { onConflict: 'key' })
      .select('key, value');
    saveButton.disabled = false;
    saveButton.textContent = 'Enregistrer';
    if (error || !data || data.length !== changed.length) {
      fail(error, "les informations n'ont pas été enregistrées");
      return;
    }
    for (const row of data) settings[row.key] = row.value;
    toast('Informations enregistrées : le site les affiche au prochain chargement');
  });

  const editDialog = $('edit-dialog');
  const editForm = $('edit-form');

  function setEditPhoto(change) {
    editPhoto = change;
    const item = items.find((row) => row.id === editingId);
    const saved = item && !change.remove ? smallPhoto(item.image_url) : null;
    showPhotoPreview('edit', change.file || saved);
    $('edit-photo-note').hidden = !(change.remove && item && item.image_url);
  }

  function openEditDialog(id) {
    const item = items.find((row) => row.id === id);
    if (!item) return;
    editingId = id;
    const category = categories.find((row) => row.id === item.category_id);
    $('edit-product').textContent = item.name_fr + (category ? ' · ' + category.name_fr : '');
    editForm.category.replaceChildren(...categories.map((row) => el('option', { value: row.id }, row.name_fr)));
    editForm.category.value = item.category_id;
    editForm.nameFr.value = item.name_fr;
    editForm.nameEn.value = item.name_en || '';
    editForm.descFr.value = item.description_fr || '';
    editForm.descEn.value = item.description_en || '';
    $('edit-error').textContent = '';
    setEditPhoto({ file: null, remove: false });
    openDialog(editDialog);
  }

  $('edit-photo-btn').addEventListener('click', () => choosePhoto({ kind: 'edit' }));
  $('edit-photo-clear').addEventListener('click', () => {
    setEditPhoto({ file: null, remove: true });
    $('edit-photo-btn').focus();
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const item = items.find((row) => row.id === editingId);
    if (!item) return closeDialog(editDialog);

    const changes = {};
    const nameFr = editForm.nameFr.value.trim();
    const nameEn = editForm.nameEn.value.trim() || null;
    const descFr = editForm.descFr.value.trim() || null;
    const descEn = editForm.descEn.value.trim() || null;
    const refuse = (message, field) => {
      $('edit-error').textContent = message;
      field.focus();
    };
    if (!nameFr) return refuse('Le nom est obligatoire.', editForm.nameFr);
    if (descEn && !descFr) return refuse(EN_ONLY_DESCRIPTION, editForm.descFr);
    if (nameFr !== item.name_fr) changes.name_fr = nameFr;
    if (nameEn !== (item.name_en || null)) changes.name_en = nameEn;
    if (descFr !== (item.description_fr || null)) changes.description_fr = descFr;
    if (descEn !== (item.description_en || null)) changes.description_en = descEn;
    if (editPhoto.remove && item.image_url) changes.image_url = null;
    const categoryId = editForm.category.value;
    if (categoryId && categoryId !== item.category_id) {
      changes.category_id = categoryId;
      changes.position = Math.max(0, ...itemsOf(categoryId).map((row) => row.position)) + 1;
    }
    if (!editPhoto.file && !Object.keys(changes).length) {
      closeDialog(editDialog);
      toast('Aucune modification');
      return;
    }

    const saveButton = $('edit-save');
    saveButton.disabled = true;
    saveButton.textContent = 'Enregistrement…';
    $('edit-error').textContent = '';
    setBusy(editDialog, true);
    let saved = null;
    let newUrl = null;
    try {
      if (editPhoto.file) newUrl = changes.image_url = await uploadPhotos('items', item.id, editPhoto.file);
      const { data, error } = await db.from('items').update(changes).eq('id', item.id)
        .select('id, category_id, position, name_fr, name_en, description_fr, description_en, image_url');
      if (error) throw error;
      if (!data || !data.length) throw new Error('accès refusé');
      saved = data[0];
    } catch (error) {
      console.error(error);
      if (newUrl) await removeStoredPhoto(newUrl);
      sheetError(editDialog, $('edit-error'), "Les modifications n'ont pas été enregistrées : " + (error.message || 'erreur inconnue') + '.');
      return;
    } finally {
      setBusy(editDialog, false);
      saveButton.disabled = false;
      saveButton.textContent = 'Enregistrer';
    }

    const oldUrl = item.image_url;
    Object.assign(item, saved);
    closeDialog(editDialog);
    if ('category_id' in changes) {
      if ($('filter-category').value !== 'all') $('filter-category').value = item.category_id;
      renderCategories();
    }
    renderItems();
    const again = $('items-list').querySelector('[data-edit-id="' + CSS.escape(item.id) + '"]');
    if (again) again.focus();
    const kinds = new Set(Object.keys(changes).filter((field) => field !== 'position').map((field) => field.split('_')[0]));
    const what = kinds.size > 1 ? 'Modifications enregistrées'
      : kinds.has('category') ? 'Produit déplacé'
        : kinds.has('name') ? 'Nom enregistré'
          : kinds.has('description') ? 'Description enregistrée'
            : changes.image_url ? 'Photo mise à jour' : 'Photo retirée';
    toast(what + ' : ' + itemLabel(item));
    if ('image_url' in changes) await removeStoredPhoto(oldUrl);
  });

  db.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') useSession(null);
  });

  db.auth.getSession().then(({ data, error }) => {
    if (error) console.warn(error);
    return useSession(data ? data.session : null);
  }).catch((error) => showError('La page n\'a pas pu se charger : ' + error.message));
})();
````

## `supabase-config.js`

````js
const SUPABASE_URL = "{{SUPABASE_URL}}";
const SUPABASE_KEY = "{{SUPABASE_PUBLISHABLE_KEY}}";
````

## `supabase/schema.sql`

````sql
create table if not exists public.categories (
  id         text primary key,
  name_fr    text not null check (char_length(name_fr) between 1 and 60),
  name_en    text check (char_length(name_en) <= 60),
  image_url  text,
  position   integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.items (
  id             uuid primary key default gen_random_uuid(),
  category_id    text not null references public.categories (id) on update cascade on delete restrict,
  group_fr       text check (char_length(group_fr) <= 40),
  group_en       text check (char_length(group_en) <= 40),
  is_extra       boolean not null default false,
  name_fr        text not null check (char_length(name_fr) between 1 and 80),
  name_en        text check (char_length(name_en) <= 80),
  description_fr text check (char_length(description_fr) <= 300),
  description_en text check (char_length(description_en) <= 300),
  price          numeric(7, {{PRICE_DECIMALS}}) not null check (price >= 0 and price < 10000),
  image_url      text,
  available      boolean not null default true,
  featured       boolean not null default false,
  position       integer not null default 0,
  created_at     timestamptz not null default now()
);

create index if not exists items_category_position on public.items (category_id, position);

create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email   text,
  added_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

alter table public.categories enable row level security;
alter table public.items      enable row level security;
alter table public.admins     enable row level security;

drop policy if exists "categories: everyone reads"  on public.categories;
drop policy if exists "categories: admins insert"   on public.categories;
drop policy if exists "categories: admins update"   on public.categories;
drop policy if exists "categories: admins delete"   on public.categories;
create policy "categories: everyone reads" on public.categories for select to anon, authenticated using (true);
create policy "categories: admins insert"  on public.categories for insert to authenticated with check (public.is_admin());
create policy "categories: admins update"  on public.categories for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "categories: admins delete"  on public.categories for delete to authenticated using (public.is_admin());

drop policy if exists "items: everyone reads" on public.items;
drop policy if exists "items: admins insert"  on public.items;
drop policy if exists "items: admins update"  on public.items;
drop policy if exists "items: admins delete"  on public.items;
create policy "items: everyone reads" on public.items for select to anon, authenticated using (true);
create policy "items: admins insert"  on public.items for insert to authenticated with check (public.is_admin());
create policy "items: admins update"  on public.items for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "items: admins delete"  on public.items for delete to authenticated using (public.is_admin());

drop policy if exists "admins: see own row" on public.admins;
create policy "admins: see own row" on public.admins for select to authenticated using (user_id = (select auth.uid()));

grant select on public.categories, public.items to anon, authenticated;
grant insert, update, delete on public.categories, public.items to authenticated;
grant select on public.admins to authenticated;
grant execute on function public.is_admin() to anon, authenticated;

create or replace function public.reorder_categories(ids text[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  update public.categories as c
     set position = x.ord
    from unnest(ids) with ordinality as x(id, ord)
   where c.id = x.id;
end;
$$;

revoke execute on function public.reorder_categories(text[]) from public, anon;
grant execute on function public.reorder_categories(text[]) to authenticated;

create or replace function public.reorder_items(ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;
  update public.items as i
     set position = x.ord
    from unnest(ids) with ordinality as x(id, ord)
   where i.id = x.id;
end;
$$;

revoke execute on function public.reorder_items(uuid[]) from public, anon;
grant execute on function public.reorder_items(uuid[]) to authenticated;

create table if not exists public.settings (
  key        text primary key check (key ~ '^[a-z_]{1,40}$'),
  value      text not null default '' check (char_length(value) <= 300),
  updated_at timestamptz not null default now()
);

alter table public.settings enable row level security;

drop policy if exists "settings: everyone reads" on public.settings;
drop policy if exists "settings: admins insert"  on public.settings;
drop policy if exists "settings: admins update"  on public.settings;
drop policy if exists "settings: admins delete"  on public.settings;
create policy "settings: everyone reads" on public.settings for select to anon, authenticated using (true);
create policy "settings: admins insert"  on public.settings for insert to authenticated with check (public.is_admin());
create policy "settings: admins update"  on public.settings for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "settings: admins delete"  on public.settings for delete to authenticated using (public.is_admin());

grant select on public.settings to anon, authenticated;
grant insert, update, delete on public.settings to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('menu', 'menu', true, 3145728, array['image/webp', 'image/jpeg', 'image/png'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "menu photos: admins list"   on storage.objects;
drop policy if exists "menu photos: admins upload" on storage.objects;
drop policy if exists "menu photos: admins update" on storage.objects;
drop policy if exists "menu photos: admins delete" on storage.objects;
create policy "menu photos: admins list"   on storage.objects for select to authenticated using (bucket_id = 'menu' and public.is_admin());
create policy "menu photos: admins upload" on storage.objects for insert to authenticated with check (bucket_id = 'menu' and public.is_admin());
create policy "menu photos: admins update" on storage.objects for update to authenticated using (bucket_id = 'menu' and public.is_admin());
create policy "menu photos: admins delete" on storage.objects for delete to authenticated using (bucket_id = 'menu' and public.is_admin());
````

## `.vercelignore`

````text
supabase/
README.md
````

---

# PART 6 — TESTING WITHOUT A REAL LOGIN

The builder does not have the owner's password, and must never type real credentials. To test the
logged-in screens and every write, serve the site locally and use a throw-away copy of the admin page
with a fake Supabase in front of it:

1. Create `admin-test-mock.js` (below) at the project root, with `{{SUPABASE_PROJECT_REF}}` replaced.
2. Create `admin-test.html`: a copy of `admin.html` with
   `<script src="admin-test-mock.js"></script>` inserted just **before** the supabase-js `<script>`
   tag.
3. Open `/admin-test.html` from a local server. The mock writes a fake session to `localStorage`,
   answers the REST calls with canned rows, and records every request in `window.__requests`. Replace
   `window.confirm` in the console when testing deletions.
4. Check each feature, and the requests' bodies in `window.__requests`.
5. **Delete both files** and clear the site's `localStorage` afterwards (the fake session would stay).

```js
(function () {
  var ref = '{{SUPABASE_PROJECT_REF}}';
  var uid = '11111111-1111-4111-8111-111111111111';
  function b64(o) { return btoa(JSON.stringify(o)).split('=').join('').split('+').join('-').split('/').join('_'); }
  var exp = Math.floor(Date.now() / 1000) + 3600;
  var token = b64({ alg: 'HS256', typ: 'JWT' }) + '.' + b64({ sub: uid, email: 'test@example.com', role: 'authenticated', aud: 'authenticated', exp: exp }) + '.sig';
  localStorage.setItem('sb-' + ref + '-auth-token', JSON.stringify({
    access_token: token, token_type: 'bearer', expires_in: 3600, expires_at: exp, refresh_token: 'fake',
    user: { id: uid, email: 'test@example.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() }
  }));

  var categories = [
    { id: 'cafes', name_fr: 'Cafés', name_en: 'Coffees', image_url: null, position: 1 },
    { id: 'thes', name_fr: 'Thés', name_en: 'Teas', image_url: null, position: 2 },
    { id: 'vide', name_fr: 'Vide', name_en: null, image_url: null, position: 3 }
  ];
  function item(id, cat, name, price, pos) {
    return { id: id, category_id: cat, group_fr: null, group_en: null, is_extra: false, name_fr: name, name_en: null,
      description_fr: null, description_en: null, price: price, image_url: null, available: true, featured: false, position: pos };
  }
  var items = [
    item('a1', 'cafes', 'Espresso', 3, 1), item('a2', 'cafes', 'Americano', 3.5, 2), item('a3', 'cafes', 'Cappuccino', 4.5, 3),
    item('b1', 'thes', 'Thé à la menthe', 3, 1)
  ];
  var settings = [{ key: 'phone', value: '' }];

  window.__requests = [];
  function json(body, status) { return new Response(JSON.stringify(body), { status: status || 200, headers: { 'Content-Type': 'application/json' } }); }
  function eq(url, key) { var v = url.searchParams.get(key); return v ? v.replace('eq.', '') : null; }
  function byId(list, id) { return list.find(function (r) { return r.id === id; }); }

  window.fetch = async function (input, init) {
    init = init || {};
    var url = new URL(typeof input === 'string' ? input : input.url);
    var method = (init.method || 'GET').toUpperCase();
    var body = init.body && typeof init.body === 'string' ? JSON.parse(init.body) : null;
    window.__requests.push({ method: method, path: url.pathname.split('/').pop(), search: decodeURIComponent(url.search), body: body });
    var accept = new Headers(init.headers).get('Accept') || '';
    function rows(list) { return accept.indexOf('vnd.pgrst.object') >= 0 ? json(list[0] || null) : json(list); }
    var p = url.pathname;

    if (p.endsWith('/rest/v1/admins')) return rows([{ user_id: uid }]);
    if (p.endsWith('/rest/v1/categories') && method === 'GET') return json(categories);
    if (p.endsWith('/rest/v1/items') && method === 'GET') return json(items);
    if (p.endsWith('/rest/v1/settings') && method === 'GET') return json(settings);
    if (p.endsWith('/rest/v1/settings') && method === 'POST') return json(body);
    if (p.endsWith('/rest/v1/rpc/reorder_items') || p.endsWith('/rest/v1/rpc/reorder_categories')) {
      var list = p.endsWith('reorder_items') ? items : categories;
      body.ids.forEach(function (id, i) { byId(list, id).position = i + 1; });
      return new Response(null, { status: 204 });
    }
    if (p.endsWith('/rest/v1/items') && method === 'POST') { items.push(body); return rows([body]); }
    if (p.endsWith('/rest/v1/categories') && method === 'POST') { categories.push(body); return rows([body]); }
    if (method === 'PATCH') {
      var table = p.endsWith('/items') ? items : categories;
      var row = byId(table, eq(url, 'id'));
      Object.assign(row, body);
      return json([row]);
    }
    if (p.endsWith('/rest/v1/items') && method === 'DELETE') {
      var gone = items.filter(function (r) { return r.id === eq(url, 'id') || r.category_id === eq(url, 'category_id'); });
      items = items.filter(function (r) { return gone.indexOf(r) < 0; });
      return json(gone);
    }
    if (p.endsWith('/rest/v1/categories') && method === 'DELETE') {
      var id = eq(url, 'id');
      if (items.some(function (r) { return r.category_id === id; })) return json({ message: 'violates foreign key constraint' }, 409);
      var removed = categories.filter(function (r) { return r.id === id; });
      categories = categories.filter(function (r) { return r.id !== id; });
      return json(removed);
    }
    return json({ message: 'blocked in test' }, 500);
  };
})();
```

---

# PART 7 — PITFALLS ALREADY SOLVED (KEEP THESE FIXES)

1. **Row-level security does not raise errors for forbidden updates or deletes**: it changes 0 rows.
   Always ask for the rows back and treat "none" as refused.
2. **Logged in is not the same as admin.** Writes require a row in `admins`, and sign-ups are turned
   off (and checked, since a project can be left with them on).
3. **No integrity hash on jsDelivr's auto-minified files.** Pin `supabase-js/…/dist/umd/supabase.js`,
   not `supabase.min.js`.
4. **SortableJS needs `forceFallback: true`** so mouse and touch dragging behave the same.
5. **Safari cannot make WebP from a canvas** (it silently returns PNG): check the result's type and
   fall back to JPEG.
6. **A `display:none` file input may not open on phones**: hide it visually instead.
7. **A `display` set by a class beats the `hidden` attribute** (e.g. `.admin-user { display: flex }`
   showed "Déconnexion" on the login screen): add `[hidden] { display: none }` to such components.
8. **`grid-area` names leak between layouts**: an element styled `grid-area: thumb` (or `name`,
   `move`…) for one grid lands in an implicit column of another grid that has no such area (the
   reorder rows came out reversed). Reset it with `grid-area: auto` where it is reused.
9. **Redrawing a whole list throws away what is being typed in it.** After a slow photo upload, redraw
   only the changed photo button.
10. **Closing a sheet while it saves hides the outcome.** Ignore Esc / × / backdrop while saving, and
    fall back to a toast if the browser closes it anyway.
11. **Names repeat across categories**: every message names the category too.
12. **A database without the `settings` table** must still let the owner edit the menu: the Infos tab
    shows a note instead.
13. **File-writing tools can turn a backslash-u escape into a raw character** (the accent range
    `\u0300-\u036f` in `slugify()`): write such escapes from a script and check the files contain the
    escapes.
14. **Deleting a category** must delete its products first (the foreign key refuses otherwise) and
    say how many in the confirmation.

---

# PART 8 — ACCEPTANCE CHECKS

1. `grep -rn "{{" admin.html admin.css admin.js supabase-config.js supabase/` prints nothing; the logo,
   colours, fonts and currency are the new café's.
2. With `supabase-config.js` empty: "Configuration manquante". With it filled and no session: the
   login screen, no "Déconnexion" button.
3. A wrong password → "E-mail ou mot de passe incorrect."; an account not in `admins` → "Accès refusé"
   with its e-mail. (Owner test, with the owner's own login.)
4. As an anonymous visitor: reading works; changing or adding an item, calling `reorder_items` or
   `reorder_categories` and uploading to `menu` are refused; `admins` returns `[]`;
   `/auth/v1/settings` answers `"disable_signup": true`.
5. With the mock (Part 6) or as the owner: change a price (rounded to `{{PRICE_DECIMALS}}` decimals,
   toast), switch an item off (the public page shows "Indisponible"), add a product with a photo (two
   copies in storage), edit name / description in both languages, move a product to another category
   (it goes last there), delete a product after confirming.
6. "Changer l'ordre": ↑ / ↓ and dragging save one `reorder_items` call with the new order; the public
   page follows on the next load.
7. Categories: add (photo required, duplicate names refused, id from the name), rename, change photo,
   reorder (drag and arrows), delete (confirmation gives the product count; the products go too).
8. Infos: each refusal of Part 2.4 shows its message with the focus on the field; only changed details
   are sent; the public page shows them on the next load.
9. At 375 px wide: no sideways scrolling in any tab; product and category cards fit; the e-mail is
   hidden under 520 px.
10. No console errors on load; the two libraries load (integrity hashes accepted).
