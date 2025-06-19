const Document = require("../models/Documents");

// Create a new document
exports.createDocument = async (req, res) => {
  const { title, content } = req.body;
  const createdBy = req.user.id;

  try {
    if (!title) {
      return res.status(400).json({ error: "Title is required." });
    }

    // const newDoc = new Document({
    //   title,
    //   content,
    //   createdBy,
    //   versionHistory: [{ content }],
    // });
    const newDoc = new Document({
  title: req.body.title,
  content: req.body.content,
  createdBy: req.user._id,  // user id from auth middleware
  versionHistory: []
});


    const document = await newDoc.save();
    res.status(201).json(document);
  } catch (err) {
    console.error("Create error:", err.message);
    res.status(500).send("Server error");
  }
};

// Get all documents for the current user (owner or shared)
exports.getDocuments = async (req, res) => {
  try {
    const userId = req.user.id;
    const documents = await Document.find({
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    }).sort({ updatedAt: -1 });

    res.json(documents);
  } catch (err) {
    console.error("Get documents error:", err.message);
    res.status(500).send("Server error");
  }
};

// Get a specific document with access control
exports.getDocumentById = async (req, res) => {
  try {
    const userId = req.user.id;
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: "Document not found." });
    }

    const hasAccess = doc.createdBy.toString() === userId || doc.sharedWith.includes(userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Access denied." });
    }

    res.json(doc);
  } catch (err) {
    console.error("Get document error:", err.message);
    res.status(500).send("Server error");
  }
};

// Delete a document by ID (only owner)
exports.deleteDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const document = await Document.findById(req.params.id);

    if (!document) {
      return res.status(404).json({ error: "Document not found." });
    }

    if (document.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Only the owner can delete this document." });
    }

    await document.deleteOne();
    res.json({ message: "Document deleted successfully." });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ error: "Error deleting document." });
  }
};

// Share a document with another user by email (only owner)
exports.shareDocument = async (req, res) => {
  try {
    const userId = req.user.id;
    const { userEmail } = req.body;

    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Document not found" });

    if (doc.createdBy.toString() !== userId) {
      return res.status(403).json({ error: "Only owner can share the document." });
    }

    const User = require('../models/User');
    const userToShare = await User.findOne({ email: userEmail });

    if (!userToShare) return res.status(404).json({ error: "User to share with not found" });

    if (!doc.sharedWith.includes(userToShare._id)) {
      doc.sharedWith.push(userToShare._id);
      await doc.save();
    }

    res.json({ message: "Document shared successfully" });
  } catch (err) {
    console.error("Share error:", err.message);
    res.status(500).json({ error: "Failed to share document" });
  }
};
