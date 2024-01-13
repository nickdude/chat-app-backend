const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");

// Search all users of a system (except Admin)
const findAllUsers = async (search) => {
	const keyword = search
		? {
				$or: [
					{ name: { $regex: search, $options: "i" } },
					{ email: { $regex: search, $options: "i" } },
					{ phoneNumber: { $regex: search, $options: "i" } },
				],
		  }
		: {};
	const users = await User.find({ ...keyword, isAdmin: false });
	return users;
};

// Get all friends of a user
const findAllFriends = async (user, keyword) => {
	const friends = await user.friends.filter((friend) => {
		return (
			friend.name?.toLowerCase().includes(keyword) ||
			friend.email?.toLowerCase().includes(keyword) ||
			friend.phoneNumber?.toLowerCase().includes(keyword)
		);
	});

	return friends;
};

// Get all users registered today
const findNewUsersRegisted = async () => {
	const today = new Date();
	// Set hours, minutes, seconds, and milliseconds to 0 for the current day.
	today.setHours(0, 0, 0, 0);

	const tomorrow = new Date(today);
	// Get the start of the next day.
	tomorrow.setDate(today.getDate() + 1);

	const users = await User.find({
		isAdmin: false,
		createdAt: {
			$gte: today,
			$lt: tomorrow,
		},
	});

	return users;
};

// Get user information
const findUserDetail = async (userId) => {
	const user = await User.findById(userId)
		.populate("friends")
		.populate("waitingAcceptedFriends")
		.populate("waitingRequestFriends");

	return user;
};

// Update current information
const updateCurrentUser = async (userId, name, email, phoneNumber) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			name,
			email,
			phoneNumber,
		},
		{ new: true }
	);
	return user;
};

// Update user information (for admin only).
const updateUser = async (userId, name, phoneNumber) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			name,
			phoneNumber,
		},
		{ new: true }
	);
	return user;
};

// Send friend request to a user
const sendRequest = async (userId, friendId) => {
	const user = await addUserToWaitingAcceptedList(userId, friendId);
	await addUserToWaitingRequestList(friendId, userId);
	return user;
};

// Cancel friend request to a user
const cancelRequest = async (userId, friendId) => {
	const user = await removeUserFromWaitingAcceptedList(userId, friendId);
	await removeUserFromWaitingRequestList(friendId, userId);
	return user;
};

// Accept friend request to a user
const acceptRequest = async (userId, friendId) => {
	await addUserToFriendsList(userId, friendId);
	await addUserToFriendsList(friendId, userId);

	await removeUserFromWaitingAcceptedList(friendId, userId);
	const user = await removeUserFromWaitingRequestList(userId, friendId);
	return user;
};

// Deny friend request to a user
const denyRequest = async (userId, friendId) => {
	const user = await removeUserFromWaitingRequestList(userId, friendId);
	await removeUserFromWaitingAcceptedList(friendId, userId);
	return user;
};

// Remove friendship
const removeFriendship = async (userId, friendId) => {
	await removeUserFromFriendsList(userId, friendId);
	const user = await removeUserFromFriendsList(friendId, userId);
	return user;
};

// Add new user to waiting accepted friends list
const addUserToWaitingAcceptedList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$push: { waitingAcceptedFriends: friendId },
		},
		{ new: true }
	);
	return user;
};

// Add new user to waiting requested friends list
const addUserToWaitingRequestList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$push: { waitingRequestFriends: friendId },
		},
		{ new: true }
	);
	return user;
};

// Remove user from waiting accepted friends list
const removeUserFromWaitingAcceptedList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$pull: { waitingAcceptedFriends: friendId },
		},
		{ new: true }
	);
	return user;
};

// Remove user from waiting requested friends list
const removeUserFromWaitingRequestList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(
		userId,
		{
			$pull: { waitingRequestFriends: friendId },
		},
		{ new: true }
	);
	return user;
};

// Add user to friends list
const addUserToFriendsList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(userId, {
		$push: { friends: friendId },
	});
	return user;
};

// Remove user from friends list
const removeUserFromFriendsList = async (userId, friendId) => {
	const user = await User.findByIdAndUpdate(userId, {
		$pull: { friends: friendId },
	});
	return user;
};

module.exports = {
	findAllUsers,
	findAllFriends,
	findNewUsersRegisted,
	findUserDetail,
	updateCurrentUser,
	updateUser,
	sendRequest,
	cancelRequest,
	acceptRequest,
	denyRequest,
	removeFriendship,
};
