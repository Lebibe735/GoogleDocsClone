const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  photo: { type: String, default: '/public/user.png' } // Optional fallback
});

module.exports = mongoose.model('User', userSchema);