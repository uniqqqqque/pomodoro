require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
app.use(
  cors({
    origin: [
      "https://pomodoro.poliscuks.id.lv",
      "http://127.0.0.1:5555",
      "http://localhost:5555",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
    ],
    credentials: true,
  }),
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, //1min
  max: 500,
  message: { message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, //1min
  max: 100,
  message: { message: "Too many login attempt, please try again later" },
});

app.use(limiter);
app.use("/auth/login", authLimiter);
app.use("/auth/register", authLimiter);

app.use(express.json());

app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  if (process.env.NODE_ENV === "production") {
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  }
  next();
});

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const sessions = require("./routes/sessions");
app.use("/sessions", sessions);

const stats = require("./routes/stats");
app.use("/stats", stats);

const { router: leaderboard } = require("./routes/leaderboard");
app.use("/leaderboard", leaderboard);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
