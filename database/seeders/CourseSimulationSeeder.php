<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use App\Models\Batch;
use App\Models\Assignment;
use App\Models\Enrollment;
use App\Models\Submission;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class CourseSimulationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 0. Create/Update Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@molang.com'],
            [
                'name' => 'Super Admin',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }
        $admin->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        // 1. Create/Update Instructors
        $instructor1 = User::updateOrCreate(
            ['email' => 'instructor@molang.com'],
            [
                'name' => 'Syed Hasnain',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$instructor1->hasRole('instructor')) {
            $instructor1->assignRole('instructor');
        }
        $instructor1->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        $instructor2 = User::updateOrCreate(
            ['email' => 'jane@molang.com'],
            [
                'name' => 'Jane Doe',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$instructor2->hasRole('instructor')) {
            $instructor2->assignRole('instructor');
        }
        $instructor2->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        // 2. Create Categories
        $categories = [
            'Development' => 'Software development and programming',
            'Design' => 'Graphics and UI/UX design',
            'Business' => 'Business and marketing strategy',
            'Marketing' => 'Digital marketing and SEO',
        ];

        $categoryModels = [];
        foreach ($categories as $name => $desc) {
            $categoryModels[] = Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => $desc]
            );
        }

        // 3. Create Self-Paced Courses
        $coursesData = [
            [
                'title' => 'Modern Web Development with React',
                'price' => 100.00,
                'discount_price' => 75.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor1->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'UI/UX Design Masterclass',
                'price' => 80.00,
                'category_id' => $categoryModels[1]->id,
                'instructor_id' => $instructor1->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Intro to Programming (Free)',
                'price' => 0.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor1->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Data Science with Python',
                'price' => 150.00,
                'discount_price' => 100.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor1->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Machine Learning Fundamentals',
                'price' => 120.00,
                'discount_price' => 90.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor1->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop',
            ],
        ];

        // Create Self-paced Batch (Unified Learning Path for all public courses)
        $selfPacedBatch = Batch::updateOrCreate(
            ['slug' => 'self-paced-learning'],
            [
                'instructor_id' => $instructor1->id,
                'name' => 'Self-Paced Learning Batch',
                'description' => 'Batch untuk kursus mandiri tanpa jadwal tetap.',
                'type' => 'structured',
                'status' => 'open',
                'start_date' => now()->subMonths(6),
                'is_public' => true,
            ]
        );

        $createdCourses = [];
        foreach ($coursesData as $cData) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($cData['title'])],
                array_merge($cData, [
                    'subtitle' => 'Learn from scratch with expert guidance.',
                    'description' => 'Comprehensive course designed to take you from beginner to advanced level.',
                    'status' => 'published',
                    'type' => 'self_paced',
                    'published_at' => now(),
                ])
            );
            $createdCourses[] = $course;

            $selfPacedBatch->courses()->syncWithoutDetaching([
                $course->id => ['order' => count($createdCourses), 'is_required' => false]
            ]);
            
            $this->seedCourseContent($course, $selfPacedBatch->id);
        }

        // 4. Create Structured BATCH (Traditional Learning Session)
        $batch = Batch::updateOrCreate(
            ['slug' => Str::slug('Mobile Programming with Flutter')],
            [
                'instructor_id' => $instructor1->id,
                'name' => 'Batch Flutter September 2024',
                'class_code' => 'FLT101',
                'description' => 'Sesi belajar intensif Mobile Programming dengan Flutter dalam rentang waktu tertentu.',
                'type' => 'structured',
                'status' => 'in_progress',
                'start_date' => now()->subDays(10),
                'end_date' => now()->addDays(20),
                'enrollment_start_date' => now()->subDays(20),
                'enrollment_end_date' => now()->subDays(10),
                'max_students' => 50,
                'current_students' => 20,
                'is_public' => true,
            ]
        );

        $classroomCourses = [
            'Dart Language Basics',
            'Flutter UI Components',
        ];

        foreach ($classroomCourses as $index => $title) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'instructor_id' => $instructor1->id,
                    'category_id' => $categoryModels[0]->id,
                    'title' => $title,
                    'status' => 'published',
                    'type' => 'structured',
                    'published_at' => now(),
                    'thumbnail' => 'https://images.unsplash.com/photo-1617042375876-a13e36734a04?q=80&w=800&auto=format&fit=crop',
                ]
            );
            $createdCourses[] = $course;

            $batch->courses()->syncWithoutDetaching([
                $course->id => ['order' => $index + 1, 'is_required' => true]
            ]);
            
            $this->seedCourseContent($course, $batch->id);
        }

        // 5. Create KELAS (Google Classroom style)
        $classroom = Batch::updateOrCreate(
            ['slug' => Str::slug('Pemrograman Mobile Classroom')],
            [
                'instructor_id' => $instructor2->id,
                'name' => 'Kelas Pemrograman (Mobile Programming)',
                'class_code' => 'PEM-MOB-01',
                'description' => 'Ruang belajar kolaboratif ala Google Classroom untuk materi Mobile Programming.',
                'type' => 'classroom',
                'status' => 'open',
                'start_date' => now(),
                'end_date' => now()->addYear(),
                'is_public' => true,
                'max_students' => 100,
            ]
        );

        // Topics for Classroom
        $topicFundamental = $classroom->batchTopics()->updateOrCreate(
            ['title' => 'Dasar & Fundamental'],
            ['sort_order' => 1]
        );

        $topicIntermediate = $classroom->batchTopics()->updateOrCreate(
            ['title' => 'Deep Dive & Q&A'],
            ['sort_order' => 2]
        );

        // Associate main course
        $classroom->courses()->syncWithoutDetaching([
            $createdCourses[0]->id => ['order' => 1, 'is_required' => true],
        ]);

        // Seed Sessions for Classroom
        $sessions = [
            [
                'title' => 'Pengenalan React & Dasar Komponen',
                'type' => 'material',
                'description' => 'Sesi ini membahas dasar-dasar React, cara membuat komponen, dan memahami props.',
                'session_date' => now()->subDays(5)->setTime(13, 0),
                'duration' => '2 Jam',
                'status' => 'completed',
                'materials' => [
                    ['type' => 'file', 'title' => 'Slide Dasar React.pdf', 'url' => 'https://example.com/slide.pdf'],
                    ['type' => 'youtube', 'title' => 'Video Review Komponen', 'url' => 'dQw4w9WgXcQ'],
                ],
            ],
            [
                'title' => 'Deep Dive into React Hooks',
                'type' => 'material',
                'description' => 'Membahas useEffect, useMemo, dan custom hooks secara mendalam.',
                'session_date' => now()->subDays(1)->setTime(10, 0),
                'duration' => '2.5 Jam',
                'status' => 'completed',
                'recording_url' => 'https://example.com/recording-1',
                'materials' => [
                    ['type' => 'file', 'title' => 'Hooks Cheat Sheet.pdf', 'url' => 'https://example.com/cheat-sheet.pdf'],
                ],
            ],
        ];

        foreach ($sessions as $index => $sData) {
            $topic = ($index == 0) ? $topicFundamental : $topicIntermediate;
            $classroom->sessions()->updateOrCreate(
                ['title' => $sData['title'], 'batch_id' => $classroom->id],
                array_merge($sData, ['batch_topic_id' => $topic->id])
            );
        }

        // STANDALONE Assignment for Classroom
        $classroomAssignment = $classroom->assignments()->updateOrCreate(
            ['title' => 'Tugas Mandiri: Analisis Aplikasi Mobile'],
            [
                'batch_topic_id' => $topicIntermediate->id,
                'description' => 'Silahkan cari satu aplikasi mobile populer dan analisis struktur navigasinya.',
                'instructions' => 'Kumpulkan dalam format PDF atau Link Google Drive.',
                'type' => 'assignment',
                'max_points' => 100,
                'due_date' => now()->addDays(7),
                'is_published' => true,
                'gradable' => true,
            ]
        );

        // POPULATE TIMELINE (BatchActivity)
        $order = 1;
        $classroom->activities()->delete();
        $classroom->activities()->create([
            'activityable_id' => $createdCourses[0]->id,
            'activityable_type' => \App\Models\Course::class,
            'sort_order' => $order++,
            'is_required' => true,
        ]);
        foreach ($classroom->sessions()->orderBy('session_date')->get() as $session) {
            $classroom->activities()->create([
                'activityable_id' => $session->id,
                'activityable_type' => \App\Models\BatchSession::class,
                'sort_order' => $order++,
                'is_required' => true,
            ]);
        }
        $classroom->activities()->create([
            'activityable_id' => $classroomAssignment->id,
            'activityable_type' => \App\Models\Assignment::class,
            'sort_order' => $order++,
            'is_required' => true,
        ]);

        // 6. Create Student and Enrollments
        $studentUser = User::updateOrCreate(
            ['email' => 'student@molang.com'],
            [
                'name' => 'John Student',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$studentUser->hasRole('student')) {
            $studentUser->assignRole('student');
        }
        $studentUser->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        // Enroll in React Course
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'course_id' => $createdCourses[0]->id],
            ['enrolled_at' => now()->subDays(10), 'progress_percentage' => 45]
        );

        // Enroll in Classroom
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'batch_id' => $classroom->id],
            ['enrolled_at' => now()->subDays(5), 'progress_percentage' => 20]
        );

        // Enroll in new Data Science and ML Courses
        $dsCourse = $createdCourses[3];
        $mlCourse = $createdCourses[4];
        
        $dsEnrollment = Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'course_id' => $dsCourse->id],
            ['enrolled_at' => now()->subDays(5), 'progress_percentage' => 80]
        );
        $mlEnrollment = Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'course_id' => $mlCourse->id],
            ['enrolled_at' => now()->subDays(3), 'progress_percentage' => 80]
        );

        // Mark lessons as completed (except the final assignment)
        foreach ([$dsCourse, $mlCourse] as $c) {
            $enrollment = Enrollment::where('user_id', $studentUser->id)->where('course_id', $c->id)->first();
            $lessonIds = Lesson::whereHas('section', fn($q) => $q->where('course_id', $c->id))->pluck('id')->toArray();
            
            // Pop the last lesson (the assignment) so it remains incomplete
            array_pop($lessonIds);
            
            $enrollment->update(['completed_lessons' => $lessonIds]);
            
            // Seed graded quiz submissions so the progress is valid
            $quizAssignments = Assignment::whereHas('lesson.section', fn($q) => $q->where('course_id', $c->id))->where('type', 'quiz')->get();
            foreach ($quizAssignments as $qa) {
                Submission::updateOrCreate(
                    ['assignment_id' => $qa->id, 'user_id' => $studentUser->id],
                    [
                        'status' => 'graded',
                        'submitted_at' => now()->subDays(1),
                        'points_awarded' => 100,
                        'answers' => ['q1' => 'a'],
                        'instructor_feedback' => 'Good job on the quiz!',
                        'graded_at' => now(),
                        'graded_by' => $instructor1->id,
                    ]
                );
            }
        }

        // 7. SEED SUBMISSIONS (REALISTIC)
        $this->seedStudentSubmissions($studentUser, $classroom, $createdCourses[0]);

        // AI Settings
        $settingService = app(\App\Services\AppSettingService::class);
        $settingService->set('ai_provider', 'gemini', 'string', 'ai');
        $settingService->set('ai_model', 'gemini-flash-latest', 'string', 'ai');
    }

    private function seedCourseContent($course, $batchId)
    {
        $isReact = str_contains($course->title, 'React');
        
        for ($i = 1; $i <= 2; $i++) {
            $section = Section::updateOrCreate(
                ['course_id' => $course->id, 'sort_order' => $i],
                ['title' => "Module $i: " . ($i == 1 ? ($isReact ? 'React Fundamentals' : 'Getting Started') : 'Advanced Concepts')]
            );

            // Lesson 1: Video
            Lesson::updateOrCreate(
                ['section_id' => $section->id, 'sort_order' => 1],
                [
                    'title' => "Introduction to " . ($isReact ? 'JSX' : 'Topic'),
                    'type' => 'video',
                    'content' => 'In this lesson, we cover the basic syntax and structure.',
                    'duration' => 600,
                    'is_published' => true,
                ]
            );

            // Lesson 2: Quiz
            $quizData = [
                'title' => "Quiz " . $section->title,
                'description' => "Test your knowledge on " . $section->title,
                'timeLimit' => 15,
                'passingScore' => 70,
                'questions' => [
                    [
                        'id' => 'q1',
                        'text' => $isReact ? 'What is the purpose of useState?' : 'What is the first step in this process?',
                        'options' => [
                            ['id' => 'a', 'text' => $isReact ? 'To manage local component state' : 'Step A'],
                            ['id' => 'b', 'text' => $isReact ? 'To perform API calls' : 'Step B'],
                        ],
                        'correctOptionId' => 'a',
                    ],
                ]
            ];

            $lesson = Lesson::updateOrCreate(
                ['section_id' => $section->id, 'sort_order' => 2],
                [
                    'title' => "Module $i Quiz",
                    'type' => 'quiz',
                    'content' => json_encode($quizData),
                    'duration' => 900,
                    'is_published' => true,
                ]
            );

            // Create assignment record for this quiz in the batch
            Assignment::updateOrCreate(
                ['batch_id' => $batchId, 'lesson_id' => $lesson->id],
                [
                    'title' => $lesson->title,
                    'description' => 'Complete the quiz to test your understanding.',
                    'type' => 'quiz',
                    'max_points' => 100,
                    'is_published' => true,
                    'content' => $quizData,
                ]
            );
        }

        // Add a final regular assignment to simulate AI grading
        $assignmentLesson = Lesson::updateOrCreate(
            ['section_id' => $section->id, 'sort_order' => 3],
            [
                'title' => "Tugas Akhir: " . $course->title,
                'type' => 'assignment',
                'content' => 'Tugas ini bertujuan untuk menguji pemahaman akhir Anda. Silakan kumpulkan file laporan yang relevan.',
                'duration' => 0,
                'is_published' => true,
            ]
        );

        Assignment::updateOrCreate(
            ['batch_id' => $batchId, 'lesson_id' => $assignmentLesson->id],
            [
                'title' => 'Final Submission: ' . $course->title,
                'description' => 'Tugas Akhir untuk ' . $course->title . '. Pastikan file yang Anda unggah sangat relevan dengan topik kursus ini.',
                'type' => 'assignment',
                'max_points' => 100,
                'is_published' => true,
                'gradable' => true,
            ]
        );
    }

    private function seedStudentSubmissions($user, $batch, $course)
    {
        // 1. Seed a Quiz Submission
        $quizAssignment = Assignment::where('batch_id', $batch->id)->where('type', 'quiz')->first();
        if ($quizAssignment) {
            Submission::updateOrCreate(
                ['assignment_id' => $quizAssignment->id, 'user_id' => $user->id],
                [
                    'status' => 'graded',
                    'submitted_at' => now()->subDays(2),
                    'points_awarded' => 100,
                    'answers' => ['q1' => 'a'],
                    'instructor_feedback' => 'Excellent work on the fundamentals!',
                    'graded_at' => now()->subDays(1),
                    'graded_by' => $batch->instructor_id,
                ]
            );
        }

        // 2. Seed a Regular Assignment Submission with AI Feedback
        $taskAssignment = Assignment::where('batch_id', $batch->id)->where('type', 'assignment')->first();
        if ($taskAssignment) {
            Submission::updateOrCreate(
                ['assignment_id' => $taskAssignment->id, 'user_id' => $user->id],
                [
                    'status' => 'submitted',
                    'submitted_at' => now()->subHours(5),
                    'content' => 'Saya telah menganalisis aplikasi Gojek. Navigasinya menggunakan Bottom Navigation Bar dengan 4 menu utama: Beranda, Promo, Pesanan, dan Profil. Ini memudahkan user menjangkau fitur utama.',
                    'ai_status' => 'completed',
                    'ai_score' => 85,
                    'ai_feedback' => 'Analisis Anda cukup baik dan terfokus pada kemudahan pengguna (accessibility). Namun, Anda bisa menambahkan analisis mengenai hirarki visual pada elemen promo.',
                    'ai_evaluated_at' => now()->subHours(4),
                ]
            );
        }
    }
}
