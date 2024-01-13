const express = require("express");

const {
	getAllUsers,
	getAllFriends,
	getCurrentUserDetail,
	sendFriendRequest,
	acceptFriendRequest,
	denyFriendRequest,
	removeFriend,
	cancelFriendRequest,
	updateCurrentUserDetail,
	getAllNewUsersRegistedToday,
	getUserDetailById,
	updateUserDetail,
} = require("../controllers/userController");
const { isAuthenticated, isAdmin } = require("../middlewares/authMiddleware");
const {
	isAvailableToSendFriendRequest,
	isAvailableToAcceptFriendRequest,
	isAvailableToDenyFriendRequest,
	isAvailableToRemoveFriend,
} = require("../middlewares/userMiddleware");

const router = express.Router();

router.route("/").get(isAuthenticated, getAllUsers);

router.route("/profile/:userId").get(isAuthenticated, getUserDetailById);

router
	.route("/new-registered-users")
	.get(isAuthenticated, getAllNewUsersRegistedToday);

router
	.route("/me")
	.get(isAuthenticated, getCurrentUserDetail)
	.patch(isAuthenticated, updateCurrentUserDetail);

router
	.route("/update-user-profile")
	.patch(isAuthenticated, isAdmin, updateUserDetail);

router.route("/friends").get(isAuthenticated, getAllFriends);

router
	.route("/send-friend-request")
	.patch(isAuthenticated, isAvailableToSendFriendRequest, sendFriendRequest);

router
	.route("/cancel-friend-request")
	.patch(isAuthenticated, cancelFriendRequest);

router
	.route("/accept-friend-request")
	.patch(
		isAuthenticated,
		isAvailableToAcceptFriendRequest,
		acceptFriendRequest
	);

router
	.route("/deny-friend-request")
	.patch(isAuthenticated, isAvailableToDenyFriendRequest, denyFriendRequest);

router
	.route("/remove-friend")
	.patch(isAuthenticated, isAvailableToRemoveFriend, removeFriend);

module.exports = router;
