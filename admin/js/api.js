// api.js — admin backend-এর সাথে কথা বলা (JWT token header-এ পাঠিয়ে)

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + localStorage.getItem("bazar_token"),
  };
}

// response যাচাই: ok হলে JSON, নইলে error ছুঁড়ি
async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "সমস্যা হয়েছে");
  return data;
}

// সব user আনা
export async function getUsers() {
  return handle(await fetch("/api/admin/users", { headers: authHeaders() }));
}

// block/enable
export async function setActive(id, isActive) {
  return handle(await fetch(`/api/admin/users/${id}/active`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ is_active: isActive }),
  }));
}

// role বদল (user ⇄ manager)
export async function setRole(id, role) {
  return handle(await fetch(`/api/admin/users/${id}/role`, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify({ role }),
  }));
}

// কোনো user-এর list (read-only)
export async function getUserItems(id) {
  return handle(await fetch(`/api/admin/users/${id}/items`, { headers: authHeaders() }));
}
