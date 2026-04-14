const express = require("express");
const router = express.Router();
const pool = require("../database");
const authMiddleware = require("../middleware/auth");
const { body, validationResult } = require("express-validator");

// called when a pomodoro finishes — saves the completed work session
router.post(
  "/",
  authMiddleware,
  [
    body("duration")
      .isInt({ min: 1, max: 1440 })
      .withMessage("Invalid duration"),
    body("type")
      .isIn(["work", "short_break", "long_break"])
      .withMessage("Invalid session type"),
    body("completed").isBoolean().withMessage("Invalid completed value"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user_id = req.user.id;
    const { duration, type, completed, started_at } = req.body;
    try {
      await pool.query(
        "INSERT INTO sessions (user_id, duration, type, completed, started_at) VALUES ($1, $2, $3, $4, $5)",
        // fall back to now() if client didn't send a start time
        [user_id, duration, type, completed, started_at || new Date()],
      );
      return res.status(201).json({ message: "Session created" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Server error" });
    }
  },
);

router.get("/", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  try {
    const sessions = await pool.query(
      "SELECT * FROM sessions WHERE user_id = $1",
      [user_id],
    );
    return res.status(200).json(sessions.rows);
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const user_id = req.user.id;
  const params_id = req.params.id;
  try {
    const { completed } = req.body;
    await pool.query(
      "UPDATE sessions SET completed = $1 WHERE id = $2 AND user_id = $3",
      [completed, params_id, user_id],
    );
    return res.status(200).json({ message: "Session updated" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user.id;
    const params_id = req.params.id;
    await pool.query(
      "DELETE FROM sessions WHERE id = $1 AND user_id = $2",
      [params_id, user_id],
    );
    return res.status(200).json({ message: "Session deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
