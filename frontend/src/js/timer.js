if (!localStorage.getItem("token")) {
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

const modeNames = {
  work: "Working",
  short_break: "Short Break",
  long_break: "Long Break",
};

function formatTime(seconds) {
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function updateDisplay() {
  const timer = document.getElementById("timer");
  timer.textContent = formatTime(timeLeft);
  document.getElementById("mode").textContent = modeNames[mode];
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

function logout() {
  localStorage.removeItem("token");
  window.location.href = "login.html";
}

requestNotificationPermission();

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
// document.getElementById("statsBtn").addEventListener("click", stats);
document.getElementById("logoutBtn").addEventListener("click", logout);
