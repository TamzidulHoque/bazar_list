// userView.js — user name-এ ক্লিক করলে তার list দেখায় (read-only modal)

const modal = document.getElementById("viewModal");
const closeBtn = document.getElementById("viewClose");
const title = document.getElementById("viewTitle");
const sub = document.getElementById("viewSub");
const list = document.getElementById("viewList");

export function openUserView(user) {
  title.textContent = user.name + "-এর List";
  sub.textContent = user.email + " · " + user.role;

  list.innerHTML = "";
  if (!user.items || user.items.length === 0) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "কোনো item নেই";
    list.appendChild(li);
  } else {
    // পরে: await fetch("/api/admin/users/" + user.id + "/items")
    for (const item of user.items) {
      const li = document.createElement("li");
      li.textContent = item; // textContent → XSS-safe
      list.appendChild(li);
    }
  }

  modal.classList.add("show");
}

closeBtn.addEventListener("click", () => modal.classList.remove("show"));
// overlay-তে ক্লিক করলেও বন্ধ হবে
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.remove("show");
});
