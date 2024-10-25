const express = require("express");
const authController = require("../controllers/authController");
const taskController = require("../controllers/taskController");
const setUserIdMiddleware = require("../middlewares/setUserIdMiddleware");
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router.route("/").get(taskController.indexTask).post(
  // setUserIdMiddleware.setUserId,
  taskController.setOrganizationAndUserId,
  taskController.storeTask
);

router
  .route("/:id")
  .get(taskController.showTask)
  .patch(taskController.updateTask)
  .delete(taskController.destroyTask);

module.exports = router;
