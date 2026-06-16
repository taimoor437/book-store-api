const express = require("express");
const router = express.Router();
const Book = require("../models/Book");

// ──────────────────────────────────────────────
// GET /api/books — Get all books (with search & pagination)
// ──────────────────────────────────────────────
router.get("/", async (req, res, next) => {
  try {
    // --- Search / Filter ---
    const filter = {};

    if (req.query.author) {
      // Case-insensitive partial match
      filter.author = { $regex: req.query.author, $options: "i" };
    }
    if (req.query.genre) {
      filter.genre = { $regex: req.query.genre, $options: "i" };
    }
    if (req.query.title) {
      filter.title = { $regex: req.query.title, $options: "i" };
    }
    if (req.query.inStock !== undefined) {
      filter.inStock = req.query.inStock === "true";
    }

    // --- Pagination ---
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Execute query
    const [books, totalBooks] = await Promise.all([
      Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Book.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalBooks / limit);

    res.status(200).json({
      success: true,
      count: books.length,
      totalBooks,
      totalPages,
      currentPage: page,
      data: books,
    });
  } catch (error) {
    next(error);
  }
});

// ──────────────────────────────────────────────
// GET /api/books/:id — Get a single book by ID
// ──────────────────────────────────────────────
router.get("/:id", async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    // Handle invalid ObjectId format
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: `Invalid book ID format: ${req.params.id}`,
      });
    }
    next(error);
  }
});

// ──────────────────────────────────────────────
// POST /api/books — Add a new book
// ──────────────────────────────────────────────
router.post("/", async (req, res, next) => {
  try {
    const { title, author, genre, price, publishedDate, inStock } = req.body;

    // Validate required fields
    const errors = [];
    if (!title) errors.push("Title is required");
    if (!author) errors.push("Author is required");
    if (price === undefined || price === null) errors.push("Price is required");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      price,
      publishedDate,
      inStock,
    });

    res.status(201).json({
      success: true,
      message: "Book created successfully",
      data: book,
    });
  } catch (error) {
    // Handle Mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }
    next(error);
  }
});

// ──────────────────────────────────────────────
// PUT /api/books/:id — Update an existing book by ID
// ──────────────────────────────────────────────
router.put("/:id", async (req, res, next) => {
  try {
    const { title, author, price } = req.body;

    // Validate required fields on update
    const errors = [];
    if (title !== undefined && !title) errors.push("Title cannot be empty");
    if (author !== undefined && !author) errors.push("Author cannot be empty");
    if (price !== undefined && (price === null || price === ""))
      errors.push("Price cannot be empty");

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Return updated document
      runValidators: true, // Run schema validators on update
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: book,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: `Invalid book ID format: ${req.params.id}`,
      });
    }
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: messages,
      });
    }
    next(error);
  }
});

// ──────────────────────────────────────────────
// DELETE /api/books/:id — Delete a book by ID
// ──────────────────────────────────────────────
router.delete("/:id", async (req, res, next) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book not found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
      data: book,
    });
  } catch (error) {
    if (error.kind === "ObjectId") {
      return res.status(400).json({
        success: false,
        message: `Invalid book ID format: ${req.params.id}`,
      });
    }
    next(error);
  }
});

module.exports = router;
