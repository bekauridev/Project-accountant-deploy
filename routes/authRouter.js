const express = require("express");
const authController = require("../controllers/authController");
const router = express.Router();

router.post("/verification", authController.protect, authController.verification);

router.post("/signup", authController.signup);

router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);

module.exports = router;
