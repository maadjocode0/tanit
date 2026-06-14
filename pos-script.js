const LATE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

let knownIds = new Set();
let currentFilter = "pending";
let allOrders = [];

// =============================================
// AUTH
// =============================================

async function ensureAuth() {
  const token = sessionStorage.getItem("tanit_token");
  if (!token) { window.location.href = "login.html"; return false; }
  const ok = await validateToken(token);
  if (!ok) { sessionStorage.removeItem("tanit_token"); window.location.href = "login.html"; return false; }
  return true;
}

// =============================================
// CLOCK
// =============================================

function startClock() {
  const el = document.getElementById("currentTime");
  if (!el) return;
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit", minute: "2-digit", second: "2-digit"
    });
  };
  tick();
  setInterval(tick, 1000);
}

// =============================================
// FILTER
// =============================================

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".filter-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.filter === filter);
  });
  renderOrders();
}

// =============================================
// UTILS
// =============================================

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function isToday(iso) {
  const d = new Date(iso);
  const now = new Date();
  return d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();
}

function isActive(status) {
  return status === "pending" || status === "preparing";
}

function isLate(iso) {
  return (Date.now() - new Date(iso).getTime()) > LATE_THRESHOLD_MS;
}

function minutesWaiting(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// =============================================
// STATS
// =============================================

function updateStats() {
  const todayOrders = allOrders.filter(o => isToday(o.created_at));
  const pending = todayOrders.filter(o => o.status === "pending").length;
  const preparing = todayOrders.filter(o => o.status === "preparing").length;
  const done = todayOrders.filter(o => o.status === "done").length;
  const cancelled = todayOrders.filter(o => o.status === "cancelled").length;
  const revenue = todayOrders
    .filter(o => o.status === "done")
    .reduce((sum, o) => sum + Number(o.total), 0);

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set("statPending", pending);
  set("statPreparing", preparing);
  set("statDone", done);
  set("statCancelled", cancelled);
  set("statRevenue", formatPrice(revenue));

  const badge = (id, n) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = n;
    el.style.display = n > 0 ? "inline-flex" : "none";
  };
  badge("badgePending", pending);
  badge("badgePreparing", preparing);
}

// =============================================
// RENDER
// =============================================

function getFilteredOrders() {
  const todayOrders = allOrders.filter(o => isToday(o.created_at));
  if (currentFilter === "all") return todayOrders;
  return todayOrders.filter(o => o.status === currentFilter);
}

function getStatusLabel(status) {
  if (status === "preparing") return '<span class="status-badge preparing"><i class="fa-solid fa-fire-burner"></i> En préparation</span>';
  if (status === "done") return '<span class="status-badge done"><i class="fa-solid fa-check"></i> Terminée</span>';
  if (status === "cancelled") return '<span class="status-badge cancelled"><i class="fa-solid fa-xmark"></i> Annulée</span>';
  return '';
}

function getActions(order) {
  if (order.status === "pending") {
    return `
      <button class="btn-cancel" onclick="markCancelled('${order.id}')"><i class="fa-solid fa-xmark"></i> Annuler</button>
      <button class="btn-start" onclick="markPreparing('${order.id}')"><i class="fa-solid fa-fire-burner"></i> Commencer</button>`;
  }
  if (order.status === "preparing") {
    return `
      <button class="btn-cancel" onclick="markCancelled('${order.id}')"><i class="fa-solid fa-xmark"></i> Annuler</button>
      <button class="btn-done" onclick="markDone('${order.id}')"><i class="fa-solid fa-check"></i> Terminé</button>`;
  }
  return '';
}

function renderOrders() {
  const posOrders = document.getElementById("posOrders");
  updateStats();

  const filtered = getFilteredOrders();

  if (!filtered.length) {
    const labels = { pending: "en attente", preparing: "en préparation", done: "terminées", cancelled: "annulées", all: "aujourd'hui" };
    posOrders.innerHTML = `<p class="empty-pos">Aucune commande ${labels[currentFilter]} pour aujourd'hui.</p>`;
    return;
  }

  posOrders.innerHTML = filtered.map(order => {
    const late = isActive(order.status) && isLate(order.created_at);
    const mins = minutesWaiting(order.created_at);
    const isNew = !knownIds.has(order.id) && order.status === "pending";
    const statusClass = order.status !== "pending" ? "order-" + order.status : "";

    return `
      <div class="order-card ${statusClass} ${late ? 'order-late' : ''} ${isNew ? 'new' : ''}" id="order-${order.id}">
        <div class="order-head">
          <h3><i class="fa-solid fa-utensils"></i> Table ${escapeHtml(order.table_number)}</h3>
          <strong>${formatPrice(order.total)}</strong>
        </div>

        ${late ? `<div class="late-warning"><i class="fa-solid fa-triangle-exclamation"></i> Attend depuis ${mins} min</div>` : ''}
        ${getStatusLabel(order.status)}

        <ul class="order-items">
          ${order.items.map(item => `
            <li>${escapeHtml(item.name)} × ${item.qty} <span class="item-subtotal-pos">— ${formatPrice(item.price * item.qty)}</span></li>
          `).join("")}
        </ul>

        ${order.notes ? `<div class="order-note"><i class="fa-solid fa-pen"></i> ${escapeHtml(order.notes)}</div>` : ''}

        <div class="order-foot">
          <span class="order-time"><i class="fa-regular fa-clock"></i> ${formatTime(order.created_at)}</span>
          <div class="order-actions">${getActions(order)}</div>
        </div>
      </div>
    `;
  }).join("");
}

// =============================================
// ACTIONS
// =============================================

async function setStatus(id, status, confirmMsg) {
  if (confirmMsg && !confirm(confirmMsg)) return;
  try {
    await updateOrderStatus(id, status);
    await fetchAndRender();
  } catch (err) { console.error(err); alert("Action impossible. Réessayez."); }
}

const markPreparing = (id) => setStatus(id, "preparing");
const markDone = (id) => setStatus(id, "done");
const markCancelled = (id) => setStatus(id, "cancelled", "Annuler cette commande ?");

// =============================================
// FETCH + ALERTS
// =============================================

async function fetchAndRender() {
  try {
    allOrders = await getOrders();
  } catch (err) {
    if (err.status === 401) { logout(); return; }
    console.error(err);
    return;
  }

  const pendingOrders = allOrders.filter(o => o.status === "pending" && isToday(o.created_at));
  const newOrders = pendingOrders.filter(o => !knownIds.has(o.id));
  if (newOrders.length > 0) {
    playSound();
    notifyNewOrders(newOrders);
  }
  pendingOrders.forEach(o => knownIds.add(o.id));

  renderOrders();
}

function playSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.15, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {}
}

function notifyNewOrders(orders) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    const title = orders.length === 1
      ? `Nouvelle commande — Table ${orders[0].table_number}`
      : `${orders.length} nouvelles commandes`;
    const body = orders.map(o => `Table ${o.table_number} · ${formatPrice(o.total)}`).join("\n");
    const n = new Notification(title, { body, icon: "icons/icon-192.png", tag: "tanit-order", renotify: true });
    n.onclick = () => { window.focus(); n.close(); };
  } catch (e) {}
}

function requestNotifications() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

// =============================================
// INIT
// =============================================

document.addEventListener("DOMContentLoaded", async () => {
  if (!(await ensureAuth())) return;
  requestNotifications();
  startClock();
  fetchAndRender();
  setInterval(fetchAndRender, 5000);
  // Re-render every minute so "late" timers stay fresh.
  setInterval(renderOrders, 60000);
});
