const username = document.getElementById("username");
const password = document.getElementById("password");
const email = document.getElementById("email");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const errorMsg = document.getElementById("errorMsg");

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove("hidden");
  [username, password].forEach((el) => {
    el.classList.add("ring-red-500/60");
    el.classList.remove("ring-white/5");
  });
}

function clearError() {
  errorMsg.classList.add("hidden");
  [username, password, email].forEach((el) => {
    el.classList.remove("ring-red-500/60");
    el.classList.add("ring-white/5");
  });
}

[username, password, email].forEach((el) => {
  el.addEventListener("focus", clearError);
});

loginBtn.addEventListener("click", async () => {
  clearError();
  loginBtn.disabled = true;
  loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Login';
  try {
    const data = await login(username.value, password.value);
    if (data.message === "Login accepted") {
      navigateTo("index.html");
    } else {
      loginBtn.disabled = false;
      loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i>Login';
      showError(data.message);
    }
  } catch {
    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket mr-2"></i>Login';
    showError("Connection error. Please try again.");
  }
});

registerBtn.addEventListener("click", async () => {
  if (email.classList.contains("opacity-0")) {
    email.classList.remove("opacity-0", "pointer-events-none");
    email.classList.add("pointer-events-auto");
    email.classList.remove("field-in");
    void email.offsetWidth;
    email.classList.add("field-in");
  } else {
    clearError();
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Register';
    try {
      const data = await register(username.value, email.value, password.value);
      if (data.message === "Register is fine") {
        navigateTo("index.html");
      } else {
        registerBtn.disabled = false;
        registerBtn.innerHTML = '<i class="fa-solid fa-user-plus mr-2"></i>Register';
        showError(data.message);
      }
    } catch {
      registerBtn.disabled = false;
      registerBtn.innerHTML = '<i class="fa-solid fa-user-plus mr-2"></i>Register';
      showError("Connection error. Please try again.");
    }
  }
});
