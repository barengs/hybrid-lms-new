<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Batch;
use App\Models\Category;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CourseAISimulationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Ensure Instance for Instructor and Student
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@hybridlms.com'],
            [
                'name' => 'Budi AI Santoso',
                'password' => Hash::make('password'),
            ]
        );
        $instructor->assignRole('instructor');

        $student = User::firstOrCreate(
            ['email' => 'student@hybridlms.com'],
            [
                'name' => 'Siswa Simulasi',
                'password' => Hash::make('password'),
            ]
        );
        $student->assignRole('student');

        // 2. Create Category
        $category = Category::firstOrCreate(
            ['slug' => 'financial-literacy'],
            [
                'name' => 'Financial Literacy',
                'description' => 'Mastering your personal and business finances.',
                'icon' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400',
                'is_active' => true,
            ]
        );

        // 3. Create Course
        $course = Course::updateOrCreate(
            ['slug' => 'mastering-financial-intelligence'],
            [
                'instructor_id' => $instructor->id,
                'category_id' => $category->id,
                'title' => 'Mastering Financial Intelligence',
                'description' => 'Kelas ini dirancang untuk membekali Anda dengan pengetahuan finansial yang mendalam, mulai dari pengelolaan aset hingga strategi investasi modern.',
                'thumbnail' => 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800',
                'price' => 250000,
                'type' => 'self_paced',
                'level' => 'intermediate',
                'status' => 'published',
                'published_at' => now(),
            ]
        );

        // 3.5 Create Batch for the Course
        $batch = Batch::updateOrCreate(
            ['slug' => 'simulation-batch-1'],
            [
                'instructor_id' => $instructor->id,
                'name' => 'Simulation Batch 1',
                'class_code' => Batch::generateClassCode(),
                'description' => 'Batch simulasi untuk pengujian AI.',
                'type' => 'structured',
                'status' => 'open',
                'start_date' => now(),
                'end_date' => now()->addMonths(3),
                'enrollment_start_date' => now()->subDay(),
                'enrollment_end_date' => now()->addMonth(),
            ]
        );

        // Attach course to batch (Using sync to avoid duplicate pivot records)
        $batch->courses()->syncWithoutDetaching([
            $course->id => ['order' => 1, 'is_required' => true]
        ]);

        // 4. Modul 1: Pengenalan
        $section1 = Section::create([
            'course_id' => $course->id,
            'title' => 'Modul Pengenalan Belajar',
            'sort_order' => 1,
        ]);

        Lesson::create([
            'section_id' => $section1->id,
            'title' => 'Prasyarat Kemampuan',
            'type' => 'text',
            'content' => 'Tidak ada persyaratan kemampuan khusus untuk mengikuti materi ini. Yang terpenting adalah Anda harus bisa belajar mandiri, berkomitman, dan benar-benar punya rasa ingin tahu.',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        Lesson::create([
            'section_id' => $section1->id,
            'title' => 'Pengenalan Tools Keuangan',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_provider' => 'youtube',
            'duration' => 300,
            'sort_order' => 2,
            'is_published' => true,
        ]);

        // 5. Modul 2: Materi Inti & Quiz
        $section2 = Section::create([
            'course_id' => $course->id,
            'title' => 'Modul Pembelajaran Utama',
            'sort_order' => 2,
        ]);

        Lesson::create([
            'section_id' => $section2->id,
            'title' => 'Decoding Your Financial Future',
            'type' => 'video',
            'video_url' => 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            'video_provider' => 'youtube',
            'duration' => 600,
            'sort_order' => 1,
            'is_published' => true,
        ]);

        // Mock Quiz Data stored as JSON in content
        $quizData = [
            'id' => 'quiz-' . Str::random(8),
            'title' => 'Ujian Financial Literacy',
            'description' => 'Uji pemahaman Anda tentang konsep dasar keuangan dan investasi.',
            'timeLimit' => 10,
            'passingScore' => 70,
            'questions' => [
                [
                    'id' => 'q1',
                    'text' => 'Apa yang dimaksud dengan aset lancar?',
                    'options' => [
                        ['id' => 'a', 'text' => 'Aset yang sulit dicairkan'],
                        ['id' => 'b', 'text' => 'Aset yang dapat dicairkan dalam waktu kurang dari satu tahun'],
                        ['id' => 'c', 'text' => 'Hutang jangka panjang'],
                        ['id' => 'd', 'text' => 'Aset tetap perusahaan'],
                    ],
                    'correctOptionId' => 'b',
                ],
                [
                    'id' => 'q2',
                    'text' => 'Manakah yang termasuk investasi dengan risiko rendah?',
                    'options' => [
                        ['id' => 'a', 'text' => 'Saham gorengan'],
                        ['id' => 'b', 'text' => 'Trading Crypto'],
                        ['id' => 'c', 'text' => 'Deposito Bank / Reksa Dana Pasar Uang'],
                        ['id' => 'd', 'text' => 'Bisnis MLM untung cepat'],
                    ],
                    'correctOptionId' => 'c',
                ]
            ]
        ];

        Lesson::create([
            'section_id' => $section2->id,
            'title' => 'Ujian Financial Literacy',
            'type' => 'quiz',
            'content' => json_encode($quizData),
            'sort_order' => 2,
            'is_published' => true,
        ]);

        // 6. Modul 3: Evaluasi & AI Assignment
        $section3 = Section::create([
            'course_id' => $course->id,
            'title' => 'Tahap Evaluasi Akhir',
            'sort_order' => 3,
        ]);

        $lessonAssignment = Lesson::create([
            'section_id' => $section3->id,
            'title' => 'Proyek Perencanaan Keuangan Pribadi',
            'type' => 'assignment',
            'description' => 'Pada tahap ini Anda diminta untuk membuat simulasi perencanaan keuangan selama 12 bulan ke depan.',
            'sort_order' => 1,
            'is_published' => true,
        ]);

        // Create Assignment record linked to lesson AND batch
        Assignment::create([
            'batch_id' => $batch->id,
            'lesson_id' => $lessonAssignment->id,
            'title' => 'Submisi Proyek Perencanaan Keuangan',
            'description' => 'Analisis dan buatlah rencana alokasi aset berdasarkan pendapatan bulanan sebesar 10 Juta Rupiah.',
            'instructions' => "1. Buatlah esai/analisis atau unggah file perhitungan.\n2. Alokasikan untuk Dana Darurat, Investasi, dan Kebutuhan Pokok.\n3. Berikan alasan pemilihan instrumen investasi Anda.",
            'type' => 'assignment',
            'due_date' => Carbon::now()->addDays(7),
            'max_points' => 100,
            'is_published' => true,
            'is_required' => true,
        ]);

        // 7. Enrollment for Test Student (Self-paced/Direct for Simulation)
        Enrollment::updateOrCreate(
            [
                'user_id' => $student->id,
                'course_id' => $course->id,
            ],
            [
                'batch_id' => null, // Detach from batch for easy self-paced testing link
                'enrolled_at' => now(),
                'is_completed' => false,
                'progress_percentage' => 0,
                'completed_lessons' => [],
            ]
        );

        $this->command->info("Simulasi Kursus AI berhasil dibuat!");
        $this->command->info("Siswa: student@hybridlms.com (Pass: password)");
        $this->command->info("Instruktur: instructor@hybridlms.com (Pass: password)");
    }
}
