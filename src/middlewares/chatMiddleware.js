const Chat = require("../models/chatModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const isGroupAdmin = catchAsync(async (req, res, next) => {
	let { chatId } = req.body;

	if (!chatId) {
		return next(new AppError("Please provide a chat ID"));
	}
	const chat = await Chat.findById(chatId);
	if (!chat) {
		return next(new AppError("Chat not found with that ID"));
	}
	if (!chat.groupAdmin.equals(req.user._id)) {
		return next(new AppError("Only admin can perform this action"));
	}
	res.locals.chat = chat;
	next();
});

module.exports = { isGroupAdmin };
