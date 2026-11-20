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
