const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");

// Configs & Models
dotenv.config();
const connectDB = require("./config/db");
const Document = require("./models/Documents");
const authController = require("./controllers/authController");

// Routes & Middleware
const docRoutes = require("./routes/docRoutes");
const authRoutes = require("./routes/auth");
const authenticateUser = require("./middleware/auth");

const app = express();
const server = http.createServer(app);

// ✅ Configure CORS
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

// Connect to DB
connectDB();

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB connected");
});
mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB disconnected");
});
mongoose.connection.on("reconnected", () => {
  console.info("🔄 MongoDB reconnected");
});
mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB error:", err);
});

// File upload setup
const upload = multer({ dest: "uploads/" });

// Middlewares
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);

// ✅ Initialize Socket.IO
const io = socketIo(server, {
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

  socket.on("typing", (docId) => {
    socket.to(docId).emit("user-typing");
  });

  socket.on("disconnect", () => {
    console.log("🔌 Client disconnected");
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("❗ Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
