const express = require("express");
const router = express.Router();
const pool = require("../database");
const authMiddleware = require("../middleware/auth");

const RANKS = [
  { name: "Procrastinator", minMinutes: 0 },
  { name: "Starter", minMinutes: 180 },
  { name: "Focused", minMinutes: 600 },
  { name: "Grinder", minMinutes: 1200 },
  { name: "Consistent", minMinutes: 2100 },
  { name: "Deep Worker", minMinutes: 3300 },
  { name: "Obsessed", minMinutes: 4800 },
  { name: "Legend", minMinutes: 7200 },
];

function getRank(minutes) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (minutes >= r.minMinutes) rank = r;
  }
  return rank.name;
}

function getIntervalClause(period) {
  if (period === "day") return "AND started_at >= NOW() - INTERVAL '1 day'";
  if (period === "month") return "AND started_at >= NOW() - INTERVAL '30 days'";
  return "";
}

// GET /leaderboard?period=day|month|all
router.get("/", authMiddleware, async (req, res) => {
  const period = ["day", "month", "all"].includes(req.query.period)
    ? req.query.period
    : "month";
  const intervalClause = getIntervalClause(period);

  try {
    const result = await pool.query(
      `SELECT u.id, u.username, COALESCE(SUM(s.duration), 0) as minutes
       FROM users u
       LEFT JOIN sessions s ON s.user_id = u.id
         AND s.type = 'work'
         AND s.completed = true
         ${intervalClause}
       GROUP BY u.id, u.username
       ORDER BY minutes DESC
       LIMIT 50`,
    );

    const rows = result.rows.map((row, index) => ({
      position: index + 1,
      username: row.username,
      minutes: parseInt(row.minutes),
      rank: getRank(parseInt(row.minutes)),
    }));

    return res.status(200).json(rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /leaderboard/me?period=day|month|all
router.get("/me", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const period = ["day", "month", "all"].includes(req.query.period)
    ? req.query.period
    : "month";
  const intervalClause = getIntervalClause(period);

  try {
    const minutesResult = await pool.query(
      `SELECT COALESCE(SUM(duration), 0) as minutes
       FROM sessions
       WHERE user_id = $1 AND type = 'work' AND completed = true
       ${intervalClause}`,
      [user_id],
    );

    const minutes = parseInt(minutesResult.rows[0].minutes);

    const positionResult = await pool.query(
      `SELECT COUNT(*) as position
       FROM (
         SELECT user_id, SUM(duration) as total
         FROM sessions
         WHERE type = 'work' AND completed = true ${intervalClause}
         GROUP BY user_id
       ) t
       WHERE t.total > $1`,
      [minutes],
    );

    const position = parseInt(positionResult.rows[0].position) + 1;

    return res.status(200).json({
      minutes,
      rank: getRank(minutes),
      position,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = { router, getRank };
