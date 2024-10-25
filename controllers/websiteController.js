const asyncMiddleware = require("../middlewares/asyncMiddleware");
const Organization = require("../models/organizationModel");

const AppError = require("../utils/AppError");

// Order to see all websites you should go to this Route
// @route  GET /api/v1/organizations/

// @desc   Create a new website
// @route  GET /api/v1/organizations/organizationId/websites
// @access Private
exports.createWebsite = asyncMiddleware(async (req, res, next) => {
  const organizationId = req.params.organizationId;

  const newWebsite = {
    name: req.body.name,
    url: req.body.url,
    identificationCodeRecord: req.body.identificationCodeRecord,
    passwordRecord: req.body.passwordRecord,
  };

  // Update the organization by pushing the new website into the embedded array
  const updatedOrganization = await Organization.findByIdAndUpdate(
    organizationId,
    { $push: { websites: newWebsite } },
    { new: true, runValidators: true }
  );

  if (!updatedOrganization) {
    return next(new AppError(`No organization found with id of ${organizationId}`, 404));
  }

  res.status(201).json({
    status: "success",
    data: {
      organization: updatedOrganization,
    },
  });
});

// @desc   Update an existing website
// @route  PATCH /api/v1/organizations/organizationId/websites/websiteId
// @access Private
exports.updateWebsite = asyncMiddleware(async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const websiteId = req.params.websiteId;

  const organization = await Organization.findById(organizationId);

  if (!organization) {
    return next(new AppError(`No organization found with id of ${organizationId}`, 404));
  }

  // Find the website by its unique ID within the websites array
  const website = organization.websites.id(websiteId);

  if (!website) {
    return next(new AppError(`No website found with id of ${websiteId}`, 404));
  }

  // Update the website fields
  Object.assign(website, req.body);

  // Save the updated organization document
  await organization.save();

  res.status(200).json({
    status: "success",
    data: {
      updatedWebsite: website,
    },
  });
});

// @desc   Delete multiple or single website
// @route  DELETE /api/v1/organizatiosn/organizationId/websites
// @route  DELETE /api/v1/organizations/organizationId/websites/websiteId
exports.deleteWebsite = asyncMiddleware(async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const websiteId = req.params.websiteId;

  // First, find the organization and check if websites array is empty
  const organization = await Organization.findById(organizationId);

  if (!organization) {
    return next(new AppError(`No organization found with id of ${organizationId}`, 404));
  }

  if (organization.websites.length === 0) {
    return next(
      new AppError(`The websites list is already empty for this organization.`, 400)
    );
  }

  let updatedOrganization;

  if (websiteId) {
    // Check if the specified website exists in the organization
    const websiteExists = organization.websites.id(websiteId);

    if (!websiteExists) {
      return next(new AppError(`No website found with the provided ID`, 404));
    }

    // Remove the website by its ID from the embedded array
    updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { $pull: { websites: { _id: websiteId } } },
      { new: true, runValidators: true }
    );
  } else {
    // If no websiteId is provided, remove all websites
    updatedOrganization = await Organization.findByIdAndUpdate(
      organizationId,
      { $set: { websites: [] } },
      { new: true, runValidators: true }
    );
  }

  // Check if the update was successful
  if (!updatedOrganization) {
    return next(
      new AppError(`Failed to update organization with id of ${organizationId}`, 500)
    );
  }

  res.status(204).json({
    status: "success",
    data: null,
  });
});
