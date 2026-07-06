// main.js — admin dashboard entry: role ঠিক করা, render, logout

import { renderUsers } from "./table.js";

// লগইন করা user (localStorage থেকে)। role এখনো backend-এ নেই,
// তাই আপাতত ?role=manager দিয়ে টেস্ট করা যাবে; নইলে default admin।
function getRole() {
  const params = new URLSearchParams(location.search);
  if (params.get("role")) return params.get("role"); // টেস্টিং shortcut
  const user = JSON.parse(localStorage.getItem("bazar_user") || "null");
  return (user && user.role) || "admin";
}

// অন্য ফাইল যেন role জানতে পারে (live binding)
export let currentRole = getRole();

// manager হলে admin-only অংশ (Actions, account-এ ঢোকা) লুকাই
document.body.classList.toggle("role-manager", currentRole === "manager");
document.getElementById("roleBadge").textContent =
  currentRole === "manager" ? "Manager" : "Admin";

// logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("bazar_token");
  localStorage.removeItem("bazar_user");
  window.location.href = "/authentication/";
});

renderUsers();
