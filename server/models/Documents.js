
const mongoose = require("mongoose");

const DocumentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  versionHistory: [{
    content: String,
    timestamp: { type: Date, default: Date.now },
     modifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User'  }, // kush e bëri ndryshimin
  }],
}, {
  timestamps: true
});

module.exports = mongoose.model("Documents", DocumentSchema);
