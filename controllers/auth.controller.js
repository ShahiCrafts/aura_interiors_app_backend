const User = require("../models/user.model");
const { generateVerificationEmail } = require("../utils/emailTemplate");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

const generateAccessToken = (user) => {
  // passing user instance to create payload
  return jwt.sign(
    {
      id: user._id,
      role: user.role, // payload
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    let user = await User.findOne({ email });

    if (user && user.isVerified) {
      return res.status(400).json({
        message: "Account already exists with this email!",
      });
    }

    if (user && !user.isVerified) {
      const verificationCode = user.createVerificationCode();
      await user.save();

      const htmlEmailTemplate = generateVerificationEmail(
        user.email,
        verificationCode
      );

      await sendEmail(
        user.email,
        "Verify your Aura Interiors Account",
        htmlEmailTemplate
      );

      return res.status(200).json({
        message:
          "Account already exists but is not verified. A new code has been sent.",
        nextStep: "verify",
      });
    }

    user = new User({ email, password });

    const verificationCode = user.createVerificationCode();
    await user.save();

    const htmlEmailTemplate = generateVerificationEmail(
      user.email,
      verificationCode
    );

    await sendEmail(
      user.email,
      "Verify your Aura Interiors Account",
      htmlEmailTemplate
    );

    res.status(200).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      nextStep: "verify",
    });
  } catch (error) {
    next(error);
  }
};

const verifyUser = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found!" });
    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified!",
      });
    }

    const isValid = user.isVerificationCodeValid(code);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid or expired verification code" });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(200).json({
      message: "Account verified successfully",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationCode = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) {
      return res.status(400).json({
        message: "User already verified",
      });
    }

    const verificationCode = user.createVerificationCode();
    await user.save();

    const htmlEmailTemplate = generateVerificationEmail(
      user.email,
      verificationCode
    );

    await sendEmail(
      user.email,
      "Resend Verification - Aura Interiors Account",
      htmlEmailTemplate
    );

    res.status(200).json({ message: "Verification code resent successfully" });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) {
      return res.status(400).json({
        message: "Account not verfied. Please verify before login.",
        nextStep: "verify",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const accessToken = generateAccessToken();
    const refreshToken = generateRefreshToken();

    res.status(200).json({
      message: "Login successful",
      user: {
        _id: user._id,
        email: user.email,
        role: user.role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (error, decoded) => {
        if (error) {
          return res.status(401).json({
            message: "Session expired. Please log in again.",
          });
        }

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        const newAccessToken = generateAccessToken(user);
        res.status(200).json({
          accessToken: newAccessToken,
        });
      }
    );
  } catch (error) {
    next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    res.status(200).json({
      message: "Logged out successfully.",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  verifyUser,
  resendVerificationCode,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
