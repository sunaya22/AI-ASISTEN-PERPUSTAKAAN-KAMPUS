require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mysql = require("mysql2/promise");
const path = require("path");

const app = express();
const PORT = Number(process.env.PORT || 3001);
const APP_ORIGIN = process.env.APP_ORIGIN || `http://localhost:${PORT}`;
const OLLAMA_BASE_URL = (process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434").replace(/\/$/, "");
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:1.5b";
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 60000);

app.disable("x-powered-by");
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: APP_ORIGIN }));
app.use(express.json({ limit: "20kb" }));
app.use(express.static(path.join(__dirname, "public")));

const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
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

async function searchBooksCatalog(keyword, limit = 50) {
  const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
  if (!keyword) {
    const [rows] = await pool.execute(
      `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.total_stok, b.stok_tersedia, k.nama_kategori
       FROM tabel_buku b LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori ORDER BY b.judul ASC LIMIT ${safeLimit}`
    );
    return rows;
  }
  const [rows] = await pool.execute(
    `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.total_stok, b.stok_tersedia, k.nama_kategori
     FROM tabel_buku b LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori
     WHERE b.judul LIKE ? OR b.penulis LIKE ? OR k.nama_kategori LIKE ?
     ORDER BY b.judul ASC LIMIT ${safeLimit}`,
    [`%${keyword}%`, `%${keyword}%`, `%${keyword}%`]
  );
  return rows;
}

// PENCARIAN CHAT CERDAS: Cek apakah judul buku ada di dalam kalimat pengguna
async function searchBookForChat(keyword) {
  if (!keyword) return [];
  
  // Ambil semua buku dari database untuk dicocokkan langsung dengan teks pengguna
  const [allRows] = await pool.execute(
    `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.total_stok, b.stok_tersedia, k.nama_kategori
     FROM tabel_buku b LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori`
  );

  const lowerQ = keyword.toLowerCase();
  
  // Cari apakah ada judul atau penulis di database yang termuat dalam kalimat pertanyaan pengguna
  const matchedBook = allRows.find(b => {
    const title = (b.judul || "").toLowerCase();
    const author = (b.penulis || "").toLowerCase();
    return (title.length > 2 && lowerQ.includes(title)) || (author.length > 2 && lowerQ.includes(author));
  });

  if (matchedBook) {
    return [matchedBook];
  }

  // Fallback jika tidak ada yang pas secara persis di kalimat
  const cleanKeyword = keyword
    .replace(/(berikan|informasi|dari|buku|tentang|tolong|cari|ringkasan|tersebut|yang|apa|adalah)/gi, "")
    .trim();
    
  if (!cleanKeyword) return [];

  const [rows] = await pool.execute(
    `SELECT b.id_buku, b.judul, b.penulis, b.penerbit, b.tahun_terbit, b.total_stok, b.stok_tersedia, k.nama_kategori
     FROM tabel_buku b LEFT JOIN tabel_kategori k ON b.id_kategori = k.id_kategori
     WHERE b.judul LIKE ? OR b.penulis LIKE ?
     LIMIT 1`,
    [`%${cleanKeyword}%`, `%${cleanKeyword}%`]
  );
  return rows;
}

app.get("/api/health", async (_req, res) => {
  let database = "connected";
  try { await pool.query("SELECT 1"); } catch { database = "disconnected"; }
  res.json({ success: true, app: "LibraAI", database, model: OLLAMA_MODEL });
});

app.get("/api/categories", async (_req, res) => {
  try {
    const [rows] = await pool.execute("SELECT id_kategori, nama_kategori FROM tabel_kategori ORDER BY nama_kategori");
    res.json({ success: true, data: rows });
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal mengambil kategori." });
  }
});

app.get("/api/books", async (req, res) => {
  try {
    const q = normalizeText(req.query.q, 100);
    const results = await searchBooksCatalog(q, 100);
    res.json({ success: true, count: results.length, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: "Gagal mengambil katalog buku." });
  }
});

app.get("/api/availability", async (req, res) => {
  try {
    const q = normalizeText(req.query.q, 100);
    if (!q) return res.status(400).json({ success: false, error: "Masukkan judul buku." });
    const rows = await searchBooksCatalog(q, 5);
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
    res.status(500).json({ success: false, error: "Gagal memeriksa ketersediaan." });
  }
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  const question = normalizeText(req.body?.message, 1000);
  if (!question) return res.status(400).json({ success: false, error: "Pertanyaan kosong." });

  const REFUSAL_TEXT = "Maaf, saya tidak dapat membantu menjawab pertanyaan di luar topik perpustakaan. Jika Anda memiliki pertanyaan lain yang lebih terkait dengan buku atau literasi, saya akan senang membantu.";

  const lowerQ = question.toLowerCase();
  const bookKeywords = ["buku", "perpus", "novel", "penulis", "penerbit", "katalog", "literasi", "baca", "stok", "peminjaman", "isbn", "perpustakaan", "ringkasan", "sinopsis", "cari", "rekomendasi", "kategori", "terbit", "akuntansi", "anatomi", "jelaskan", "informasi", "dasar", "etika", "politik", "jurnal", "blockchain", "blokchain", "web", "website", "pembuatan", "coding", "pemrograman", "kedokteran", "keperawatan", "tersedia", "ekonomi", "apakah", "epidemiologi", "iot", "jaringan", "teknologi", "hijau", "inovasi"];
  const greetings = ["halo", "hi", "selamat", "pagi", "siang", "malam", "terima kasih", "test"];
  
  const isGreeting = greetings.some(g => lowerQ === g || lowerQ.startsWith(g));
  const hasBookTerm = bookKeywords.some(term => lowerQ.includes(term));

  if (!isGreeting && !hasBookTerm) {
    return res.json({ success: true, reply: REFUSAL_TEXT, sources: [], model: OLLAMA_MODEL });
  }

  try {
    const isRecommendationQuery = ["rekomendasi", "cocok", "bagus", "belajar", "tentang jurnal"].some(term => lowerQ.includes(term));
    
    let books = [];
    if (!isRecommendationQuery) {
      books = await searchBookForChat(question).catch(() => []);
    }

    const isBookFoundInDb = books.length > 0;
    const bookContext = isBookFoundInDb
      ? `Buku ditemukan di katalog lokal:\n- Judul: ${books[0].judul}\n- Penulis: ${books[0].penulis}\n- Kategori: ${books[0].nama_kategori}\n- Stok Tersedia: ${books[0].stok_tersedia} dari ${books[0].total_stok}`
      : "Tidak ada buku spesifik di katalog lokal perpustakaan kampus.";

    const systemPrompt = `Kamu adalah LibraAI, asisten resmi Perpustakaan Kampus.
    
DATA KATALOG LOKAL:
${bookContext}

ATURAN UTAMA:
1. Jawablah dengan singkat, padat, dan langsung pada intinya (maksimal 2 paragraf). 
2. Jika buku ditemukan di katalog lokal, sebutkan nama penulis, kategori, deskripsi singkat, dan informasi ketersediaan stoknya.
3. Jika pengguna meminta REKOMENDASI buku atau topiknya tidak ada di katalog lokal, berikan rekomendasi buku terbaik di dunia nyata.
4. Gunakan bahasa Indonesia yang natural dan ramah.`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: question }
    ];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

    let ollamaResponse;
    try {
      ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          messages: messages,
          stream: false
        }),
        signal: controller.signal
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!ollamaResponse.ok) {
      return res.status(502).json({ success: false, error: "Ollama sibuk, coba lagi." });
    }

    const result = await ollamaResponse.json();
    let reply = result?.message?.content;

    if (!reply) return res.status(502).json({ success: false, error: "Jawaban kosong dari AI." });

    // Tambahkan catatan tidak tersedia HANYA JIKA buku benar-benar tidak ada di database lokal
    if (!isBookFoundInDb && !isGreeting) {
      reply += "\n\n*(Mohon maaf, buku ini tidak tersedia di katalog perpustakaan kampus kami.)*";
    }

    res.json({
      success: true,
      reply,
      sources: books.map(b => ({ title: b.judul, author: b.penulis, available: b.stok_tersedia })),
      model: OLLAMA_MODEL
    });

  } catch (error) {
    console.error("Chat error:", error.message);
    res.status(500).json({ success: false, error: "Terjadi kesalahan pada server." });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`LibraAI berjalan di http://localhost:${PORT} dengan model ${OLLAMA_MODEL}`);
});