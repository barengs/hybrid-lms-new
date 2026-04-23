<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\User;
use App\Models\Section;
use App\Models\Lesson;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ClassroomSimulationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Get the Instructor (Budi Al Santoso)
        $instructor = User::where('email', 'instructor@hybridlms.com')->first();
        if (!$instructor) {
            $this->command->error('Instructor not found. Please run DatabaseSeeder first.');
            return;
        }

        // 2. Get the Student (Siswa Simulasi)
        $student = User::where('email', 'student@hybridlms.com')->first();
        if (!$student) {
            $this->command->error('Student not found. Please run DatabaseSeeder first.');
            return;
        }

        // 3. Create the Course (Mobile Programming With Flutter)
        $course = Course::updateOrCreate(
            ['slug' => 'mobile-programming-with-flutter'],
            [
                'instructor_id' => $instructor->id,
                'title' => 'Mobile Programming With Flutter',
                'description' => 'Membangun aplikasi mobile cross-platform modern dengan Flutter dan Dart.',
                'price' => 0, // Free for classroom
                'level' => 'intermediate',
                'status' => 'published',
                'category_id' => 1,
                'thumbnail' => 'https://api.placeholder.com/640/360',
            ]
        );

        // Add a basic section and lesson to this course
        $section = Section::updateOrCreate(
            ['course_id' => $course->id, 'title' => 'Pengenalan Flutter'],
            ['sort_order' => 1]
        );

        Lesson::updateOrCreate(
            ['section_id' => $section->id, 'title' => 'Instalasi & Setup'],
            [
                'content' => 'Langkah-langkah instalasi Flutter SDK di Windows/Mac.',
                'type' => 'text',
                'duration' => 15,
                'sort_order' => 1,
            ]
        );

        // 4. Create the Classroom Batch (Mobile Programming)
        $batch = Batch::updateOrCreate(
            ['slug' => 'mobile-programming-class-a'],
            [
                'instructor_id' => $instructor->id,
                'name' => 'Mobile Programming - Class A',
                'class_code' => 'FLUTTER2024',
                'description' => 'Kelas tatap muka untuk mata kuliah Mobile Programming menggunakan framework Flutter.',
                'type' => 'classroom',
                'start_date' => Carbon::now()->subDays(2),
                'end_date' => Carbon::now()->addMonths(4),
                'enrollment_start_date' => Carbon::now()->subDays(10),
                'enrollment_end_date' => Carbon::now()->addDays(5),
                'max_students' => 40,
                'current_students' => 1,
                'status' => 'in_progress',
                'is_public' => true,
                'auto_approve' => true,
            ]
        );

        // 5. Link Batch to Course
        DB::table('batch_course')->updateOrInsert(
            ['batch_id' => $batch->id, 'course_id' => $course->id],
            ['order' => 1, 'is_required' => true]
        );

        // 6. Enroll the Student to this Batch
        Enrollment::updateOrCreate(
            ['user_id' => $student->id, 'batch_id' => $batch->id, 'course_id' => $course->id],
            [
                'enrolled_at' => Carbon::now()->subDays(1),
                'progress_percentage' => 10,
                'is_completed' => false,
            ]
        );

        $this->command->info('Flutter Mobile Programming Classroom Simulation Data seeded successfully!');
    }
}
