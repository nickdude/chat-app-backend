const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("../models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const isAuthenticated = catchAsync(async (req, res, next) => {
	//1. get token and check if it exists
	let token;
	if (
		req.headers.authorization &&
		req.headers.authorization.startsWith("Bearer")
	) {
		token = req.headers.authorization.split(" ")[1];
	}
	if (!token) {
		next(
			new AppError("You are not logged in. Please log in to get access", 401)
		);
	}
	//2. verification token
	const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
	//3 check if user still exists
	const freshUser = await User.findById(decoded.id);
	if (!freshUser) {
		return next(
			new AppError("The user belonging to this token no longer exists", 401)
		);
	}
	//4 check if user changed password after the token was issued
	if (freshUser.changedPasswordAfter(decoded.iat)) {
		return next(
			new AppError("User recently changed password! Please log in again", 401)
		);
	}
	req.user = freshUser;
	next();
});

const restrictTo =
	(...roles) =>
	(req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return next(
				new AppError("You do not have permission to perform this action."),
				403
			);
		}
		next();
	};

const isAdmin = (req, res, next) => {
	if (!req.user.isAdmin) {
		return next(
			new AppError("You do not have permission to perform this action"),
			403
		);
	}
	next();
};

const isUser = (req, res, next) => {
	if (!req.user.isAdmin) {
		return next(
			new AppError("You do not have permission to perform this action"),
			403
		);
	}
	next();
};

module.exports = { isAuthenticated, restrictTo, isAdmin, isUser };
