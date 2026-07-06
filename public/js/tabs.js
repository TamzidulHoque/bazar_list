// tabs.js — একাধিক list (tab): দেখানো, switch, add, rename, delete

import { tabBar } from "./dom.js";
import { state, save } from "./store.js";
import { render } from "./render.js";

export function renderTabs() {
  tabBar.innerHTML = "";

  state.tabs.forEach((tab, i) => {
    const wrap = document.createElement("div");
    wrap.className = "tab-btn" + (i === state.currentTab ? " active" : "");

    const name = document.createElement("span");
    name.textContent = tab.name;
    name.addEventListener("click", () => switchTab(i));
    name.addEventListener("dblclick", () => renameTab(i)); // ডাবল-ক্লিকে নাম বদলানো
    wrap.appendChild(name);

    if (state.tabs.length > 1) {
      const close = document.createElement("span");
      close.className = "tab-close";
      close.textContent = "×";
      close.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteTab(i);
      });
      wrap.appendChild(close);
    }

    tabBar.appendChild(wrap);
  });

  const add = document.createElement("button");
  add.className = "tab-add";
  add.textContent = "+";
  add.title = "নতুন list";
  add.addEventListener("click", addTab);
  tabBar.appendChild(add);
}

function switchTab(i) {
  state.currentTab = i;
  state.currentPage = 1;
  state.editingIndex = null;
  render();
}

function addTab() {
  const name = prompt("নতুন list-এর নাম:", "List " + (state.tabs.length + 1));
  if (!name || !name.trim()) return;
  state.tabs.push({ name: name.trim(), items: [] });
  state.currentTab = state.tabs.length - 1;
  state.currentPage = 1;
  save();
  render();
}

function renameTab(i) {
  const name = prompt("নতুন নাম:", state.tabs[i].name);
  if (!name || !name.trim()) return;
  state.tabs[i].name = name.trim();
  save();
  render();
}

function deleteTab(i) {
  if (state.tabs.length <= 1) return;
  if (!confirm(`"${state.tabs[i].name}" list মুছে ফেলবেন?`)) return;
  state.tabs.splice(i, 1);
  if (state.currentTab >= state.tabs.length) state.currentTab = state.tabs.length - 1;
  state.currentPage = 1;
  save();
  render();
}
