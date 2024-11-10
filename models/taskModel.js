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
      enum: ["monthly", "yearly"],
    },
    // The time period for which the task is intended
    targetPeriod: {
      type: Date,
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
    archived: {
      type: Boolean,
      default: false,
    },
    notifiedOneDayBefore: {
      type: Boolean,
      default: false,
    },
    notifiedFiveDaysBefore: {
      type: Boolean,
      default: false,
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
taskSchema.index({ deadline: 1, archived: 1, status: 1 });

taskSchema.pre("findOneAndUpdate", function (next) {
  // Access currently updated document
  const updatedTask = this.getUpdate();

  if (updatedTask.status === "completed") {
    updatedTask.archived = true;
  }
  next();
});
const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
