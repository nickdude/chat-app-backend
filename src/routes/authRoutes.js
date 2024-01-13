const express = require("express");

const {
	signup,
	login,
	logout,
	updatePassword,
	forgotPassword,
	resetPassword,
	resetToDefaultPassword,
} = require("../controllers/authController");
const {
	isAuthenticated,
	isAdmin,
	isUser,
} = require("../middlewares/authMiddleware");

const router = express.Router();

router.route("/register").post(signup);

router.route("/login").post(login);

router.route("/logout").get(logout);

router.route("/update-password").patch(isAuthenticated, isUser, updatePassword);

router.route("/forgot-password").patch(forgotPassword);

router
	.route("/reset-default-password")
	.patch(isAuthenticated, isAdmin, resetToDefaultPassword);

router.route("/reset-password/:token").patch(resetPassword);
module.exports = router;
