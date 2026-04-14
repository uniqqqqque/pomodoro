async function checkAuth() {
  const data = await apiFetch("/auth/check");
  if (!data || data.message !== "OK") {
    navigateTo("login.html");
  } else {
    document.getElementById("usernameLabel").textContent =
      data.username + "/pomodoro";
    document.getElementById("rankBadge").textContent = data.rank;
  }
}
checkAuth();

async function logout() {
  await apiFetch("/auth/logout", "POST");
  navigateTo("login.html");
}

let mode = "work";
let pomodoroCount = 0;
let workTime = 1500;
let shortBreak = 300;
let longBreak = 900;
let pomodorosUntilLongBreak = 4;
const audio = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/765/765-preview.mp3",
);

let timeLeft = workTime;
let isRunning = false;
let intervalId = null;
let sessionStartedAt = null;

const icons = {
  work: "fa-brain",
  short_break: "fa-mug-hot",
  long_break: "fa-couch",
};

const modeIcon = document.getElementById("modeIcon");
const modeLabel = document.getElementById("modeLabel");

const modeLabels = {
  work: "Focus",
  short_break: "Short Break",
  long_break: "Long Break",
};

modeIcon.className = `fa-solid ${icons[mode]} text-base text-orange-400`;

function renderDots() {
  const container = document.getElementById("dotsContainer");
  container.innerHTML = "";
  for (let i = 0; i < pomodorosUntilLongBreak; i++) {
    const dot = document.createElement("div");
    dot.id = `dot${i}`;
    dot.className = "h-1.5 w-7 rounded-full bg-slate-700";
    container.appendChild(dot);
  }
}

function updateDots() {
  const filled = pomodoroCount % pomodorosUntilLongBreak;
  for (let i = 0; i < pomodorosUntilLongBreak; i++) {
    const dot = document.getElementById(`dot${i}`);
    if (dot) {
      dot.className = `h-1.5 w-7 rounded-full transition-all duration-500 ${i < filled ? "bg-orange-400" : "bg-slate-700"}`;
    }
  }
}

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateDisplay() {
  const timer = document.getElementById("timer");
  timer.textContent = formatTime(timeLeft);
  const color = mode === "work" ? "text-orange-400" : "text-green-400";
  document.getElementById("modeIcon").className =
    `fa-solid ${icons[mode]} text-base ${color}`;
  modeLabel.className = `text-2xl font-semibold tracking-widest uppercase ${color}`;
  modeLabel.textContent = modeLabels[mode];
  updateDots();
  const ring = document.getElementById("progressRing");
  if (mode === "work") {
    ring.style.stroke = "#f97316";
  } else {
    ring.style.stroke = "#4ade80";
  }
  const circumference = 879.6;
  let totalTime;
  if (mode === "work") {
    totalTime = workTime;
  } else if (mode === "short_break") {
    totalTime = shortBreak;
  } else {
    totalTime = longBreak;
  }
  const offset = circumference * (1 - timeLeft / totalTime);
  ring.style.strokeDashoffset = offset;
}

async function startTimer() {
  if (isRunning) return;
  isRunning = true;
  if (!sessionStartedAt) sessionStartedAt = new Date().toISOString();
  intervalId = setInterval(async () => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      document.getElementById("startBtn").innerHTML =
        '<i class="fa-solid fa-play"></i>';
      if (mode === "work") {
        await apiFetch("/sessions", "POST", {
          duration: Math.round(workTime / 60),
          type: "work",
          completed: true,
          started_at: sessionStartedAt,
        });
        sessionStartedAt = null;
      }
      if (mode === "work") {
        showNotification("Break time!", "Take a great chill!");
      } else {
        showNotification("Work Time!", "Cmon, just finish your work!");
      }
      switchMode();
      updateDisplay();
      if (isSoundEnabled()) {
        audio.currentTime = 0;
        audio.play();
      }
      if (isAutoResumeEnabled()) {
        startTimer();
        document.getElementById("startBtn").innerHTML =
          '<i class="fa-solid fa-pause"></i>';
      }
    }
  }, 1000);
}

function pauseTimer() {
  if (!isRunning) return;
  clearInterval(intervalId);
  isRunning = false;
}

function resetTimer() {
  isRunning = false;
  clearInterval(intervalId);
  timeLeft = workTime;
  pomodoroCount = 0;
  mode = "work";
  localStorage.removeItem("pomodoroTimerState");
  sessionStartedAt = null;
  updateDisplay();
  updateDots();
}

function switchMode() {
  if (mode === "work") {
    pomodoroCount++;
    if (pomodoroCount % pomodorosUntilLongBreak === 0) {
      mode = "long_break";
      timeLeft = longBreak;
    } else {
      mode = "short_break";
      timeLeft = shortBreak;
    }
  } else {
    mode = "work";
    timeLeft = workTime;
  }
}

function requestNotificationPermission() {
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function isSoundEnabled() {
  return document.getElementById("toggleSound").classList.contains("active");
}

function isAutoResumeEnabled() {
  return document
    .getElementById("toggleAutoResume")
    .classList.contains("active");
}

function isNotificationsEnabled() {
  return document
    .getElementById("toggleNotifications")
    .classList.contains("active");
}

function showNotification(title, body) {
  if (isNotificationsEnabled() && Notification.permission === "granted") {
    new Notification(title, { body, icon: "🍅" });
  }
}

requestNotificationPermission();

document.getElementById("toggleNotifications").addEventListener("click", () => {
  const btn = document.getElementById("toggleNotifications");
  const isNowActive = btn.classList.contains("active");
  if (isNowActive && Notification.permission === "default") {
    Notification.requestPermission().then((result) => {
      if (result === "denied") {
        btn.classList.remove("active");
      }
    });
  }
  if (isNowActive && Notification.permission === "denied") {
    btn.classList.remove("active");
  }
});

const startBtn = document.getElementById("startBtn");

startBtn.addEventListener("click", () => {
  if (isRunning) {
    pauseTimer();
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
  } else {
    startTimer();
    startBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  resetTimer();
  startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
});

document.getElementById("logoutBtn").addEventListener("click", logout);

document.getElementById("settingPomodoro").addEventListener("change", (e) => {
  const val = Math.max(1, parseInt(e.target.value) || 1);
  e.target.value = val;
  workTime = val * 60;
  if (mode === "work" && !isRunning) {
    timeLeft = workTime;
    updateDisplay();
  }
  saveSettings();
});

document.getElementById("settingShortBreak").addEventListener("change", (e) => {
  const val = Math.max(1, parseInt(e.target.value) || 1);
  e.target.value = val;
  shortBreak = val * 60;
  if (mode === "short_break" && !isRunning) {
    timeLeft = shortBreak;
    updateDisplay();
  }
  saveSettings();
});

document.getElementById("settingLongBreak").addEventListener("change", (e) => {
  const val = Math.max(1, parseInt(e.target.value) || 1);
  e.target.value = val;
  longBreak = val * 60;
  if (mode === "long_break" && !isRunning) {
    timeLeft = longBreak;
    updateDisplay();
  }
  saveSettings();
});

document
  .getElementById("settingPomodorosUntil")
  .addEventListener("change", (e) => {
    const val = Math.max(1, parseInt(e.target.value) || 1);
    e.target.value = val;
    pomodorosUntilLongBreak = val;
    renderDots();
    updateDots();
    saveSettings();
  });

function saveTimerState() {
  localStorage.setItem(
    "pomodoroTimerState",
    JSON.stringify({ timeLeft, mode, pomodoroCount }),
  );
}

function loadTimerState() {
  const raw = localStorage.getItem("pomodoroTimerState");
  if (!raw) return false;
  const s = JSON.parse(raw);
  timeLeft = s.timeLeft;
  mode = s.mode;
  pomodoroCount = s.pomodoroCount;
  return true;
}

function saveSettings() {
  localStorage.setItem(
    "pomodoroSettings",
    JSON.stringify({
      workTime,
      shortBreak,
      longBreak,
      pomodorosUntilLongBreak,
    }),
  );
}

function loadSettings() {
  const s = JSON.parse(localStorage.getItem("pomodoroSettings") || "{}");
  if (s.workTime) {
    workTime = s.workTime;
    document.getElementById("settingPomodoro").value = workTime / 60;
  }
  if (s.shortBreak) {
    shortBreak = s.shortBreak;
    document.getElementById("settingShortBreak").value = shortBreak / 60;
  }
  if (s.longBreak) {
    longBreak = s.longBreak;
    document.getElementById("settingLongBreak").value = longBreak / 60;
  }
  if (s.pomodorosUntilLongBreak) {
    pomodorosUntilLongBreak = s.pomodorosUntilLongBreak;
    document.getElementById("settingPomodorosUntil").value =
      pomodorosUntilLongBreak;
  }
  timeLeft = workTime;
  renderDots();
  updateDisplay();
}

loadSettings();
if (loadTimerState()) updateDisplay();

document
  .querySelector('a[href="stats.html"]')
  .addEventListener("click", (e) => {
    e.preventDefault();
    pauseTimer();
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    saveTimerState();
    navigateTo("stats.html");
  });

document
  .querySelector('a[href="leaderboard.html"]')
  .addEventListener("click", (e) => {
    e.preventDefault();
    pauseTimer();
    startBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    saveTimerState();
    navigateTo("leaderboard.html");
  });
