const express = require("express");
const router = express.Router();
const {
  registerUser,
  verifyUser,
  resendVerificationCode,
  loginUser,
  refreshAccessToken,
  logoutUser,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/verify", verifyUser);
router.post("/verification/resend", resendVerificationCode);
router.post("/login", loginUser);
router.post("/token/refresh", refreshAccessToken);
router.post("/logout", logoutUser);

module.exports = router;
