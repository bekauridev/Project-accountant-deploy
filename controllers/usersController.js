const User = require("../models/userModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");
const crudHandlerFactory = require("./crudHandlerFactory");
const filterFieldsObj = require("../utils/filterFieldsObj");

// @desc Delete Currently logged in user's details
// @route PUT /api/v1/users/updateMe
// @access Private
exports.deleteMe = asyncMiddleware(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc Update Currently logged in user's details
// @route PUT /api/v1/users/updateMe
// @access Private
exports.updateMe = asyncMiddleware(async (req, res, next) => {
  // Avoid password update from this function
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

  // Accept only allowed fields
  const fields = filterFieldsObj(req.body, "name", "email");
  // Check if the provided email is the same as the current email
  if (req.body.email) {
    // !! TO DO You Need to add 2 step authentication for email before update
    if (req.user.email === req.body.email)
      return next(
        new AppError("The email you provided is already your current email address", 400)
      );
  }

  const updatedUser = await User.findByIdAndUpdate(req.user.id, fields, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: "success",
    user: updatedUser,
  });
});

// ///////////////////////////////////
// CRUD Using crudHandlerFactory

// @desc Show a users
// @route PUT /api/v1/users/
// @access Private (admin)
exports.index = crudHandlerFactory.indexDoc(User);

// @desc Show single user
// @route PUT /api/v1/users/:id
// @access Private (admin)
exports.showUser = crudHandlerFactory.showDoc(User);

// @desc Create a user
// @route PUT /api/v1/users/:id
// @access Private (admin)
exports.storeUser = crudHandlerFactory.storeDoc(User);

// @desc Update a user (Do Not update password)
// @route PUT /api/v1/users/:id
// @access Private (admin)
exports.updateUser = crudHandlerFactory.updateDoc(User);

// @desc Delete a user
// @route PUT /api/v1/users/:id
// @access Private (admin)
exports.destroyUser = crudHandlerFactory.destroyDoc(User);
