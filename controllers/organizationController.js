const Organization = require("../models/organizationModel");
const crudHandlerFactory = require("../controllers/crudHandlerFactory");
// ///////////////////////////////////
// CRUD Using crudHandlerFactory

// @desc   Retrieve a list of Organizations
// @route  GET /api/v1/users/
// @access Admin access only
exports.indexUser = crudHandlerFactory.indexDoc(Organization);

// @desc   Retrieve a single Organization by ID
// @route  GET /api/v1/users/:id
// @access Admin access only
exports.showUser = crudHandlerFactory.showDoc(Organization);

// @desc   Update a Organization's details
// @route  POST /api/v1/users/:id
// @access Admin access only
exports.storeUser = crudHandlerFactory.storeDoc(Organization);

// @desc   Update a Organization
// @route  PATCH /api/v1/users/:id
// @access Admin access only
exports.updateUser = crudHandlerFactory.updateDoc(Organization);

// @desc   Delete a Organization
// @route  DELETE /api/v1/users/:id
// @access Admin access only
exports.destroyUser = crudHandlerFactory.destroyDoc(Organization);
