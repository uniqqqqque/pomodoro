const API_URL = "https://pomodoro.poliscuks.id.lv/api";

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

async function register(username, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
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
