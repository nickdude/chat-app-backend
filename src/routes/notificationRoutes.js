const express = require("express");

const { isAuthenticated, isUser } = require("../middlewares/authMiddleware");
const {
	getAllUnreadNotifications,
	createNewNotification,
	readNotifications,
} = require("../controllers/notificationController");

const router = express.Router();

router
	.route("/")
	.get(isAuthenticated, isUser, getAllUnreadNotifications)
	.post(isAuthenticated, isUser, createNewNotification)
	.patch(isAuthenticated, isUser, readNotifications);

module.exports = router;
