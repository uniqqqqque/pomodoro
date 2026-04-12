if (!localStorage.getItem("token")) {
  window.location.href = "login.html";
}

function formatMinutes(minutes) {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
}

async function loadStats() {
  const total = await apiFetch("/stats/total");
  const today = await apiFetch("/stats/today");
  const week = await apiFetch("/stats/week");
  const activity = await apiFetch("/stats/activity");
  const heatmap = await apiFetch("/stats/heatmap");

  document.getElementById("total").textContent = formatMinutes(
    total[0].total_minutes,
  );
  document.getElementById("today").textContent = formatMinutes(
    today[0].today_minutes,
  );
  document.getElementById("week").textContent = formatMinutes(
    week[0].week_minutes,
  );

  new Chart(document.getElementById("activity"), {
    type: "bar",
    data: {
      labels: activity.map((h) => h.hour + ":00"),
      datasets: [
        {
          label: "Session",
          data: activity.map((h) => h.minutes),
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

  const cal = new CalHeatmap();
  const heatmapFormatted = heatmap.map((h) => ({
    date: h.date.split("T")[0],
    sessions: parseInt(h.sessions),
  }));

  cal.paint({
    data: { source: heatmapFormatted, x: "date", y: "sessions" },
    date: {
      start: new Date(
        new Date().getFullYear() - 1,
        new Date().getMonth() + 2,
        1,
      ),
    },
    itemSelector: "#heatmap",
    domain: { type: "month" },
    subDomain: { type: "ghDay" },
    theme: "dark",
    range: 12,
    scale: {
      color: {
        range: ["#2d1a00", "#f97316"],
        type: "linear",
        domain: [0, 5],
      },
    },
  });
}

loadStats();
