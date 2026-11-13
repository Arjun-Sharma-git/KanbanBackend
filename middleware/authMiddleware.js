const jwt = require("jsonwebtoken");

// Verifies the JWT sent in the Authorization header and exposes the
// authenticated user's id as req.userId for the route handlers.
const verifyJwt = (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) {
    return res
      .status(401)
      .send({ success: false, data: "Unauthorised request on protected path" });
  }

  // Accept both "Bearer <token>" and a bare token.
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

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
