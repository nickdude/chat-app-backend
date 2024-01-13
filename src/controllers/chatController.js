const Chat = require("../models/chatModel");
const User = require("../models/userModel");
const {
	findChat,
	createNewChat,
	findAllChats,
	findChatById,
	createNewGroupChat,
} = require("../services/chatService");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

//@description     Create or fetch One to One Chat
//@route           POST /api/chats
//@access          PROTECTED
const accessChat = catchAsync(async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({
			message: "UserId not sent with request",
		});
	}

	var isChat = await findChat(req.user._id, userId);

	if (isChat.length > 0) {
		res.status(200).json(isChat[0]);
	} else {
		const fullChat = await createNewChat(req.user._id, userId);
		res.status(200).json(fullChat);
	}
});

//@description     Fetch all chats for a user
//@route           GET /api/chats
//@access          PROTECTED
const fetchChats = catchAsync(async (req, res) => {
	try {
		const results = await findAllChats(req.user._id);
		res.status(200).send(results);
	} catch (error) {
		res.status(400);
		throw new AppError(error.message);
	}
});

//@description     Fetch chat by ID for a user
//@route           GET /api/chats/:chatId
//@access          PROTECTED
const fetchChatById = catchAsync(async (req, res) => {
	const chatId = req.params.chatId || undefined;
	try {
		const results = await findChatById(req.user._id, chatId);
		res.status(200).send(results);
	} catch (error) {
		res.status(400);
		throw new AppError(error.message);
	}
});

//@description     Create New Group Chat
//@route           POST /api/chats/create-group-chat
//@access          PROTECTED
const createGroupChat = catchAsync(async (req, res) => {
	if (!req.body.users || !req.body.chatName) {
		return res.status(400).send({ message: "Please fill all the fields" });
	}
	var users = req.body.users;
	if (users.length < 2) {
		return res
			.status(400)
			.send("More than 2 users are required to form a group chat");
	}
	users.push(req.user);
	try {
		const fullGroupChat = await createNewGroupChat(req.body, users, req.user);
		res.status(200).json(fullGroupChat);
	} catch (error) {
		res.status(400);
		throw new AppError(error.message);
	}
});

//@description		Update group chat - used only by admin
//@route					PATCH /api/chats/update-group-chat
//@access					PROTECTED
const updateGroupChat = catchAsync(async (req, res, next) => {
	let { chatName, addedMembers, removedMembers } = req.body;
	addedMembers = addedMembers ? addedMembers : [];
	removedMembers = removedMembers ? removedMembers : [];

	const chat = res.locals.chat || {};
	chat.chatName = chatName || chat.chatName;
	chat.users.addToSet(...addedMembers);
	chat.users.pull(...removedMembers);
	await chat.save();

	res.status(200).json({
		message: "Updated group chat successfully",
		chat,
	});
});

module.exports = {
	accessChat,
	fetchChats,
	fetchChatById,
	createGroupChat,
	updateGroupChat,
};
