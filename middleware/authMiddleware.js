const jwt = require("jsonwebtoken");
const verifyJwt = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token)
      return res.send({
        success: "false",
        data: "Unauthorised request on protected path",
      });
    //our else condition cheks whether the token was tempred with or not
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    //adding userId to body of the request
    req.body.userId = decode.userId;
    next();
  }
  catch (err) {
    res.send({ success: "false", data: "Invalid token" });
  }
};
module.exports = verifyJwt;