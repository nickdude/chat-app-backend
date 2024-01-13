const {
	findAllUsers,
	findAllFriends,
	findUserDetail,
	findNewUsersRegisted,
	updateCurrentUser,
	updateUser,
	sendRequest,
	cancelRequest,
	acceptRequest,
	denyRequest,
	removeFriendship,
} = require("../services/userService");

const catchAsync = require("../utils/catchAsync");

//@description     Search all users of a system (except Admin)
//@route           GET /api/users/
//@access          PROTECTED
const getAllUsers = catchAsync(async (req, res) => {
	const users = await findAllUsers(req.query.search);

	res.status(200).json({
		length: users.length,
		users,
	});
});

//@description     Get current user information
//@route           GET /api/users/me
//@access          PROTECTED
const getCurrentUserDetail = catchAsync(async (req, res) => {
	const user = await findUserDetail(req.user._id);

	res.status(200).json({
		user,
	});
});

//@description     Get user information by ID
//@route           GET /api/users/profile/:userId
//@access          PROTECTED
const getUserDetailById = catchAsync(async (req, res) => {
	const user = await findUserDetail(req.params.userId);

	res.status(200).json({
		user,
	});
});

//@description     Get all new registed users of a system (except Admin)
//@route           GET /api/users/new-registed-users
//@access          PROTECTED
const getAllNewUsersRegistedToday = catchAsync(async (req, res) => {
	const users = await findNewUsersRegisted();

	res.status(200).json({
		length: users.length,
		users,
	});
});

//@description		Update current user information
//@route					PATCH /api/users/me
//@access					PROTECTED
const updateCurrentUserDetail = catchAsync(async (req, res) => {
	const name = req.body.name || req.user.name;
	const email = req.body.email || req.user.email;
	const phoneNumber = req.body.phoneNumber || req.user.phoneNumber;
	const user = await updateCurrentUser(req.user._id, name, email, phoneNumber);

	res.status(200).json({
		user,
	});
});

//@description		Update user information (for admin only)
//@route					PATCH /api/users/update-user-profile
//@access					PROTECTED
const updateUserDetail = catchAsync(async (req, res) => {
	const user = await updateUser(
		req.body.userId,
		req.body.name,
		req.body.phoneNumber || ""
	);

	res.status(200).json({
		user,
	});
});

//@description		Search all friends of a user
//@route					GET /api/users/friends
//@access					PROTECTED
const getAllFriends = catchAsync(async (req, res) => {
	const user = await req.user.populate("friends");
	const keyword = req.query.search?.toLowerCase() || "";
	const friends = await findAllFriends(user, keyword);

	res.status(200).json({
		length: friends.length,
		users: friends,
	});
});

//@description		Send friend request to a user
//@route					PATCH /api/users/send-friend-request
//@access					PROTECTED
const sendFriendRequest = catchAsync(async (req, res) => {
	const user = await sendRequest(req.user._id, req.body.userId);

	res.status(200).json({
		user,
	});
});

//@description		Send friend request to a user
//@route					PATCH /api/users/cancel-friend-request
//@access					PROTECTED
const cancelFriendRequest = catchAsync(async (req, res) => {
	const user = await cancelRequest(req.user._id, req.body.userId);

	res.status(200).json({
		user,
	});
});

//@description		Accept friend request of a user
//@route					PATCH /api/users/accept-friend-request
//@access					PROTECTED
const acceptFriendRequest = catchAsync(async (req, res) => {
	const user = await acceptRequest(req.user._id, req.body.userId);

	res.status(200).json({
		user,
		message: "Both of you became friends",
	});
});

//@description		Deny friend request of a user
//@route					PATCH /api/users/deny-friend-request
//@access					PROTECTED
const denyFriendRequest = catchAsync(async (req, res) => {
	const user = await denyRequest(req.user._id, req.body.userId);

	res.status(200).json({
		user,
		message: "Friend request deleted",
	});
});

//@description		Remove friend
//@route					PATCH /api/users/remove-friend
//@access					PROTECTED
const removeFriend = catchAsync(async (req, res) => {
	const user = await removeFriendship(req.user._id, req.body.userId);

	res.status(200).json({
		user,
		message: "Removed friend successfully",
	});
});

module.exports = {
	getAllUsers,
	getUserDetailById,
	getAllNewUsersRegistedToday,
	getCurrentUserDetail,
	updateCurrentUserDetail,
	updateUserDetail,
	getAllFriends,
	sendFriendRequest,
	cancelFriendRequest,
	acceptFriendRequest,
	denyFriendRequest,
	removeFriend,
};
