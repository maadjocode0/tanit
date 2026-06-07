const ADMIN_PASSWORD = "tanit2024";
let knownIds = new Set();

function checkPassword() {
  const pwd = prompt("Mot de passe staff :");
  if (pwd !== ADMIN_PASSWORD) {
    document.body.innerHTML = "<p style='color:white;text-align:center;padding:2rem'>Accès refusé.</p>";
    return false;
  }
  return true;
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatPrice(price) {
  return `${Number(price).toFixed(2)} DT`;
}

function startClock() {
  const el = document.getElementById("currentTime");
  const tick = () => {
    el.textContent = new Date().toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  };
  tick();
  setInterval(tick, 1000);
}

async function renderOrders() {
  const posOrders = document.getElementById("posOrders");
  const orderCount = document.getElementById("orderCount");

  let orders = [];
  try {
    orders = await getOrders();
    orders = orders.filter(o => o.status === "pending");
  } catch (err) {
    console.error(err);
    return;
  }

  const newIds = orders.filter(o => !knownIds.has(o.id)).map(o => o.id);
  if (newIds.length > 0) playSound();
  orders.forEach(o => knownIds.add(o.id));

  orderCount.textContent = `${orders.length} commande${orders.length > 1 ? "s" : ""}`;

  if (!orders.length) {
    posOrders.innerHTML = '<p class="empty-pos">Aucune commande en attente.</p>';
    return;
  }

  posOrders.innerHTML = orders.map(order => `
    <div class="order-card ${newIds.includes(order.id) ? "new" : ""}" id="order-${order.id}">
      <div class="order-head">
        <h3>Table ${order.table_number}</h3>
        <strong>${formatPrice(order.total)}</strong>
      </div>
      <ul class="order-items">
        ${order.items.map(item => `
          <li>${item.name} × ${item.qty} — ${formatPrice(item.price * item.qty)}</li>
        `).join("")}
      </ul>
      <div class="order-foot">
        <span class="order-time">${formatTime(order.created_at)}</span>
        <button class="btn-done" onclick="markDone('${order.id}')">
          <i class="fa-solid fa-check"></i> Terminé
        </button>
      </div>
    </div>
  `).join("");
}

async function markDone(id) {
  try {
    await updateOrderStatus(id, "done");
    knownIds.delete(id);
    await renderOrders();
  } catch (err) {
    console.error(err);
  }
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

document.addEventListener("DOMContentLoaded", () => {
  if (!checkPassword()) return;
  startClock();
  renderOrders();
  setInterval(renderOrders, 3000);
});