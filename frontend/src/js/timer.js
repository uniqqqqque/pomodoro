let mode = "work";
let pomodoroCount = 0;
const workTime = 1500;
const shortBreak = 300;
const longBreak = 900;

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
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  intervalId = setInterval(() => {
    timeLeft--;
    updateDisplay();
    if (timeLeft <= 0) {
      clearInterval(intervalId);
      isRunning = false;
      switchMode();
      updateDisplay();
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

document.getElementById("startBtn").addEventListener("click", startTimer);
document.getElementById("pauseBtn").addEventListener("click", pauseTimer);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
