const express = require("express");
const {
	accessChat,
	fetchChats,
	fetchChatById,
	createGroupChat,
	updateGroupChat,
} = require("../controllers/chatController");

const { isAuthenticated, isUser } = require("../middlewares/authMiddleware");
const { isGroupAdmin } = require("../middlewares/chatMiddleware");

const router = express.Router();

router
	.route("/")
	.get(isAuthenticated, isUser, fetchChats)
	.post(isAuthenticated, isUser, accessChat);

router.route("/:chatId").get(isAuthenticated, isUser, fetchChatById);

router
	.route("/create-group-chat")
	.post(isAuthenticated, isUser, createGroupChat);

router
	.route("/update-group-chat")
	.patch(isAuthenticated, isUser, isGroupAdmin, updateGroupChat);

module.exports = router;
