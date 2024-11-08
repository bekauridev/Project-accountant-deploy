const AppError = require("../utils/AppError");
const asyncMiddleware = require("./asyncMiddleware");

// @desc   Reject password update
// @route  Protect middleware
exports.declinePasswordUpdate = asyncMiddleware(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        `This route is not for password updates. Please use ${req.protocol}://${req.get(
          "host"
        )}/api/v1/auth/updatePassword for password updates or /forgotPassword if you forgot your password.`,
        400
      )
    );
  }
  next();
});
