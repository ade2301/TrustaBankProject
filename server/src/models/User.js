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
    // PIN Authentication
    pinHash: {
      type: String,
      default: null,
    },
    transactionPinHash: {
      type: String,
      default: null,
    },
    failedPinAttempts: {
      type: Number,
      default: 0,
    },
    pinLockedUntil: {
      type: Date,
      default: null,
    },
    // Onboarding
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    isDemoAccount: {
      type: Boolean,
      default: false,
    },
    walletBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalIncome: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalExpenses: {
      type: Number,
      default: 0,
      min: 0,
    },
    loginBonusGranted: {
      type: Boolean,
      default: false,
    },
    personalInfo: {
      dateOfBirth: String,
      gender: String,
      nationality: String,
      countryOfResidence: String,
    },
    contactInfo: {
      phoneNumber: String,
      physicalAddress: String,
      verified: Boolean,
      default: false,
    },
    contactInfo: {
      phoneNumber: String,
      physicalAddress: String,
      verified: {
        type: Boolean,
        default: false,
      },
    },
    // Device fingerprinting
    deviceFingerprints: [
      {
        ip: String,
        userAgent: String,
        deviceId: String,
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastLoginIp: String,
    lastLoginAt: Date,
    // Original OTP fields
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
