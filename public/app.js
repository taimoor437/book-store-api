const API_URL = "/api/books";

const state = {
  page: 1,
  limit: 8,
  totalPages: 1,
  editingId: null,
};

const elements = {
  form: document.querySelector("#book-form"),
  formTitle: document.querySelector("#form-title"),
  submitButton: document.querySelector("#submit-button"),
  resetForm: document.querySelector("#reset-form"),
  bookId: document.querySelector("#book-id"),
  title: document.querySelector("#title"),
  author: document.querySelector("#author"),
  genre: document.querySelector("#genre"),
  price: document.querySelector("#price"),
  publishedDate: document.querySelector("#publishedDate"),
  inStock: document.querySelector("#inStock"),
  searchForm: document.querySelector("#search-form"),
  searchTitle: document.querySelector("#search-title"),
  searchAuthor: document.querySelector("#search-author"),
  searchGenre: document.querySelector("#search-genre"),
  searchStock: document.querySelector("#search-stock"),
  clearSearch: document.querySelector("#clear-search"),
  message: document.querySelector("#message"),
  list: document.querySelector("#book-list"),
  summary: document.querySelector("#summary"),
  prevPage: document.querySelector("#prev-page"),
  nextPage: document.querySelector("#next-page"),
  pageInfo: document.querySelector("#page-info"),
};

function setMessage(text = "", type = "") {
  elements.message.textContent = text;
  elements.message.className = `message ${type}`.trim();
}

function formatDate(value) {
  if (!value) return "No date";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getBookPayload() {
  const payload = {
    title: elements.title.value.trim(),
    author: elements.author.value.trim(),
    genre: elements.genre.value.trim(),
    price: Number(elements.price.value),
    inStock: elements.inStock.checked,
  };

  if (elements.publishedDate.value) {
    payload.publishedDate = elements.publishedDate.value;
  }

  return payload;
}

function getFilters() {
  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit,
  });

  const filters = {
    title: elements.searchTitle.value.trim(),
    author: elements.searchAuthor.value.trim(),
    genre: elements.searchGenre.value.trim(),
    inStock: elements.searchStock.value,
  };

  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });

  return params;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const body = await response.json();

  if (!response.ok) {
    const detail = Array.isArray(body.errors) ? body.errors.join(", ") : body.message;
    throw new Error(detail || "Request failed");
  }

  return body;
}

function resetBookForm() {
  elements.form.reset();
  elements.bookId.value = "";
  elements.inStock.checked = true;
  state.editingId = null;
  elements.formTitle.textContent = "Add Book";
  elements.submitButton.textContent = "Add Book";
}

function startEdit(book) {
  state.editingId = book._id;
  elements.bookId.value = book._id;
  elements.title.value = book.title || "";
  elements.author.value = book.author || "";
  elements.genre.value = book.genre || "";
  elements.price.value = book.price ?? "";
  elements.publishedDate.value = book.publishedDate ? book.publishedDate.slice(0, 10) : "";
  elements.inStock.checked = Boolean(book.inStock);
  elements.formTitle.textContent = "Edit Book";
  elements.submitButton.textContent = "Update Book";
  document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderBooks(books) {
  elements.list.innerHTML = "";

  if (!books.length) {
    elements.list.innerHTML = '<div class="empty-state">No books found.</div>';
    return;
  }

  books.forEach((book) => {
    const article = document.createElement("article");
    article.className = "book-card";
    article.innerHTML = `
      <div>
        <h3>${escapeHtml(book.title)}</h3>
        <p class="meta">
          <span>${escapeHtml(book.author)}</span>
          <span>${escapeHtml(book.genre || "Uncategorized")}</span>
          <span>${formatDate(book.publishedDate)}</span>
        </p>
      </div>
      <div class="price-row">
        <span class="price">$${Number(book.price).toFixed(2)}</span>
        <span class="badge ${book.inStock ? "" : "out"}">${book.inStock ? "In stock" : "Out of stock"}</span>
      </div>
      <div class="card-actions">
        <button class="ghost-button" type="button" data-action="edit">Edit</button>
        <button class="danger-button" type="button" data-action="delete">Delete</button>
      </div>
    `;

    article.querySelector('[data-action="edit"]').addEventListener("click", () => startEdit(book));
    article.querySelector('[data-action="delete"]').addEventListener("click", () => deleteBook(book));
    elements.list.appendChild(article);
  });
}

function renderPagination(data) {
  state.totalPages = data.totalPages || 1;
  elements.summary.textContent = `${data.totalBooks || 0} total`;
  elements.pageInfo.textContent = `Page ${state.page} of ${state.totalPages}`;
  elements.prevPage.disabled = state.page <= 1;
  elements.nextPage.disabled = state.page >= state.totalPages;
}

async function loadBooks() {
  try {
    setMessage("Loading books...");
    const data = await requestJson(`${API_URL}?${getFilters().toString()}`);
    renderBooks(data.data || []);
    renderPagination(data);
    setMessage("");
  } catch (error) {
    elements.list.innerHTML = "";
    elements.summary.textContent = "Unavailable";
    setMessage(error.message, "error");
  }
}

async function saveBook(event) {
  event.preventDefault();

  try {
    const payload = getBookPayload();
    const id = state.editingId;
    const url = id ? `${API_URL}/${id}` : API_URL;
    const method = id ? "PUT" : "POST";

    await requestJson(url, {
      method,
      body: JSON.stringify(payload),
    });

    setMessage(id ? "Book updated." : "Book added.", "success");
    resetBookForm();
    await loadBooks();
  } catch (error) {
    setMessage(error.message, "error");
  }
}

async function deleteBook(book) {
  const confirmed = window.confirm(`Delete "${book.title}"?`);
  if (!confirmed) return;

  try {
    await requestJson(`${API_URL}/${book._id}`, { method: "DELETE" });
    setMessage("Book deleted.", "success");
    await loadBooks();
  } catch (error) {
    setMessage(error.message, "error");
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.form.addEventListener("submit", saveBook);
elements.resetForm.addEventListener("click", resetBookForm);

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  state.page = 1;
  loadBooks();
});

elements.clearSearch.addEventListener("click", () => {
  elements.searchForm.reset();
  state.page = 1;
  loadBooks();
});

elements.prevPage.addEventListener("click", () => {
  if (state.page > 1) {
    state.page -= 1;
    loadBooks();
  }
});

elements.nextPage.addEventListener("click", () => {
  if (state.page < state.totalPages) {
    state.page += 1;
    loadBooks();
  }
});

loadBooks();
