const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const authRoutes = require("./routes/auth.js");
const taskRoutes = require("./routes/tasks.js");
const analyticsRoutes = require("./routes/analytics.js")

const PORT = process.env.PORT || 3001;

const app = express();

const corsOptions = {
  origin: 'https://kanban-project-rho.vercel.app', //frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

app.use(express.json());
app.use(cors(corsOptions));

const MONGODB_URI = process.env.MONGODB_URL;
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log(`Successfully Connected to db at port ${PORT}`);
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/task", taskRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

app.get("/health", (req, res) => {
  res.json("status:active");
});

app.listen(3001, () => {
  console.log("Server Online");
});
