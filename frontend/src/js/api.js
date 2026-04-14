const API_URL =
  location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? `http://${location.hostname}:3002`
    : "https://pomodoro.poliscuks.id.lv/api";

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".animate").forEach((el, i) => {
    el.style.animationDelay = `${i * 120}ms`;
    el.classList.add("stagger-in");
  });
});

function navigateTo(url) {
  document.body.style.transition =
    "opacity 0.15s ease-out, transform 0.15s ease-out";
  document.body.style.opacity = "0";
  document.body.style.transform = "translateY(-6px)";
  setTimeout(() => {
    window.location.href = url;
  }, 160);
}

async function login(username, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data;
}

async function register(username, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data;
}

async function apiFetch(endpoint, method = "GET", body = null) {
  const options = {
    method: method,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  };
  if (body !== null) options.body = JSON.stringify(body);

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();
  return data;
}
