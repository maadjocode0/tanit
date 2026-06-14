// =====================================================================
// Menu back-office (admin.html)
// Toggle availability + override prices, stored in Supabase menu_items.
// Depends on: menu-data.js (flatMenuItems, MENU_DATA, formatPrice), supabase.js
// =====================================================================

let overrides = {};   // name -> { available, price_override }

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

function flash(msg, isError) {
  const el = document.getElementById("saveStatus");
  el.textContent = msg;
  el.className = "save-status show" + (isError ? " error" : "");
  clearTimeout(flash._t);
  flash._t = setTimeout(() => { el.className = "save-status"; }, 1800);
}

async function loadOverrides() {
  overrides = {};
  try {
    const rows = await getMenuItems();
    rows.forEach(r => { overrides[r.name] = r; });
  } catch (e) {
    if (e.status === 401) { logout(); return; }
    flash("Table menu_items absente — lancez supabase-setup.sql", true);
  }
}

function render() {
  const root = document.getElementById("adminList");
  const items = flatMenuItems();

  // Group by category, preserving MENU_DATA order.
  const byCat = new Map();
  items.forEach(it => {
    if (!byCat.has(it.category)) byCat.set(it.category, []);
    byCat.get(it.category).push(it);
  });

  root.innerHTML = [...byCat.entries()].map(([cat, list]) => `
    <section class="admin-cat" data-cat="${escapeHtml(cat)}">
      <h2>${escapeHtml(cat)}</h2>
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
      let any = false;
      cat.querySelectorAll(".admin-row").forEach(row => {
        const match = row.dataset.name.toLowerCase().includes(q);
        row.style.display = match ? "" : "none";
        if (match) any = true;
      });
      cat.style.display = any ? "" : "none";
    });
  });
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await ensureAuth())) return;
  await loadOverrides();
  render();
  setupSearch();
});
