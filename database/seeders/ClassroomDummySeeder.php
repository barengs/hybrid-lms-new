<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Batch;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\Lesson;
use App\Models\Section;
use App\Models\Submission;
use App\Models\User;
use App\Models\Profile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ClassroomDummySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Instructor
        $instructor = User::firstOrCreate(
            ['email' => 'instructor@dummy.com'],
            [
                'name' => 'Budi Instruktur',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        $instructor->assignRole('instructor');
        Profile::updateOrCreate(['user_id' => $instructor->id], ['avatar' => 'https://ui-avatars.com/api/?name=Budi+Instruktur&background=random']);


        // 2. Create Students
        $students = [];
        for ($i = 1; $i <= 5; $i++) {
            $student = User::firstOrCreate(
                ['email' => "student{$i}@dummy.com"],
                [
                    'name' => "Siswa {$i}",
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            $student->assignRole('student');
            Profile::updateOrCreate(['user_id' => $student->id], ['avatar' => "https://ui-avatars.com/api/?name=Siswa+{$i}&background=random"]);
            $students[] = $student;
        }

        // 3. Create Courses
        $rand = time() . '-' . rand(1000,9999);
        
        $courseMobileId = DB::table('courses')->insertGetId([
            'instructor_id' => $instructor->id,
            'title' => 'Mastering React Native ' . $rand,
            'slug' => 'dummy-course-rn-' . $rand,
            'description' => 'Complete guide to mobile app development.',
            'thumbnail' => '/assets/images/thumbnail mobile.jpeg',
            'level' => 'intermediate',
            'price' => 0,
            'type' => 'structured', 
            'status' => 'published',
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $section1Id = DB::table('sections')->insertGetId([
            'course_id' => $courseMobileId, 
            'title' => 'Introduction to RN', 
            'sort_order' => 1,
            'created_at' => now(), 'updated_at' => now()
        ]);
        
        DB::table('lessons')->insert([
            ['section_id' => $section1Id, 'title' => 'Setup Environment', 'type' => 'video', 'duration' => 600, 'sort_order' => 1, 'is_published' => true, 'created_at' => now(), 'updated_at' => now()],
            ['section_id' => $section1Id, 'title' => 'Hello World', 'type' => 'video', 'duration' => 900, 'sort_order' => 2, 'is_published' => true, 'created_at' => now(), 'updated_at' => now()]
        ]);
        
        $courseWebId = DB::table('courses')->insertGetId([
            'instructor_id' => $instructor->id,
            'title' => 'Full Stack Web Dev ' . $rand,
            'slug' => 'dummy-course-web-' . $rand,
            'description' => 'Build modern web apps.',
            'thumbnail' => '/assets/images/thumbnail-web-app.webp',
            'level' => 'advanced',
            'price' => 0,
            'type' => 'structured',
            'status' => 'published',
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 4. Create Classroom Batches
        $batchId = DB::table('batches')->insertGetId([
            'instructor_id' => $instructor->id,
            'name' => 'Kelas React Native Pagi ' . $rand,
            'slug' => 'dummy-batch-rn-' . $rand,
            'description' => 'Kelas intensif React Native untuk pemula.',
            'type' => 'classroom',
            'class_code' => strtoupper(Str::random(6)), 
            'status' => 'open',
            'start_date' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        
        DB::table('batch_course')->insert([
            'batch_id' => $batchId,
            'course_id' => $courseMobileId,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 5. Enroll Students
        foreach ($students as $index => $student) {
            $enrollmentId = DB::table('enrollments')->insertGetId([
                'user_id' => $student->id,
                'course_id' => $courseMobileId,
                'batch_id' => $batchId,
                'enrolled_at' => now()->subDays(rand(1, 10)),
                'is_completed' => false,
                'progress_percentage' => rand(20, 90),
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $score = rand(40, 95);
            $gradeLetter = $score >= 80 ? 'A' : ($score >= 70 ? 'B' : ($score >= 50 ? 'C' : 'D'));

            DB::table('grades')->insert([
                'user_id' => $student->id,
                'batch_id' => $batchId,
                'overall_score' => $score,
                'letter_grade' => $gradeLetter,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        // 6. Create Assignment & Submissions
        $assignmentId = DB::table('assignments')->insertGetId([
            'batch_id' => $batchId,
            'title' => 'Final Project: Clone Gojek UI',
            'description' => 'Create a simple clone of the Gojek Home screen.',
            'max_points' => 100,
            'type' => 'project',
            'is_published' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        foreach ($students as $index => $student) {
            $status = rand(0, 1) ? 'submitted' : 'graded';
            if ($index > 3) $status = 'pending';
            
            if ($status !== 'pending') {
                 DB::table('submissions')->insert([
                    'assignment_id' => $assignmentId,
                    'user_id' => $student->id,
                    'content' => 'https://github.com/student/repo',
                    'submitted_at' => now(),
                    'status' => $status == 'graded' ? 'graded' : 'submitted',
                    'points_awarded' => $status == 'graded' ? rand(70, 100) : null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
