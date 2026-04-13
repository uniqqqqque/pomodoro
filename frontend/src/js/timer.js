async function checkAuth() {
  const data = await apiFetch("/auth/check");
  if (!data || data.message === "No token provided") {
    window.location.href = "login.html";
  }
}
checkAuth();

async function logout() {
  await apiFetch("/auth/logout", "POST");
  window.location.href = "login.html";
}

let mode = "work";
let pomodoroCount = 0;
const workTime = 1500;
const shortBreak = 300;
const longBreak = 900;
const audio = new Audio(
  "https://assets.mixkit.co/active_storage/sfx/765/765-preview.mp3",
);

let timeLeft = workTime;
let isRunning = false;
let intervalId = null;

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

modeIcon.className = `fa-solid ${icons[mode]} text-base text-slate-500`;

function updateDots() {
  const filled = pomodoroCount % 4;
  for (let i = 0; i < 4; i++) {
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
  document.getElementById("modeIcon").className =
    `fa-solid ${icons[mode]} text-base text-slate-500`;
  modeLabel.textContent = modeLabels[mode];
  updateDots();
  const ring = document.getElementById("progressRing");
  if (mode === "work") {
    ring.style.stroke = "#f97316"; // оранжевый
  } else {
    ring.style.stroke = "#4ade80"; // зелёный
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
  intervalId = setInterval(async () => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      if (mode === "work") {
        await apiFetch("/sessions", "POST", {
          duration: Math.round(workTime / 60),
          type: "work",
          completed: true,
        });
      }
      if (mode === "work") {
        showNotification("Break time!", "Take a great chill!");
      } else {
        showNotification("Work Time!", "Cmon, just finish your work!");
      }
      switchMode();
      updateDisplay();
      audio.play();
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
  updateDisplay();
  updateDots();
}

function switchMode() {
  if (mode === "work") {
    pomodoroCount++;
    if (pomodoroCount % 4 === 0) {
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

function showNotification(title, body) {
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "🍅" });
  }
}

requestNotificationPermission();

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
// document.getElementById("statsBtn").addEventListener("click", stats);
document.getElementById("logoutBtn").addEventListener("click", logout);
