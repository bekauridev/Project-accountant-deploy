const express = require("express");
const usersController = require("../controllers/usersController");
const authController = require("../controllers/authController");

const router = express.Router();

router.use(authController.protect, authController.checkRole("admin", "user"));

router.patch("/updateMe", usersController.updateMe);
router.delete("/deleteMe", usersController.deleteMe);

router.use(authController.checkRole("admin"));

// Admin-only routes
router
  .route("/")
  .get(authController.protect, usersController.index)
  .post(usersController.storeUser);
router
  .route("/:id")
  .get(usersController.showUser)
  .patch(usersController.updateUser)
  .delete(usersController.destroyUser);

module.exports = router;
