// list.js — item-এর list দেখানো + add / edit / delete / clear

import { itemInput, addBtn, itemList, clearAllBtn } from "./dom.js";
import { state, items, save, PAGE_SIZE } from "./store.js";
import { render } from "./render.js";

export function renderList(totalPages) {
  itemList.innerHTML = "";

  const start = (state.currentPage - 1) * PAGE_SIZE;
  const pageItems = items().slice(start, start + PAGE_SIZE);

  pageItems.forEach((text, i) => {
    const index = start + i;

    const li = document.createElement("li");
    li.className = "item";

    if (index === state.editingIndex) {
      // ---------- EDIT MODE ----------
      const input = document.createElement("input");
      input.className = "edit-input";
      input.value = text;

      const saveBtn = document.createElement("button");
      saveBtn.className = "edit-btn";
      saveBtn.textContent = "Save";
      saveBtn.addEventListener("click", () => saveEdit(index, input.value));

      const cancelBtn = document.createElement("button");
      cancelBtn.className = "delete-btn";
      cancelBtn.textContent = "X";
      cancelBtn.addEventListener("click", () => { state.editingIndex = null; render(); });

      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") saveEdit(index, input.value);
        if (e.key === "Escape") { state.editingIndex = null; render(); }
      });

      li.appendChild(input);
      li.appendChild(saveBtn);
      li.appendChild(cancelBtn);
    } else {
      // ---------- NORMAL MODE ----------
      const span = document.createElement("span");
      span.className = "item-text";
      span.textContent = `${index + 1}. ${text}`;

      const editBtn = document.createElement("button");
      editBtn.className = "edit-btn";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => editItem(index));

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "X";
      deleteBtn.addEventListener("click", () => deleteItem(index));

      li.appendChild(span);
      li.appendChild(editBtn);
      li.appendChild(deleteBtn);
    }

    itemList.appendChild(li);
  });

  const activeInput = itemList.querySelector(".edit-input");
  if (activeInput) activeInput.focus();
}

function addItem() {
  const text = itemInput.value.trim();
  if (!text) return;
  items().push(text);
  save();
  state.currentPage = Math.ceil(items().length / PAGE_SIZE);
  render();
  itemInput.value = "";
  itemInput.focus();
}

function editItem(index) {
  state.editingIndex = index;
  render();
}

function saveEdit(index, value) {
  const newText = value.trim();
  if (newText) {
    items()[index] = newText;
    save();
  }
  state.editingIndex = null;
  render();
}

function deleteItem(index) {
  items().splice(index, 1);
  save();
  render();
}

function clearAll() {
  if (items().length === 0) return;
  if (confirm("এই list-এর সব item মুছে ফেলবেন?")) {
    state.tabs[state.currentTab].items = [];
    state.currentPage = 1;
    save();
    render();
  }
}

// ---- listeners ----
addBtn.addEventListener("click", addItem);
itemInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addItem();
});
clearAllBtn.addEventListener("click", clearAll);
