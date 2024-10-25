const express = require("express");
const organizationController = require("../controllers/organizationController");
const authController = require("../controllers/authController");
const websiteRouter = require("./websiteRouter");
const taskRouter = require("./taskRouter");
const setUserIdMiddleware = require("../middlewares/setUserIdMiddleware");
const router = express.Router();

// Redirecting to Website Router
router.use("/:organizationId/websites", websiteRouter);
router.use("/:organizationId/tasks", taskRouter);

router.use(authController.protect);
router
  .route("/")
  .get(organizationController.indexOrganization)
  .post(setUserIdMiddleware.setUserId, organizationController.storeOrganization);

router
  .route("/:id")
  .get(organizationController.showOrganization) // Retrieve a specific doc by ID
  .patch(organizationController.updateOrganization) // Update a doc
  .delete(organizationController.destroyOrganization); // Delete a doc

module.exports = router;
