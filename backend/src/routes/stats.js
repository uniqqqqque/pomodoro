const express = require("express");
const router = express.Router();
const pool = require("../database");
const authMiddleware = require("../middleware/auth");

// all-time total focus minutes
router.get("/total", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  try {
    const total = await pool.query(
      "SELECT COUNT(*) as total_sessions, SUM(duration) as total_minutes FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true",
      [user_id],
    );
    return res.status(200).json(total.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// today's focus minutes — offset is the user's utc offset in minutes so we compare local dates
router.get("/today", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const utcOffset = parseInt(req.query.utcOffset) || 0;
  try {
    const today = await pool.query(
      "SELECT COUNT(*) as today_sessions, SUM(duration) as today_minutes FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true AND DATE(started_at + make_interval(mins => $2)) = DATE(NOW() + make_interval(mins => $2))",
      [user_id, utcOffset],
    );
    return res.status(200).json(today.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// last 7 days
router.get("/week", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  try {
    const week = await pool.query(
      "SELECT COUNT(*) as week_sessions, SUM(duration) as week_minutes FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true AND started_at >= CURRENT_DATE - INTERVAL '7 days'",
      [user_id],
    );
    return res.status(200).json(week.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// minutes per hour for today's bar chart — offset applied so hours match local time
router.get("/activity", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const utcOffset = parseInt(req.query.utcOffset) || 0;
  try {
    const activity = await pool.query(
      "SELECT EXTRACT(HOUR FROM started_at + make_interval(mins => $2)) as hour, SUM(duration) as minutes FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true AND DATE(started_at + make_interval(mins => $2)) = DATE(NOW() + make_interval(mins => $2)) GROUP BY hour ORDER BY hour",
      [user_id, utcOffset],
    );
    return res.status(200).json(activity.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

// session counts per day for the last 365 days — used to draw the heatmap
router.get("/heatmap", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const utcOffset = parseInt(req.query.utcOffset) || 0;
  try {
    const heatmap = await pool.query(
      "SELECT DATE(started_at + make_interval(mins => $2)) as date, COUNT(*) as sessions FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true AND started_at >= NOW() - INTERVAL '365 days' GROUP BY date ORDER BY date",
      [user_id, utcOffset],
    );
    return res.status(200).json(heatmap.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
