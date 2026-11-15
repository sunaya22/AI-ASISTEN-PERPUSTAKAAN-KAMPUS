# LibraAI – AI Asisten Perpustakaan Kampus

Prototipe TP3 menggunakan HTML, CSS, JavaScript, Node.js + Express, MySQL, dan Ollama.

## 1. Kebutuhan

- Windows 10/11
- Node.js dan npm
- XAMPP (MySQL)
- Ollama
- Model yang kompatibel dan sudah tersedia pada Ollama

## 2. Persiapan database

1. Jalankan MySQL dari XAMPP Control Panel.
2. Buka phpMyAdmin: `http://localhost/phpmyadmin`.
3. Pilih menu Import dan impor `database.sql`.
4. SQL ini membuat tabel `tabel_kategori` dan `tabel_buku` beserta beberapa data dummy.

Jika database atau tabel milikmu sudah ada, buat backup terlebih dahulu. Periksa struktur kolom dan sesuaikan query pada `server.js`; jangan mengimpor skema contoh secara membabi buta ke database produksi.

## 3. Persiapan Ollama

1. Jalankan Ollama.
2. Di PowerShell, jalankan `ollama list` untuk melihat model yang tersedia.
3. Jika ingin mengunduh model contoh, jalankan `ollama pull llama3.2:1b`.
4. Salin `.env.example` menjadi `.env`.
5. Isi `OLLAMA_MODEL` dengan nama persis dari `ollama list`.

Catatan: model dengan akhiran `-cloud` dapat menggunakan layanan cloud. Jangan menyebutnya inference lokal murni tanpa memeriksa dokumentasi dan konfigurasi model tersebut.

## 4. Jalankan aplikasi

Buka PowerShell pada folder proyek:

```powershell
npm install
Copy-Item .env.example .env
notepad .env
npm start
```

Pastikan nilai konfigurasi database dan nama model sesuai lingkunganmu. Buka `http://localhost:3000`.

## 5. API yang tersedia

- `GET /api/health` – memeriksa koneksi database dan Ollama.
- `GET /api/categories` – daftar kategori.
- `GET /api/books?q=javascript` – pencarian buku.
- `GET /api/availability?q=javascript` – pemeriksaan stok.
- `POST /api/chat` – mengirim pertanyaan ke Ollama.

Contoh body chat:

```json
{
  "message": "Tolong carikan buku untuk belajar JavaScript"
}
```

## 6. Keamanan

- File `.env` tidak boleh diunggah ke GitHub.
- Jangan memasukkan password, API key, token, atau data pribadi pada prompt dan screenshot laporan.
- Backend membatasi ukuran JSON, panjang pertanyaan, CORS, dan frekuensi request chat.
- Gunakan prepared statements untuk query SQL.
- Untuk deployment publik, tambahkan autentikasi, HTTPS, logging yang aman, pengelolaan akun database dengan hak minimum, serta konfigurasi CORS sesuai domain sebenarnya.
- Jangan membuka port Ollama ke internet. Akses Ollama hanya dari backend tepercaya.

## 7. Batasan implementasi TP3

Fitur chat menggunakan retrieval sederhana dari katalog MySQL berdasarkan kata kunci, lalu menyertakan hasilnya sebagai konteks prompt. Ini belum merupakan RAG berbasis embedding/vector database. Implementasi RAG penuh dapat ditambahkan dengan pipeline dokumen, chunking, embedding, vector storage, retrieval, dan review manusia.

## 8. Lima kasus uji TP3

Lihat `TP3-TESTING.md`. Isi hasil, waktu respons, kualitas sumber, penggunaan resource, dan error berdasarkan pengujian nyata. Jangan mengisi hasil sebelum pengujian dilakukan.
