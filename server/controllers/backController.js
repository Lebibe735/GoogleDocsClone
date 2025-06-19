// const express = require("express");
// const router = express.Router();
// const User = require("../models/User"); // Your user model
// const bcrypt = require("bcryptjs");
// const multer = require("multer");
// const path = require("path");

// // Setup multer for file upload storage
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/"); // Folder to save uploaded photos
//   },
//   filename: function (req, file, cb) {
//     const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
//     cb(null, uniqueSuffix + path.extname(file.originalname));
//   },
// });
// const upload = multer({ storage: storage });

// // Registration controller
// router.post("/register", upload.single("photo"), async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     // Basic validation
//     if (!username || !password) {
//       return res.status(400).json({ error: "Username and password are required" });
//     }

//     // Check if username already exists
//     const existingUser = await User.findOne({ username });
//     if (existingUser) {
//       return res.status(400).json({ error: "Username already exists" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Create new user object
//     const newUser = new User({
//       username,
//       password: hashedPassword,
//     });

//     // If photo uploaded, save its filename/path
//     if (req.file) {
//       newUser.photo = req.file.filename; // or save full path if you want
//     }

//     await newUser.save();

//     res.json({ message: "User registered successfully" });
//   } catch (err) {
//     console.error("Registration error:", err);
//     res.status(500).json({ error: "Server error during registration" });
//   }
// });

// module.exports = router;
