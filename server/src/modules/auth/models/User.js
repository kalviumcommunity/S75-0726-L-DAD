const mongoose = require('mongoose');
const { USER_ROLES } = require('../../../constants/logistics.constants');

const emailPattern = /^\S+@\S+\.\S+$/;

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
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

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
