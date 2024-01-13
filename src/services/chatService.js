const Chat = require("../models/chatModel");
const User = require("../models/userModel");

const AppError = require("../utils/appError");

const findChat = async (userId, friendId) => {
	var isChat = await Chat.find({
		isGroupChat: false,
		$and: [
			{ users: { $elemMatch: { $eq: userId } } },
			{ users: { $elemMatch: { $eq: friendId } } },
		],
	}).populate("latestMessage");

	isChat = await User.populate(isChat, {
		path: "latestMessage.sender",
		select: "name pic email",
	});

	return isChat;
};

const createNewChat = async (userId, friendId) => {
	var chatData = {
		chatName: "sender",
		isGroupChat: false,
		users: [userId, friendId],
	};

	const createdChat = await Chat.create(chatData);
	const fullChat = await Chat.findOne({ _id: createdChat._id }).populate(
		"users",
		"-password"
	);

	return fullChat;
};

const findAllChats = async (userId) => {
	let chat = await Chat.find({ users: { $elemMatch: { $eq: userId } } })
		.populate("latestMessage")
		.sort({ updatedAt: -1 });

	chat = await User.populate(chat, {
		path: "latestMessage.sender",
		select: "name pic email",
	});
	return chat;
};

const findChatById = async (userId, chat) => {
	const chatId = chat || undefined;
	let groupChat = await Chat.find({
		users: { $elemMatch: { $eq: userId } },
		_id: chatId,
	})
		.populate("latestMessage")
		.sort({ updatedAt: -1 });

	groupChat = await User.populate(groupChat, {
		path: "latestMessage.sender",
		select: "name pic email",
	});
	return groupChat;
};

const createNewGroupChat = async (input, users, user) => {
	const groupChat = await Chat.create({
		chatName: input.chatName,
		users: users,
		isGroupChat: true,
		groupAdmin: user,
	});

	const fullGroupChat = await Chat.findOne({ _id: groupChat._id });

	return fullGroupChat;
};

const updateGroupChat = async () => {};

module.exports = {
	findChat,
	createNewChat,
	findAllChats,
	findChatById,
	createNewGroupChat,
	updateGroupChat,
};
