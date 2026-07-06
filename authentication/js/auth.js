// authentication/js/auth.js — আলাদা login/signup পেজের লজিক

const authTitle = document.getElementById("authTitle");
const authError = document.getElementById("authError");
const authName = document.getElementById("authName");
const authEmail = document.getElementById("authEmail");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authToggle = document.getElementById("authToggle");

let mode = "login"; // "login" অথবা "signup"

function updateMode() {
  const isLogin = mode === "login";
  authTitle.textContent = isLogin ? "Login" : "Sign up";
  authSubmit.textContent = isLogin ? "Login" : "Sign up";
  authName.style.display = isLogin ? "none" : "block";
  authToggle.textContent = isLogin ? "Account নেই? Sign up করুন" : "Account আছে? Login করুন";
}

authToggle.addEventListener("click", () => {
  mode = mode === "login" ? "signup" : "login";
  authError.textContent = "";
  updateMode();
});

async function submit() {
  authError.style.color = "salmon";
  authError.textContent = "";
  const email = authEmail.value.trim();
  const password = authPassword.value;

  try {
    if (mode === "signup") {
      const name = authName.value.trim();
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) { authError.textContent = data.error; return; }
      // signup সফল → login mode-এ ফিরি
      mode = "login";
      updateMode();
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

    localStorage.setItem("bazar_token", data.token);
    localStorage.setItem("bazar_user", JSON.stringify(data.user));

    // role অনুযায়ী পাঠানো (আপাতত সবাই user page-এ; পরে admin → /admin/)
    window.location.href = "/";
  } catch (err) {
    authError.textContent = "নেটওয়ার্ক সমস্যা";
  }
}

authSubmit.addEventListener("click", submit);
authPassword.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });

updateMode();
