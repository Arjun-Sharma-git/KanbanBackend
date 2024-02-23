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

const checks = {
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
  status: (value) => {
    return ["toDo", "inProgress", "backlog", "done"].includes(value);
  },
  duration: (value) => {
    return ["week", "month", "day"].includes(value);
  },
};

router.post("/createTask", verifyJwt, async (req, res) => {
  try {
    const { userId, title, priority, checkList } = req.body;
    const dueDate = req.body.dueDate || null;
    if (
      !checks.title(req.body.title) ||
      !checks.priority(req.body.priority) ||
      !checks.checkList(req.body.checkList)
    ) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await createTask(userId, title, priority, checkList, dueDate);
    res.send({ success: true, data: data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, data: err.toString() });
  }
});

router.get("/getAllTasks/:duration", verifyJwt, async (req, res) => {
  try {
    const userId = req.body.userId;
    const { duration } = req.params;
    console.log(duration);
    if (!checks.duration(duration)) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await getAllTasks(userId, duration);
    res.send({ success: true, data: data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, data: err.toString() });
  }
});

router.get("/getSingleTask/:taskId", async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!checks.taskId(req.params.taskId)) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await getSingleTask(taskId);
    res.send({ success: "true", data: data });
  } catch (err) {
    res.send({ success: "false", data: err.toString() });
  }
});

router.put("/editTask", verifyJwt, async (req, res) => {
  try {
    const { taskId, title, priority, checkList } = req.body;
    const dueDate = req.body.dueDate || null;
    if (
      !checks.title(req.body.title) ||
      !checks.priority(req.body.priority) ||
      !checks.checkList(req.body.checkList) ||
      !checks.taskId(req.body.taskId)
    ) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await editTask(taskId, title, priority, checkList, dueDate);
    res.send({ success: true, data: data });
  } catch (err) {
    console.log(err);
    res.send({ success: false, data: err.toString() });
  }
});

router.delete("/deleteTask/:taskId", verifyJwt, async (req, res) => {
  try {
    const userId = req.body.userId;
    const taskId = req.params.taskId;
    if (!checks.taskId(req.params.taskId)) {
      return res.send({ success: false, data: "Invalid input" });
    }
    await deleteTask(taskId, userId);
    res.send({ success: true, data: "Task deleted successfully" });
  } catch (err) {
    res.send({ success: false, data: err.toString() });
  }
});

router.put("/changeStatus", verifyJwt, async (req, res) => {
  try {
    const { taskId, status } = req.body;
    if (!checks.taskId(req.body.taskId) || !checks.status(req.body.status)) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await changeStatus(taskId, status);
    res.send({ success: true, data: data });
  } catch (err) {
    res.send({ success: false, data: err.toString() });
  }
});

router.put("/editCheckList", verifyJwt, async (req, res) => {
  try {
    const { taskId, checkListId, isChecked } = req.body;
    if (
      !checks.taskId(req.body.taskId) ||
      !checks.checkListId(req.body.checkListId)
    ) {
      return res.send({ success: false, data: "Invalid input" });
    }
    const data = await editCheckList(taskId, checkListId, isChecked);
    res.send({ success: "true", data: data });
  } catch (err) {
    console.log(err);
    res.send({ success: "false", data: err.toString() });
  }
});

router.get("/getCheckListCount/:taskId", verifyJwt, async (req, res) => {
  try {
    const taskId = req.params.taskId;
    if (!checks.taskId(req.params.taskId)) {
      console.log("Invalid input");
      return res.send({ success: false, data: "Invalid input" });
    }
    const countData = await getCheckListCount(taskId);
    res.send({ success: true, data: countData });
  } catch (error) {
    console.log(error);
    res.send({ success: false, data: error.message });
  }
});
module.exports = router;
