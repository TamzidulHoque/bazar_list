// sync.js — login/guest অনুযায়ী list load + server-এ save

import { saveForFutureBtn } from "./dom.js";
import { state, STORAGE_KEY } from "./store.js";
import { render } from "./render.js";

export function isLoggedIn() {
  return !!localStorage.getItem("bazar_token");
}

// list কোথা থেকে আসবে ঠিক করি: server (account) নাকি localStorage (guest)
export async function loadItems() {
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
  state.tabs = (stored && stored.length) ? stored : [{ name: "List 1", items: [] }];
  state.currentTab = 0;

  // login করা + বর্তমান tab খালি → account-এর সেভ করা list আনি
  const cur = state.tabs[state.currentTab].items;
  if (isLoggedIn() && cur.length === 0) {
    try {
      const res = await fetch("/api/items", {
        headers: { Authorization: "Bearer " + localStorage.getItem("bazar_token") },
      });
      const data = await res.json();
      if (res.ok) {
        state.tabs[state.currentTab].items = data.items.map((row) => row.title);
      }
    } catch (err) { }
  }

  state.currentPage = 1;
  render();
}

// logout-এর সময় সব tab মুছে একটা খালি tab রাখি
export function clearGuestItems() {
  state.tabs = [{ name: "List 1", items: [] }];
  state.currentTab = 0;
  state.currentPage = 1;
  localStorage.removeItem(STORAGE_KEY);
  render();
}

saveForFutureBtn.addEventListener("click", async () => {
  const token = localStorage.getItem("bazar_token");

  if (!token) {
    alert("📌 List সেভ করে রাখতে হলে আগে signup / login করতে হবে।");
    return;
  }

  try {
    const res = await fetch("/api/items/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
      body: JSON.stringify({ items: state.tabs[state.currentTab].items }), // বর্তমান tab
    });
    const data = await res.json();
    if (!res.ok) { alert("❌ " + data.error); return; }

    alert(`✅ "${state.tabs[state.currentTab].name}" account-এ সেভ হয়েছে! (${data.count}টি item)`);
  } catch (err) {
    alert("নেটওয়ার্ক সমস্যা");
  }
});
