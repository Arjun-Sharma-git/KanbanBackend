const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/authMiddleware");
const { register, login, updateUser } = require("../controllers/auth");

const checks = {
  email: (value) => {
    const emailRegEx = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegEx.test(value);
  },
  password: (value) => {
    return value.length >= 8;
  },
  name: (value) => {
    return value.length > 0;
  },
  title: (value) => {
    return value.length > 0;
  },
  priority: (value) => {
    return ["low", "moderate", "high"].includes(value);
  },
  checkList: (value) => {
    return value.length > 0;
  },
  taskId: (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },
  checkListId: (value) => {
    return mongoose.Types.ObjectId.isValid(value);
  },
};

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (
      !checks.email(req.body.email) ||
      !checks.password(req.body.password) ||
      !checks.name(req.body.name)
    ) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await register(name, email, password);
    res.send({ success: true, data: data });
  } catch (err) {
    res.send({ success: false, data: err.toString() });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!checks.email(req.body.email) || !checks.password(req.body.password)) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await login(email, password);
    res.send({ success: true, data: data });
  } catch (err) {
    res.send({ success: false, data: err.toString() });
  }
});

router.put("/updateUser", verifyJwt, async (req, res) => {
  try {
    const { userId, name, oldPassword } = req.body;
    const newPassword = req.body.newPassword || null;
    if (
      !checks.password(req.body.oldPassword) ||
      !checks.name(req.body.name) ||
      checks.password(req.body.newPassword)
    ) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await updateUser(userId, name, oldPassword, newPassword);
    res.send({ success: "true", data: data });
  } catch (err) {
    res.send({ success: "false", data: err.toString() });
  }
});

module.exports = router;
