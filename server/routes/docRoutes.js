
const express = require('express');
const router = express.Router();
const Document = require('../models/Documents');
const User = require('../models/User');
const authenticateUser = require('../middleware/auth');

// Krijo dokument të ri (vetëm përdorues i kyçur)
router.post('/create', authenticateUser, async (req, res) => {
  try {
    const { title, content = "", template = "blank" } = req.body;
    const userId = req.user.id;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newDoc = new Document({
      title,
      content,
      template,
      createdBy: userId,
      sharedWith: [userId], // fillimisht e ka vetëm pronari
      versionHistory: [{
        content,
        timestamp: new Date(),
        modifiedBy: userId
      }]
    });

    await newDoc.save();
    res.status(201).json(newDoc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merr të gjitha dokumentet ku përdoruesi është pronar ose ka akses
router.get('/', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const documents = await Document.find({
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    }).sort({ updatedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Merr dokument specifik me kontroll aksesesh
router.get('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Kontrollo nëse është pronar ose ka akses
    if (doc.createdBy.toString() !== userId && !doc.sharedWith.includes(userId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(doc);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Përditëso përmbajtjen e dokumentit dhe ruaj version history me modifier
router.put('/:docId/content', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { content } = req.body;
    const { docId } = req.params;

    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ error: "Document not found" });

    if (document.createdBy.toString() !== userId && !document.sharedWith.includes(userId)) {
      return res.status(403).json({ error: "Access denied" });
    }

    // Shto versionin e ri në historinë e versioneve me info të modifier-it
    document.versionHistory.push({
      content,
      timestamp: new Date(),
      modifiedBy: userId
    });

    document.content = content;
    document.updatedAt = Date.now();

    await document.save();

    res.json({ message: "Content updated with history" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fshi dokument (vetëm pronari)
router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const doc = await Document.findById(req.params.id);

    if (!doc) {
      return res.status(404).json({ error: 'Document not found' });
    }
    if (doc.createdBy.toString() !== userId) {
      return res.status(403).json({ error: 'Only owner can delete document' });
    }

    await doc.deleteOne();
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Share dokument me përdorues tjetër (vetëm pronari mund të ndajë)
router.post('/share', authenticateUser, async (req, res) => {
  const { docId, username } = req.body;

  if (!docId || !username) {
    return res.status(400).json({ error: "docId and username are required" });
  }

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ error: "User not found" });

    const document = await Document.findById(docId);
    if (!document) return res.status(404).json({ error: "Document not found" });

    if (!document.createdBy.equals(req.user.id)) {
      return res.status(403).json({ error: "Not authorized to share this document" });
    }

    if (!document.sharedWith.includes(user._id)) {
      document.sharedWith.push(user._id);
      await document.save();
    }

    res.json({ success: true, message: "Document shared" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

// Merr historinë e versioneve me populated username për modifier
router.get('/:docId/history', authenticateUser, async (req, res) => {
  try {
    const { docId } = req.params;

    const document = await Document.findById(docId)
      .populate('versionHistory.modifiedBy', 'username')
      .select('versionHistory');

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(document.versionHistory);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
