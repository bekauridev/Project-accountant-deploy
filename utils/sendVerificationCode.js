const AppError = require("./AppError");
const sendEmail = require("./email");

const sendVerificationCode = async (user) => {
  // Generate a 6-digit numeric code
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.verificationCode = verificationCode;
  user.verificationCodeExpires = Date.now() + 10 * 60 * 1000; // Code valid for 10 minutes

  await user.save({ validateBeforeSave: false });

  // Send the verification code via email
  const message = `Your verification code: ${verificationCode}`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your verification code (valid for 10 minutes)",
      message,
    });
  } catch (err) {
    // In case email sending fails, reset the verification fields
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError("Error sending the verification email. Try again later!", 500);
  }
};

module.exports = sendVerificationCode;
