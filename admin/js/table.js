// table.js — stat cards + user table আঁকা (createElement, XSS-safe)

import { users } from "./data.js";
import { toggleActive, makeManager, demoteToUser } from "./actions.js";
import { openUserView } from "./userView.js";
import { currentRole } from "./main.js";

const statsBox = document.getElementById("stats");
const rows = document.getElementById("userRows");

// ছোট helper: pill span বানায়
function pill(text, cls) {
  const s = document.createElement("span");
  s.className = "pill " + cls;
  s.textContent = text;
  return s;
}

function renderStats() {
  const total = users.length;
  const active = users.filter((u) => u.is_active).length;
  const managers = users.filter((u) => u.role === "manager").length;

  statsBox.innerHTML = "";
  const cards = [
    { num: total, label: "Total users" },
    { num: active, label: "Active" },
    { num: total - active, label: "Blocked" },
    { num: managers, label: "Managers" },
  ];
  for (const c of cards) {
    const card = document.createElement("div");
    card.className = "stat-card";
    const num = document.createElement("div");
    num.className = "num";
    num.textContent = c.num;
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = c.label;
    card.appendChild(num);
    card.appendChild(label);
    statsBox.appendChild(card);
  }
}

export function renderUsers() {
  renderStats();
  rows.innerHTML = "";

  users.forEach((u, i) => {
    const tr = document.createElement("tr");

    // # (serial)
    const tdNum = document.createElement("td");
    tdNum.textContent = i + 1;

    // name → admin হলে clickable (read-only view); manager হলে শুধু টেক্সট
    const tdName = document.createElement("td");
    if (currentRole === "manager") {
      tdName.textContent = u.name; // manager account-এ ঢুকতে পারবে না
    } else {
      const nameBtn = document.createElement("button");
      nameBtn.className = "user-name";
      nameBtn.textContent = u.name;
      nameBtn.addEventListener("click", () => openUserView(u));
      tdName.appendChild(nameBtn);
    }

    // email
    const tdEmail = document.createElement("td");
    tdEmail.textContent = u.email;

    // role pill
    const tdRole = document.createElement("td");
    tdRole.appendChild(pill(u.role, u.role));

    // status pill
    const tdStatus = document.createElement("td");
    tdStatus.appendChild(
      u.is_active ? pill("active", "active") : pill("inactive", "inactive")
    );

    // actions (admin-only)
    const tdAct = document.createElement("td");
    tdAct.className = "admin-only";

    // block / enable toggle
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "act " + (u.is_active ? "block" : "enable");
    toggleBtn.textContent = u.is_active ? "Block" : "Enable";
    toggleBtn.addEventListener("click", () => toggleActive(u.id));

    tdAct.appendChild(toggleBtn);

    // role অনুযায়ী: user → "Make manager", manager → "Demote to user"
    // admin-কে এই button দেখাই না (admin demote/promote হয় না)
    if (u.role === "user") {
      const mgrBtn = document.createElement("button");
      mgrBtn.className = "act manager";
      mgrBtn.textContent = "Make manager";
      mgrBtn.addEventListener("click", () => makeManager(u.id));
      tdAct.appendChild(mgrBtn);
    } else if (u.role === "manager") {
      const demoteBtn = document.createElement("button");
      demoteBtn.className = "act demote";
      demoteBtn.textContent = "Demote to user";
      demoteBtn.addEventListener("click", () => demoteToUser(u.id));
      tdAct.appendChild(demoteBtn);
    }

    tr.append(tdNum, tdName, tdEmail, tdRole, tdStatus, tdAct);
    rows.appendChild(tr);
  });
}
