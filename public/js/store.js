// store.js — পুরো app-এর shared state ও persistence ("single source of truth")

export const STORAGE_KEY = "bazar_guest_tabs";
export const PAGE_SIZE = 10;

// সব module এই একই state object শেয়ার করে
export const state = {
  tabs: [{ name: "List 1", items: [] }],
  currentTab: 0,
  currentPage: 1,
  editingIndex: null,
};

// বর্তমান tab-এর items array ফেরত দেয় (সবসময় live)
export function items() {
  return state.tabs[state.currentTab].items;
}

// সব tab localStorage-এ সেভ
export function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.tabs));
}
