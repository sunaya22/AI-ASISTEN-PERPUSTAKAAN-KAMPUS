# Lembar Pengujian TP3 – LibraAI

Isi kolom hasil hanya setelah pengujian benar-benar dijalankan. Gunakan data dummy atau data katalog yang diizinkan.

| No. | Kasus | Langkah/input | Hasil yang diharapkan | Hasil aktual | Waktu respons | Sumber sesuai? | Resource/error |
|---|---|---|---|---|---|---|---|
| 1 | Pertanyaan umum | “Apa fungsi perpustakaan?” | Jawaban umum yang relevan | Belum diuji | Catat | N/A bila tanpa sumber | Catat |
| 2 | Pencarian buku | “Cari buku JavaScript” | Menjawab dengan data katalog yang ditemukan | Belum diuji | Catat | Cocokkan judul/penulis | Catat |
| 3 | Ketersediaan buku | “Apakah Belajar JavaScript untuk Pemula tersedia?” | Status dan stok sesuai MySQL | Belum diuji | Catat | Cocokkan stok database | Catat |
| 4 | Rekomendasi | “Rekomendasikan buku untuk belajar web development” | Rekomendasi hanya dari katalog atau menyatakan keterbatasan data | Belum diuji | Catat | Periksa tiap judul | Catat |
| 5 | Input kosong | Kirim pesan kosong | Validasi menolak input | Belum diuji | Catat | N/A | Catat |

## Prosedur pengukuran

1. Catat waktu mulai ketika tombol kirim ditekan.
2. Catat waktu selesai ketika jawaban tampil.
3. Selisih keduanya adalah waktu respons yang diamati.
4. Periksa jawaban dengan data MySQL atau sumber resmi yang digunakan.
5. Buka Task Manager untuk mengamati CPU dan RAM jika diperlukan.
6. Uji kegagalan dengan menghentikan Ollama sementara, lalu jalankan kembali untuk memeriksa pemulihan.

## Format catatan error dan pemulihan

- Kondisi pemicu:
- Pesan yang ditampilkan:
- Apakah server tetap berjalan:
- Langkah pemulihan:
- Hasil setelah pemulihan:

## Catatan kejujuran pelaporan

Jangan menyatakan pengujian berhasil, akurasi tertentu, atau waktu respons tertentu sebelum memperoleh bukti pengujian.
