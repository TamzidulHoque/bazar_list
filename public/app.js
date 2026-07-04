// ============ Guest List (localStorage) + Pagination ============

const STORAGE_KEY = "bazar_guest_items";
const PAGE_SIZE = 10;   // প্রতি পেজে সর্বোচ্চ ১০টা item
let currentPage = 1;
let editingIndex = null;    // এখন কোন পেজে আছি

let items = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const itemInput = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const itemList = document.getElementById("itemList");
const clearAllBtn = document.getElementById("clearAllBtn");
const saveForFutureBtn = document.getElementById("saveForFutureBtn");
const pagination = document.getElementById("pagination");
const home_Btn = document.getElementById("homeBtn");

function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function render() {
    itemList.innerHTML = "";

    const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * PAGE_SIZE;
    const pageItems = items.slice(start, start + PAGE_SIZE);

    pageItems.forEach((text, i) => {
        const index = start + i;

        const li = document.createElement("li");
        li.className = "item";

        if (index === editingIndex) {
            // ---------- EDIT MODE: input + Save + Cancel ----------
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
            cancelBtn.addEventListener("click", () => {
                editingIndex = null;
                render();
            });

            // Enter চাপলে Save, Escape চাপলে Cancel
            input.addEventListener("keydown", (e) => {
                if (e.key === "Enter") saveEdit(index, input.value);
                if (e.key === "Escape") { editingIndex = null; render(); }
            });

            li.appendChild(input);
            li.appendChild(saveBtn);
            li.appendChild(cancelBtn);
        } else {
            // ---------- NORMAL MODE: span + Edit + Delete ----------
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

    renderPagination(totalPages);

    // edit mode হলে input-টায় নিজে থেকে ফোকাস দিই (সাথে সাথে টাইপ করা যায়)
    const activeInput = itemList.querySelector(".edit-input");
    if (activeInput) activeInput.focus();
}
function renderPagination(totalPages) {
    pagination.innerHTML = "";

    // ১ পেজ (১০ বা কম item) হলে page number দেখাব না
    if (totalPages <= 1) return;

    // Prev বাটন
    const prev = document.createElement("button");
    prev.className = "page-btn";
    prev.textContent = "Prev";
    prev.disabled = currentPage === 1;                 // ১ম পেজে Prev নিষ্ক্রিয়
    prev.addEventListener("click", () => { currentPage--; render(); });
    pagination.appendChild(prev);

    // 1, 2, 3 ... সংখ্যাগুলো
    for (let p = 1; p <= totalPages; p++) {
        const btn = document.createElement("button");
        btn.className = "page-btn";
        btn.textContent = p;
        if (p === currentPage) btn.classList.add("active"); // বর্তমান পেজ হাইলাইট
        btn.addEventListener("click", () => { currentPage = p; render(); });
        pagination.appendChild(btn);
    }

    // Next বাটন
    const next = document.createElement("button");
    next.className = "page-btn";
    next.textContent = "Next";
    next.disabled = currentPage === totalPages;        // শেষ পেজে Next নিষ্ক্রিয়
    next.addEventListener("click", () => { currentPage++; render(); });
    pagination.appendChild(next);
}

function addItem() {
    const text = itemInput.value.trim();
    if (!text) return;
    items.push(text);
    save();
    currentPage = Math.ceil(items.length / PAGE_SIZE); // নতুন item যে পেজে গেল সেখানে যাই
    render();
    itemInput.value = "";
    itemInput.focus();
}

// Edit বাটনে ক্লিক → শুধু state বদলাই, তারপর render নতুন করে আঁকে
function editItem(index) {
    editingIndex = index;
    render();
}

// input-এর লেখা array-তে বসাই
function saveEdit(index, value) {
    const newText = value.trim();
    if (newText) {           // খালি হলে বদলাব না
        items[index] = newText;
        save();
    }
    editingIndex = null;     // edit mode বন্ধ
    render();
}

function deleteItem(index) {
    items.splice(index, 1);
    save();
    render();
}

function clearAll() {
    if (items.length === 0) return;
    if (confirm("সব item মুছে ফেলবেন?")) {
        items = [];
        currentPage = 1;
        save();
        render();
    }
}

addBtn.addEventListener("click", addItem);
itemInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") addItem();
});
clearAllBtn.addEventListener("click", clearAll);

// logout-এর সময় guest list পুরো মুছে ফেলি (array + localStorage + পর্দা)
function clearGuestItems() {
    items = [];
    currentPage = 1;
    localStorage.removeItem(STORAGE_KEY); // ⭐ সঠিক key ব্যবহার হচ্ছে
    render();
}


function isLoggedIn() {
    return !!localStorage.getItem("bazar_token");
}

// list কোথা থেকে আসবে ঠিক করি: server (account) নাকি localStorage (guest)
async function loadItems() {
    const guestList = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // login করা + guest list খালি → account-এর সেভ করা list আনি
    if (isLoggedIn() && guestList.length === 0) {
        try {
            const res = await fetch("/api/items", {
                headers: { Authorization: "Bearer " + localStorage.getItem("bazar_token") },
            });
            const data = await res.json();
            items = res.ok ? data.items.map((row) => row.title) : [];
        } catch (err) {
            items = [];
        }
    } else {
        // guest, বা login করা কিন্তু হাতে list আছে → guest list দেখাই
        items = guestList;
    }

    currentPage = 1;
    render();
}

saveForFutureBtn.addEventListener("click", async () => {
    const token = localStorage.getItem("bazar_token");

    // login না করা থাকলে → notification
    if (!token) {
        alert("📌 List সেভ করে রাখতে হলে আগে signup / login করতে হবে।");
        return;
    }

    try {
        const res = await fetch("/api/items/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token,   // ⭐ token পাঠাই
            },
            body: JSON.stringify({ items: items }),  // পুরো guest list পাঠাই
        });
        const data = await res.json();
        if (!res.ok) { alert("❌ " + data.error); return; }

        alert(`✅ তোমার list account-এ সেভ হয়েছে! (${data.count}টি item)`);
        // localStorage copy রেখে দিলাম (তুমি চেয়েছ)
    } catch (err) {
        alert("নেটওয়ার্ক সমস্যা");
    }

});

home_Btn.addEventListener("click", async () => {
    alert("Home is not available for now")
});

loadItems();
