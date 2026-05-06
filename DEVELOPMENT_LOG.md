# Development Log - Backend (Laravel)

## 1. Requirement Log
| Tanggal | Permintaan | Status |
| :--- | :--- | :--- |
| 2026-05-06 | Pemisahan Controller API khusus untuk Mobile (Pilot: Dashboard & My Learning) | Selesai |
| 2026-05-06 | API Mobile: Auth & Profile Management | Selesai |
| 2026-05-06 | API Mobile: Enrollment & Class Code | Menunggu |
| 2026-05-06 | API Mobile: Learning Content (Lesson, Quiz, Submission) | Menunggu |

## 2. Implementation Plans

### [2026-05-06] Pemisahan API Mobile & Web
**Tujuan**: Membuat endpoint yang terisolasi khusus untuk kebutuhan aplikasi mobile.
**Pendekatan**:
- Namespace baru: `App\Http\Controllers\Api\V1\Mobile`.
- Endpoint akan dioptimalkan untuk kebutuhan mobile (minimal data, flat structure).
- Route baru di `api.php` dengan prefix `mobile`.

## 3. Task List
- [x] Inisialisasi DEVELOPMENT_LOG.md
- [x] Membuat folder `app/Http/Controllers/Api/V1/Mobile`
- [x] Membuat `Mobile/Student/DashboardController.php` (Salinan dari original dengan optimasi)
- [x] Mendaftarkan route mobile di `routes/api.php`
- [ ] **Auth & Profile (Mobile)**
    - [ ] Membuat `Mobile/Auth/AuthController.php`
    - [ ] Membuat `Mobile/Student/ProfileController.php`
- [ ] **Learning & Enrollment (Mobile)**
    - [ ] Membuat `Mobile/Student/CourseController.php` (Detail, Syllabus, Lessons)
    - [ ] Membuat `Mobile/Student/AssignmentController.php` (Quiz & Submission)
    - [ ] Implementasi Join Class via Class Code di `Mobile/Student/BatchController.php`
