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

// The JWT is delivered as an httpOnly cookie so page JavaScript can never read
// it (an XSS payload cannot steal a token it cannot see). In production the
// frontend and API are served from the same origin, so SameSite=Lax applies
// and also mitigates CSRF; set SAME_SITE=none;Secure only if they are split
// across sites.
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd && process.env.CROSS_SITE_COOKIE === "true" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, matches the JWT lifetime
};

const sendAuth = (res, status, data) => {
  res.cookie("token", data.token, cookieOptions);
  // The token is set as a cookie only; it is deliberately not returned in the body.
  res.status(status).send({
    success: true,
    data: { name: data.name, message: data.message },
  });
};

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
    sendAuth(res, 201, data);
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
    sendAuth(res, 200, data);
  } catch (err) {
    sendError(res, err);
  }
});

router.post("/logout", (req, res) => {
  // clearCookie must receive the same options the cookie was set with.
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.send({ success: true, data: "Logged out" });
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
