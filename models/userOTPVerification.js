const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const UserOTPVerificationSchema = new Schema({
  userId: String,
  otp:String,
  createdAt: Date,
  expiresAt: Date,
});

const UserOTPVerification = mongoose.model(
  "userOTPVerification",
  UserOTPVerificationSchema
);

module.exports = UserOTPVerification;