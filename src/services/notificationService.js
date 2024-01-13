const Notification = require("../models/notificationModel");
const notificationSchema = require("../validations/notificationSchema");

const addNotification = async (input, userId) => {
	const notification = await validateNewNotification(input, userId);
	const newNotification = await Notification.create(notification);

	return newNotification;
};

const findUnreadNotifications = async (userId) => {
	const notifications = await Notification.find({
		receiver: userId,
		isRead: false,
	})
		.populate("sender")
		.populate("chat");

	return notifications;
};

const readMyNotifications = async (chatId, userId) => {
	await Notification.updateMany(
		{ receiver: userId, isRead: false, chat: chatId },
		{ $set: { isRead: true } }
	);
	const notifications = await Notification.find({
		receiver: userId,
		isRead: false,
	})
		.populate("sender")
		.populate("chat");

	return notifications;
};

const validateNewNotification = async (input, userId) => {
	const { receiver, type, content, isRead, chat } = input;
	var newNotification = {
		sender: userId,
		receiver,
		type,
		content,
		isRead: false,
		chat,
	};

	try {
		await notificationSchema.validateAsync(newNotification, {
			abortEarly: false,
		});
	} catch (e) {
		console.log("Failed to validate new notification");
		console.log(e);
	}
	return newNotification;
};

module.exports = {
	addNotification,
	findUnreadNotifications,
	readMyNotifications,
};
