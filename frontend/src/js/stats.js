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

function formatMinutes(minutes) {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

async function loadStats() {
  const utcOffset = -new Date().getTimezoneOffset();
  const total = await apiFetch("/stats/total");
  const today = await apiFetch(`/stats/today?utcOffset=${utcOffset}`);
  const week = await apiFetch("/stats/week");
  const activity = await apiFetch(`/stats/activity?utcOffset=${utcOffset}`);
  const heatmap = await apiFetch(`/stats/heatmap?utcOffset=${utcOffset}`);

  document.getElementById("total").textContent = formatMinutes(
    total[0]?.total_minutes || 0,
  );
  document.getElementById("today").textContent = formatMinutes(
    today[0]?.today_minutes || 0,
  );
  document.getElementById("week").textContent = formatMinutes(
    week[0]?.week_minutes || 0,
  );

  const activityByHour = Array.from({ length: 24 }, (_, i) => {
    const found = activity.find((h) => parseInt(h.hour) === i);
    return found ? parseInt(found.minutes) : 0;
  });

  new Chart(document.getElementById("activity"), {
    type: "bar",
    data: {
      labels: Array.from(
        { length: 24 },
        (_, i) => i.toString().padStart(2, "0") + ":00",
      ),
      datasets: [
        {
          label: "Session",
          data: activityByHour,
          backgroundColor: "#f97316",
        },
      ],
    },
    options: {
      plugins: {
        legend: { display: false },
      },
    },
  });

  const streak = calcStreak(heatmap);
  document.getElementById("streak").textContent = streak;

  const activeDays = heatmap.filter((d) => parseInt(d.sessions) > 0).length;
  const avgMinutes =
    activeDays > 0 ? Math.round(total[0].total_minutes / activeDays) : 0;
  document.getElementById("avgday").textContent = formatMinutes(avgMinutes);

  renderHeatmap(heatmap);
}

function calcStreak(heatmapData) {
  const sessionMap = {};
  heatmapData.forEach((d) => {
    sessionMap[d.date.split("T")[0]] = parseInt(d.sessions);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  const cur = new Date(today);
  while (true) {
    const dateStr = cur.toISOString().split("T")[0];
    if (sessionMap[dateStr] > 0) {
      streak++;
      cur.setDate(cur.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function renderHeatmap(data) {
  const container = document.getElementById("heatmap");
  container.innerHTML = "";

  const CELL = 11;
  const GAP = 3;
  const STEP = CELL + GAP;
  const LEFT_PAD = 28;
  const TOP_PAD = 20;
  const MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const sessionMap = {};
  data.forEach((d) => {
    sessionMap[d.date.split("T")[0]] = parseInt(d.sessions);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 52 * 7);
  startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));

  const days = [];
  const cur = new Date(startDate);
  while (cur <= today) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }

  const totalWeeks = Math.ceil(days.length / 7);
  const svgW = LEFT_PAD + totalWeeks * STEP;
  const svgH = TOP_PAD + 7 * STEP;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", svgW);
  svg.setAttribute("height", svgH);

  function getColor(n) {
    if (!n) return "#1e293b";
    if (n <= 2) return "#7c2d12";
    if (n <= 4) return "#c2410c";
    if (n <= 7) return "#ea580c";
    return "#f97316";
  }

  // Month labels
  let lastMonth = -1;
  days.forEach((date, i) => {
    const week = Math.floor(i / 7);
    if ((date.getDay() + 6) % 7 === 0 && date.getMonth() !== lastMonth) {
      lastMonth = date.getMonth();
      const text = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text",
      );
      text.setAttribute("x", LEFT_PAD + week * STEP);
      text.setAttribute("y", TOP_PAD - 6);
      text.setAttribute("font-size", "10");
      text.setAttribute("font-family", "JetBrains Mono, monospace");
      text.setAttribute("fill", "#64748b");
      text.textContent = MONTHS[date.getMonth()];
      svg.appendChild(text);
    }
  });

  // Day labels
  ["Mon", "", "Wed", "", "Fri", "", ""].forEach((label, i) => {
    if (!label) return;
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", LEFT_PAD - 4);
    text.setAttribute("y", TOP_PAD + i * STEP + CELL);
    text.setAttribute("font-size", "10");
    text.setAttribute("font-family", "JetBrains Mono, monospace");
    text.setAttribute("fill", "#64748b");
    text.setAttribute("text-anchor", "end");
    text.textContent = label;
    svg.appendChild(text);
  });

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.style.cssText =
    "position:fixed;background:#0f172a;color:#f1f5f9;padding:5px 10px;border-radius:8px;font-size:11px;font-family:'JetBrains Mono',monospace;pointer-events:none;opacity:0;transition:opacity 0.12s;z-index:100;border:1px solid rgba(255,255,255,0.08);";
  document.body.appendChild(tooltip);

  // Cells
  days.forEach((date, i) => {
    const week = Math.floor(i / 7);
    const dow = (date.getDay() + 6) % 7;
    const dateStr = date.toISOString().split("T")[0];
    const count = sessionMap[dateStr] || 0;

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", LEFT_PAD + week * STEP);
    rect.setAttribute("y", TOP_PAD + dow * STEP);
    rect.setAttribute("width", CELL);
    rect.setAttribute("height", CELL);
    rect.setAttribute("rx", 2);
    rect.setAttribute("fill", getColor(count));
    rect.style.cursor = "default";

    rect.addEventListener("mouseenter", (e) => {
      const label =
        count === 0 ? "No sessions" : `${count} session${count > 1 ? "s" : ""}`;
      tooltip.textContent = `${label} · ${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
      tooltip.style.opacity = "1";
      tooltip.style.left = e.clientX + 14 + "px";
      tooltip.style.top = e.clientY - 36 + "px";
    });

    rect.addEventListener("mousemove", (e) => {
      tooltip.style.left = e.clientX + 14 + "px";
      tooltip.style.top = e.clientY - 36 + "px";
    });

    rect.addEventListener("mouseleave", () => {
      tooltip.style.opacity = "0";
    });

    svg.appendChild(rect);
  });

  container.appendChild(svg);
}

loadStats();
document.getElementById("logoutBtn").addEventListener("click", logout);
