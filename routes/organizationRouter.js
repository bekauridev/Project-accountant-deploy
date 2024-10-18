const express = require("express");

const router = express.Router();

router.route("/").get(usersController.indexUser).post(usersController.storeUser);

router
  .route("/:id")
  .get(usersController.showUser) // Retrieve a specific user by ID
  .patch(usersController.declinePasswordUpdate, usersController.updateUser) // Update a user
  .delete(usersController.destroyUser); // Delete a user

module.exports = router;
