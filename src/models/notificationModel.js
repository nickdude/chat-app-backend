const mongoose = require("mongoose");

const notifSchema = mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		receiver: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
		type: {
			type: "String",
			required: [true, "Please provide a notification type"],
		},
		chat: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Chat",
		},
		content: {
			type: "String",
			required: [true, "Please provide a content"],
		},
		isRead: {
			type: Boolean,
			default: false,
		},
	},
	{ timestamps: true }
);

const Notification = mongoose.model("Notification", notifSchema);

module.exports = Notification;
