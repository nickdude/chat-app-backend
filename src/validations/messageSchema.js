const Joi = require("joi");

const messageSchema = Joi.object({
	sender: Joi.required(),
	content: Joi.string()
		.replace(/^\s+|\s+$/g, "")
		.strict()
		.required(),
	chat: Joi.string().required(),
	type: Joi.string().optional().allow(null),
	mimeType: Joi.string().optional().allow(null),
	fileName: Joi.string().optional().allow(null),
});

module.exports = messageSchema;
