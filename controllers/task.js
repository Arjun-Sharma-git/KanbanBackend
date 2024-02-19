const Task = require("../models/task");
const User = require("../models/user");
const mongoose = require("mongoose");

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

const getAllTasks = async (userId, startTime, endTime) => {
  try {
    const tasks = await User.findById(userId).populate({
      // **Notes--> This is the name of the key in the user Schema //
      path: "tasks",
      match: {
        createdAt: {
          $gte: new Date(parseInt(startTime)),
          $lte: new Date(parseInt(endTime)),
        },
      },
    });
    return tasks;
  } catch (err) {
    console.log(err);
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

module.exports = {
  createTask,
  getAllTasks,
  deleteTask,
  changeStatus,
  editTask,
};
