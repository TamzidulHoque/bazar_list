// main.js — admin dashboard entry: role যাচাই, backend থেকে data এনে render, logout

import { renderUsers } from "./table.js";
import { getUsers } from "./api.js";
import { setUsers } from "./data.js";

// login-এ পাওয়া user (localStorage থেকে) → তার আসল role
function getRole() {
  const user = JSON.parse(localStorage.getItem("bazar_user") || "null");
  return user && user.role;
}

// অন্য ফাইল যেন role জানতে পারে (live binding)
export let currentRole = getRole();

// admin/manager না হলে এই পেজে থাকার অধিকার নেই → login পেজে
if (currentRole !== "admin" && currentRole !== "manager") {
  window.location.href = "/authentication/";
}

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

// backend থেকে আসল user list এনে দেখাই
(async () => {
  try {
    const data = await getUsers();
    setUsers(data.users);
    renderUsers();
  } catch (e) {
    alert("User list আনা গেল না: " + e.message);
  }
})();
