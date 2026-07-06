// pagination.js — Prev / 1 / 2 / Next

import { pagination } from "./dom.js";
import { state } from "./store.js";
import { render } from "./render.js";

export function renderPagination(totalPages) {
  pagination.innerHTML = "";

  // ১ পেজ (১০ বা কম item) হলে page number দেখাব না
  if (totalPages <= 1) return;

  const prev = document.createElement("button");
  prev.className = "page-btn";
  prev.textContent = "Prev";
  prev.disabled = state.currentPage === 1;
  prev.addEventListener("click", () => { state.currentPage--; render(); });
  pagination.appendChild(prev);

  for (let p = 1; p <= totalPages; p++) {
    const btn = document.createElement("button");
    btn.className = "page-btn";
    btn.textContent = p;
    if (p === state.currentPage) btn.classList.add("active");
    btn.addEventListener("click", () => { state.currentPage = p; render(); });
    pagination.appendChild(btn);
  }

  const next = document.createElement("button");
  next.className = "page-btn";
  next.textContent = "Next";
  next.disabled = state.currentPage === totalPages;
  next.addEventListener("click", () => { state.currentPage++; render(); });
  pagination.appendChild(next);
}
