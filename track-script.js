// =====================================================================
// Customer order tracking (track.html?id=<order id>)
// =====================================================================

const STEPS = [
  { key: "pending",   label: "Reçue",          icon: "fa-receipt" },
  { key: "preparing", label: "En préparation", icon: "fa-fire-burner" },
  { key: "done",      label: "Prête",          icon: "fa-bell-concierge" }
];

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
    pending:   { t: "Commande reçue ✅",      s: "Le personnel a bien reçu votre commande." },
    preparing: { t: "En préparation 👨‍🍳",    s: "Votre commande est en cuisine." },
    done:      { t: "C'est prêt ! 🔔",         s: "Votre commande est prête à être servie." },
    cancelled: { t: "Commande annulée",        s: "Contactez le personnel pour plus d'informations." }
  };
  const h = map[status] || map.pending;
  return `<div class="track-headline"><h2>${h.t}</h2><p>${h.s}</p></div>`;
}

function render(order) {
  const itemsHTML = (order.items || []).map(it =>
    `<li><span>${escapeHtml(it.name)} × ${it.qty}</span><span>${fmt(it.price * it.qty)}</span></li>`
  ).join("");

  document.getElementById("trackRoot").innerHTML = `
    ${headlineHTML(order.status)}
    ${stepperHTML(order.status)}
    <div class="track-card">
      <div class="track-row"><span>Table</span><strong>${escapeHtml(order.table_number)}</strong></div>
      <ul class="track-items">${itemsHTML}</ul>
      ${order.notes ? `<div class="track-note"><i class="fa-solid fa-pen"></i> ${escapeHtml(order.notes)}</div>` : ""}
      <div class="track-total"><span>Total</span><strong>${fmt(order.total)}</strong></div>
    </div>
    <p class="track-refresh"><i class="fa-solid fa-rotate"></i> Mise à jour automatique</p>`;
}

let pollTimer = null;

async function refresh(id) {
  try {
    const order = await getOrderById(id);
    if (!order) { renderNotFound(); clearInterval(pollTimer); return; }
    render(order);
    if (order.status === "done" || order.status === "cancelled") clearInterval(pollTimer);
  } catch (e) {
    console.error(e);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getOrderId();
  if (!id) { renderNotFound(); return; }
  refresh(id);
  pollTimer = setInterval(() => refresh(id), 5000);
});
