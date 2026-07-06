// actions.js — block/enable + make manager (আপাতত dummy data বদলায়; পরে API call)

import { users } from "./data.js";
import { renderUsers } from "./table.js";

// id দিয়ে user খুঁজি
function find(id) {
  return users.find((u) => u.id === id);
}

// active ⇄ inactive টগল
export function toggleActive(id) {
  const u = find(id);
  if (!u) return;
  u.is_active = !u.is_active;
  // পরে: await fetch("/api/admin/users/" + id + "/active", { method:"PATCH", ... })
  renderUsers();
}

// user → manager বানানো
export function makeManager(id) {
  const u = find(id);
  if (!u || u.role !== "user") return;
  u.role = "manager";
  // পরে: await fetch("/api/admin/users/" + id + "/role", { method:"PATCH", body:{role:"manager"} })
  renderUsers();
}

// manager → আবার user বানানো (demote)
export function demoteToUser(id) {
  const u = find(id);
  if (!u || u.role !== "manager") return;
  u.role = "user";
  // পরে: await fetch("/api/admin/users/" + id + "/role", { method:"PATCH", body:{role:"user"} })
  renderUsers();
}
