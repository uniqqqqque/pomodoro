const username = document.getElementById("username");
const password = document.getElementById("password");
const confirmPassword = document.getElementById("confirmPassword");
const confirmPasswordWrapper = document.getElementById("confirmPasswordWrapper");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const errorMsg = document.getElementById("errorMsg");

function setupEyeToggle(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  btn.addEventListener("click", () => {
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    btn.querySelector("i").className = show
      ? "fa-regular fa-eye-slash text-sm"
      : "fa-regular fa-eye text-sm";
  });
}
setupEyeToggle("password", "togglePassword");
setupEyeToggle("confirmPassword", "toggleConfirmPassword");

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
  [username, password, confirmPassword].forEach((el) => {
    el.classList.remove("ring-red-500/60");
    el.classList.add("ring-white/5");
  });
}

[username, password, confirmPassword].forEach((el) => {
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
  if (confirmPasswordWrapper.classList.contains("opacity-0")) {
    confirmPasswordWrapper.classList.remove("opacity-0", "pointer-events-none");
    confirmPasswordWrapper.classList.add("pointer-events-auto");
    confirmPasswordWrapper.classList.remove("field-in");
    void confirmPasswordWrapper.offsetWidth;
    confirmPasswordWrapper.classList.add("field-in");
  } else {
    if (password.value !== confirmPassword.value) {
      showError("Passwords do not match");
      confirmPassword.classList.add("ring-red-500/60");
      confirmPassword.classList.remove("ring-white/5");
      return;
    }
    clearError();
    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Register';
    try {
      const data = await register(username.value, password.value);
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
