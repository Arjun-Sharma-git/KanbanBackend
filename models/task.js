const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["toDo", "inProgress", "backlog", "done"],
      default: "toDo",
    },
    checkList: [
      {
        title: String,
        isChecked: Boolean,
      },
    ],
  },
  {
    timestamps: {
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  }
);
module.exports = mongoose.model("Task", taskSchema);
