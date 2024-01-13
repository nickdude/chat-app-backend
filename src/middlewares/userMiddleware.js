const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const isAvailableToSendFriendRequest = catchAsync(async (req, res, next) => {
	const friend = await User.findById(req.body.userId);
	if (!friend) {
		return next(new AppError(`No user found with that ID!`, 404));
	}
	if (friend._id.equals(req.user._id)) {
		return next(new AppError(`You can't add yourself as a friend!`, 400));
	}
	if (friend.friends.includes(req.user._id)) {
		return next(new AppError(`You are already friends with this user!`, 400));
	}
	if (friend.waitingRequestFriends.includes(req.user._id)) {
		return next(
			new AppError(
				`You have already sent a request to this user! Wait for their response!`,
				400
			)
		);
	}
	next();
});

const isAvailableToAcceptFriendRequest = catchAsync(async (req, res, next) => {
	const friend = await User.findById(req.body.userId);
	if (!friend) {
		return next(new AppError(`No user found with that ID`, 404));
	}
	if (friend._id.equals(req.user._id)) {
		return next(
			new AppError(`You can't accept yourself to become a friend!`, 400)
		);
	}
	next();
});

const isAvailableToDenyFriendRequest = catchAsync(async (req, res, next) => {
	if (req.user.friends.includes(req.body.userId)) {
		return next(new AppError(`You are already friends with this user`, 400));
	}
	next();
});

const isAvailableToRemoveFriend = catchAsync(async (req, res, next) => {
	const friends = req.user.friends;
	if (!friends.includes(req.body.userId)) {
		return next(new AppError(`You are not a friend of this user`, 400));
	}
	next();
});

module.exports = {
	isAvailableToSendFriendRequest,
	isAvailableToAcceptFriendRequest,
	isAvailableToDenyFriendRequest,
	isAvailableToRemoveFriend,
};
