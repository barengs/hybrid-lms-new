# Molang - Hybrid LMS System Architecture & Work Plan

Dokumen ini berisi kerangka berpikir, deskripsi sistem, dan rencana kerja (task list) dari pengembangan Molang (Hybrid LMS), sebagai panduan bersama agar pengembangan selalu selaras dengan konsep dasar.

## 1. Kerangka Berpikir: Sistem Hybrid
Sistem LMS ini menggabungkan dua metode belajar utama (Hybrid):
1. **Individual / Mandiri (Udemy Base)**
   - Siswa dapat membeli atau mengikuti (enroll) kursus secara mandiri (baik gratis maupun berbayar).
2. **Terpandu / Kelas Terstruktur (Google Classroom Base)**
   - Siswa bergabung ke dalam sebuah "Kelas" / "Batch".
   - Jika sebuah kursus dimasukkan ke dalam kelas tersebut, siswa otomatis mendapatkan akses ke kursus tanpa perlu membayar / enroll ulang (Bypass Paywall).

## 2. Deskripsi Modul Utama

### A. Pengelompokan "Kelas" (Model: `Batch`)
Kelas terbagi menjadi dua kategori:
- **Bootcamp (`type: structured`)**: Dibuat oleh Admin. Terbuka untuk masyarakat umum.
- **Classroom (`type: classroom`)**: Dibuat oleh Instruktur. Bersifat privat dan mewajibkan siswa memasukkan **Class Code** untuk bergabung.

### B. Kursus dan Materi (Model: `Course`)
- Kursus bersifat modular dan bisa berdiri sendiri atau ditempelkan ke dalam kelas (Batch).
- Memiliki fitur *Paywall* untuk pendaftaran mandiri.

### C. Kepemilikan & Hak Akses (Enrollment)
- **Enrollment Kelas**: Siswa yang mendaftar ke kelas akan mendapatkan record `Enrollment` dengan `batch_id` yang terisi, namun `course_id = null`.
- **Enrollment Kursus (Implicit to Explicit)**: Untuk memastikan *progress_percentage* dapat dilacak secara akurat per kursus, saat siswa mengakses sebuah kursus via kelas untuk pertama kalinya, sistem akan men-generate record `Enrollment` khusus untuk kursus tersebut (`batch_id` dan `course_id` terisi).

## 3. Rencana Kerja (Work Plan) & Task List

Rencana teknis di bawah ini berfokus pada implementasi "Bypass Paywall & Implicit Course Access":

- [ ] **Task 1: Update API Katalog Kursus (Web/Mobile)**
  - File: `app/Http/Controllers/Api/V1/CourseCatalogController.php`
  - Aksi: Modifikasi `show()` untuk mengecek apakah kursus ter-enroll via kelas (Batch). Jika ya, set `is_enrolled = true` agar tombol di UI berubah menjadi "Lanjutkan Belajar".

- [ ] **Task 2: Update API Pembelajaran Siswa (Learning Controller)**
  - File: `app/Http/Controllers/Api/V1/Student/LearningController.php`
  - Aksi: Tambahkan fungsi helper `getOrImplicitlyCreateEnrollment`.
  - Aksi: Validasi saat siswa membuka materi pelajaran. Jika mereka berhak mengaksesnya via Kelas, *generate* Enrollment secara otomatis (jika belum ada) agar progres belajar dapat dicatat tanpa bentrok.

- [ ] **Task 3: Pengujian Manual**
  - Uji skenario pendaftaran via Classroom Code.
  - Uji akses materi kursus di dalam kelas (Bypass Paywall).
  - Uji penambahan persentase progres belajar di kursus terkait.
  - Uji kepemilikan kursus secara individual (Non-Kelas) untuk memastikan Paywall masih aktif.

*Dokumen ini diperbarui terakhir pada: Juni 2026*
