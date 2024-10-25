const crudHandlerFactory = require("../controllers/crudHandlerFactory");
const Task = require("../models/taskModel");
const Organization = require("../models/organizationModel");
const { filterByLoggedInUser } = require("../utils/hepler");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");

exports.setOrganizationAndUserId = asyncMiddleware(async (req, res, next) => {
  // Automatically set organization and user if not in req.body
  if (!req.body.organization) req.body.organization = req.params.organizationId;
  if (!req.body.user) req.body.user = req.user.id;

  // Check if organization exists and is related to the user
  const organization = await Organization.findOne({
    _id: req.body.organization,
    user: req.body.user,
  });

  // If organization is not found or does not belong to the user, return error
  if (!organization) {
    return next(
      new AppError(
        `No organization found with ID: ${req.body.organization} for this user`,
        404
      )
    );
  }

  next();
});

/////////////////////////////////////
// CRUD Using crudHandlerFactory

// @desc   Retrieve a list of Tasks
// @route  GET /api/v1/tasks/
// @access Private
exports.indexTask = crudHandlerFactory.indexDoc(Task, filterByLoggedInUser);

// @desc   Retrieve a single task by ID
// @route  GET /api/v1/tasks/:id
// @access Private
exports.showTask = crudHandlerFactory.showDoc(Task, filterByLoggedInUser);

// @desc   Create a Task
// @route  POST /api/v1/task/
// @access Private
exports.storeTask = crudHandlerFactory.storeDoc(Task);

// @desc   Update a Task
// @route  PATCH /api/v1/tasks/:id
// @access Private
exports.updateTask = crudHandlerFactory.updateDoc(Task, filterByLoggedInUser);

// @desc   Delete a Task
// @route  DELETE /api/v1/tasks/:id
// @access Private
exports.destroyTask = crudHandlerFactory.destroyDoc(Task, filterByLoggedInUser);
