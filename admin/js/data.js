// data.js — user list-এর in-memory cache (backend থেকে ভরা হয়)
// আগে dummy array ছিল; এখন আসল data /api/admin/users থেকে আসে।

export let users = [];

// backend থেকে আনা list এখানে বসাই (main.js ডাকে)
export function setUsers(list) {
  users = list;
}
