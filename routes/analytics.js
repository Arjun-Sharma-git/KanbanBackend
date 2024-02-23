const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/analytics");

router.get("/getAnalytics", verifyJwt, async (req, res) => {
  try {
    const userId = req.body.userId;
    const data = await getAnalytics(userId);
    res.send({ success: true, data: data });
  } catch (err) {
    res.send({ success: false, data: err });
  }
});
module.exports = router;
