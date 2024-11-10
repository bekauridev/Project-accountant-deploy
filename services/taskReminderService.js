// const cron = require("node-cron");
// const moment = require("moment-timezone");
// const Task = require("../models/taskModel");
// const asyncMiddleware = require("../middlewares/asyncMiddleware");

// const AppError = require("../utils/AppError");
// const sendEmail = require("./emailService");

// // Function to send deadline notification with proper message construction
// const sendDeadlineNotification = async (email, taskTitle, deadline, daysBefore) => {
//   const message = `This is a friendly reminder that your task "${taskTitle}" is due in ${daysBefore} days, on ${moment(
//     deadline
//   ).format("MMMM Do YYYY, h:mm a")}.`; // Clear and informative message

//   try {
//     await sendEmail({
//       email,
//       subject: `Task Reminder: ${taskTitle} Due in ${daysBefore} Days`,
//       message,
//     });
//   } catch (error) {
//     throw new AppError(error, 500);
//   }
// };

// // Cron job scheduled to run every day at 7:00 AM Asia/Tbilisi time
// const checkTaskDeadlines = cron.schedule(
//   // "0 7 * * *", // Runs at 7:00 AM daily
//   "*/10 * * * * *",
//   asyncMiddleware(async () => {
//     const now = moment().utc();
//     const fiveDaysLater = moment(now)
//       .add(5, "days")
//       .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
//     const oneDayLater = moment(now)
//       .add(1, "days")
//       .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

//     // Find tasks that are due exactly 5 days from now and are not archived
//     const tasks = await Task.find({
//       archived: false,
//       status: "progress",
//       deadline: {
//         $gte: now.startOf("day").toDate(),
//         $lte: fiveDaysLater.endOf("day").toDate(),
//       },
//     })
//       .populate("organization")
//       .populate("user");

//     console.log(`Found ${tasks.length} tasks with 5 days left before deadline`);

//     for (const task of tasks) {
//       const timeToDeadline = moment(task.deadline).diff(now, "days");

//       if (timeToDeadline === 5 && !task.notifiedFiveDaysBefore) {
//         await sendDeadlineNotification(task.user.email, task.title, task.deadline, 5);
//         task.notifiedFiveDaysBefore = true;
//         await task.save();
//       }

//       // Notify 1 day before deadline
//       if (timeToDeadline === 1 && !task.notifiedOneDayBefore) {
//         await sendDeadlineNotification(task.user.email, task.title, task.deadline, 1);
//         task.notifiedOneDayBefore = true;
//         await task.save();
//       }
//     }
//   }),
//   {
//     scheduled: true,
//     timezone: "Asia/Tbilisi",
//   }
// );

// module.exports = checkTaskDeadlines;

const cron = require("node-cron");
const moment = require("moment-timezone");
const Task = require("../models/taskModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");

const AppError = require("../utils/AppError");
const sendEmail = require("./emailService");

// Function to construct a list of upcoming tasks for the email
const buildUpcomingTasksList = (tasks) => {
  return Object.entries(tasks).reduce((message, [deadlineTime, tasks]) => {
    const deadlineDate = moment()
      .add(parseInt(deadlineTime), "days")
      .format("MMMM Do YYYY,");

    const taskList = tasks.reduce((taskMessage, task) => {
      return `${taskMessage}  * **${task.title}**: Due on ${deadlineDate}\n`;
    }, "");

    return `${message}**${deadlineTime} day${
      deadlineTime > 1 ? "s" : ""
    }**:\n${taskList}`;
  }, "");
};

// Cron job scheduled to run every day at 7:00 AM Asia/Tbilisi time
const checkTaskDeadlines = cron.schedule(
  // "0 7 * * *", // Runs at 7:00 AM daily
  "*/10 * * * * *",
  asyncMiddleware(async () => {
    const now = moment().utc();
    const fiveDaysLater = moment(now)
      .add(5, "days")
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });
    const oneDayLater = moment(now)
      .add(1, "days")
      .set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

    // Find tasks that are due exactly 5 days from now and are not archived
    const tasks = await Task.find({
      archived: false,
      status: "progress",
      deadline: {
        $gte: now.startOf("day").toDate(),
        $lte: fiveDaysLater.endOf("day").toDate(),
      },
    })
      .populate("organization")
      .populate("user");

    if (tasks.length > 0) {
      // Combine tasks for the same user into a single notification
      const tasksByUser = tasks.reduce((accumulator, task) => {
        const user = task.user.email; // Assuming user email is the identifier
        const deadlineTime = moment(task.deadline).diff(now, "days"); // Get the deadline time in days
        if (deadlineTime === 5 || deadlineTime === 1) {
          accumulator[user] = accumulator[user] || {}; // Create an object if it doesn't exist
          accumulator[user][deadlineTime] = accumulator[user][deadlineTime] || []; // Create an array if it doesn't exist
          accumulator[user][deadlineTime].push(task); // Add the task to the array
        }
        return accumulator;
      }, {});
      // Send separate emails for each user with their upcoming tasks list
      for (const email in tasksByUser) {
        if (tasksByUser[email][5] === undefined && tasksByUser[email][1] === undefined)
          continue;
        const deadlineInfiveDay = tasksByUser[email][5];
        const deadlineInOneDay = tasksByUser[email][1];
        if (deadlineInfiveDay && deadlineInfiveDay[0].notifiedFiveDaysBefore === false) {
          console.log(deadlineInfiveDay);
          const upcomingTasksList = buildUpcomingTasksList(deadlineInfiveDay);
          await sendDeadlineNotification(email, upcomingTasksList, 5);
          await Task.updateMany(
            { _id: { $in: deadlineInfiveDay.map((task) => task._id) } },
            { $set: { notifiedFiveDaysBefore: true } }
          );
        }

        if (deadlineInOneDay && deadlineInOneDay[0].notifiedOneDayBefore === false) {
          const upcomingTasksList = buildUpcomingTasksList(deadlineInOneDay);
          await sendDeadlineNotification(email, upcomingTasksList, 1);
          await Task.updateMany(
            { _id: { $in: deadlineInOneDay.map((task) => task._id) } },
            { $set: { notifiedOneDayBefore: true } }
          );
        }
      }
    }
  }),
  {
    scheduled: true,
    timezone: "Asia/Tbilisi",
  }
);

const sendDeadlineNotification = async (email, upcomingTasksList) => {
  const message = `This is a friendly reminder that you have upcoming tasks due soon:\n${upcomingTasksList}`; // Clear and informative message

  try {
    await sendEmail({
      email,
      subject: "Upcoming Deadlines",
      message,
    });
  } catch (error) {
    throw new AppError(error, 500);
  }
};

module.exports = checkTaskDeadlines;
