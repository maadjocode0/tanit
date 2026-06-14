// =====================================================================
// Supabase REST + Auth helpers (shared by every page)
// =====================================================================
const SUPABASE_URL = "https://wuiimhdiqsrvwnoovoxg.supabase.co";
const SUPABASE_KEY = "sb_publishable_aPa4RDt8MV4ybjFmZkt9AQ_-e8vHCa2";

// Staff access token if logged in, otherwise the public (anon) key.
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

// ── ORDERS ─────────────────────────────────────────────────────────
async function getOrders() {
  return supabaseRequest("GET", "/orders?select=*&order=created_at.desc");
}

async function getOrderById(id) {
  const rows = await supabaseRequest("GET", `/orders?id=eq.${id}&select=*`);
  return rows[0] || null;
}

// Returns the created order row (so the caller gets its id for tracking).
// Resilient: if the `notes` column doesn't exist yet, retries without it.
async function createOrder(tableNumber, items, total, notes) {
  const base = { table_number: tableNumber, items, total, status: "pending" };
  const payload = (notes && notes.trim()) ? { ...base, notes: notes.trim() } : base;
  try {
    const rows = await supabaseRequest("POST", "/orders", payload);
    return rows[0] || null;
  } catch (e) {
    if (payload.notes) {
      const rows = await supabaseRequest("POST", "/orders", base);
      return rows[0] || null;
    }
    throw e;
  }
}

async function updateOrderStatus(id, status) {
  return supabaseRequest("PATCH", `/orders?id=eq.${id}`, { status });
}

// ── MENU ITEMS (availability / price overrides) ────────────────────
async function getMenuItems() {
  return supabaseRequest("GET", "/menu_items?select=*");
}

// Upsert by primary key `name`.
async function upsertMenuItem(row) {
  return supabaseRequest(
    "POST", "/menu_items",
    { ...row, updated_at: new Date().toISOString() },
    { "Prefer": "resolution=merge-duplicates,return=representation" }
  );
}

// ── AUTH ───────────────────────────────────────────────────────────
// True only for a real, non-expired staff session token.
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

// ── PWA: register the service worker (secure contexts only) ────────
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
