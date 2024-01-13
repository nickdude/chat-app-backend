const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

const User = require("../models/userModel");

const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { addNewUser } = require("../services/authService");
const sendEmail = require("../utils/email");

const signToken = (id) => {
	return jwt.sign({ id: id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

const createSendToken = (user, statusCode, res) => {
	const token = signToken(user._id);
	const cookieOptions = {
		expires: new Date(
			Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
		),
		httpOnly: true,
	};
	if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
	res.cookie("jwt", token, cookieOptions);
	user.password = undefined;
	res.status(statusCode).json({
		token,
		data: {
			user,
		},
	});
};

const createUniqueSlug = (baseString) => {
	const uniqueId = uuidv4(); // Generate a unique UUID
	const slug = baseString.toLowerCase().replace(/ /g, "-") + "-" + uniqueId;
	return slug;
};

const signup = catchAsync(async (req, res, next) => {
	req.body.slug = createUniqueSlug(req.body.name);
	let newUser;
	try {
		newUser = await addNewUser(req.body);
	} catch (error) {
		let errorMessages = [];
		// Iterate over the validation errors and push the messages to the array
		for (const field in error.details) {
			errorMessages.push(error.details[field].message);
		}
		return res.status(400).json({
			error,
			messages: errorMessages,
		});
	}
	createSendToken(newUser, 201, res);
});

const login = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new AppError("Please provide email and password", 400));
	}
	const user = await User.findOne({ email }).select("+password");

	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError("Incorrect email or password", 401));
	}

	const token = signToken(user._id);
	user.password = undefined;
	res.status(200).json({
		token,
		data: {
			user: user,
		},
	});
});

const logout = catchAsync(async (req, res, next) => {
	res.clearCookie("jwt");
});

const updatePassword = catchAsync(async (req, res, next) => {
	// 1) Get user from collection
	const user = await User.findById(req.user._id).select("+password");

	// 2) Check if POSTed current password is correct
	if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
		return next(new AppError("Your current password is wrong.", 401));
	}

	// 3) If so, update password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();

	// 4) Log user in, send JWT
	createSendToken(user, 200, res);
});

const forgotPassword = catchAsync(async (req, res, next) => {
	// 1) Get user based on POSTed email
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError("There is no user with email address.", 404));
	}

	// 2) Generate the random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });

	// 3) Send it to user's email
	try {
		// const resetURL = `${req.protocol}://${req.get(
		// 	"host"
		// )}/api/auth/reset-password/${resetToken}`;
		const resetURL = `${req.protocol}://${req.get(
			"host"
		)}/reset-password/${resetToken}`;

		// const message = `Forgot your password? Submit a PATCH request with your new password to: \n\n${resetURL}\nIf you did not forget your password, please ignore this email!`;

		const message = `Dear Mr/Mrs,\n\nWe received a request to reset the password for your account. To proceed with the password reset, please click on the link below:\n\nLink: ${resetURL}\n\nIf you did not request a password reset, please ignore this email. Your current password will remain unchanged.\nPlease note that this link is valid for 10 minutes. After that, you will need to request another password reset.\nThank you for using our services.\n\nBest regards,\nNguyen Huu Huy`;
		await sendEmail({
			email: user.email,
			subject: "Your password reset token (valid for 10 minutes)",
			message,
		});

		res.status(200).json({
			message: "Token sent to email!",
		});
	} catch (err) {
		console.log(err);
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });

		return next(
			new AppError("There was an error sending the email. Try again later!"),
			500
		);
	}
});

const resetPassword = catchAsync(async (req, res, next) => {
	// 1. Get user based on token
	const hashedToken = crypto
		.createHash("sha256")
		.update(req.params.token)
		.digest("hex");

	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});

	if (!user) {
		return next(
			new AppError("Token is invalid or expired! Please try again later.", 400)
		);
	}

	// 2. If the token has not expired, and there is user, set the new password
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;

	await user.save();

	createSendToken(user, 200, res);
});

const resetToDefaultPassword = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.body.userId);

	user.password = "123456";
	user.passwordConfirm = "123456";
	await user.save();

	res.status(200).json({
		user: user,
	});
});

module.exports = {
	signup,
	login,
	logout,
	updatePassword,
	forgotPassword,
	resetPassword,
	resetToDefaultPassword,
};
