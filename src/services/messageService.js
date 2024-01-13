const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const Message = require("../models/messageModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const messageSchema = require("../validations/messageSchema");

// Get all messages of a chat
const findAllMessagesOfAChat = async (chatId) => {
	const messages = await Message.find({ chat: chatId })
		.populate("sender", "name pic email")
		.populate("chat");
	return messages;
};

// Get message detail by ID
const findMessageById = async (messageId) => {
	let message = await Message.findById(messageId)
		.populate("sender", "name pic email")
		.populate("chat");
	message = await User.populate(message, {
		path: "chat.users",
		select: "name pic email",
	});
	return message;
};

// Get all messages for admin only
const findAllMessages = async () => {
	const messages = await Message.find().sort({ createdAt: -1 });
	return messages;
};

// Get all messages sent today
const findNewMessagesSent = async () => {
	const today = new Date();
	// Set hours, minutes, seconds, and milliseconds to 0 for the current day.
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	// Get the start of the next day.
	tomorrow.setDate(today.getDate() + 1);

	const messages = await Message.find({
		createdAt: {
			$gte: today,
			$lt: tomorrow,
		},
	});
	return messages;
};

// Send new message
const sendNewMessage = async (input, userId) => {
	const newMessage = await validateNewMessage(input, userId);

	var message = await Message.create(newMessage);
	message = await message.populate("sender", "name pic");
	message = await message.populate("chat");
	message = await User.populate(message, {
		path: "chat.users",
		select: "name pic email",
	});
	await Chat.findByIdAndUpdate(input.chatId, { latestMessage: message });
	return message;
};

// Validate new message input
const validateNewMessage = async (input, userId) => {
	const { content, type, mimeType, fileName, chatId } = input;
	var newMessage = {
		sender: userId,
		content: content.trim(),
		chat: chatId,
		type,
		mimeType,
		fileName,
	};

	try {
		await messageSchema.validateAsync(newMessage, {
			abortEarly: false,
		});
	} catch (e) {
		console.log("Failed to validate new message");
	}
	return newMessage;
};

module.exports = {
	findAllMessagesOfAChat,
	findMessageById,
	findAllMessages,
	findNewMessagesSent,
	sendNewMessage,
};
