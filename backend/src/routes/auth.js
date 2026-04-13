const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../database");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const { sendWelcomeEmail } = require("../email");
const authMiddleware = require("../middleware/auth");

router.post(
  "/register",
  [
    body("email").isEmail(),
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
      .withMessage("Password must contain at least one lowecase letter")
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
      const { username, email, password } = req.body;
      const existingEmail = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email],
      );
      if (existingEmail.rows.length > 0) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const existingUsername = await pool.query(
        "SELECT id FROM users WHERE username = $1",
        [username],
      );
      if (existingUsername.rows.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const passwordHash = await bcrypt.hash(password, 10);
      await pool.query(
        "INSERT INTO users (username, email, password_hash, created_at) VALUES ($1, $2, $3, NOW())",
        [username, email, passwordHash],
      );
      await sendWelcomeEmail(email, username);
      res.status(201).json({ message: "Register is fine" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);

router.post("/login", async (req, res) => {
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
      res.status(200).json({ message: "Login accepted" });
    }
    return res.status(400).json({ message: "User not found" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out" });
});

router.get("/check", authMiddleware, (req, res) => {
  res.status(200).json({ message: "OK", userId: req.user.id });
});

module.exports = router;
