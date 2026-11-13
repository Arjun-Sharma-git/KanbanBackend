const Task = require("../models/task");

// Counts the user's tasks by priority and status, plus how many
// unfinished tasks have a due date.
const getAnalytics = async (userId) => {
  const tasks = await Task.find({ userId });

  const statistics = {
    priority: { low: 0, moderate: 0, high: 0 },
    status: { toDo: 0, inProgress: 0, backlog: 0, done: 0 },
    dueDate: 0,
  };

  tasks.forEach((task) => {
    statistics.priority[task.priority]++;
    statistics.status[task.status]++;
    if (task.dueDate && task.status !== "done") statistics.dueDate++;
  });

  return statistics;
};

module.exports = { getAnalytics };
