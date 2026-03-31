import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    accountNumber: {
      type: String,
      required: true,
      unique: true,
      length: 10,
    },
    loginOtpHash: {
      type: String,
      default: null,
    },
    loginOtpExpiresAt: {
      type: Date,
      default: null,
    },
    loginOtpAttempts: {
      type: Number,
      default: 0,
    },
    loginOtpLockUntil: {
      type: Date,
      default: null,
    },
    loginPasswordAttempts: {
      type: Number,
      default: 0,
    },
    loginPasswordLockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.model('User', userSchema)
