// data.js — dummy users (পরে backend /api/admin/users থেকে আসবে)
// প্রতিটা user: id, name, email, role (user|manager|admin), is_active, items[]

export const users = [
  { id: 1, name: "Tahmid",  email: "tamzidultahmid@gmail.com", role: "admin",   is_active: true,  items: ["Rice", "Oil", "Salt"] },
  { id: 2, name: "Saadman", email: "saadman@gmail.com",        role: "manager", is_active: true,  items: ["Notebook", "Pen"] },
  { id: 3, name: "Rakib",   email: "rakib@gmail.com",          role: "user",    is_active: true,  items: ["Milk", "Bread", "Egg", "Butter"] },
  { id: 4, name: "Nabila",  email: "nabila@gmail.com",         role: "user",    is_active: false, items: [] },
  { id: 5, name: "Hasan",   email: "hasan@gmail.com",          role: "user",    is_active: true,  items: ["Soap", "Shampoo"] },
];
