async function checkAuth() {
  const data = await apiFetch("/auth/check");
  if (!data || data.message !== "OK") {
    navigateTo("login.html");
  } else {
    document.getElementById("usernameLabel").textContent =
      data.username + "/pomodoro";
    document.getElementById("rankBadge").textContent = data.rank;
    currentUsername = data.username;
  }
}

async function logout() {
  await apiFetch("/auth/logout", "POST");
  navigateTo("login.html");
}

function formatMinutes(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

const MEDAL = ["🥇", "🥈", "🥉"];

let currentUsername = "";
let currentPeriod = "month";

async function loadMyStats() {
  const data = await apiFetch(`/leaderboard/me?period=month`);
  if (!data) return;
  document.getElementById("myRank").textContent = data.rank;
  document.getElementById("myPosition").textContent = `#${data.position}`;
  document.getElementById("myTime").textContent = formatMinutes(data.minutes);
}

async function loadLeaderboard(period) {
  const list = document.getElementById("leaderboardList");

  list.style.transition = "opacity 0.15s";
  list.style.opacity = "0.35";
  list.style.pointerEvents = "none";

  const data = await apiFetch(`/leaderboard?period=${period}`);

  list.style.opacity = "1";
  list.style.pointerEvents = "";

  if (!data || data.length === 0) {
    list.innerHTML =
      '<div class="text-center text-slate-600 py-8">No data yet.</div>';
    return;
  }

  list.innerHTML = "";
  data.forEach((row) => {
    const isMe = row.username === currentUsername;
    const medal = row.position <= 3 ? MEDAL[row.position - 1] : null;

    const el = document.createElement("div");
    el.className = `flex items-center gap-3 rounded-xl px-4 py-3 transition ${
      isMe
        ? "bg-orange-500/10 ring-1 ring-orange-500/30"
        : "bg-slate-800/40 hover:bg-slate-800/70"
    }`;

    el.innerHTML = `
      <span class="w-8 text-center font-bold ${medal ? "text-2xl leading-none" : "text-base text-slate-500"}">
        ${medal ?? row.position}
      </span>
      <div class="flex flex-1 flex-col gap-0.5 min-w-0">
        <span class="truncate text-sm font-semibold ${isMe ? "text-orange-400" : "text-white"}" data-username></span>
        <span class="text-xs text-slate-500" data-rank></span>
      </div>
      <span class="font-mono text-sm font-semibold ${isMe ? "text-orange-400" : "text-slate-300"}">
        ${formatMinutes(row.minutes)}
      </span>
    `;
    el.querySelector("[data-username]").textContent = row.username;
    el.querySelector("[data-rank]").textContent = row.rank;

    list.appendChild(el);
  });
}

function setActiveTab(period) {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    const isActive = btn.dataset.period === period;
    btn.classList.toggle("active", isActive);
    btn.classList.toggle("bg-slate-700", isActive);
    btn.classList.toggle("text-white", isActive);
    btn.classList.toggle("text-slate-400", !isActive);
  });
}

document.querySelectorAll(".tab-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const period = btn.dataset.period;
    if (period === currentPeriod) return;
    currentPeriod = period;
    setActiveTab(period);
    loadLeaderboard(period);
  });
});

document.getElementById("logoutBtn").addEventListener("click", logout);

checkAuth().then(() => {
  loadMyStats();
  loadLeaderboard(currentPeriod);
});
