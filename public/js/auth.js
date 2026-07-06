// auth.js — user page-এর nav: Login link বা Profile dropdown + change-password + logout
// (login/signup এখন আলাদা /authentication/ পেজে)

import { clearGuestItems } from "./sync.js";

const authArea = document.getElementById("authArea");
const passModal = document.getElementById("passModal");
const passClose = document.getElementById("passClose");
const passError = document.getElementById("passError");
const currentPass = document.getElementById("currentPass");
const newPass = document.getElementById("newPass");
const passSubmit = document.getElementById("passSubmit");

function getUser() { return JSON.parse(localStorage.getItem("bazar_user") || "null"); }
function clearAuth() {
  localStorage.removeItem("bazar_token");
  localStorage.removeItem("bazar_user");
}

// ---- nav-এ Login link বা Profile dropdown আঁকি ----
function renderAuthArea() {
  authArea.innerHTML = "";
  const user = getUser();

  if (!user) {
    // logged out → Login link (আলাদা পেজে নিয়ে যায়)
    const link = document.createElement("a");
    link.className = "nav-btn";
    link.textContent = "Login";
    link.href = "/authentication/";
    authArea.appendChild(link);
    return;
  }

  // logged in → Profile dropdown
  const wrap = document.createElement("div");
  wrap.className = "profile-wrap";

  const btn = document.createElement("button");
  btn.className = "nav-btn";
  btn.textContent = user.name + " ▾";

  // admin/manager হলে Dashboard লিংক দেখাই (backend role যোগ হলে অটো কাজ করবে)
  const isStaff = user.role === "admin" || user.role === "manager";
  const dashboardItem = isStaff
    ? `<a class="menu-item" href="/admin/">Dashboard</a>`
    : "";

  const menu = document.createElement("div");
  menu.className = "profile-menu";
  menu.innerHTML = `
    ${dashboardItem}
    <button class="menu-item" id="editProfileBtn">Edit Profile</button>
    <button class="menu-item" id="changePassBtn">Change Password</button>
    <button class="menu-item" id="logoutBtn">Logout</button>
  `;

  btn.addEventListener("click", () => menu.classList.toggle("show"));

  wrap.appendChild(btn);
  wrap.appendChild(menu);
  authArea.appendChild(wrap);

  document.getElementById("logoutBtn").addEventListener("click", logout);
  document.getElementById("editProfileBtn").addEventListener("click", () => alert("Edit Profile — পরের step-এ 🙂"));
  document.getElementById("changePassBtn").addEventListener("click", openPassModal);
}

// ---- change password modal ----
function openPassModal() {
  passError.textContent = "";
  currentPass.value = "";
  newPass.value = "";
  passModal.classList.add("show");
}
passClose.addEventListener("click", () => passModal.classList.remove("show"));

passSubmit.addEventListener("click", async () => {
  passError.style.color = "salmon";
  passError.textContent = "";
  const currentPassword = currentPass.value;
  const newPassword = newPass.value;

  if (!currentPassword || !newPassword) {
    passError.textContent = "দুটো field-ই পূরণ করুন";
    return;
  }

  try {
    const res = await fetch("/api/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("bazar_token"),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) { passError.textContent = data.error; return; }

    passError.style.color = "lightgreen";
    passError.textContent = "✅ Password বদলেছে!";
    setTimeout(() => passModal.classList.remove("show"), 1200);
  } catch (err) {
    passError.textContent = "নেটওয়ার্ক সমস্যা";
  }
});

// ---- logout ----
async function logout() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (err) { }

  clearAuth();          // token + user মুছি
  clearGuestItems();    // list-ও মুছি
  renderAuthArea();     // nav আবার Login দেখাবে
}

renderAuthArea();
