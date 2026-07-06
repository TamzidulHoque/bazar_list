// userView.js — user name-এ ক্লিক → তার list (read-only modal, backend থেকে আনা)

import { getUserItems } from "./api.js";

const modal = document.getElementById("viewModal");
const closeBtn = document.getElementById("viewClose");
const title = document.getElementById("viewTitle");
const sub = document.getElementById("viewSub");
const list = document.getElementById("viewList");

// list-এ একটা লাইন বসানোর ছোট helper
function line(text, empty = false) {
  const li = document.createElement("li");
  if (empty) li.className = "empty";
  li.textContent = text; // XSS-safe
  return li;
}

export async function openUserView(user) {
  title.textContent = user.name + "-এর List";
  sub.textContent = user.email + " · " + user.role;
  list.innerHTML = "";
  list.appendChild(line("লোড হচ্ছে..."));
  modal.classList.add("show");

  try {
    const data = await getUserItems(user.id); // backend থেকে আসল list
    list.innerHTML = "";
    if (!data.items || data.items.length === 0) {
      list.appendChild(line("কোনো item নেই", true));
    } else {
      for (const item of data.items) list.appendChild(line(item));
    }
  } catch (e) {
    list.innerHTML = "";
    list.appendChild(line(e.message, true));
  }
}

closeBtn.addEventListener("click", () => modal.classList.remove("show"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});
