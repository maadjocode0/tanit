const ADMIN_PASSWORD = "tanit2024";
const LATE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes

let knownIds = new Set();
let currentFilter = "pending";
let allOrders = [];

// =============================================
// AUTH
// =============================================

function checkAuth() {
  const token = sessionStorage.getItem("tanit_token");
  if (!token) {
    window.location.href = "login.html";
    return null;
  }
  return token;
}

// =============================================
// CLOCK
// =============================================

function startClock() {
  const el = document.getElementById("currentTime");
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

function isLate(iso) {
  return (Date.now() - new Date(iso).getTime()) > LATE_THRESHOLD_MS;
}

function minutesWaiting(iso) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
}

// =============================================
// STATS
// =============================================

function updateStats() {
  const todayOrders = allOrders.filter(o => isToday(o.created_at));
  const pending = todayOrders.filter(o => o.status === "pending").length;
  const done = todayOrders.filter(o => o.status === "done").length;
  const cancelled = todayOrders.filter(o => o.status === "cancelled").length;
  const revenue = todayOrders
    .filter(o => o.status === "done")
    .reduce((sum, o) => sum + Number(o.total), 0);

  document.getElementById("statPending").textContent = pending;
  document.getElementById("statDone").textContent = done;
  document.getElementById("statCancelled").textContent = cancelled;
  document.getElementById("statRevenue").textContent = formatPrice(revenue);
  document.getElementById("badgePending").textContent = pending;
  document.getElementById("badgePending").style.display = pending > 0 ? "inline-flex" : "none";
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
  if (status === "done") return '<span class="status-badge done"><i class="fa-solid fa-check"></i> Terminée</span>';
  if (status === "cancelled") return '<span class="status-badge cancelled"><i class="fa-solid fa-xmark"></i> Annulée</span>';
  return '';
}

function renderOrders() {
  const posOrders = document.getElementById("posOrders");
  updateStats();

  const filtered = getFilteredOrders();

  if (!filtered.length) {
    const labels = { pending: "en attente", done: "terminées", cancelled: "annulées", all: "aujourd'hui" };
    posOrders.innerHTML = `<p class="empty-pos">Aucune commande ${labels[currentFilter]} pour aujourd'hui.</p>`;
    return;
  }

  posOrders.innerHTML = filtered.map(order => {
    const late = order.status === "pending" && isLate(order.created_at);
    const mins = minutesWaiting(order.created_at);
    const isNew = knownIds.has(order.id) === false && order.status === "pending";

    return `
      <div class="order-card ${order.status !== 'pending' ? 'order-' + order.status : ''} ${late ? 'order-late' : ''} ${isNew ? 'new' : ''}" id="order-${order.id}">
        <div class="order-head">
          <h3><i class="fa-solid fa-utensils"></i> Table ${order.table_number}</h3>
          <strong>${formatPrice(order.total)}</strong>
        </div>

        ${late ? `<div class="late-warning"><i class="fa-solid fa-triangle-exclamation"></i> Attend depuis ${mins} min</div>` : ''}
        ${getStatusLabel(order.status)}

        <ul class="order-items">
          ${order.items.map(item => `
            <li>${item.name} × ${item.qty} <span class="item-subtotal-pos">— ${formatPrice(item.price * item.qty)}</span></li>
          `).join("")}
        </ul>

        <div class="order-foot">
          <span class="order-time"><i class="fa-regular fa-clock"></i> ${formatTime(order.created_at)}</span>
          <div class="order-actions">
            ${order.status === "pending" ? `
              <button class="btn-cancel" onclick="markCancelled('${order.id}')">
                <i class="fa-solid fa-xmark"></i> Annuler
              </button>
              <button class="btn-done" onclick="markDone('${order.id}')">
                <i class="fa-solid fa-check"></i> Terminé
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// =============================================
// ACTIONS
// =============================================

async function markDone(id) {
  try {
    await updateOrderStatus(id, "done");
    await fetchAndRender();
  } catch (err) { console.error(err); }
}

async function markCancelled(id) {
  if (!confirm("Annuler cette commande ?")) return;
  try {
    await updateOrderStatus(id, "cancelled");
    await fetchAndRender();
  } catch (err) { console.error(err); }
}

// =============================================
// FETCH + SOUND
// =============================================

async function fetchAndRender() {
  try {
    allOrders = await getOrders();
  } catch (err) {
    console.error(err);
    return;
  }

  const pendingOrders = allOrders.filter(o => o.status === "pending" && isToday(o.created_at));
  const newIds = pendingOrders.filter(o => !knownIds.has(o.id)).map(o => o.id);
  if (newIds.length > 0) playSound();
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
function escape(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
// =============================================
// INIT
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  if (!checkAuth()) return;
  startClock();
  fetchAndRender();
  setInterval(fetchAndRender, 5000);
  // Re-render every minute so "late" indicators update
  setInterval(renderOrders, 60000);
});