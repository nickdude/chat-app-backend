const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
	const date = new Date();
	console.log("Connecting to database ... ".bold);
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log(`MongoDB connected: ${conn.connection.host}`.cyan.underline);
		console.log("Time to connect to database: ".bold, Date.now() - date);
	} catch (error) {
		console.log(`Error: ${error.message}`.red.bold);
		process.exit();
	}
};

module.exports = connectDB;
