# Development Log - Backend (Laravel)

## 1. Requirement Log
| Tanggal | Permintaan | Status |
| :--- | :--- | :--- |
| 2026-05-06 | Pemisahan Controller API khusus untuk Mobile (Pilot: Dashboard & My Learning) | Selesai |
| 2026-05-06 | API Mobile: Auth & Profile Management | Selesai |
| 2026-05-06 | API Mobile: Enrollment & Class Code | Selesai |
| 2026-05-06 | API Mobile: Learning Content (Lesson, Quiz, Submission) | Selesai |
| 2026-05-08 | Penambahan fitur Simulasi Pembayaran pada Checkout API | Selesai |
| 2026-05-08 | Perbaikan Mobile API: Penambahan `assignment_id` pada detail Lesson | Selesai |

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
    - [x] Implementasi Join Class via Class Code di `Mobile/Student/BatchController.php`
- [x] **Checkout & Payment Updates (2026-05-08)**
    - [x] Update `CheckoutController@processCheckout` untuk mendukung parameter `payment_simulation`
    - [x] Penambahan logic aktivasi enrollment instan dan increment `total_enrollments` saat pembayaran sukses/disimulasikan
    - [x] Update `CourseController@showLesson` untuk menyertakan `assignment_id`
