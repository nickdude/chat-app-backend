const Joi = require("joi");

const chatSchema = Joi.object({
	chatName: Joi.string(),
	isGroupChat: Joi.boolean(),
	users: Joi.array().items(Joi.string().hex().length(24).required()).required(),
	latestMessage: Joi.string().hex().length(24).allow(null),
	groupAdmin: Joi.string().hex().length(24).required(),
});

module.exports = chatSchema;
