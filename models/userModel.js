const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const zxcvbn = require("zxcvbn");
const AppError = require("../utils/AppError");
const hashToken = require("../utils/hashToken");
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  name: {
    type: String,
    trim: true,
    required: [true, "A user must have name!"],
  },
  surname: {
    type: String,
    trim: true,
    required: [true, "A user must have surname!"],
  },

  email: {
    type: String,
    required: [true, "A user must have email!"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },

  phone: {
    type: String,
    unique: true,
    sparse: true, // Ensure Mongoose skips uniqueness check on null or undefined
    validate: [validator.isMobilePhone, "Please provide a valid phone number"],
  },
  password: {
    type: String,
    minlength: 8,
    select: false,
    required: [true, "A user must have password!"],
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please add a password confirmation"],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Passwords do not match",
    },
  },
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationCode: {
    type: String,
    select: false,
  },
  verificationCodeExpires: {
    type: Date,
  },

  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
});

// Hash verification code before saving
userSchema.pre("save", async function (next) {
  // Only hash the verification code if it exists and is being modified
  if (this.isModified("verificationCode") && this.verificationCode) {
    const salt = await bcrypt.genSalt(12);
    this.verificationCode = await bcrypt.hash(this.verificationCode, salt);
  }

  next();
});
// Hash password before saving
userSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // ! (TEMP CLOSED) Check password Strength
  // const passwordStrength = zxcvbn(this.password);
  // if (passwordStrength.score < 4) {
  //   const { warning, suggestions } = passwordStrength.feedback;
  //   // Build error message
  //   let errorMsg = "Weak password!";
  //   if (warning) errorMsg += ` ${warning}`;
  //   if (suggestions) errorMsg += `  ${suggestions.join(" ")}`;

  //   return next(new AppError(errorMsg, 400));
  // }

  // Hash pass
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Delete passwordConfirm field
  this.passwordConfirm = undefined;

  // move on ^-
  next();
});

// Update the passwordChangedAt field before saving the user document (crucial for changedPasswordAfter with is used in (protect))
userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Sing jwt token
userSchema.methods.getSignedJwt = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

userSchema.methods.matchHashedField = async function (candidateValue, storedHashedValue) {
  return await bcrypt.compare(candidateValue, storedHashedValue);
};

// Check if user changed password after the token was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp; // True if password was changed after token was issued
  }

  return false;
};
// Password reset token
userSchema.methods.getPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = hashToken(resetToken);
  console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
