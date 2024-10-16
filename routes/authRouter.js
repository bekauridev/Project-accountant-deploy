const express = require("express");
const authController = require("../controllers/authController");
const verificationController = require("../controllers/verificationController");
const router = express.Router();

router.post("/signup", authController.signup);

router.post("/login", authController.login);
router.post("/forgotPassword", authController.forgotPassword);

router.use(authController.protect);
router.post(
  "/send-verification-code",
  verificationController.sendVerificationCodeHandler
);
router.post("/verification", verificationController.verification);

module.exports = router;
