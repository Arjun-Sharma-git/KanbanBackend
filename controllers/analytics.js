const Task = require("../models/task");
const User = require("../models/user");
const mongoose = require("mongoose");

const getAnalytics = async (userId) => {
  try {
    const tasks = await User.findById(userId).populate({
      path: "tasks",
    });
    const alltasks = tasks.tasks;
    const statistics = {
      priority: {
        low: 0,
        moderate: 0,
        high: 0,
      },
      status: {
        toDo: 0,
        inProgress: 0,
        backlog: 0,
        done: 0,
      },
      dueDate: 0,
    };

    alltasks.forEach((task) => {
      statistics.priority[task.priority]++;

      statistics.status[task.status]++;

      if (task.dueDate && task.status !== "done") {
        statistics.dueDate++;
      }
    });

    return statistics;
  } catch (err) {
    console.log(err);
    return Promise.reject(err);
  }
};
module.exports = { getAnalytics };
