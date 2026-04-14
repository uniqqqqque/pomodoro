const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../middleware/auth");
const { getRank } = require("./leaderboard");

router.post(
  "/register",
  [
    body("username")
      .trim()
      .notEmpty()
      .isLength({ min: 2 })
      .matches(/^\S+$/)
      .withMessage("Username cannot contain spaces"),
    body("password")
      .trim()
      .notEmpty()
      .isLength({ min: 6 })
      .matches(/^\S+$/)
      .withMessage("Password cannot contain spaces")
      .matches(/[a-z]/)
      .withMessage("Password must contain at least one lowercase letter")
      .matches(/[A-Z]/)
      .withMessage("Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*]/)
      .withMessage("Password must contain at least one special character")
      .matches(/[0-9]/)
      .withMessage("Password must contain at least one number"),
  ],

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { username, password } = req.body;

      const existingUsername = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username],
      );
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (username, password_hash, created_at) VALUES ($1, $2, NOW())",
        [username, passwordHash],
      );
      res.status(201).json({ message: "Register is fine" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post(
  "/login",
  [
    body("username").trim().notEmpty().withMessage("Username is required"),
    body("password").notEmpty().withMessage("Password is required"),
  ],
  async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  try {
    const { username, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE username = $1", [
      username,
    ]);
    if (user.rows.length > 0) {
      const isMatch = await bcrypt.compare(
        password,
        user.rows[0].password_hash,
      );
      if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
      }
      const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });
      res.cookie("token", token, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, //7days in ms
      });
      return res.status(200).json({ message: "Login accepted" });
    }
    return res.status(400).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
},
);

router.post("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
  });
  res.status(200).json({ message: "Logged out" });
});

router.get("/check", authMiddleware, async (req, res) => {
  try {
    const user = await pool.query("SELECT username FROM users WHERE id = $1", [
      req.user.id,
    ]);
    const minutes = await pool.query(
      "SELECT COALESCE(SUM(duration), 0) as minutes FROM sessions WHERE user_id = $1 AND type = 'work' AND completed = true AND started_at >= NOW() - INTERVAL '30 days'",
      [req.user.id],
    );
    res.status(200).json({
      message: "OK",
      userId: req.user.id,
      username: user.rows[0].username,
      rank: getRank(parseInt(minutes.rows[0].minutes)),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
