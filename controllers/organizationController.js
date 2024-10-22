const Organization = require("../models/organizationModel");
const crudHandlerFactory = require("../controllers/crudHandlerFactory");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");
const User = require("../models/userModel");
const ApiFeatures = require("../utils/apiFeatures");

// @desc    Set user ID automatically when during organization creation
// @route   Middleware
// @for     storeOrganization
exports.setUserId = asyncMiddleware(async (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  const user = await User.findById(req.body.user);

  if (!user) return next(new AppError(`No user found with ID: ${req.body.userId}`, 404));

  next();
});

const filterByLoggedInUser = (req) => {
  return { user: req.user.id }; // Filter by the logged-in user's ID
};

// ///////////////////////////////////
// CRUD Using crudHandlerFactory

// @desc   Retrieve a list of Organizations
// @route  GET /api/v1/organization/
// @access Private
exports.indexOrganization = crudHandlerFactory.indexDoc(
  Organization,
  filterByLoggedInUser
);

// @desc   Retrieve a single Organization by ID
// @route  GET /api/v1/organization/:id
// @access Private
exports.showOrganization = crudHandlerFactory.showDoc(Organization, filterByLoggedInUser);

// @desc   Update a Organization's details
// @route  POST /api/v1/organization/:id
// @access Private
exports.storeOrganization = crudHandlerFactory.storeDoc(Organization);

// @desc   Update a Organization
// @route  PATCH /api/v1/organization/:id
// @access Private
exports.updateOrganization = crudHandlerFactory.updateDoc(
  Organization,
  filterByLoggedInUser
);

// @desc   Delete a Organization
// @route  DELETE /api/v1/organization/:id
// @access Private
exports.destroyOrganization = crudHandlerFactory.destroyDoc(
  Organization,
  filterByLoggedInUser
);
