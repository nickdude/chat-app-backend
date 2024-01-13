const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/userModel");
const userSchema = require("../validations/userSchema");

const addNewUser = async (input) => {
	let newUser;
	validationResult = await validateNewUser(input);
	newUser = await User.create(validationResult);
	return newUser;
};

const validateNewUser = async (input) => {
	const { name, email, password, passwordConfirm, slug } = input;
	var newUser = {
		name,
		email,
		password,
		passwordConfirm,
		slug,
	};
	await userSchema.validateAsync(newUser, {
		abortEarly: false,
	});
	return newUser;
};

module.exports = { addNewUser };
