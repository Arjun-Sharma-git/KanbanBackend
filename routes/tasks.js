const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const verifyJwt = require("../middleware/authMiddleware");

const {
  createTask,
  getAllTasks,
  deleteTask,
  changeStatus,
  editTask,
  getSingleTask,
  editCheckList,
  getCheckListCount,
} = require("../controllers/task.js");

const isValidId = (value) => mongoose.Types.ObjectId.isValid(value);

const checks = {
  title: (value) => typeof value === "string" && value.trim().length > 0,
  priority: (value) => ["low", "moderate", "high"].includes(value),
  checkList: (value) =>
    Array.isArray(value) &&
    value.length > 0 &&
    value.every((item) => typeof item?.title === "string" && item.title.trim()),
  status: (value) => ["toDo", "inProgress", "backlog", "done"].includes(value),
  duration: (value) => ["week", "month", "day"].includes(value),
};

const invalid = (res, message = "Invalid input") =>
  res.status(400).send({ success: false, data: message });

const sendError = (res, err) =>
  res.status(err.status || 500).send({ success: false, data: err.message });

const validateTaskBody = ({ title, priority, checkList }) => {
  if (!checks.title(title)) return "Title is required";
  if (!checks.priority(priority)) return "Priority must be low, moderate or high";
  if (!checks.checkList(checkList)) return "Add at least one checklist item with a title";
  return null;
};

router.post("/createTask", verifyJwt, async (req, res) => {
  try {
    const { title, priority, checkList } = req.body;
    const error = validateTaskBody(req.body);
    if (error) return invalid(res, error);
    const dueDate = req.body.dueDate || null;
    const data = await createTask(req.userId, title.trim(), priority, checkList, dueDate);
    res.status(201).send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.get("/getAllTasks/:duration", verifyJwt, async (req, res) => {
  try {
    const { duration } = req.params;
    if (!checks.duration(duration)) return invalid(res);
    const data = await getAllTasks(req.userId, duration);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

// Public route: powers the shareable read-only task page.
router.get("/getSingleTask/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidId(taskId)) return invalid(res);
    const data = await getSingleTask(taskId);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.put("/editTask", verifyJwt, async (req, res) => {
  try {
    const { taskId, title, priority, checkList } = req.body;
    if (!isValidId(taskId)) return invalid(res);
    const error = validateTaskBody(req.body);
    if (error) return invalid(res, error);
    const dueDate = req.body.dueDate || null;
    const data = await editTask(req.userId, taskId, title.trim(), priority, checkList, dueDate);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.delete("/deleteTask/:taskId", verifyJwt, async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidId(taskId)) return invalid(res);
    const data = await deleteTask(req.userId, taskId);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.put("/changeStatus", verifyJwt, async (req, res) => {
  try {
    const { taskId, status } = req.body;
    if (!isValidId(taskId) || !checks.status(status)) return invalid(res);
    const data = await changeStatus(req.userId, taskId, status);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

router.put("/editCheckList", verifyJwt, async (req, res) => {
  try {
    const { taskId, checkListId, isChecked } = req.body;
    if (!isValidId(taskId) || !isValidId(checkListId)) return invalid(res);
    const data = await editCheckList(req.userId, taskId, checkListId, isChecked);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

// Public route: used by the shareable read-only task page.
router.get("/getCheckListCount/:taskId", async (req, res) => {
  try {
    const { taskId } = req.params;
    if (!isValidId(taskId)) return invalid(res);
    const data = await getCheckListCount(taskId);
    res.send({ success: true, data });
  } catch (err) {
    sendError(res, err);
  }
});

module.exports = router;
