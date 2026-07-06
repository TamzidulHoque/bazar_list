// render.js — পুরো পর্দা আঁকে (tabs + list + pagination একসাথে)

import { state, items, PAGE_SIZE } from "./store.js";
import { renderTabs } from "./tabs.js";
import { renderList } from "./list.js";
import { renderPagination } from "./pagination.js";

export function render() {
  const totalPages = Math.max(1, Math.ceil(items().length / PAGE_SIZE));
  if (state.currentPage > totalPages) state.currentPage = totalPages;

  renderTabs();
  renderList(totalPages);
  renderPagination(totalPages);
}
