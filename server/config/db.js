
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");

// dotenv.config();

// const MONGO_URI = "mongodb+srv://Lebibe:C3ypCA6h2TpaS9HC@cluster0.hvwesud.mongodb.net/ProjectY?retryWrites=true&w=majority&appName=Cluster0";

// const connectDB = async () => {
//   try {
//     // Connect without deprecated options
//     await mongoose.connect(MONGO_URI);

//     console.log("MongoDB Connected Successfully...");
//   } catch (errors) {
//     console.log("Failed to connect MongoDB...");
//     console.log(errors.message);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://Lebibe:C3ypCA6h2TpaS9HC@cluster0.hvwesud.mongodb.net/ProjectY?retryWrites=true&w=majority&appName=Cluster0";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });

    console.log(" MongoDB connected successfully");
  } catch (err) {
    console.error(" Initial MongoDB connection failed:", err.message);
    retryConnection();
  }

  // Optional: listen for connection events
  mongoose.connection.on("disconnected", () => {
    console.warn(" MongoDB disconnected");
  });

  mongoose.connection.on("reconnected", () => {
    console.log(" MongoDB reconnected");
  });

  mongoose.connection.on("error", (err) => {
    console.error(" MongoDB error:", err.message);
  });
};

// Retry logic if initial connection fails
const retryConnection = () => {
  setTimeout(() => {
    console.log(" Retrying MongoDB connection...");
    connectDB();
  }, 5000); // retry after 5 seconds
};

module.exports = connectDB;
