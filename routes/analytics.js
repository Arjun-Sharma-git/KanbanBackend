const express = require("express");
const router = express.Router();
const verifyJwt = require("../middleware/authMiddleware");
const { getAnalytics } = require("../controllers/analytics");

router.get("/getAnalytics", verifyJwt, async (req, res) => {
  try {
    const data = await getAnalytics(req.userId);
    res.send({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).send({ success: false, data: err.message });
  }
});

module.exports = router;
