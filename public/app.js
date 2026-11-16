const $ = (selector) => document.querySelector(selector);

// Fungsi pembantu untuk mencari elemen dengan beberapa alternatif ID/Class
function getElement(selectors) {
  for (const sel of selectors) {
    const el = document.querySelector(sel);
    if (el) return el;
  }
  return null;
}

async function api(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
  return data;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

// Variabel untuk Pagination & Data
let allBooks = [];
let currentPage = 1;
const itemsPerPage = 6;

async function loadCategories() {
  const target = getElement(["#category-list", "#categories", ".category-list", "#kategori-list"]);
  if (!target) {
    console.warn("Elemen kontainer kategori tidak ditemukan di HTML.");
    return;
  }
  try {
    const result = await api("/api/categories");
    const list = result.data || [];
    target.innerHTML = list.length
      ? list.map(item => `<span class="category-chip">${escapeHtml(item.nama_kategori)}</span>`).join("")
      : '<p class="muted">Belum ada kategori di database.</p>';
  } catch (error) {
    target.innerHTML = `<p class="muted">Gagal memuat kategori: ${escapeHtml(error.message)}</p>`;
  }
}

function renderBooks() {
  const target = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
  if (!target) return;

  if (!allBooks.length) {
    target.innerHTML = '<p class="muted">Buku tidak ditemukan.</p>';
    removePagination();
    return;
  }

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBooks = allBooks.slice(startIndex, endIndex);

  target.innerHTML = paginatedBooks.map(book => {
    const available = Number(book.stok_tersedia) > 0;
    return `<article class="book-card">
      <h3>${escapeHtml(book.judul)}</h3>
      <p>Penulis: ${escapeHtml(book.penulis || "-")}</p>
      <p>Kategori: ${escapeHtml(book.nama_kategori || "-")}</p>
      <p>Penerbit: ${escapeHtml(book.penerbit || "-")}</p>
      <p>Tahun: ${escapeHtml(book.tahun_terbit || "-")}</p>
      <span class="stock ${available ? "" : "empty"}">${available ? "Tersedia" : "Tidak tersedia"} · Stok ${Number(book.stok_tersedia) || 0}</span>
    </article>`;
  }).join("");

  renderPaginationControls();
}

function renderPaginationControls() {
  let paginationContainer = $("#pagination-container");
  
  if (!paginationContainer) {
    paginationContainer = document.createElement("div");
    paginationContainer.id = "pagination-container";
    paginationContainer.className = "flex justify-center items-center gap-1.5 mt-8 mb-10 col-span-full flex-wrap";
    const bookList = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
    if (bookList && bookList.parentNode) {
      bookList.parentNode.insertBefore(paginationContainer, bookList.nextSibling);
    }
  }

  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(allBooks.length / itemsPerPage);

  if (totalPages <= 1) return;

  const appendBtn = (text, pageNum, isActive = false, isDisabled = false) => {
    const btn = document.createElement("button");
    btn.innerHTML = text;
    
    if (isDisabled) {
      btn.className = "px-3.5 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed";
      btn.disabled = true;
    } else if (isActive) {
      btn.className = "px-3.5 py-2 text-sm font-semibold text-white bg-emerald-600 border border-emerald-600 rounded-lg shadow-sm transition-all";
    } else {
      btn.className = "px-3.5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-emerald-600 transition-all shadow-sm cursor-pointer";
      btn.addEventListener("click", () => {
        currentPage = pageNum;
        renderBooks();
        const bl = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
        if (bl) window.scrollTo({ top: bl.offsetTop - 120, behavior: 'smooth' });
      });
    }
    paginationContainer.appendChild(btn);
  };

  appendBtn("‹ Prev", currentPage - 1, false, currentPage === 1);
  if (currentPage > 1) {
    paginationContainer.lastChild.onclick = () => {
      currentPage--;
      renderBooks();
      const bl = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
      if (bl) window.scrollTo({ top: bl.offsetTop - 120, behavior: 'smooth' });
    };
  }

  let pages = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    if (currentPage <= 4) {
      pages = [1, 2, 3, 4, 5, '...', totalPages];
    } else if (currentPage >= totalPages - 3) {
      pages = [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }

  pages.forEach(p => {
    if (p === '...') {
      const span = document.createElement("span");
      span.className = "px-2 py-2 text-sm text-gray-400 font-medium select-none";
      span.textContent = "...";
      paginationContainer.appendChild(span);
    } else {
      appendBtn(p, p, p === currentPage, false);
    }
  });

  appendBtn("Next ›", currentPage + 1, false, currentPage === totalPages);
  if (currentPage < totalPages) {
    paginationContainer.lastChild.onclick = () => {
      currentPage++;
      renderBooks();
      const bl = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
      if (bl) window.scrollTo({ top: bl.offsetTop - 120, behavior: 'smooth' });
    };
  }
}

function removePagination() {
  const container = $("#pagination-container");
  if (container) container.innerHTML = "";
}

async function loadBooks(query = "") {
  const target = getElement(["#book-list", "#books", ".book-list", "#katalog-buku"]);
  const btn = getElement(["#search-books", "#search-btn"]);
  const prevText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Memuat..."; }
  if (target) target.innerHTML = '<p class="muted">Memuat katalog...</p>';
  removePagination();

  try {
    const result = await api(`/api/books?q=${encodeURIComponent(query)}`);
    allBooks = result.data || [];
    currentPage = 1;
    renderBooks();
  } catch (error) {
    if (target) target.innerHTML = `<p class="muted">Gagal memuat katalog: ${escapeHtml(error.message)}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = prevText || "Cari buku"; }
  }
}

const searchBtn = getElement(["#search-books", "#search-btn"]);
const bookSearch = getElement(["#book-search", "#search-input-book"]);
if (searchBtn && bookSearch) {
  searchBtn.addEventListener("click", () => loadBooks(bookSearch.value.trim()));
}
if (bookSearch) {
  bookSearch.addEventListener("keydown", event => {
    if (event.key === "Enter") loadBooks(event.target.value.trim());
  });
}

// === LIVE SEARCH KETERSEDIAAN BUKU ===
const avSearch = getElement(["#availability-search", "#check-search"]);
const checkTarget = getElement(["#availability-result", "#check-result"]);
const checkBtn = getElement(["#check-availability", "#check-btn"]);

if (checkBtn) checkBtn.style.display = "none";

if (avSearch && checkTarget) {
  avSearch.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (!query) {
      checkTarget.innerHTML = "";
      return;
    }

    checkTarget.innerHTML = "Memeriksa ketersediaan...";

    try {
      const result = await api(`/api/availability?q=${encodeURIComponent(query)}`);
      const data = result.data || [];
      
      if (data.length === 0) {
        checkTarget.innerHTML = "Buku tidak ditemukan pada katalog.";
        return;
      }

      checkTarget.innerHTML = data.slice(0, 5).map(book => {
        const available = Number(book.stok_tersedia) > 0;
        return `<p><b>${escapeHtml(book.judul)}</b> — <span class="${available ? "text-emerald-600" : "text-red-600"}">${escapeHtml(book.status)}</span> (stok: ${Number(book.stok_tersedia) || 0})</p>`;
      }).join("");
    } catch (error) {
      checkTarget.textContent = `Gagal: ${error.message}`;
    }
  });
}

function addMessage(role, text) {
  const target = getElement(["#chat-messages", "#chat-box"]);
  if (!target) return null;
  const node = document.createElement("div");
  node.className = role === "user" ? "message user-message" : "message assistant-message";
  if (role === "user") {
    node.textContent = text;
  } else {
    const avatar = document.createElement("span");
    avatar.className = "avatar";
    avatar.textContent = "🤖";
    const body = document.createElement("div");
    const name = document.createElement("b");
    name.textContent = "LibraAI";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    body.append(name, paragraph);
    node.append(avatar, body);
  }
  target.append(node);
  target.scrollTop = target.scrollHeight;
  return node;
}

const chatForm = getElement(["#chat-form", "#form-chat"]);
if (chatForm) {
  chatForm.addEventListener("submit", async event => {
    event.preventDefault();
    const input = getElement(["#chat-input", "#input-chat"]);
    const sendBtn = chatForm.querySelector('button[type="submit"]');
    const message = input ? input.value.trim() : "";
    if (!message) return;

    addMessage("user", message);
    if (input) input.value = "";
    if (sendBtn) sendBtn.disabled = true;
    const pending = addMessage("assistant", "Sedang memproses pertanyaan...");
    const paragraph = pending ? pending.querySelector("p") : null;

    try {
      const result = await api("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message })
      });
      if (paragraph) paragraph.textContent = result.reply || "Tidak ada jawaban.";
      if (result.sources && result.sources.length && pending) {
        const sourceText = result.sources.map(source => source.title).join(", ");
        const source = document.createElement("small");
        source.className = "muted";
        source.textContent = `Sumber katalog: ${sourceText}`;
        const bodyDiv = pending.querySelector("div");
        if (bodyDiv) bodyDiv.append(source);
      }
    } catch (error) {
      if (paragraph) paragraph.textContent = `Maaf, ${error.message}`;
    } finally {
      if (sendBtn) sendBtn.disabled = false;
      if (input) input.focus();
    }
  });
}

loadCategories();
loadBooks();