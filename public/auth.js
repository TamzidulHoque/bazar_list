// ================= Auth (login / signup / profile) =================

const authArea = document.getElementById("authArea");
const authModal = document.getElementById("authModal");
const authTitle = document.getElementById("authTitle");
const authError = document.getElementById("authError");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authToggle = document.getElementById("authToggle");
const authClose = document.getElementById("authClose");
const passModal = document.getElementById("passModal");
const passClose = document.getElementById("passClose");
const passError = document.getElementById("passError");
const currentPass = document.getElementById("currentPass");
const newPass = document.getElementById("newPass");
const passSubmit = document.getElementById("passSubmit");

let authMode = "login"; // "login" অথবা "signup"

// ---- localStorage-এ token/user রাখা-পড়া ----
function getUser() { return JSON.parse(localStorage.getItem("bazar_user") || "null"); }
function setAuth(token, user) {
    localStorage.setItem("bazar_token", token);
    localStorage.setItem("bazar_user", JSON.stringify(user));
}
function clearAuth() {
    localStorage.removeItem("bazar_token");
    localStorage.removeItem("bazar_user");
}

// ---- nav-এ Login বাটন বা Profile dropdown আঁকি ----
function renderAuthArea() {
    authArea.innerHTML = "";
    const user = getUser();

    if (!user) {
        const btn = document.createElement("button");
        btn.className = "nav-btn";
        btn.textContent = "Login";
        btn.addEventListener("click", openModal);
        authArea.appendChild(btn);
        return;
    }

    // logged in → Profile dropdown
    const wrap = document.createElement("div");
    wrap.className = "profile-wrap";

    const btn = document.createElement("button");
    btn.className = "nav-btn";
    btn.textContent = user.name + " ▾";

    const menu = document.createElement("div");
    menu.className = "profile-menu";
    menu.innerHTML = `
    <button class="menu-item" id="editProfileBtn">Edit Profile</button>
    <button class="menu-item" id="changePassBtn">Change Password</button>
    <button class="menu-item" id="logoutBtn">Logout</button>
  `;

    btn.addEventListener("click", () => menu.classList.toggle("show"));

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    authArea.appendChild(wrap);

    document.getElementById("logoutBtn").addEventListener("click", logout);
    document.getElementById("editProfileBtn").addEventListener("click", () => alert("Edit Profile — পরের step-এ 🙂"));
    document.getElementById("changePassBtn").addEventListener("click", openPassModal);
}

// ---- modal খোলা/বন্ধ ----
function openModal() {
    authMode = "login";
    updateModalMode();
    authError.textContent = "";
    authModal.classList.add("show");
}
function closeModal() {
    authModal.classList.remove("show");
    authName.value = authEmail.value = authPassword.value = "";
}
function updateModalMode() {
    const isLogin = authMode === "login";
    authTitle.textContent = isLogin ? "Login" : "Sign up";
    authSubmit.textContent = isLogin ? "Login" : "Sign up";
    authName.style.display = isLogin ? "none" : "block";
    authToggle.textContent = isLogin ? "Account নেই? Sign up করুন" : "Account আছে? Login করুন";
}

authClose.addEventListener("click", closeModal);
authToggle.addEventListener("click", () => {
    authMode = authMode === "login" ? "signup" : "login";
    authError.textContent = "";
    updateModalMode();
});

function openPassModal() {
    passError.textContent = "";
    currentPass.value = "";
    newPass.value = "";
    passModal.classList.add("show");
}
passClose.addEventListener("click", () => passModal.classList.remove("show"));

passSubmit.addEventListener("click", async () => {
    passError.style.color = "salmon";
    passError.textContent = "";
    const currentPassword = currentPass.value;
    const newPassword = newPass.value;

    if (!currentPassword || !newPassword) {
        passError.textContent = "দুটো field-ই পূরণ করুন";
        return;
    }

    try {
        const res = await fetch("/api/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("bazar_token"),
            },
            body: JSON.stringify({ currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) { passError.textContent = data.error; return; }

        passError.style.color = "lightgreen";
        passError.textContent = "✅ Password বদলেছে!";
        setTimeout(() => passModal.classList.remove("show"), 1200);
    } catch (err) {
        passError.textContent = "নেটওয়ার্ক সমস্যা";
    }
});

// ---- submit: fetch দিয়ে API-কে ডাকি ----
authSubmit.addEventListener("click", async () => {
    authError.style.color = "salmon";
    authError.textContent = "";
    const email = authEmail.value.trim();
    const password = authPassword.value;

    try {
        if (authMode === "signup") {
            const name = authName.value.trim();
            const res = await fetch("/api/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });
            const data = await res.json();
            if (!res.ok) { authError.textContent = data.error; return; }
            // signup সফল → login mode-এ ফিরি
            authMode = "login";
            updateModalMode();
            authError.style.color = "lightgreen";
            authError.textContent = "Account তৈরি হয়েছে! এখন login করুন।";
            return;
        }

        // login
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) { authError.textContent = data.error; return; }

        setAuth(data.token, data.user); // token + user সেভ
        closeModal();
        renderAuthArea();
        loadItems();                      // nav-এ Profile দেখাও
    } catch (err) {
        authError.textContent = "নেটওয়ার্ক সমস্যা";
    }
});

async function logout() {
    try {
        await fetch("/api/logout", { method: "POST" });
    } catch (err) { }

    clearAuth();          // token + user মুছি
    clearGuestItems();    // ⭐ list-ও মুছি (array + localStorage + পর্দা)
    renderAuthArea();     // nav আবার Signup/Login দেখাবে
}



// প্রথমবার nav আঁকি
renderAuthArea();
