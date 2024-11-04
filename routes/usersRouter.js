const express = require("express");
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");
const organizationRouter = require("../routes/organizationRouter");
const router = express.Router();

router.use(authController.protect);

// router.use("/userId/organization", organizationRouter);

router.patch(
  "/updateMe",
  usersController.declinePasswordUpdate,
  usersController.updateMe
);

router.delete("/deleteMe", usersController.deleteMe);
router.get("/:id", usersController.showUser); // Retrieve a specific user by ID

// Admin-only routes
router.use(authController.checkRole("admin"));
// Admin routes for user management
router
  .route("/")
  .get(usersController.indexUsers) // Retrieve all users
  .post(usersController.storeUser); // Create a new user

router
  .route("/:id")
  .patch(usersController.declinePasswordUpdate, usersController.updateUser) // Update a user
  .delete(usersController.destroyUser); // Delete a user

module.exports = router;
