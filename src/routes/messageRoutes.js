const express = require("express");

const {
	isAuthenticated,
	isAdmin,
	isUser,
} = require("../middlewares/authMiddleware");

const {
	sendMessage,
	allMessages,
	getAllMessagesForAdmin,
	getAllNewSentMessagesToday,
	getMessageById,
} = require("../controllers/messageController");

const router = express.Router();

router
	.route("/")
	.get(isAuthenticated, isAdmin, getAllMessagesForAdmin)
	.post(isAuthenticated, isUser, sendMessage);

router
	.route("/detail/:messageId")
	.get(isAuthenticated, isAdmin, getMessageById);

router
	.route("/new-sent-messages")
	.get(isAuthenticated, isAdmin, getAllNewSentMessagesToday);

router.route("/:chatId").get(isAuthenticated, allMessages);

module.exports = router;
