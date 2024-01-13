const {
	readMyNotifications,
	findUnreadNotifications,
	addNotification,
} = require("../services/notificationService");

const catchAsync = require("../utils/catchAsync");

//@description     Create new Notification
//@route           POST /api/notifications/
//@access          PROTECTED
const createNewNotification = catchAsync(async (req, res) => {
	const newNotification = await addNotification(req.body, req.user._id);

	res.status(201).json({
		notification: newNotification,
	});
});

//@description     Get all unread notifications
//@route           GET /api/notifications/
//@access          PROTECTED
const getAllUnreadNotifications = catchAsync(async (req, res) => {
	const notifications = await findUnreadNotifications(req.user._id);

	res.status(200).json({
		notifications: notifications,
	});
});

//@description     Read notifications
//@route           PATCH /api/notifications/
//@access          PROTECTED
const readNotifications = catchAsync(async (req, res) => {
	const notifications = await readMyNotifications(
		req.body.chatId,
		req.user._id
	);

	res.status(200).json({ notifications });
});

module.exports = {
	createNewNotification,
	getAllUnreadNotifications,
	readNotifications,
};
