const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const authRoutes = require("./routes/auth.js");
const taskRoutes = require("./routes/tasks.js");
const analyticsRoutes = require("./routes/analytics.js");

const PORT = process.env.PORT || 3001;
const FRONTEND_URL =
  process.env.FRONTEND_URL || "https://kanban-project-rho.vercel.app";

const app = express();

app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(
  cors({
    origin: FRONTEND_URL.split(",").map((url) => url.trim()),
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection failed:", err.message));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json("status:active");
});

app.use((req, res) => {
  res.status(404).send({ success: false, data: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

module.exports = app;
