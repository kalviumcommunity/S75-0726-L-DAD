const mongoose = require('mongoose');
const { USER_ROLES } = require('../../../constants/logistics.constants');

// Deliberately lightweight: address ownership is verified by the auth flow, not regex.
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [emailPattern, 'Please provide a valid email address'],
    },
    // Hash this value in the authentication service before saving; never expose it by default.
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(USER_ROLES), required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (_document, returnedObject) => {
        delete returnedObject.password;
        return returnedObject;
      },
    },
  },
);

userSchema.index({ email: 1 }, { unique: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
