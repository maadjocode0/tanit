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

function setTable(table) {
  localStorage.setItem(TABLE_KEY, table);
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

  // Show table if already set
  const table = getTable();
  if (table) {
    document.getElementById("tableDisplay").style.display = "block";
    document.getElementById("tableNumber").textContent = table;
    orderBtn.disabled = false;
  }
}

function setTableManually() {
  const input = document.getElementById("tableInput");
  const val = input.value.trim();
  if (!val || isNaN(val) || Number(val) < 1) {
    input.style.borderColor = "red";
    return;
  }
  input.style.borderColor = "";
  setTable(val);
  document.getElementById("tableDisplay").style.display = "block";
  document.getElementById("tableNumber").textContent = val;
  document.getElementById("orderBtn").disabled = false;
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
    const order = await createOrder(table, cart, total, note);
    setCart([]);
    localStorage.removeItem(TABLE_KEY);
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

// Check for table number in URL (from QR code)
function checkURLTable() {
  const params = new URLSearchParams(window.location.search);
  const table = params.get("table");
  if (table) {
    setTable(table);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkURLTable();
  renderCart();
});