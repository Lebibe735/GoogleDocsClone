
// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const dotenv = require("dotenv");
//  const path = require("path");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const multer = require("multer");

// // Configs & Models
// dotenv.config();
// const connectDB = require("./config/db");
// const Document = require("./models/Documents");
// const authController = require("./controllers/authController");

// // Routes & Middleware
// const docRoutes = require("./routes/docRoutes");
// const authRoutes = require("./routes/auth");
// const authenticateUser = require("./middleware/auth");

// // Express setup
// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"]
//   }
// });

// // File uploads
// const upload = multer({ dest: "uploads/" });

// // Connect to DB
// connectDB(); // Includes retry logic

// // MongoDB connection events
// mongoose.connection.on("connected", () => {
//   console.log("✅ MongoDB connected");
// });

// mongoose.connection.on("disconnected", () => {
//   console.warn("⚠️ MongoDB disconnected");
// });

// mongoose.connection.on("reconnected", () => {
//   console.info("🔄 MongoDB reconnected");
// });

// mongoose.connection.on("error", (err) => {
//   console.error("❌ MongoDB error:", err);
// });

// // Middlewares
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// app.use("/images", express.static(path.join(__dirname, "public/images")));


// // Routes
// const router = express.Router();
// router.post("/login", authController.login);
// // app.use("/api/auth", router);
// app.use("/api/auth", authRoutes);
// app.use("/api/documents", docRoutes);

// // Serve frontend
// // const path = require("path");
// app.use(express.static(path.join(__dirname, "client")));
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/index.html"));
// });


// // Socket.IO
// io.on("connection", (socket) => {
//   console.log("🔌 New client connected");

//   socket.on("join", async (docId) => {
//     if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
//       console.log("⚠️ Invalid docId:", docId);
//       return;
//     }

//     socket.join(docId);
//     console.log(`📄 Client joined room: ${docId}`);

//     try {
//       const document = await Document.findById(docId);
//       if (document) {
//         socket.emit("receiveEdit", document.content);
//         socket.emit("receiveTitle", document.title);
//       } else {
//         socket.emit("doc-error", "Document not found");
//       }
//     } catch (error) {
//       console.error("❌ Error fetching document:", error);
//       socket.emit("doc-error", "Server error");
//     }
//   });

//   socket.on("edit-content", async ({ docId, content }) => {
//     try {
//       const document = await Document.findById(docId);
//       if (document) {
//         document.content = content;
//         document.versionHistory.push({ content, timestamp: new Date() });
//         await document.save();
//         socket.to(docId).emit("update-content", { docId, content });
//       } else {
//         socket.emit("doc-error", "Document not found");
//       }
//     } catch (error) {
//       console.error("❌ Error updating content:", error);
//     }
//   });

//   socket.on("edit-title", async ({ docId, title }) => {
//     try {
//       const document = await Document.findById(docId);
//       if (document) {
//         document.title = title;
//         await document.save();
//         socket.to(docId).emit("update-title", { docId, title });
//       }
//     } catch (error) {
//       console.error("❌ Error updating title:", error);
//     }
//   });

//   socket.on("typing", (docId) => {
//     socket.to(docId).emit("user-typing");
//   });

//   socket.on("disconnect", () => {
//     console.log("🔌 Client disconnected");
//   });
// });

// // Error handling middleware (Express)
// app.use((err, req, res, next) => {
//   console.error("❗ Unhandled error:", err);
//   res.status(500).json({ error: "Something went wrong on the server." });
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });
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
const authController = require("./controllers/authController");
const authenticateUser = require("./middleware/auth");

// Setup express & server
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Multer file upload config
const upload = multer({ dest: "uploads/" });

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));

// Routes
const router = express.Router();
router.post("/login", authController.login);
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);

// Serve frontend
app.use(express.static(path.join(__dirname, "client")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client/index.html"));
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
