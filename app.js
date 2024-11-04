const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");

const usersRouter = require("./routes/usersRouter");
const organizationRouter = require("./routes/organizationRouter");
const taskRouter = require("./routes/taskRouter");
const authRouter = require("./routes/authRouter");

// initialize app
const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Allow your frontend domain
    methods: ["GET", "POST", "PATCH"], // Allow specific methods
    credentials: true, // Allow cookies
  })
);
// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

// !! (TEMP CLOSED) LIMITERS
// // Rate limiter for all /api routes (General Rate Limits)
// const generalRateLimiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// // Rate limiter for all auth-related routes
// const authRateLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 10, // Limit to 5 attempts
//   message: "Too many attempts, please try again later.",
// });

// app.use("/api", generalRateLimiter);
// app.use("/api/v1/auth", authRateLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser()); // To parse cookies

// Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/organizations", organizationRouter);
app.use("/api/v1/tasks", taskRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
