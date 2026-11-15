CREATE DATABASE IF NOT EXISTS database_perpustakaan
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE database_perpustakaan;

CREATE TABLE IF NOT EXISTS tabel_kategori (
  id_kategori INT AUTO_INCREMENT PRIMARY KEY,
  nama_kategori VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS tabel_buku (
  id_buku INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  penulis VARCHAR(150),
  penerbit VARCHAR(150),
  tahun_terbit YEAR NULL,
  id_kategori INT NULL,
  total_stok INT NOT NULL DEFAULT 0,
  stok_tersedia INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_buku_kategori FOREIGN KEY (id_kategori)
    REFERENCES tabel_kategori(id_kategori)
    ON UPDATE CASCADE ON DELETE SET NULL
);

-- Bersihkan data lama (opsional, jalankan jika ingin reset)
-- SET FOREIGN_KEY_CHECKS = 0;
-- TRUNCATE TABLE tabel_buku;
-- TRUNCATE TABLE tabel_kategori;
-- SET FOREIGN_KEY_CHECKS = 1;

INSERT IGNORE INTO tabel_kategori (nama_kategori) VALUES
('Sains dan Teknologi'),
('Ekonomi dan Bisnis'),
('Hukum dan Politik'),
('Pendidikan dan Pembelajaran'),
('Ilmu Sosial'),
('Kesehatan dan Kedokteran'),
('Agama dan Spiritualitas'),
('Bahasa dan Sastra'),
('Karya Ilmiah dan Referensi'),
('Sejarah dan Kebudayaan'),
('Seni dan Desain');

-- =========================
-- 100 BUKU (10 per kategori, 11 kategori)
-- =========================

-- 1. Sains dan Teknologi
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Pengantar Sains Modern' AS judul, 'Dr. Andi Prasetyo' AS penulis, 'Pustaka Ilmu' AS penerbit, 2022 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Fisika Dasar untuk Pemula' AS judul, 'Siti Nurhaliza' AS penulis, 'Ilmu Press' AS penerbit, 2021, 3, 2 UNION ALL
  SELECT 'Kimia Terapan Sehari-hari' AS judul, 'Budi Santoso' AS penulis, 'Sains Media' AS penerbit, 2023, 5, 4 UNION ALL
  SELECT 'Biologi Sel dan Molekuler' AS judul, 'Dewi Lestari' AS penulis, 'Pustaka Ilmu' AS penerbit, 2020, 2, 1 UNION ALL
  SELECT 'Teknologi Nano dalam Industri' AS judul, 'Rizky Hidayat' AS penulis, 'TechPress' AS penerbit, 2024, 3, 3 UNION ALL
  SELECT 'Astronomi untuk Mahasiswa' AS judul, 'Nina Kartika' AS penulis, 'Ilmu Press' AS penerbit, 2022, 4, 2 UNION ALL
  SELECT 'Energi Terbarukan Masa Depan' AS judul, 'Eko Prasetyo' AS penulis, 'Sains Media' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Robotika dan Otomasi' AS judul, 'Lina Marlina' AS penulis, 'TechPress' AS penerbit, 2023, 4, 1 UNION ALL
  SELECT 'Sains Data Dasar' AS judul, 'Fajar Nugroho' AS penulis, 'Pustaka Ilmu' AS penerbit, 2023, 5, 5 UNION ALL
  SELECT 'Inovasi Teknologi Hijau' AS judul, 'Putri Ayu' AS penulis, 'Ilmu Press' AS penerbit, 2024, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Sains dan Teknologi'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 2. Ekonomi dan Bisnis
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Pengantar Ekonomi Mikro' AS judul, 'Ahmad Fauzi' AS penulis, 'Ekon Press' AS penerbit, 2021 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Manajemen Bisnis Modern' AS judul, 'Sari Indah' AS penulis, 'Bisnis Media' AS penerbit, 2023, 5, 4 UNION ALL
  SELECT 'Akuntansi Dasar' AS judul, 'Tono Saputra' AS penulis, 'Ekon Press' AS penerbit, 2022, 3, 1 UNION ALL
  SELECT 'Kewirausahaan Digital' AS judul, 'Hana Salsabila' AS penulis, 'Tekno Buku' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Marketing Strategis' AS judul, 'Raka Pradipta' AS penulis, 'Bisnis Media' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Ekonomi Makro Terapan' AS judul, 'Nur Aini' AS penulis, 'Ekon Press' AS penerbit, 2020, 2, 1 UNION ALL
  SELECT 'Manajemen Keuangan' AS judul, 'Omar Abdullah' AS penulis, 'Andi Publisher' AS penerbit, 2022, 4, 2 UNION ALL
  SELECT 'Bisnis Plan Praktis' AS judul, 'Putra Mahendra' AS penulis, 'Bisnis Media' AS penerbit, 2024, 3, 3 UNION ALL
  SELECT 'Ekonomi Syariah Dasar' AS judul, 'Qori Hanifah' AS penulis, 'Ekon Press' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Supply Chain Management' AS judul, 'Winda Lestari' AS penulis, 'TechPress' AS penerbit, 2024, 2, 1
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Ekonomi dan Bisnis'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 3. Hukum dan Politik
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Pengantar Ilmu Hukum' AS judul, 'Prof. Hadi Wijaya' AS penulis, 'Hukum Press' AS penerbit, 2021 AS tahun_terbit, 4 AS total_stok, 2 AS stok_tersedia UNION ALL
  SELECT 'Hukum Tata Negara' AS judul, 'Rina Marlina' AS penulis, 'Nusantara Legal' AS penerbit, 2022, 3, 1 UNION ALL
  SELECT 'Politik Indonesia Kontemporer' AS judul, 'Doni Prakoso' AS penulis, 'Politik Media' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Hukum Pidana Dasar' AS judul, 'Salsa Bila' AS penulis, 'Hukum Press' AS penerbit, 2020, 3, 2 UNION ALL
  SELECT 'Sistem Politik Komparatif' AS judul, 'Umi Kulsum' AS penulis, 'Politik Media' AS penerbit, 2024, 2, 2 UNION ALL
  SELECT 'Hukum Perdata Praktis' AS judul, 'Vina Oktavia' AS penulis, 'Nusantara Legal' AS penerbit, 2023, 4, 2 UNION ALL
  SELECT 'Hubungan Internasional' AS judul, 'Wahyu Nugraha' AS penulis, 'Politik Media' AS penerbit, 2022, 3, 1 UNION ALL
  SELECT 'Hukum Administrasi Negara' AS judul, 'Xena Laras' AS penulis, 'Hukum Press' AS penerbit, 2024, 2, 1 UNION ALL
  SELECT 'Kebijakan Publik' AS judul, 'Yusuf Maulana' AS penulis, 'Politik Media' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Etika Politik' AS judul, 'Zahra Aulia' AS penulis, 'Nusantara Legal' AS penerbit, 2024, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Hukum dan Politik'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 4. Pendidikan dan Pembelajaran
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Dasar-dasar Pendidikan' AS judul, 'Prof. Siti Aminah' AS penulis, 'Pendidikan Press' AS penerbit, 2022 AS tahun_terbit, 5 AS total_stok, 4 AS stok_tersedia UNION ALL
  SELECT 'Strategi Pembelajaran Aktif' AS judul, 'Bima Sakti' AS penulis, 'Edu Media' AS penerbit, 2023, 4, 2 UNION ALL
  SELECT 'Psikologi Pendidikan' AS judul, 'Citra Dewi' AS penulis, 'Pendidikan Press' AS penerbit, 2021, 3, 1 UNION ALL
  SELECT 'Kurikulum dan Pembelajaran' AS judul, 'Dimas Arya' AS penulis, 'Edu Media' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Evaluasi Pembelajaran' AS judul, 'Elsa Putri' AS penulis, 'Pendidikan Press' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Teknologi dalam Pendidikan' AS judul, 'Fadil Rahman' AS penulis, 'Edu Media' AS penerbit, 2024, 3, 3 UNION ALL
  SELECT 'Pembelajaran Inklusif' AS judul, 'Gina Melati' AS penulis, 'Pendidikan Press' AS penerbit, 2022, 2, 1 UNION ALL
  SELECT 'Manajemen Kelas' AS judul, 'Hadi Kurniawan' AS penulis, 'Edu Media' AS penerbit, 2023, 4, 2 UNION ALL
  SELECT 'Pengembangan Bahan Ajar' AS judul, 'Ika Nurhaliza' AS penulis, 'Pendidikan Press' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Literasi Digital Siswa' AS judul, 'Jefri Nicol' AS penulis, 'Edu Media' AS penerbit, 2024, 3, 3
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Pendidikan dan Pembelajaran'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 5. Ilmu Sosial
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Pengantar Sosiologi' AS judul, 'Dr. Kartika Sari' AS penulis, 'Sosial Press' AS penerbit, 2022 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Antropologi Budaya' AS judul, 'Lutfi Hakim' AS penulis, 'Budaya Media' AS penerbit, 2021, 3, 2 UNION ALL
  SELECT 'Psikologi Sosial' AS judul, 'Maya Anggraini' AS penulis, 'Sosial Press' AS penerbit, 2023, 4, 2 UNION ALL
  SELECT 'Perubahan Sosial' AS judul, 'Nanda Prakoso' AS penulis, 'Budaya Media' AS penerbit, 2024, 3, 1 UNION ALL
  SELECT 'Sosiologi Kota' AS judul, 'Olivia Rahma' AS penulis, 'Sosial Press' AS penerbit, 2022, 3, 2 UNION ALL
  SELECT 'Komunikasi Massa' AS judul, 'Pandu Wijaya' AS penulis, 'Media Ilmu' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Gender dan Masyarakat' AS judul, 'Qonita Zahra' AS penulis, 'Sosial Press' AS penerbit, 2024, 2, 2 UNION ALL
  SELECT 'Sosiologi Pendidikan' AS judul, 'Reza Fahlevi' AS penulis, 'Budaya Media' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Masyarakat Digital' AS judul, 'Sinta Dewi' AS penulis, 'Sosial Press' AS penerbit, 2024, 4, 4 UNION ALL
  SELECT 'Metode Penelitian Sosial' AS judul, 'Tama Rizal' AS penulis, 'Budaya Media' AS penerbit, 2022, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Ilmu Sosial'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 6. Kesehatan dan Kedokteran
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Anatomi Manusia Dasar' AS judul, 'dr. Ulya Hasanah' AS penulis, 'Sehat Press' AS penerbit, 2022 AS tahun_terbit, 3 AS total_stok, 2 AS stok_tersedia UNION ALL
  SELECT 'Kesehatan Masyarakat' AS judul, 'dr. Vian Mahesa' AS penulis, 'Medika Ilmu' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Gizi dan Diet Sehat' AS judul, 'dr. Wahyu Setiawan' AS penulis, 'Sehat Press' AS penerbit, 2024, 5, 4 UNION ALL
  SELECT 'Epidemiologi Dasar' AS judul, 'dr. Xaviera Putri' AS penulis, 'Medika Ilmu' AS penerbit, 2021, 2, 1 UNION ALL
  SELECT 'Kesehatan Mental Remaja' AS judul, 'dr. Yoga Aditya' AS penulis, 'Sehat Press' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Farmakologi Dasar' AS judul, 'dr. Zahira Putri' AS penulis, 'Medika Ilmu' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Penyakit Tidak Menular' AS judul, 'dr. Ari Wibisono' AS penulis, 'Sehat Press' AS penerbit, 2022, 4, 2 UNION ALL
  SELECT 'Pertolongan Pertama' AS judul, 'dr. Bunga Maharani' AS penulis, 'Medika Ilmu' AS penerbit, 2024, 5, 5 UNION ALL
  SELECT 'Kesehatan Lingkungan' AS judul, 'dr. Candra Wijaya' AS penulis, 'Sehat Press' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Edukasi Kesehatan Masyarakat' AS judul, 'dr. Dina Oktaviani' AS penulis, 'Medika Ilmu' AS penerbit, 2024, 2, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Kesehatan dan Kedokteran'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 7. Agama dan Spiritualitas
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Pengantar Studi Agama' AS judul, 'Ust. Eko Mulyadi' AS penulis, 'Nur Press' AS penerbit, 2022 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Etika dan Moral dalam Agama' AS judul, 'Dr. Fani Lestari' AS penulis, 'Hikmah Media' AS penerbit, 2021, 3, 2 UNION ALL
  SELECT 'Spiritualitas Modern' AS judul, 'Gilang Pratama' AS penulis, 'Nur Press' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Sejarah Agama-agama' AS judul, 'Hana Salsabila' AS penulis, 'Hikmah Media' AS penerbit, 2024, 2, 2 UNION ALL
  SELECT 'Tafsir Tematik' AS judul, 'Irfan Hakim' AS penulis, 'Nur Press' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Fiqih Kontemporer' AS judul, 'Jihan Ayu' AS penulis, 'Hikmah Media' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Tasawuf untuk Pemula' AS judul, 'Kevin Adrian' AS penulis, 'Nur Press' AS penerbit, 2022, 3, 1 UNION ALL
  SELECT 'Dialog Antaragama' AS judul, 'Laras Wati' AS penulis, 'Hikmah Media' AS penerbit, 2023, 2, 2 UNION ALL
  SELECT 'Akhlak Mulia Sehari-hari' AS judul, 'Maulana Yusuf' AS penulis, 'Nur Press' AS penerbit, 2024, 4, 4 UNION ALL
  SELECT 'Refleksi Spiritual' AS judul, 'Nabila Zahra' AS penulis, 'Hikmah Media' AS penerbit, 2024, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Agama dan Spiritualitas'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 8. Bahasa dan Sastra
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Tata Bahasa Indonesia' AS judul, 'Oka Prasetya' AS penulis, 'Sastra Press' AS penerbit, 2022 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Sastra Indonesia Modern' AS judul, 'Puspita Sari' AS penulis, 'Bahasa Media' AS penerbit, 2021, 3, 2 UNION ALL
  SELECT 'Linguistik Umum' AS judul, 'Rendra Kurnia' AS penulis, 'Sastra Press' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Penulisan Kreatif' AS judul, 'Siska Amelia' AS penulis, 'Bahasa Media' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Sastra Bandingan' AS judul, 'Ahmad Fauzi' AS penulis, 'Sastra Press' AS penerbit, 2022, 2, 1 UNION ALL
  SELECT 'Bahasa Inggris Akademik' AS judul, 'Sari Indah' AS penulis, 'Bahasa Media' AS penerbit, 2024, 5, 4 UNION ALL
  SELECT 'Apresiasi Puisi' AS judul, 'Tono Saputra' AS penulis, 'Sastra Press' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Analisis Wacana' AS judul, 'Hana Salsabila' AS penulis, 'Bahasa Media' AS penerbit, 2023, 2, 1 UNION ALL
  SELECT 'Sastra Lisan Nusantara' AS judul, 'Raka Pradipta' AS penulis, 'Sastra Press' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Penerjemahan Dasar' AS judul, 'Nur Aini' AS penulis, 'Bahasa Media' AS penerbit, 2024, 3, 3
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Bahasa dan Sastra'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 9. Karya Ilmiah dan Referensi
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Metodologi Penelitian' AS judul, 'Prof. Omar Abdullah' AS penulis, 'Referensi Press' AS penerbit, 2023 AS tahun_terbit, 5 AS total_stok, 4 AS stok_tersedia UNION ALL
  SELECT 'Panduan Menulis Karya Ilmiah' AS judul, 'Putra Mahendra' AS penulis, 'Ilmiah Media' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Statistika untuk Penelitian' AS judul, 'Qori Hanifah' AS penulis, 'Referensi Press' AS penerbit, 2022, 3, 2 UNION ALL
  SELECT 'Teknik Sitasi dan Referensi' AS judul, 'Raka Pradipta' AS penulis, 'Ilmiah Media' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Penelitian Kuantitatif' AS judul, 'Sari Indah' AS penulis, 'Referensi Press' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Penelitian Kualitatif' AS judul, 'Tegar Wibowo' AS penulis, 'Ilmiah Media' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Etika Penelitian' AS judul, 'Ulfa Nazwa' AS penulis, 'Referensi Press' AS penerbit, 2022, 2, 1 UNION ALL
  SELECT 'Proposal Penelitian Praktis' AS judul, 'Vino Pratama' AS penulis, 'Ilmiah Media' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Analisis Data Penelitian' AS judul, 'Winda Lestari' AS penulis, 'Referensi Press' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Publikasi Jurnal Ilmiah' AS judul, 'Yani Kurniasih' AS penulis, 'Ilmiah Media' AS penerbit, 2024, 2, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Karya Ilmiah dan Referensi'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 10. Sejarah dan Kebudayaan
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Sejarah Indonesia Modern' AS judul, 'Zaki Mubarak' AS penulis, 'Sejarah Press' AS penerbit, 2022 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Kebudayaan Nusantara' AS judul, 'Alya Nurfadilla' AS penulis, 'Budaya Ilmu' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Sejarah Dunia Klasik' AS judul, 'Bima Sakti' AS penulis, 'Sejarah Press' AS penerbit, 2021, 3, 1 UNION ALL
  SELECT 'Arkeologi Indonesia' AS judul, 'Cindy Aulia' AS penulis, 'Budaya Ilmu' AS penerbit, 2024, 2, 2 UNION ALL
  SELECT 'Sejarah Peradaban Islam' AS judul, 'Dimas Arya' AS penulis, 'Sejarah Press' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Warisan Budaya Takbenda' AS judul, 'Elsa Putri' AS penulis, 'Budaya Ilmu' AS penerbit, 2024, 3, 2 UNION ALL
  SELECT 'Kolonialisme di Asia' AS judul, 'Fadil Rahman' AS penulis, 'Sejarah Press' AS penerbit, 2022, 3, 1 UNION ALL
  SELECT 'Tradisi Lokal Indonesia' AS judul, 'Gina Melati' AS penulis, 'Budaya Ilmu' AS penerbit, 2023, 4, 3 UNION ALL
  SELECT 'Sejarah Pemikiran Dunia' AS judul, 'Hadi Kurniawan' AS penulis, 'Sejarah Press' AS penerbit, 2024, 2, 1 UNION ALL
  SELECT 'Museum dan Pelestarian Budaya' AS judul, 'Ika Nurhaliza' AS penulis, 'Budaya Ilmu' AS penerbit, 2024, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Sejarah dan Kebudayaan'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);

-- 11. Seni dan Desain
INSERT INTO tabel_buku (judul, penulis, penerbit, tahun_terbit, id_kategori, total_stok, stok_tersedia)
SELECT v.judul, v.penulis, v.penerbit, v.tahun_terbit, k.id_kategori, v.total_stok, v.stok_tersedia
FROM (
  SELECT 'Dasar Desain Grafis' AS judul, 'Jefri Nicol' AS penulis, 'Seni Press' AS penerbit, 2023 AS tahun_terbit, 4 AS total_stok, 3 AS stok_tersedia UNION ALL
  SELECT 'Sejarah Seni Rupa' AS judul, 'Kania Salsabila' AS penulis, 'Desain Media' AS penerbit, 2022, 3, 2 UNION ALL
  SELECT 'Fotografi untuk Pemula' AS judul, 'Lutfi Hakim' AS penulis, 'Seni Press' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Tipografi Modern' AS judul, 'Maya Anggraini' AS penulis, 'Desain Media' AS penerbit, 2023, 3, 1 UNION ALL
  SELECT 'Desain UI/UX' AS judul, 'Nanda Prakoso' AS penulis, 'Seni Press' AS penerbit, 2024, 5, 4 UNION ALL
  SELECT 'Seni Lukis Kontemporer' AS judul, 'Olivia Rahma' AS penulis, 'Desain Media' AS penerbit, 2022, 2, 1 UNION ALL
  SELECT 'Ilustrasi Digital' AS judul, 'Pandu Wijaya' AS penulis, 'Seni Press' AS penerbit, 2024, 4, 3 UNION ALL
  SELECT 'Desain Produk' AS judul, 'Qonita Zahra' AS penulis, 'Desain Media' AS penerbit, 2023, 3, 2 UNION ALL
  SELECT 'Seni Musik Tradisional' AS judul, 'Reza Fahlevi' AS penulis, 'Seni Press' AS penerbit, 2021, 2, 1 UNION ALL
  SELECT 'Creative Brief dan Branding' AS judul, 'Sinta Dewi' AS penulis, 'Desain Media' AS penerbit, 2024, 3, 2
) v
JOIN tabel_kategori k ON k.nama_kategori = 'Seni dan Desain'
WHERE NOT EXISTS (SELECT 1 FROM tabel_buku b WHERE b.judul = v.judul);