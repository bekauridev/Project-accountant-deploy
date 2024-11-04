const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    recurrence: {
      type: String,
      required: true,
      enum: ["monthly", "yearli"],
    },
    // ! (EXPLAIN LATER)
    targetPeriod: {
      type: String,
      required: [true, "Please select the target period for which the task is intended"],
    },
    status: {
      type: String,
      enum: ["progress", "completed"],
      default: "progress",
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, "Task must have start date"],
    },
    deadline: {
      type: Date,
      required: [true, "Task must have deadline date"],
    },

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Task must belong to a user"],
    },

    organization: {
      type: mongoose.Schema.ObjectId,
      ref: "Organization",
      required: [true, "Task must belong to a organization"],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
