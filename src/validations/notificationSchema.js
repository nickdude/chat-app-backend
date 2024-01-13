const Joi = require("joi");

const notificationSchema = Joi.object({
	sender: Joi.required(),
	receiver: Joi.required(),
	chat: Joi.required(),
	type: Joi.string().required(),
	content: Joi.string().required(),
	isRead: Joi.boolean(),
});

module.exports = notificationSchema;
