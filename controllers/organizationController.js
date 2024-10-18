const Organization = require("../models/organizationModel");
const crudHandlerFactory = require("../controllers/crudHandlerFactory");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");

// Set user ID automatically when during organization creation
exports.setUserId = asyncMiddleware(async (req, res, next) => {
  if (!req.body.userId) req.body.user = req.params.userId;

  const user = await User.findById(req.body.userId);

  if (!user) return next(new AppError(`No user found with ID: ${req.body.userId}`, 404));

  next();
});
// ///////////////////////////////////
// CRUD Using crudHandlerFactory

// @desc   Retrieve a list of Organizations
// @route  GET /api/v1/organization/
// @access Private
exports.indexOrganization = crudHandlerFactory.indexDoc(Organization);

// @desc   Retrieve a single Organization by ID
// @route  GET /api/v1/organization/:id
// @access Private
exports.showOrganization = crudHandlerFactory.showDoc(Organization);

// @desc   Update a Organization's details
// @route  POST /api/v1/organization/:id
// @access Private
exports.storeOrganization = crudHandlerFactory.storeDoc(Organization);

// @desc   Update a Organization
// @route  PATCH /api/v1/organization/:id
// @access Private
exports.updateOrganization = crudHandlerFactory.updateDoc(Organization);

// @desc   Delete a Organization
// @route  DELETE /api/v1/organization/:id
// @access Private
exports.destroyOrganization = crudHandlerFactory.destroyDoc(Organization);
