const express = require("express");
const router = express.Router();
const { check, body, param } = require("express-validator");
const { validateRequest } = require("../middlewares/requestValidator");
const verifyJwt = require("../middlewares/authMiddleware");
const {
  createTask,
  getAllTasks,
  deleteTask,
  changeStatus,
  editTask,
} = require("../controllers/task.js");
const validateUnixTimestamp = require("../utils/validateUnixTimeStamp");

router.post(
  "/createTask",
  verifyJwt,
  [
    check("title", "Title is a required field").isString(),
    check("priority", "priority is a required field")
      .isIn(["low", "moderate", "high"])
      .withMessage("invalid priority type"),
    check("checkList")
      .isArray()
      .custom((value) => {
        if (value.length > 0) {
          return true;
        }
        throw new Error("CheckList must contain atleast 1 element");
      }),
    check("dueDate").optional(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { userId, title, priority, checkList } = req.body;
      const dueDate = req.body.dueDate || null;
      const data = await createTask(
        userId,
        title,
        priority,
        checkList,
        dueDate
      );
      res.send({ success: "true", data: data });
    } catch (err) {
      console.log(err);
      res.send({ success: "false", data: err.toString() });
    }
  }
);

router.get(
  "/getAllTasks/:startTime/:endTime",
  verifyJwt,
  [
    param("startTime").custom(validateUnixTimestamp),
    param("endTime").custom(validateUnixTimestamp),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const { startTime, endTime } = req.params;
      const data = await getAllTasks(userId, startTime, endTime);
      res.send({ success: "true", data: data });
    } catch (err) {
      console.log(err);
      res.send({ success: "false", data: err.toString() });
    }
  }
);

router.put(
  "/editTask",
  verifyJwt,
  [
    check("taskId", "task Id needed").isMongoId(
      "TaskId should be a valid mongoDb Id"
    ),
    check("title", "Title is a required field").isString(),
    check("priority", "priority is a required field")
      .isIn(["low", "moderate", "high"])
      .withMessage("invalid priority type"),
    check("checkList")
      .isArray()
      .custom((value) => {
        if (value.length > 0) {
          return true;
        }
        throw new Error("CheckList must contain atleast 1 element");
      }),
    check("dueDate").optional(),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { taskId, title, priority, checkList } = req.body;
      const dueDate = req.body.dueDate || null;
      const data = await editTask(taskId, title, priority, checkList, dueDate);
      res.send({ success: "true", data: data });
    } catch (err) {
      console.log(err);
      res.send({ success: "false", data: err.toString() });
    }
  }
);

router.delete(
  "/deleteTask/:taskId",
  verifyJwt,
  [
    param("taskId", "task Id needed").isMongoId(
      "TaskId should be a valid mongoDb Id"
    ),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.body.userId;
      const taskId = req.params.taskId;
      await deleteTask(taskId, userId);
      res.send({ success: "true", data: "task Deleted successfully" });
    } catch (err) {
      //err contains a object of error class , it contians a name which is a string that is error type and message that contains string that states the error . , to string converts both into string and give
      // error in this format name:message //
      res.send({ success: "false", data: err.toString() });
    }
  }
);

router.put(
  "/changeStatus",
  verifyJwt,
  [
    check("taskId", "task Id needed").isMongoId(
      "TaskId should be a valid mongoDb Id"
    ),
    check("status")
      .isIn(["toDo", "inProgress", "backlog", "done"])
      .withMessage("Invalid Status type"),
  ],
  validateRequest,
  async (req, res) => {
    try {
      const { taskId, status } = req.body;
      const data = await changeStatus(taskId, status);
      res.send({ success: "true", data: data });
    } catch (err) {
      res.send({ success: "false", data: err.toString() });
    }
  }
);

module.exports = router;
