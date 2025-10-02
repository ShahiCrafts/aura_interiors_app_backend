const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
    },
    address: [
      {
        province: {
          type: String,
          required: true,
        },
        district: {
          type: String,
          required: true,
        },
        municipality: {
          type: String,
          required: true,
        },
        ward: {
          type: String,
          required: true,
        },
        street: {
          type: String,
        },
        postalCode: {
          type: String,
        },
      },
    ],
    authProvider: {
      type: String,
      enum: ["local", "google", "apple"],
      default: "local",
    },
    providerId: {
      type: String,
      trim: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
    },
    verificationTokenExpires: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook for password hashing..
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Method to compare password during login
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to create 6-digit OTP verification code
userSchema.methods.createVerificationCode = function () {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  this.verificationToken = crypto
    .createHash("sha256")
    .update(code)
    .digest("hex");

  this.verificationTokenExpires = Date.now() + 10 * 60 * 1000;
  return code;
};

// Method to validate OTP
userSchema.methods.isVerificationCodeValid = function (enteredCode) {
  if (!this.verificationToken || !this.verificationTokenExpires) return false;

  const hashedCode = crypto
    .createHash("sha256")
    .update(enteredCode)
    .digest("hex");

  const isCodeMatch = hashedCode == this.verificationToken;
  const isNotExpired = Date.now() < this.verificationTokenExpires;

  return isCodeMatch && isNotExpired;
};

module.exports = mongoose.model("User", userSchema);
