const {
	findAllMessagesOfAChat,
	findMessageById,
	findAllMessages,
	findNewMessagesSent,
	sendNewMessage,
} = require("../services/messageService");

const catchAsync = require("../utils/catchAsync");

//@description     Get all messages
//@route           GET /api/messages/:chatId
//@access          PROTECTED
const allMessages = catchAsync(async (req, res) => {
	const messages = await findAllMessagesOfAChat(req.params.chatId);

	res.status(200).json(messages);
});

//@description     Get message
//@route           GET /api/messages/detail/:messageId
//@access          PROTECTED
const getMessageById = catchAsync(async (req, res) => {
	const message = await findMessageById(req.params.messageId);

	res.status(200).json({ message });
});

//@description     Get all Messages (for admin only)
//@route           GET /api/messages
//@access          PROTECTED
const getAllMessagesForAdmin = catchAsync(async (req, res) => {
	const messages = await findAllMessages();

	res.status(200).json({
		length: messages.length,
		messages,
	});
});

//@description     Get all messages (for admin only)
//@route           GET /api/messages
//@access          PROTECTED
const getAllNewSentMessagesToday = catchAsync(async (req, res) => {
	const messages = await findNewMessagesSent();

	res.status(200).json({
		length: messages.length,
		messages,
	});
});

//@description     Create new message
//@route           POST /api/messages
//@access          PROTECTED
const sendMessage = catchAsync(async (req, res) => {
	const message = await sendNewMessage(req.body, req.user._id);

	res.status(201).json(message);
});

module.exports = {
	allMessages,
	getMessageById,
	sendMessage,
	getAllMessagesForAdmin,
	getAllNewSentMessagesToday,
};
