// actions.js — block/enable + role বদল। আগে API ডাকে, সফল হলে UI update।

import { users } from "./data.js";
import { renderUsers } from "./table.js";
import { setActive, setRole } from "./api.js";

function find(id) {
  return users.find((u) => u.id === id);
}

// active ⇄ inactive
export async function toggleActive(id) {
  const u = find(id);
  if (!u) return;
  const newVal = !u.is_active;
  try {
    await setActive(id, newVal); // DB-তে বদল
    u.is_active = newVal;         // cache-এ বদল
    renderUsers();                // পর্দায় update
  } catch (e) {
    alert(e.message);
  }
}

// user → manager
export async function makeManager(id) {
  const u = find(id);
  if (!u || u.role !== "user") return;
  try {
    await setRole(id, "manager");
    u.role = "manager";
    renderUsers();
  } catch (e) {
    alert(e.message);
  }
}

// manager → user (demote)
export async function demoteToUser(id) {
  const u = find(id);
  if (!u || u.role !== "manager") return;
  try {
    await setRole(id, "user");
    u.role = "user";
    renderUsers();
  } catch (e) {
    alert(e.message);
  }
}
