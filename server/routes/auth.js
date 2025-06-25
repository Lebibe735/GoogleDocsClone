const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const User = require('../models/User'); // Ensure this model exists

const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';

// ----------- MULTER SETUP FOR IMAGE UPLOAD ------------

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/images'); // Save uploaded files in /public/images
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// ----------- REGISTER ROUTE ------------

router.post('/register', upload.single('photo'), async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Log file info to debug upload
    console.log("Received file:", req.file);

    // Set uploaded photo or default
    const photoPath = req.file ? `/images/${req.file.filename}` : '/images/user.png';

    const user = new User({
      username,
      password: hashedPassword,
      photo: photoPath
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ----------- LOGIN ROUTE ------------

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        username: user.username,
        photo: user.photo || '/images/user.png' // fallback to default
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
















