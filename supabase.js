const SUPABASE_URL = "https://wuiimhdiqsrvwnoovoxg.supabase.co";
const SUPABASE_KEY = "sb_publishable_aPa4RDt8MV4ybjFmZkt9AQ_-e8vHCa2";

async function supabaseRequest(method, path, body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Prefer": (method === "POST" || method === "PATCH") ? "return=representation" : ""
    }
  };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${SUPABASE_URL}/rest/v1${path}`, options);
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : [];
}

async function getOrders() {
  return supabaseRequest("GET", "/orders?select=*&order=created_at.desc");
}

async function createOrder(tableNumber, items, total) {
  return supabaseRequest("POST", "/orders", {
    table_number: tableNumber,
    items,
    total,
    status: "pending"
  });
}

async function updateOrderStatus(id, status) {
  return supabaseRequest("PATCH", `/orders?id=eq.${id}`, { status });
}