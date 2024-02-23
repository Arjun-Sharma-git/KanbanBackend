const Task = require("../models/task");
const User = require("../models/user");
const mongoose = require("mongoose");
const moment = require("moment");

const createTask = async (userId, title, priority, checkList, dueDate) => {
  try {
    const taskDetails = new Task({
      userId,
      title,
      priority,
      checkList,
      dueDate,
    });
    const savedTask = await taskDetails.save();
    const taskId = savedTask._id;
    await User.findByIdAndUpdate(userId, { $push: { tasks: taskId } });
    const data = "Task created successfully!!";
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getAllTasks = async (userId, duration) => {
  try {
    console.log(userId, duration);
    const currentDate = moment();
    const startTime = moment(currentDate).startOf(duration).valueOf();
    const endTime = moment(currentDate).endOf(duration).valueOf();

    const tasks = await User.findById(userId).populate({
      path: "tasks",
      match: {
        createdAt: {
          $gte: new Date(parseInt(startTime)),
          $lte: new Date(parseInt(endTime)),
        },
      },
    });
    const allTasks = tasks.tasks;
    const tasksByStatus = {
      toDo: [],
      inProgress: [],
      backlog: [],
      done: [],
    };

    allTasks.forEach((task) => {
      tasksByStatus[task.status].push(task);
    });
    return tasksByStatus;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
const getSingleTask = async (taskId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  } catch (err) {
    return Promise.reject(err);
  }
};

const editTask = async (taskId, title, priority, checkList, dueDate) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task Not Found");
    await Task.findByIdAndUpdate(taskId, {
      $set: {
        taskId,
        title,
        priority,
        checkList,
        dueDate,
      },
    });
    const data = "Task updatated successfully!!";
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const deleteTask = async (taskId, userId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task not found");
    }

    await User.findByIdAndUpdate(
      userId,
      { $pull: { tasks: taskId } },
      { new: true }
    );
    await Task.findByIdAndDelete(taskId);
    return;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const changeStatus = async (taskId, status) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error("Task Not Found");
    }
    await Task.findByIdAndUpdate(taskId, {
      $set: {
        status,
      },
    });
    const data = "Task Status updated succesfully";
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const editCheckList = async (TaskId, checkListId, isChecked) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      TaskId,
      { $set: { "checkList.$[elem].isChecked": isChecked } },
      { new: true, arrayFilters: [{ "elem._id": checkListId }] }
    );

    if (!updatedTask) {
      throw new Error("Task not found");
    }

    return updatedTask;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};

const getCheckListCount = async (taskId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) throw new Error("Task Not Found");
    const totalChecklistItems = task.checkList.length;
    const completedChecklistItems = task.checkList.filter(
      (item) => item.isCompleted
    ).length;
    const data = { completedChecklistItems, totalChecklistItems };
    return data;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
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
