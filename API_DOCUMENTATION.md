# 📚 Online Bookstore Management API — Documentation

## Overview

A RESTful API for managing an online bookstore built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

**Frontend URL:** `http://localhost:5000`

**API Base URL:** `http://localhost:5000/api`

---

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Edit the `.env` file in the project root:

```env
MONGO_URI=mongodb://localhost:27017/bookstore
PORT=5000
```

> Replace `MONGO_URI` with your MongoDB Atlas connection string if using cloud.

### 3. Start the Server

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Open `http://localhost:5000` in your browser to use the basic frontend for adding, editing, deleting, searching, and paginating books.

---

## API Endpoints

### Root

| Method | Endpoint | Description           |
| ------ | -------- | --------------------- |
| GET    | `/`      | Bookstore frontend    |
| GET    | `/api`   | API welcome & overview |

---

### Books CRUD

| Method | Endpoint          | Description                |
| ------ | ----------------- | -------------------------- |
| GET    | `/api/books`      | Get all books              |
| GET    | `/api/books/:id`  | Get a single book by ID    |
| POST   | `/api/books`      | Add a new book             |
| PUT    | `/api/books/:id`  | Update an existing book    |
| DELETE | `/api/books/:id`  | Delete a book by ID        |

---

## Detailed Route Documentation

### 1. GET `/api/books` — Get All Books

**Query Parameters (all optional):**

| Parameter | Type   | Description                        |
| --------- | ------ | ---------------------------------- |
| `author`  | string | Filter by author (partial match)   |
| `genre`   | string | Filter by genre (partial match)    |
| `title`   | string | Filter by title (partial match)    |
| `inStock` | string | Filter by stock status (`true`/`false`) |
| `page`    | number | Page number (default: 1)           |
| `limit`   | number | Books per page (default: 10)       |

**Example Request:**

```
GET http://localhost:5000/api/books?author=Rowling&genre=Fantasy&page=1&limit=5
```

**Example Response (200):**

```json
{
  "success": true,
  "count": 2,
  "totalBooks": 2,
  "totalPages": 1,
  "currentPage": 1,
  "data": [
    {
      "_id": "665f1a2b3c4d5e6f7a8b9c0d",
      "title": "Harry Potter and the Philosopher's Stone",
      "author": "J.K. Rowling",
      "genre": "Fantasy",
      "price": 15.99,
      "publishedDate": "1997-06-26T00:00:00.000Z",
      "inStock": true,
      "createdAt": "2024-06-04T10:30:00.000Z",
      "updatedAt": "2024-06-04T10:30:00.000Z"
    }
  ]
}
```

---

### 2. GET `/api/books/:id` — Get a Single Book

**Example Request:**

```
GET http://localhost:5000/api/books/665f1a2b3c4d5e6f7a8b9c0d
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "665f1a2b3c4d5e6f7a8b9c0d",
    "title": "Harry Potter and the Philosopher's Stone",
    "author": "J.K. Rowling",
    "genre": "Fantasy",
    "price": 15.99,
    "publishedDate": "1997-06-26T00:00:00.000Z",
    "inStock": true
  }
}
```

**Not Found Response (404):**

```json
{
  "success": false,
  "message": "Book not found with id 665f1a2b3c4d5e6f7a8b9c0d"
}
```

---

### 3. POST `/api/books` — Add a New Book

**Request Body (JSON):**

```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic Fiction",
  "price": 10.99,
  "publishedDate": "1925-04-10",
  "inStock": true
}
```

**Required Fields:** `title`, `author`, `price`

**Success Response (201):**

```json
{
  "success": true,
  "message": "Book created successfully",
  "data": {
    "_id": "665f1b2c3d4e5f6a7b8c9d0e",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic Fiction",
    "price": 10.99,
    "publishedDate": "1925-04-10T00:00:00.000Z",
    "inStock": true,
    "createdAt": "2024-06-04T10:35:00.000Z",
    "updatedAt": "2024-06-04T10:35:00.000Z"
  }
}
```

**Validation Error Response (400):**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Title is required",
    "Price is required"
  ]
}
```

---

### 4. PUT `/api/books/:id` — Update a Book

**Request Body (JSON) — send only fields to update:**

```json
{
  "price": 12.99,
  "inStock": false
}
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Book updated successfully",
  "data": {
    "_id": "665f1b2c3d4e5f6a7b8c9d0e",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "genre": "Classic Fiction",
    "price": 12.99,
    "inStock": false
  }
}
```

---

### 5. DELETE `/api/books/:id` — Delete a Book

**Example Request:**

```
DELETE http://localhost:5000/api/books/665f1b2c3d4e5f6a7b8c9d0e
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Book deleted successfully",
  "data": {
    "_id": "665f1b2c3d4e5f6a7b8c9d0e",
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald"
  }
}
```

---

## HTTP Status Codes

| Code | Meaning      | When Used                                 |
| ---- | ------------ | ----------------------------------------- |
| 200  | OK           | Successful GET, PUT, DELETE               |
| 201  | Created      | Successful POST (new book added)          |
| 400  | Bad Request  | Validation errors, invalid ID format      |
| 404  | Not Found    | Book ID doesn't exist, invalid route      |
| 500  | Server Error | Unexpected server or database errors      |

---

## Middleware

1. **Request Logger** — Logs every request with method, endpoint, and timestamp to the console.
2. **Global Error Handler** — Catches all unhandled errors and returns structured JSON error responses.

---

## Project Structure

```
online-bookstore-api/
├── models/
│   └── Book.js            # Mongoose Book schema & model
├── routes/
│   └── books.js           # Express routes for /api/books
├── middleware/
│   ├── logger.js          # Request logging middleware
│   └── errorHandler.js    # Global error handler middleware
├── .env                   # Environment variables
├── .gitignore             # Git ignore rules
├── package.json           # Project dependencies & scripts
├── server.js              # Main application entry point
└── API_DOCUMENTATION.md   # This file
```

---

## Postman Testing Guide

### Import Steps:

1. Open Postman
2. Create a new **Collection** called "Bookstore API"
3. Add the following requests:

| # | Request Name         | Method | URL                                        |
|---|----------------------|--------|--------------------------------------------|
| 1 | Get All Books        | GET    | `http://localhost:5000/api/books`           |
| 2 | Get Book by ID       | GET    | `http://localhost:5000/api/books/:id`       |
| 3 | Add New Book         | POST   | `http://localhost:5000/api/books`           |
| 4 | Update Book          | PUT    | `http://localhost:5000/api/books/:id`       |
| 5 | Delete Book          | DELETE | `http://localhost:5000/api/books/:id`       |
| 6 | Search by Author     | GET    | `http://localhost:5000/api/books?author=xyz`|
| 7 | Search by Genre      | GET    | `http://localhost:5000/api/books?genre=abc` |
| 8 | Paginated Books      | GET    | `http://localhost:5000/api/books?page=1&limit=5` |

> For POST and PUT requests, set the Body to **raw → JSON** and provide the book data.

---

## Technology Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (via Mongoose ODM)
- **Environment:** dotenv
- **Dev Tool:** nodemon
