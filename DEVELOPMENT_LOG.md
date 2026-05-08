# Development Log - Backend (Laravel)

## 1. Requirement Log
| Tanggal | Permintaan | Status |
| :--- | :--- | :--- |
| 2026-05-06 | Pemisahan Controller API khusus untuk Mobile (Pilot: Dashboard & My Learning) | Selesai |
| 2026-05-06 | API Mobile: Auth & Profile Management | Selesai |
| 2026-05-06 | API Mobile: Enrollment & Class Code | Selesai |
| 2026-05-06 | API Mobile: Learning Content (Lesson, Quiz, Submission) | Selesai |
| 2026-05-08 | Penambahan fitur Simulasi Pembayaran pada Checkout API | Selesai |
| 2026-05-08 | Sinkronisasi API: Penyelarasan Web & Mobile API untuk data Kuis/Assignment | Selesai |
| 2026-05-08 | Stabilisasi Kuis Relasional (v2) & Integrasi Progres di Dashboard | Selesai |
| 2026-05-08 | Perbaikan Checkout 500 Error & Optimalisasi API Cart | Selesai |
| 2026-05-08 | Peningkatan Limit Upload Submission (10MB -> 50MB) | Selesai |

## 2. Implementation Plans

### [2026-05-06] Pemisahan API Mobile & Web
**Tujuan**: Membuat endpoint yang terisolasi khusus untuk kebutuhan aplikasi mobile.
**Pendekatan**:
- Namespace baru: `App\Http\Controllers\Api\V1\Mobile`.
- Endpoint akan dioptimalkan untuk kebutuhan mobile (minimal data, flat structure).
- Route baru di `api.php` dengan prefix `mobile`.

### [2026-05-08] Phase 2: Instructor Course Builder
**Tujuan**: Membangun alur kerja instruktur yang utuh untuk pengelolaan kursus berbasis relasional.
**Pendekatan**:
- Fokus pada Core Flow: Kursus -> Modul -> Materi -> Kuis v2 -> Tugas Akhir.
- Implementasi Quiz Builder UI khusus untuk arsitektur relasional baru.

## 3. Task List
- [x] Inisialisasi DEVELOPMENT_LOG.md
- [x] **Quiz Stabilization & Enrollment Integration (2026-05-08)**
    - [x] Perbaikan `ReferenceError: remoteQuiz` pada navigasi kuis
    - [x] Migrasi: Penambahan kolom `completed_quizzes` pada tabel `enrollments`
    - [x] Update `QuizController@submit` (Mobile) untuk tracking progres database
    - [x] Sinkronisasi Dashboard: Centang hijau untuk kuis relasional di syllabus
- [x] **Checkout & UX Fixes (2026-05-08)**
    - [x] Perbaikan 500 error di `CheckoutController` (Unique constraint handle)
    - [x] Idempotent Cart API (200 OK untuk duplikasi) untuk membersihkan console log
    - [x] Update label tombol checkout kursus gratis ("Ambil Kursus")
    - [x] Peningkatan limit upload file submission menjadi 50MB
- [ ] **Instructor Dashboard - Course Builder (Phase 2)**
    - [ ] **Curriculum Management**
        - [ ] Integrasi API untuk CRUD Section & Lesson (Instructor)
        - [ ] Fungsionalitas Kurikulum di `CourseManagePage.tsx` (Real API)
    - [ ] **Relational Quiz Builder (v2)**
        - [ ] Membuat `Instructor/QuizController` untuk kuis v2
        - [ ] Membangun UI Quiz Builder (Manager Pertanyaan & Opsi)
    - [ ] **Final Assignment Editor**
        - [ ] Membangun UI untuk pengaturan Tugas Akhir
        - [ ] Integrasi dengan AI Grading settings
