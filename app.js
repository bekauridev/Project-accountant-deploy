const express = require("express");
const morgan = require("morgan");

const globalErrorHandler = require("./controllers/errorController");
const AppError = require("./utils/AppError");
const usersRouter = require("./routes/usersRouter");
const authRouter = require("./routes/authRouter");
const User = require("./models/userModel");

// initialize app
const app = express();

// Development logging
if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

//! LIMITER FUNCTIONALITY
// // Global rate limiter for all /api routes
// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 1000, // 1 hour
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// // Specific rate limiter for login attempts
// const loginLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 login attempts per window
//   message: "Too many login attempts from this IP, please try again later.",
// });

// // Apply global limiter to all /api routes except /api/v1/auth/login
// app.use("/api", limiter);

// // Apply login limiter specifically to login route
// app.use("/api/v1/auth/login", loginLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "100kb" }));

app.use("/api/v1/users", usersRouter);
app.use("/api/v1/auth", authRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
