require("dotenv").config();
const express = require("express");
const app = express();

const cors = require("cors");
app.use(cors());

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
