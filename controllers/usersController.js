const User = require("../models/userModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");
const crudHandlerFactory = require("./crudHandlerFactory");
const { filterFieldsObj } = require("../utils/hepler");

// @desc   Delete Currently logged in user's details
// @route  DELETE /api/v1/users/updateMe
// @access Private
exports.deleteMe = asyncMiddleware(async (req, res, next) => {
  await User.findByIdAndDelete(req.user.id);

  res.status(204).json({
    status: "success",
    data: null,
  });
});

// @desc   Update Currently logged in user's details (excluding password)
// @route  PATCH /api/v1/users/updateMe
// @access Private
exports.updateMe = asyncMiddleware(async (req, res, next) => {
  // Accept only allowed fields
  const fields = filterFieldsObj(req.body, "name", "email");

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

// @desc   Retrieve a list of users
// @route  GET /api/v1/users/
// @access Admin access only
exports.indexUsers = crudHandlerFactory.indexDoc(User);

// @desc   Retrieve a single user by ID
// @route  GET /api/v1/users/:id
// @access Admin access only
exports.showUser = crudHandlerFactory.showDoc(User);

// @desc   Create a user  (excluding password)
// @route  POST /api/v1/users/:id
// @access Admin access only
exports.storeUser = crudHandlerFactory.storeDoc(User);

// @desc   Update a user (Do Not update password)
// @route  PATCH /api/v1/users/:id
// @access Admin access only
exports.updateUser = crudHandlerFactory.updateDoc(User);

// @desc   Delete a user
// @route  DELETE /api/v1/users/:id
// @access Admin access only
exports.destroyUser = crudHandlerFactory.destroyDoc(User);
