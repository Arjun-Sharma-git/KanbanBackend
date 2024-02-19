const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log(`Successfully Connected to db at port ${process.env.PORT}`);
  })
  .catch((err) => {
    console.log("MongoDB connection failed!!", err);
  });

app.get("/health", (req, res) => {
  res.json("status:active");
});

app.listen(3001, () => {
  console.log("server is running !!");
});