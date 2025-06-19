
// const express = require("express");
// const http = require("http");
// const socketIo = require("socket.io");
// const dotenv = require("dotenv");
// const path = require("path");
// const cors = require("cors");
// const mongoose = require("mongoose");
// const multer = require("multer");

// dotenv.config(); // Load .env file

// const app = express(); // Move app initialization BEFORE using routes
// const server = http.createServer(app);
// const io = socketIo(server);

// // Multer setup
// const upload = multer({ dest: "uploads/" });

// // Import your controllers and routes AFTER app initialization
// const authController = require("./controllers/authController"); // Adjust path relative to this file


// const connectDB = require("./config/db");
// const Document = require("./models/Documents");

// const docRoutes = require("./routes/docRoutes");
// const authRoutes = require("./routes/auth");
// const authenticateUser = require("./middleware/auth");


// // Connect to MongoDB
// connectDB();

// // ----------- MIDDLEWARES -----------
// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve uploads folder properly
// app.use("/images", express.static(path.join(__dirname, "public/images")));
// app.use(express.static(path.join(__dirname, "../client")));

// // ----------- ROUTES -----------
// // Use the router for auth login POST if needed, or let authRoutes handle it
// // If you want a dedicated router here for login:
// const router = express.Router();
// router.post("/login", authController.login);
// app.use("/api/auth", router); // Register this router

// // Also register other routes
// app.use("/api/auth", authRoutes);
// app.use("/api/documents", docRoutes);


// // Serve index.html on root
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "../client/index.html"));
// });

// // ----------- SOCKET.IO EVENTS -----------
// io.on("connection", (socket) => {
//   console.log("New client connected");

//   socket.on("join", async (docId) => {
//     if (!docId || !mongoose.Types.ObjectId.isValid(docId)) {
//       console.log("Invalid or missing docId received in socket join:", docId);
//       return;
//     }

//     socket.join(docId);
//     console.log(`Client joined room: ${docId}`);

//     try {
//       const document = await Document.findById(docId);
//       if (document) {
//         socket.emit("receiveEdit", document.content);
//         socket.emit("receiveTitle", document.title);
//       } else {
//         console.log("Document not found for id:", docId);
//       }
//     } catch (error) {
//       console.error("Error fetching document:", error);
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
//       }
//     } catch (error) {
//       console.error("Error updating content:", error);
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
//       console.error("Error updating title:", error);
//     }
//   });

//   socket.on("typing", (docId) => {
//     socket.to(docId).emit("user-typing");
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });

// // ----------- START SERVER -----------
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server started on port: ${PORT}`);
// //   const server = http.createServer(app);
// // const io = socketIo(server, { cors: { origin: "*" } });

// });
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

// Express setup
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// File uploads
const upload = multer({ dest: "uploads/" });

// Connect to DB
connectDB(); // Includes retry logic

// MongoDB connection events
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

// Middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use(express.static(path.join(__dirname, "../client")));

// Routes
const router = express.Router();
router.post("/login", authController.login);
app.use("/api/auth", router);
app.use("/api/auth", authRoutes);
app.use("/api/documents", docRoutes);

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Socket.IO
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

// Error handling middleware (Express)
app.use((err, req, res, next) => {
  console.error("❗ Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
