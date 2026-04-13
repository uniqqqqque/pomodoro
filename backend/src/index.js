require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors( {
  origin: 'https://pomodoro.poliscuks.id.lv',
  credentials: true
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60*1000, //15min
  max: 100,
  message: {message: 'Too many requests, please try again later'}
});

const authLimiter = rateLimit({
  windowMs: 15 * 60*1000, //15min
  max: 10,
  message: {message: 'Too many login attempt, please try again later'}
});

app.use(limiter);
app.use('/auth/login', authLimiter);
app.use('/auth/register', authLimiter);

app.use(express.json());

const authRoutes = require("./routes/auth");
app.use("/auth", authRoutes);

const sessions = require("./routes/sessions");
app.use("/sessions", sessions);

const tasks = require("./routes/tasks");
app.use("/tasks", tasks);

const stats = require("./routes/stats");
app.use("/stats", stats);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
