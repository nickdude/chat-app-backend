const Joi = require("joi");

const User = require("./../models/userModel");

const userSchema = Joi.object({
	name: Joi.string().required().messages({
		"any.required": `Please provide a name.`,
		"string.empty": "Name is not allowed to be empty",
	}),
	email: Joi.string()
		.email()
		.required()
		.messages({
			"any.required": `Please provide a email.`,
			"string.empty": "Email is not allowed to be empty",
			"string.email": "Please provide a valid email address",
		})
		.external(async (value, helpers) => {
			const isUsed = await isEmailInUse(value);
			if (isUsed) {
				return helpers.message(
					"Email is already in use. Please enter another email address."
				);
			}
			return value;
		}),
	password: Joi.string().min(6).required().messages({
		"any.required": `Please provide a password.`,
		"string.empty": "Password is not allowed to be empty",
		"string.min": "Password length must be at least 6 characters long",
	}),
	passwordConfirm: Joi.string().valid(Joi.ref("password")).required().messages({
		"any.required": `Please provide a password confirm.`,
		"string.empty": "Password confirm is not allowed to be empty",
		"any.only": `Password confirm does not match the password.`,
	}),
	phoneNumber: Joi.string()
		.pattern(/^[0-9]{10}$/)
		.allow(""),
	pic: Joi.string().uri(),
	slug: Joi.string(),
	isAdmin: Joi.boolean(),
	friends: Joi.array().items(Joi.string().hex().length(24)),
	waitingAcceptedFriends: Joi.array().items(Joi.string().hex().length(24)),
	waitingRequestFriends: Joi.array().items(Joi.string().hex().length(24)),
});

const isEmailInUse = async (email) => {
	// Implement your logic to check if the email is in use
	const user = await User.findOne({ email });
	return user !== null; // Return true if email is in use, false otherwise
};

module.exports = userSchema;
