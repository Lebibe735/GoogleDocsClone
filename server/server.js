const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

// Load environment variables
dotenv.config();

// DB Connection
const connectDB = require("./config/db");
connectDB(); // Contains retry logic

// Mongo events
mongoose.connection.on("connected", () => console.log("✅ MongoDB connected"));
mongoose.connection.on("disconnected", () => console.warn("⚠️ MongoDB disconnected"));
mongoose.connection.on("reconnected", () => console.info("🔄 MongoDB reconnected"));
mongoose.connection.on("error", (err) => console.error("❌ MongoDB error:", err));

// Models
const Document = require("./models/Documents");

// Routes & Middleware
const authRoutes = require("./routes/auth");
const docRoutes = require("./routes/docRoutes");
const authenticateUser = require("./middleware/auth");

// Setup express & server
const app = express();
const server = http.createServer(app);

// Configure CORS properly
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://localhost:3001", 
    "https://*.vercel.app",
    "https://*.onrender.com",
    "https://*.railway.app",
    "https://*.fly.dev"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://localhost:3001", 
      "https://*.vercel.app",
      "https://*.onrender.com",
      "https://*.railway.app",
      "https://*.fly.dev"
    ],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Multer file upload config
const upload = multer({ dest: "uploads/" });

// Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);

// API status endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "CollabDocs Backend API", 
    status: "running",
    version: "1.0.1",
    timestamp: new Date().toISOString()
  });
});

// Public test endpoints
app.get("/api/ping", (req, res) => {
  res.json({ pong: true, timestamp: new Date().toISOString() });
});

app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!",
    endpoints: {
      login: "POST /api/auth/login",
      register: "POST /api/auth/register", 
      documents: "GET /api/documents (requires auth)",
      create: "POST /api/documents/create (requires auth)"
    }
  });
});

// Test user creation (for debugging only)
app.post("/api/test-user", async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      username: 'testuser',
      password: hashedPassword,
      photo: '/images/user.png'
    });
    
    await testUser.save();
    res.json({ message: 'Test user created: username=testuser, password=test123' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET version of test user creation (for easier testing)
app.get("/api/test-user", async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    
    // Check if test user already exists
    const existingUser = await User.findOne({ username: 'testuser' });
    if (existingUser) {
      return res.json({ 
        message: 'Test user already exists: username=testuser, password=test123',
        exists: true 
      });
    }
    
    const hashedPassword = await bcrypt.hash('test123', 10);
    const testUser = new User({
      username: 'testuser',
      password: hashedPassword,
      photo: '/images/user.png'
    });
    
    await testUser.save();
    res.json({ 
      message: 'Test user created: username=testuser, password=test123',
      created: true 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Debug endpoint to test login directly
app.post("/api/debug-login", async (req, res) => {
  try {
    console.log("🔍 Debug login request:", req.body);
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    
    const user = await User.findOne({ username });
    console.log("🔍 User found:", user ? 'Yes' : 'No');
    
    if (!user) {
      return res.status(400).json({ error: 'User not found' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔍 Password match:", isMatch);
    
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid password' });
    }
    
    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'yoursecret';
    
    const token = jwt.sign(
      { id: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        username: user.username,
        photo: user.photo || '/images/user.png'
      }
    });
    
  } catch (err) {
    console.error("🔍 Debug login error:", err);
    res.status(500).json({ error: err.message });
  }
});

// SOCKET.IO Logic
const lastCharTimestamps = {}; // Used for conflict resolution

io.on("connection", (socket) => {
  console.log("🔌 New client connected");

  socket.on("join", async (docId) => {
    if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
      console.log("⚠️ Invalid docId:", docId);
      return;
    }

    socket.join(docId);
    console.log(`📄 Client joined room: ${docId}`);

    try {
      const document = await Document.findById(docId);
      if (document) {
        socket.emit("receiveEdit", document.content);
        socket.emit("receiveTitle", document.title);
      } else {
        socket.emit("doc-error", "Document not found");
      }
    } catch (error) {
      console.error("❌ Error fetching document:", error);
      socket.emit("doc-error", "Server error");
    }
  });

  
  socket.on("charInput", ({ docId, character, position, timestamp }) => {
    const key = `${docId}_${position}`;
  // Vetëm nëse karakteri është më i fundit për atë pozicion
    if (!lastCharTimestamps[key] || timestamp >= lastCharTimestamps[key]) {
      lastCharTimestamps[key] = timestamp;
      //Dërgo karakterin te përdoruesit e tjerë në të njëjtin dokument
      socket.to(docId).emit("receiveChar", { character, position });
    }
  });

  // 📝 Full content saving (e.g., autosave or manual)
  socket.on("edit-content", async ({ docId, content }) => {
    try {
      const document = await Document.findById(docId);
      if (document) {
        document.content = content;
        document.versionHistory.push({ content, timestamp: new Date() });
        await document.save();
        socket.to(docId).emit("update-content", { docId, content });
      } else {
        socket.emit("doc-error", "Document not found");
      }
    } catch (error) {
      console.error("❌ Error updating content:", error);
    }
  });

  // ✏️ Title edit
  socket.on("edit-title", async ({ docId, title }) => {
    try {
      const document = await Document.findById(docId);
      if (document) {
        document.title = title;
        await document.save();
        socket.to(docId).emit("update-title", { docId, title });
      }
    } catch (error) {
      console.error("❌ Error updating title:", error);
    }
  });

  // 🟢 Typing status (optional)
  socket.on("typing", (docId) => {
    socket.to(docId).emit("user-typing");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});

// General error handling middleware
app.use((err, req, res, next) => {
  console.error("❗ Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
