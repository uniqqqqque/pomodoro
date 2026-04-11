const username = document.getElementById("username");
const password = document.getElementById("password");
const email = document.getElementById("email");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");

loginBtn.addEventListener("click", async () => {
  const data = await login(username.value, password.value);
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "index.html";
  } else {
    alert(data.message);
  }
});

registerBtn.addEventListener("click", async () => {
  if (email.classList.contains("opacity-0")) {
    email.classList.remove("opacity-0", "pointer-events-none");
    email.classList.add("opacity-100", "pointer-events-auto");
  } else {
    const data = await register(username.value, email.value, password.value);
    if (data.token) {
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      alert(data.message);
    }
  }
});
