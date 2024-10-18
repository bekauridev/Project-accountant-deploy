const express = require("express");
const organizationController = require("../controllers/organizationController");

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(organizationController.indexOrganization)
  .post(organizationController.storeOrganization);

router
  .route("/:id")
  .get(organizationController.showOrganization) // Retrieve a specific doc by ID
  .patch(organizationController.updateOrganization) // Update a doc
  .delete(organizationController.destroyOrganization); // Delete a doc

module.exports = router;
