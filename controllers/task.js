const moment = require("moment");
const Task = require("../models/task");
const User = require("../models/user");
const { httpError } = require("./auth");

const STATUSES = ["toDo", "inProgress", "backlog", "done"];

// Loads a task and makes sure it belongs to the logged-in user.
const findOwnTask = async (taskId, userId) => {
  const task = await Task.findById(taskId);
  if (!task) throw httpError(404, "Task not found");
  if (String(task.userId) !== String(userId)) {
    throw httpError(403, "You are not allowed to modify this task");
  }
  return task;
};

const createTask = async (userId, title, priority, checkList, dueDate) => {
  const task = await Task.create({ userId, title, priority, checkList, dueDate });
  await User.findByIdAndUpdate(userId, { $push: { tasks: task._id } });
  return "Task created successfully!!";
};

// Returns the user's tasks created during the current day / week / month,
// grouped by status.
const getAllTasks = async (userId, duration) => {
  const now = moment();
  const tasks = await Task.find({
    userId,
    createdAt: {
      $gte: now.clone().startOf(duration).toDate(),
      $lte: now.clone().endOf(duration).toDate(),
    },
  }).sort({ createdAt: 1 });

  const tasksByStatus = Object.fromEntries(STATUSES.map((s) => [s, []]));
  tasks.forEach((task) => tasksByStatus[task.status].push(task));
  return tasksByStatus;
};

// Public: used by the shareable read-only task link.
const getSingleTask = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw httpError(404, "Task not found");
  return task;
};

const editTask = async (userId, taskId, title, priority, checkList, dueDate) => {
  const task = await findOwnTask(taskId, userId);
  Object.assign(task, { title, priority, checkList, dueDate });
  await task.save();
  return "Task updated successfully!!";
};

const deleteTask = async (userId, taskId) => {
  await findOwnTask(taskId, userId);
  await User.findByIdAndUpdate(userId, { $pull: { tasks: taskId } });
  await Task.findByIdAndDelete(taskId);
  return "Task deleted successfully";
};

const changeStatus = async (userId, taskId, status) => {
  const task = await findOwnTask(taskId, userId);
  task.status = status;
  await task.save();
  return "Task status updated successfully";
};

const editCheckList = async (userId, taskId, checkListId, isChecked) => {
  const task = await findOwnTask(taskId, userId);
  const item = task.checkList.id(checkListId);
  if (!item) throw httpError(404, "Checklist item not found");
  item.isChecked = Boolean(isChecked);
  await task.save();
  return task;
};

// Public: used by the shareable read-only task link.
const getCheckListCount = async (taskId) => {
  const task = await Task.findById(taskId);
  if (!task) throw httpError(404, "Task not found");
  return {
    completedChecklistItems: task.checkList.filter((item) => item.isChecked).length,
    totalChecklistItems: task.checkList.length,
  };
};

module.exports = {
  createTask,
  getAllTasks,
  deleteTask,
  changeStatus,
  editTask,
  editCheckList,
  getSingleTask,
  getCheckListCount,
};
