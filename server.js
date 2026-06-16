const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

// Load environment variables
dotenv.config();

// Import middleware
const requestLogger = require("./middleware/logger");
const errorHandler = require("./middleware/errorHandler");

// Import routes
const bookRoutes = require("./routes/books");

// Initialize Express app
const app = express();

// ──────────────────────────────────────────────
// Built-in Middleware
// ──────────────────────────────────────────────
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.static(path.join(__dirname, "public"))); // Serve frontend assets

// ──────────────────────────────────────────────
// Custom Middleware — Request Logger
// ──────────────────────────────────────────────
app.use(requestLogger);

// ──────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────
app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to the Online Bookstore API",
    endpoints: {
      getAllBooks: "GET    /api/books",
      getBookById: "GET    /api/books/:id",
      addBook: "POST   /api/books",
      updateBook: "PUT    /api/books/:id",
      deleteBook: "DELETE /api/books/:id",
      searchBooks: "GET    /api/books?author=xyz&genre=abc",
      pagination: "GET    /api/books?page=1&limit=10",
    },
  });
});

app.use("/api/books", bookRoutes);

// ──────────────────────────────────────────────
// Handle 404 — Invalid Routes
// ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ──────────────────────────────────────────────
// Global Error Handler
// ──────────────────────────────────────────────
app.use(errorHandler);

// ──────────────────────────────────────────────
// Database Connection & Server Start
// ──────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/bookstore";

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

module.exports = app;
