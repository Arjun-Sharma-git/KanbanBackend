const jwt = require("jsonwebtoken");

// Verifies the JWT and exposes the authenticated user's id as req.userId.
// The token normally arrives in an httpOnly "token" cookie. An Authorization
// header ("Bearer <token>" or a bare token) is still accepted as a fallback,
// which keeps API clients and tests working.
const verifyJwt = (req, res, next) => {
  const cookieToken = req.cookies ? req.cookies.token : null;
  const header = req.header("Authorization");
  const headerToken = header
    ? header.startsWith("Bearer ")
      ? header.slice(7)
      : header
    : null;
  const token = cookieToken || headerToken;

  if (!token) {
    return res
      .status(401)
      .send({ success: false, data: "Unauthorised request on protected path" });
  }

  try {
    const { userId } = jwt.verify(token, process.env.SECRET_KEY);
    req.userId = userId;
    next();
  } catch (err) {
    res
      .status(401)
      .send({ success: false, data: "Session expired, please log in again" });
  }
};

module.exports = verifyJwt;
