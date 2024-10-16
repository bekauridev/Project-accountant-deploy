const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncMiddleware = require("../middlewares/asyncMiddleware");
const AppError = require("../utils/AppError");
const sendTokenResponse = require("../utils/sendTokenResponse");
const sendEmail = require("../utils/email");
const sendVerificationCode = require("../utils/sendVerificationCode");

exports.signup = asyncMiddleware(async (req, res, next) => {
  // Validate Input
  let userObj = {
    name: req.body.name,
    surname: req.body.surname,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  };

  if (req.body.phone) {
    userObj.phone = req.body.phone;
  }
  // Create unverified user
  const newUser = await User.create(userObj);

  try {
    await sendVerificationCode(newUser);
  } catch (error) {
    return next(error);
  }

  // Remove the verification code and expiration date before sending the response
  newUser.verificationCode = undefined;
  newUser.verificationCodeExpires = undefined;
  // Generate Token
  sendTokenResponse(newUser, 201, res);
});

// Verify user based on verification code
exports.verification = asyncMiddleware(async (req, res, next) => {
  const { email, verificationCode } = req.body;

  // Find the user by email end ensure the code has not expired
  const user = await User.findOne({
    email,
    verificationCodeExpires: { $gt: Date.now() },
  }).select("+verificationCode");

  // check user existence and Compare provided verification to the user's hashed one
  if (!user || !(await user.matchHashedField(verificationCode, user.verificationCode))) {
    return next(new AppError("Invalid or expired verification code", 401));
  }

  // Mark user as verified and remove the code fields
  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Generate Token
  sendTokenResponse(user, 200, res);
});

exports.login = asyncMiddleware(async (req, res, next) => {
  // Accept user credentials
  const { email, phone, password } = req.body;

  // Check credentials
  if ((!email && !phone) || !password)
    return next(
      new AppError(
        "Please provide either an email or phone number, and a password to login."
      ),
      400
    );

  let query = {};
  if (email) query = { ...query, email: email };
  if (phone) query = { ...query, phone: phone };

  // Check if user exists
  const user = await User.findOne(query).select("+password");

  // check user existence and Compare provided pass to the user's hashed one
  if (!user || !(await user.matchHashedField(password, user.password))) {
    return next(new AppError("Invalid credentials", 401));
  }

  //  If user is not  verified trigger the verification process
  if (!user.isVerified) {
    try {
      await sendVerificationCode(user);
      return res.status(200).json({
        status: "success",
        message: "Verification code sent. Please verify your account to log in.",
      });
    } catch (error) {
      return next(error); // Handle email sending error
    }
  }

  // Generate Token
  sendTokenResponse(user, 201, res);
});

exports.protect = asyncMiddleware(async (req, res, next) => {
  // Check if token exists
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.toLowerCase().startsWith("bearer ")
  ) {
    const tokenParts = req.headers.authorization.split(" ");
    if (tokenParts.length === 2) token = tokenParts[1];
  }

  if (!token) {
    return next(
      new AppError("Access denied! Please log in or sign up to continue.", 401)
    );
  }
  // Token validation (get user id from it )
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new AppError(
        "This account no longer exists. Please contact support for assistance.",
        401
      )
    );
  }

  //  Check if user changed password after the token was issued
  if (user.changedPasswordAfter(decoded.iat)) {
    return next(new AppError("Your password has been changed. Please log in again", 401));
  }

  req.user = user;
  next();
});

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError("You do not have permission to perform this action", 403));
    }
    next();
  };
};

exports.forgotPassword = asyncMiddleware(async (req, res, next) => {
  // Receive Email: Accept the user’s email from the request body.
  const user = await User.findOne(email);
  // Find User: Look for the user in the database using the provided email.
  // Generate Reset Token: If the user exists, create a password reset token and save it to the user record.
  // Create Reset URL: Construct a URL for resetting the password that includes the token.
  // Send Email: Send an email containing the reset URL to the user’s email address.
  // Send Response: Return a success response indicating that the email has been sent.
});

// 6. Reset Password
// Steps:
// Receive Token: Accept the reset token from the request parameters.
// Hash Token: Hash the provided token to match it against the stored token.
// Find User: Retrieve the user using the hashed token and check if it has not expired.
// Validate: If the token is invalid or expired, return an error.
// Update Password: If valid, update the user’s password with the new password from the request body.
// Clear Token Data: Clear the reset token and expiration fields in the user record.
// Generate Token: Call sendTokenResponse to generate a new JWT token.
// Send Response: Return a success response with the new token.

// 7. Update Password
// Steps:
// Receive Password Data: Accept the current password, new password, and password confirmation from the request body.
// Validate Input: Check that both new password and confirmation are provided.
// Find User: Retrieve the user from the database, including their current password.
// Verify Current Password: Check if the provided current password matches the stored password.
// Update Password: If valid, update the user's password with the new password.
// Save Changes: Save the updated user record in the database.
// Generate Token: Call sendTokenResponse to generate a new JWT token.
// Send Response: Return a success response with the new token.
