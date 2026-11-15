require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3000);
const APP_ORIGIN = process.env.APP_ORIGIN || `http://localhost:${PORT}`;
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3.2:1b";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: APP_ORIGIN }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, error: "Terlalu banyak permintaan. Coba lagi sebentar." }
});

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "database_perpustakaan",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

function normalizeText(value, maxLength = 500) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

async function searchBooks(keyword, limit = 8) {
  const safeLimit = Math.min(Math.max(Number(limit) || 8, 1), 20);
  const term = `%${keyword}%`;

  // Sesuaikan nama kolom bila struktur tabel milikmu berbeda.
  const [rows] = await pool.execute(
    `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit,
            b.total_stok, b.stok_tersedia, k.nama_kategori
     FROM tabel_buku b
     LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori
     WHERE b.judul LIKE ? OR b.penulis LIKE ? OR k.nama_kategori LIKE ?
     ORDER BY b.judul ASC
     LIMIT ${safeLimit}`,
    [term, term, term]
  );
  return rows;
}

app.get("/api/health", async (_req, res) => {
  let database = "unknown";
  let ollama = "unknown";

  try {
    await pool.query("SELECT 1");
    database = "connected";
  } catch {
    database = "disconnected";
  }

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { signal: AbortSignal.timeout(5000) });
    ollama = response.ok ? "connected" : "unavailable";
  } catch {
    ollama = "disconnected";
  }

  res.json({
    success: true,
    app: "LibraAI",
    database,
    ollama,
    model: OLLAMA_MODEL
  });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id_kategori, nama_kategori FROM tabel_kategori ORDER BY nama_kategori"
    );
    res.json({ success: true, data: rows });
  } catch (error) {
    console.error("GET categories:", error.message);
    res.status(500).json({ success: false, error: "Gagal mengambil kategori. Periksa koneksi database." });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const q = normalizeText(req.query.q, 100);
    const category = normalizeText(req.query.category, 100);
    const availableOnly = req.query.available === "true";

    let sql = `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit,
                      b.total_stok, b.stok_tersedia, k.nama_kategori
               FROM tabel_buku b
               LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori
               WHERE 1=1`;
    const params = [];

    if (q) {
      sql += " AND (b.judul LIKE ? OR b.penulis LIKE ? OR k.nama_kategori LIKE ?)";
      params.push(`%${q}%`, `%${q}%`, `%${q}%`);
    }
    if (category) {
      sql += " AND k.nama_kategori = ?";
      params.push(category);
    }
    if (availableOnly) sql += " AND b.stok_tersedia > 0";
    sql += " ORDER BY b.judul LIMIT 100";

    const [rows] = await pool.execute(sql, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error("GET books:", error.message);
    res.status(500).json({ success: false, error: "Gagal mengambil katalog buku." });
  }
});

app.get("/api/availability", async (req, res) => {
  try {
    const q = normalizeText(req.query.q, 100);
    if (!q) {
      return res.status(400).json({ success: false, error: "Masukkan judul buku yang ingin diperiksa." });
    }
    const rows = await searchBooks(q, 10);
    res.json({
      success: true,
      count: rows.length,
      data: rows.map(book => ({
        judul: book.judul,
        stok_tersedia: book.stok_tersedia,
        status: Number(book.stok_tersedia) > 0 ? "Tersedia" : "Tidak tersedia"
      }))
    });
  } catch (error) {
    console.error("GET availability:", error.message);
    res.status(500).json({ success: false, error: "Gagal memeriksa ketersediaan buku." });
  }
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  const question = normalizeText(req.body?.message, 1000);

  if (!question) {
    return res.status(400).json({ success: false, error: "Pertanyaan tidak boleh kosong." });
  }

  try {
    // Retrieval sederhana dari MySQL untuk memberi konteks katalog kepada model.
    // Ini bukan implementasi vector RAG; vector embedding dapat ditambahkan kemudian.
    const books = await searchBooks(question, 8).catch(() => []);
    const bookContext = books.length
      ? books.map((b, i) =>
          `${i + 1}. Judul: ${b.judul}; Penulis: ${b.penulis || "Tidak dicantumkan"}; ` +
          `Kategori: ${b.nama_kategori || "Tidak diketahui"}; Tahun: ${b.tahun_terbit || "-"}; ` +
          `Stok tersedia: ${b.stok_tersedia}`
        ).join("\n")
      : "Tidak ada data katalog yang cocok secara langsung dengan kata kunci pertanyaan.";

    const systemPrompt = `
Kamu adalah LibraAI, asisten informasi perpustakaan kampus.
Jawab dalam Bahasa Indonesia yang jelas dan sopan.
Gunakan data katalog pada konteks hanya jika relevan.
Jangan mengarang judul, penulis, tahun terbit, atau jumlah stok.
Jika data tidak ditemukan, katakan bahwa data belum ditemukan dan sarankan pencarian katalog.
Untuk status stok, jelaskan bahwa informasi berasal dari data katalog yang tersedia.
Jangan meminta password, API key, token, atau data pribadi mahasiswa.

KONTEKS KATALOG:
${bookContext}
`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    let ollamaResponse;
    try {
      ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: question }
          ],
          stream: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!ollamaResponse.ok) {
      const detail = await ollamaResponse.text();
      console.error("Ollama response:", ollamaResponse.status, detail.slice(0, 500));
      return res.status(502).json({
        success: false,
        error: "Ollama tidak berhasil memproses permintaan. Periksa runtime dan nama model."
      });
    }

    const result = await ollamaResponse.json();
    const reply = result?.message?.content;

    if (!reply) {
      return res.status(502).json({ success: false, error: "Ollama mengembalikan jawaban kosong." });
    }

    res.json({
      success: true,
      reply,
      sources: books.map(b => ({
        title: b.judul,
        author: b.penulis,
        category: b.nama_kategori,
        available: b.stok_tersedia
      })),
      model: OLLAMA_MODEL
    });
  } catch (error) {
    console.error("POST chat:", error.name, error.message);
    if (error.name === "AbortError" || error.name === "TimeoutError") {
      return res.status(504).json({ success: false, error: "Waktu tunggu AI habis. Coba lagi." });
    }
    if (error.cause?.code === "ECONNREFUSED" || /fetch failed/i.test(error.message)) {
      return res.status(503).json({ success: false, error: "Tidak dapat terhubung ke Ollama. Pastikan Ollama sedang berjalan." });
    }
    res.status(500).json({ success: false, error: "Terjadi kesalahan pada server." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`LibraAI berjalan di http://localhost:${PORT}`);
  console.log(`Model Ollama yang dikonfigurasi: ${OLLAMA_MODEL}`);
});
