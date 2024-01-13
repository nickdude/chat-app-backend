// import third party libraries
const fs = require("fs");
const cors = require("cors");
const dotenv = require("dotenv");
const express = require("express");
const { createServer } = require("http");
const path = require("path");

// import functions and files
const connectDB = require("./config/databaseConfig");

const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const globalErrorHandler = require("./middlewares/errorHandler");
const { Server } = require("socket.io");
const uploadFile = require("./utils/uploadFile");

// declare variables and constants
const PORT = process.env.PORT || 5000;

dotenv.config();
connectDB();

const app = express();

// enable req.body json data
app.use(express.json());

// enable use static resources
app.use(express.static(path.join(__dirname, "../")));

app.use(cors());

app.use(function (req, res, next) {
	res.setHeader("Access-Control-Allow-Origin", "*");

	// Request methods you wish to allow
	res.setHeader("Access-Control-Allow-Methods", "POST");

	// Request headers you wish to allow
	res.setHeader(
		"Access-Control-Allow-Headers",
		"X-Requested-With,content-type"
	);

	// Set to true if you need the website to include cookies in the requests sent
	// to the API (e.g. in case you use sessions)
	res.setHeader("Access-Control-Allow-Credentials", true);

	next();
});

app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);
app.use("/api/notifications", notificationRoutes);

app.use(globalErrorHandler);

const httpServer = createServer(app);

const io = new Server(httpServer, {
	cors: {
		origin: "*",
		credentials: true,
	},
});

httpServer.listen(PORT, () => {
	console.log(`Server is listening on ${PORT}`.yellow.bold);
});

io.on("connection", (socket) => {
	console.log("Connected to socket.io");

	socket.on("setup", (userData) => {
		console.log("User logged in: ", userData.name, "------>", userData.email);
		socket.join(userData._id);
		socket.emit("connected");
	});

	socket.on("JOIN_ROOM", (chatId) => {
		console.log("User joined chat: ", chatId);
		socket.join(chatId);
	});

	socket.on("NEW_MESSAGE", (message) => {
		var chat = message.chat;

		if (!chat.users) return console.log("chat.users not defined");

		chat.users.forEach((user) => {
			if (user._id == message.sender._id) return;

			socket.in(user._id).emit("RECEIVE_MESSAGE", message);
		});

		// socket.to(message.chat._id).emit("RECEIVE_MESSAGE", message);
	});

	socket.on("SEND_IMAGE", (data) => {
		uploadFile(data);

		// --------------------------------
		var chat = data.message.chat;

		if (!chat.users) return;

		chat.users.forEach((user) => {
			if (user._id == data.message.sender._id) return;

			socket.in(user._id).emit("RECEIVE_IMAGE", data);
		});

		// socket.to(data.message.chat._id).emit("RECEIVE_IMAGE", data);
	});

	socket.off("setup", () => {
		console.log("USER DISCONNECTED");
		socket.leave(userData._id);
	});
});
