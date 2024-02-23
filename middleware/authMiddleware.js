const jwt = require("jsonwebtoken");

const verifyJwt = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res.send({
        success: false,
        data: "Unauthorised request on protected path",
      });
      const verifyToken = jwt.verify(token, process.env.SECRET_KEY);
      req.body.userId = verifyToken.userId;
      next();
  } catch (err) {
    res.send({
      success: false,
      data: "Corrupt token, revalidate (JWT)"
    });
  }
};
module.exports = verifyJwt;
