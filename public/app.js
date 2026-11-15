const $ = (selector) => document.querySelector(selector);

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

// Variabel untuk Pagination
let allBooks = [];
let currentPage = 1;
const itemsPerPage = 6; // Jumlah buku per halaman (bisa diubah sesuai selera)

async function loadCategories() {
  const target = $("#category-list");
  if (!target) return;
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
  const target = $("#book-list");
  if (!target) return;

  if (!allBooks.length) {
    target.innerHTML = '<p class="muted">Buku tidak ditemukan.</p>';
    removePagination();
    return;
  }

  // Hitung data untuk halaman aktif
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
    const bookList = $("#book-list");
    if (bookList && bookList.parentNode) {
      bookList.parentNode.insertBefore(paginationContainer, bookList.nextSibling);
    }
  }

  paginationContainer.innerHTML = "";
  const totalPages = Math.ceil(allBooks.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Helper membuat tombol pagination yang cantik
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
        window.scrollTo({ top: $("#book-list").offsetTop - 120, behavior: 'smooth' });
      });
    }
    paginationContainer.appendChild(btn);
  };

  // Tombol Previous
  appendBtn("‹ Prev", currentPage - 1, false, currentPage === 1);
  if (currentPage > 1) {
    paginationContainer.lastChild.onclick = () => {
      currentPage--;
      renderBooks();
      window.scrollTo({ top: $("#book-list").offsetTop - 120, behavior: 'smooth' });
    };
  }

  // Logika Pintar untuk Angka & Titik-titik (...)
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

  // Render Tombol Nomor / Ellipsis
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

  // Tombol Next
  appendBtn("Next ›", currentPage + 1, false, currentPage === totalPages);
  if (currentPage < totalPages) {
    paginationContainer.lastChild.onclick = () => {
      currentPage++;
      renderBooks();
      window.scrollTo({ top: $("#book-list").offsetTop - 120, behavior: 'smooth' });
    };
  }
}

function removePagination() {
  const container = $("#pagination-container");
  if (container) container.innerHTML = "";
}

async function loadBooks(query = "") {
  const target = $("#book-list");
  const btn = $("#search-books");
  const prevText = btn ? btn.textContent : "";
  if (btn) { btn.disabled = true; btn.textContent = "Memuat..."; }
  target.innerHTML = '<p class="muted">Memuat katalog...</p>';
  removePagination();

  try {
    const result = await api(`/api/books?q=${encodeURIComponent(query)}`);
    allBooks = result.data || [];
    currentPage = 1; // Reset ke halaman 1 setiap kali mencari buku baru
    renderBooks();
  } catch (error) {
    target.innerHTML = `<p class="muted">Gagal memuat katalog: ${escapeHtml(error.message)}</p>`;
  } finally {
    if (btn) { btn.disabled = false; btn.textContent = prevText || "Cari buku"; }
  }
}

const searchBtn = $("#search-books");
if (searchBtn) searchBtn.addEventListener("click", () => loadBooks($("#book-search").value.trim()));
const bookSearch = $("#book-search");
if (bookSearch) bookSearch.addEventListener("keydown", event => {
  if (event.key === "Enter") loadBooks(event.target.value.trim());
});

const checkBtn = $("#check-availability");
if (checkBtn) checkBtn.addEventListener("click", async () => {
  const query = $("#availability-search").value.trim();
  const target = $("#availability-result");
  if (!query) {
    target.textContent = "Masukkan judul buku terlebih dahulu.";
    return;
  }
  const prevText = checkBtn.textContent;
  checkBtn.disabled = true;
  checkBtn.textContent = "Memeriksa...";
  target.textContent = "Memeriksa ketersediaan...";
  try {
    const result = await api(`/api/availability?q=${encodeURIComponent(query)}`);
    const data = result.data || [];
    target.innerHTML = data.length
      ? data.map(book => `<p><b>${escapeHtml(book.judul)}</b> — ${escapeHtml(book.status)} (stok: ${Number(book.stok_tersedia) || 0})</p>`).join("")
      : "Buku tidak ditemukan pada katalog.";
  } catch (error) {
    target.textContent = `Gagal: ${error.message}`;
  } finally {
    checkBtn.disabled = false;
    checkBtn.textContent = prevText || "Periksa";
  }
});

const avSearch = $("#availability-search");
if (avSearch) avSearch.addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkBtn && checkBtn.click();
});

function addMessage(role, text) {
  const target = $("#chat-messages");
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

const chatForm = $("#chat-form");
if (chatForm) chatForm.addEventListener("submit", async event => {
  event.preventDefault();
  const input = $("#chat-input");
  const sendBtn = chatForm.querySelector('button[type="submit"]');
  const message = input.value.trim();
  if (!message) return;

  addMessage("user", message);
  input.value = "";
  if (sendBtn) sendBtn.disabled = true;
  const pending = addMessage("assistant", "Sedang memproses pertanyaan...");
  const paragraph = pending.querySelector("p");

  try {
    const result = await api("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message })
    });
    paragraph.textContent = result.reply || "Tidak ada jawaban.";
    if (result.sources && result.sources.length) {
      const sourceText = result.sources.map(source => source.title).join(", ");
      const source = document.createElement("small");
      source.className = "muted";
      source.textContent = `Sumber katalog: ${sourceText}`;
      const bodyDiv = pending.querySelector("div");
      if (bodyDiv) bodyDiv.append(source);
    }
  } catch (error) {
    paragraph.textContent = `Maaf, ${error.message}`;
  } finally {
    if (sendBtn) sendBtn.disabled = false;
    input.focus();
  }
});

loadCategories();
loadBooks();