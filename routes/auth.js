const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/authMiddleware");
const { register, login, updateUser } = require("../controllers/auth");

const isString = (value) => typeof value === "string";

const checks = {
  email: (value) =>
    isString(value) && /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value),
  password: (value) => isString(value) && value.trim().length >= 8,
  name: (value) => isString(value) && value.trim().length > 0,
};

const sendError = (res, err) =>
  res.status(err.status || 500).send({ success: false, data: err.message });

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!checks.name(name) || !checks.email(email) || !checks.password(password)) {
      return res.status(400).send({
        success: false,
        data: "Invalid input: name, valid email and an 8+ character password are required",
      });
    }
    const data = await register(name.trim(), email, password);
    res.status(201).send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!checks.email(email) || !isString(password) || !password) {
      return res
        .status(400)
        .send({ success: false, data: "Please enter a valid email and password" });
    }
    const data = await login(email, password);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.put("/updateUser", verifyJwt, async (req, res) => {
  try {
    const { name, oldPassword } = req.body;
    const newPassword = req.body.newPassword || null;
    if (
      !checks.name(name) ||
      !isString(oldPassword) ||
      !oldPassword ||
      (newPassword !== null && !checks.password(newPassword))
    ) {
      return res.status(400).send({
        success: false,
        data: "Invalid input: name and old password are required, new password must be 8+ characters",
      });
    }
    const data = await updateUser(req.userId, name.trim(), oldPassword, newPassword);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
