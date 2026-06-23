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
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
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
            ['email' => 'walid.miftah@gmail.com'],
            [
                'name' => 'Walid Miftah',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$instructor1->hasRole('instructor')) {
            $instructor1->assignRole('instructor');
        }
        $instructor1->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        $instructor2 = User::updateOrCreate(
            ['email' => 'anwari@gmail.com'],
            [
                'name' => 'Anwari',
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
            [
                'title' => 'Mastering Next.js 14 (Menunggu Review)',
                'subtitle' => 'Pelajari App Router, Server Actions, dan optimasi performa di Next.js 14.',
                'description' => 'Kursus ini dirancang khusus untuk membawa kemampuan React Anda ke level production. Anda akan belajar arsitektur App Router, SSR vs SSG, Server Components, dan Server Actions yang menjadi core Next.js 14. Di akhir kursus, Anda akan mendeploy aplikasi nyata berskala enterprise yang SEO-friendly.',
                'price' => 200.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor1->id,
                'status' => 'pending_review',
                'published_at' => null,
                'thumbnail' => 'https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop',
                'requirements' => [
                    'Paham dasar-dasar React.js (Hooks, Props, State)',
                    'Familiar dengan HTML, CSS, dan JavaScript modern (ES6+)',
                    'Memiliki koneksi internet stabil dan code editor (VS Code)'
                ],
                'outcomes' => [
                    'Mampu membangun aplikasi web fullstack menggunakan Next.js 14',
                    'Memahami perbedaan Server dan Client Components',
                    'Bisa mengimplementasikan Server Actions untuk mutasi data',
                    'Mengerti cara melakukan optimasi SEO dan Core Web Vitals'
                ]
            ],
        ];

        // Anwari's courses
        $coursesDataAnwari = [
            [
                'title' => 'UI/UX Design Masterclass',
                'price' => 80.00,
                'category_id' => $categoryModels[1]->id,
                'instructor_id' => $instructor2->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Intro to Programming (Free)',
                'price' => 0.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor2->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Vue.js untuk Pemula',
                'price' => 50.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor2->id,
                'status' => 'draft',
                'published_at' => null,
                'thumbnail' => 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Laravel API Development',
                'price' => 130.00,
                'discount_price' => 95.00,
                'category_id' => $categoryModels[0]->id,
                'instructor_id' => $instructor2->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1617042375876-a13e36734a04?q=80&w=800&auto=format&fit=crop',
            ],
        ];

        // Self-paced batch for Walid
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

        // Self-paced batch for Anwari
        $selfPacedBatchAnwari = Batch::updateOrCreate(
            ['slug' => 'self-paced-learning-anwari'],
            [
                'instructor_id' => $instructor2->id,
                'name' => 'Self-Paced Learning (Anwari)',
                'description' => 'Batch kursus mandiri milik Anwari.',
                'type' => 'structured',
                'status' => 'open',
                'start_date' => now()->subMonths(4),
                'is_public' => true,
            ]
        );

        $createdCourses = [];
        foreach ($coursesData as $cData) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($cData['title'])],
                array_merge([
                    'subtitle' => 'Learn from scratch with expert guidance.',
                    'description' => 'Comprehensive course designed to take you from beginner to advanced level.',
                    'status' => 'published',
                    'type' => 'self_paced',
                    'published_at' => now(),
                ], $cData)
            );
            $createdCourses[] = $course;

            $selfPacedBatch->courses()->syncWithoutDetaching([
                $course->id => ['order' => count($createdCourses), 'is_required' => false]
            ]);
            
            $this->seedCourseContent($course, $selfPacedBatch->id);
        }

        $createdCoursesAnwari = [];
        foreach ($coursesDataAnwari as $cData) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($cData['title'])],
                array_merge([
                    'subtitle' => 'Panduan lengkap dari dasar hingga mahir.',
                    'description' => 'Kursus komprehensif dirancang oleh instruktur berpengalaman.',
                    'status' => 'published',
                    'type' => 'self_paced',
                    'published_at' => now(),
                ], $cData)
            );
            $createdCoursesAnwari[] = $course;

            $selfPacedBatchAnwari->courses()->syncWithoutDetaching([
                $course->id => ['order' => count($createdCoursesAnwari), 'is_required' => false]
            ]);

            $this->seedCourseContent($course, $selfPacedBatchAnwari->id);
        }

        // 4. Structured BATCH - Walid (Flutter)
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

        $walidsClassroomCourses = [
            'Dart Language Basics',
            'Flutter UI Components',
        ];

        foreach ($walidsClassroomCourses as $index => $title) {
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

        // 4b. Structured BATCH - Anwari (Web Design)
        $batchAnwari = Batch::updateOrCreate(
            ['slug' => Str::slug('Web Design Intensive Anwari')],
            [
                'instructor_id' => $instructor2->id,
                'name' => 'Batch Web Design Intensif 2024',
                'class_code' => 'WDS202',
                'description' => 'Program intensif desain web dan UI/UX selama 30 hari bersama Anwari.',
                'type' => 'structured',
                'status' => 'open',
                'start_date' => now()->addDays(5),
                'end_date' => now()->addDays(35),
                'enrollment_start_date' => now()->subDays(5),
                'enrollment_end_date' => now()->addDays(5),
                'max_students' => 40,
                'current_students' => 10,
                'is_public' => true,
            ]
        );

        $anwarisClassroomCourses = [
            'Figma for UI Design',
            'CSS Advanced Techniques',
        ];

        foreach ($anwarisClassroomCourses as $index => $title) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($title)],
                [
                    'instructor_id' => $instructor2->id,
                    'category_id' => $categoryModels[1]->id,
                    'title' => $title,
                    'status' => 'published',
                    'type' => 'structured',
                    'published_at' => now(),
                    'thumbnail' => 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop',
                ]
            );
            $createdCoursesAnwari[] = $course;

            $batchAnwari->courses()->syncWithoutDetaching([
                $course->id => ['order' => $index + 1, 'is_required' => true]
            ]);

            $this->seedCourseContent($course, $batchAnwari->id);
        }

        // 5. KELAS (Classroom) - Walid
        $classroom = Batch::updateOrCreate(
            ['slug' => Str::slug('Pemrograman Mobile Classroom')],
            [
                'instructor_id' => $instructor1->id,
                'name' => 'Kelas Pemrograman Mobile (Walid)',
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

        // 5b. KELAS (Classroom) - Anwari
        $classroomAnwari = Batch::updateOrCreate(
            ['slug' => Str::slug('UI UX Design Classroom Anwari')],
            [
                'instructor_id' => $instructor2->id,
                'name' => 'Kelas UI/UX Design (Anwari)',
                'class_code' => 'UIX-DES-01',
                'description' => 'Ruang belajar interaktif desain UI/UX bersama Anwari.',
                'type' => 'classroom',
                'status' => 'open',
                'start_date' => now(),
                'end_date' => now()->addYear(),
                'is_public' => true,
                'max_students' => 80,
            ]
        );

        // Associate courses to classrooms
        $classroom->courses()->syncWithoutDetaching([
            $createdCourses[0]->id => ['order' => 1, 'is_required' => true],
        ]);
        $classroomAnwari->courses()->syncWithoutDetaching([
            $createdCoursesAnwari[0]->id => ['order' => 1, 'is_required' => true],
        ]);

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
            ['email' => 'willy.ramaya@gmail.com'],
            [
                'name' => 'Willy Ramaya',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$studentUser->hasRole('student')) {
            $studentUser->assignRole('student');
        }
        $studentUser->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        // Second student: Nindia Prames
        $studentUser2 = User::updateOrCreate(
            ['email' => 'nindia.prames@gmail.com'],
            [
                'name' => 'Nindia Prames',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$studentUser2->hasRole('student')) {
            $studentUser2->assignRole('student');
        }
        $studentUser2->profile()->updateOrCreate([], ['onboarding_completed' => true]);

        // Enroll Willy: Walid's React Course + Walid's Classroom
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'course_id' => $createdCourses[0]->id],
            ['enrolled_at' => now()->subDays(10), 'progress_percentage' => 45]
        );
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'batch_id' => $classroom->id],
            ['enrolled_at' => now()->subDays(5), 'progress_percentage' => 20]
        );
        // Willy also enrolled: Anwari's UI/UX course + Anwari's classroom
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'course_id' => $createdCoursesAnwari[0]->id],
            ['enrolled_at' => now()->subDays(7), 'progress_percentage' => 35]
        );
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser->id, 'batch_id' => $classroomAnwari->id],
            ['enrolled_at' => now()->subDays(6), 'progress_percentage' => 15]
        );

        // Enroll Nindia: Walid's Data Science + Walid's batch Flutter
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser2->id, 'course_id' => $createdCourses[1]->id],
            ['enrolled_at' => now()->subDays(8), 'progress_percentage' => 60]
        );
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser2->id, 'batch_id' => $batch->id],
            ['enrolled_at' => now()->subDays(8), 'progress_percentage' => 30]
        );
        // Nindia also enrolled: Anwari's Laravel course + Anwari's batch web design
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser2->id, 'course_id' => $createdCoursesAnwari[3]->id],
            ['enrolled_at' => now()->subDays(4), 'progress_percentage' => 50]
        );
        Enrollment::updateOrCreate(
            ['user_id' => $studentUser2->id, 'batch_id' => $batchAnwari->id],
            ['enrolled_at' => now()->subDays(4), 'progress_percentage' => 20]
        );

        // Enroll in new Data Science and ML Courses (Willy)
        $dsCourse = $createdCourses[1];
        $mlCourse = $createdCourses[2];
        
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
        $this->seedStudentSubmissions($studentUser2, $batch, $createdCourses[0]);

        // AI Settings
        $settingService = app(\App\Services\AppSettingService::class);
        $settingService->set('ai_provider', 'gemini', 'string', 'ai');
        $settingService->set('ai_model', 'gemini-flash-latest', 'string', 'ai');
    }

    private function seedCourseContent($course, $batchId)
    {
        $isNext = str_contains($course->title, 'Next.js');
        $isReact = str_contains($course->title, 'React') || $isNext;
        
        for ($i = 1; $i <= 2; $i++) {
            $sectionTitle = "Module $i: " . ($i == 1 ? ($isNext ? 'App Router & Server Components' : ($isReact ? 'React Fundamentals' : 'Getting Started')) : ($isNext ? 'Data Fetching & Server Actions' : 'Advanced Concepts'));

            $section = Section::updateOrCreate(
                ['course_id' => $course->id, 'sort_order' => $i],
                ['title' => $sectionTitle]
            );

            // Lesson 1: Video
            Lesson::updateOrCreate(
                ['section_id' => $section->id, 'sort_order' => 1],
                [
                    'title' => $isNext ? ($i == 1 ? 'Pengenalan Server Components' : 'Server Actions in Depth') : "Introduction to " . ($isReact ? 'JSX' : 'Topic'),
                    'type' => 'video',
                    'content' => $isNext 
                        ? "Dalam video ini kita membahas secara mendalam tentang " . ($i == 1 ? "bagaimana arsitektur Server Components bekerja di background." : "cara menggunakan Server Actions untuk mengelola state di server tanpa route handler terpisah.")
                        : 'In this lesson, we cover the basic syntax and structure.',
                    'duration' => 600,
                    'is_published' => true,
                ]
            );

            // Quiz Data Definition
            $quizData = $this->getQuizDataForCourse($course->title, $i);

            // Create a lesson placeholder for the quiz
            $quizLesson = Lesson::updateOrCreate(
                ['section_id' => $section->id, 'sort_order' => 2],
                [
                    'title' => "Module $i Quiz",
                    'type' => 'quiz',
                    'content' => null,
                    'duration' => 900,
                    'is_published' => true,
                ]
            );

            // New Relational Quiz
            $quiz = Quiz::updateOrCreate(
                ['section_id' => $section->id, 'title' => "Module $i Quiz"],
                [
                    'lesson_id' => $quizLesson->id,
                    'description' => "Test your knowledge on " . $section->title,
                    'time_limit' => 15,
                    'passing_score' => 70,
                    'is_published' => true,
                    'sort_order' => 2,
                ]
            );

            foreach ($quizData['questions'] as $qIndex => $qData) {
                $question = QuizQuestion::updateOrCreate(
                    ['quiz_id' => $quiz->id, 'question_text' => $qData['text']],
                    ['points' => 10, 'sort_order' => $qIndex + 1]
                );

                foreach ($qData['options'] as $oData) {
                    QuizOption::updateOrCreate(
                        ['quiz_question_id' => $question->id, 'option_text' => $oData['text']],
                        ['is_correct' => $oData['id'] === $qData['correctOptionId']]
                    );
                }
            }


            // Update assignment record for this quiz in the batch if needed
            Assignment::updateOrCreate(
                ['batch_id' => $batchId, 'lesson_id' => $quizLesson->id],
                [
                    'title' => "Module $i Quiz",
                    'description' => 'Complete the quiz to test your understanding.',
                    'type' => 'quiz',
                    'max_points' => 100,
                    'is_published' => true,
                ]
            );
        }

        // Add a final regular assignment to simulate AI grading
        $assignmentData = $this->getAssignmentDataForCourse($course->title);

        $assignmentLesson = Lesson::updateOrCreate(
            ['section_id' => $section->id, 'sort_order' => 3],
            [
                'title' => "Tugas Akhir: " . $course->title,
                'type' => 'assignment',
                'content' => $assignmentData['content'],
                'duration' => 0,
                'is_published' => true,
            ]
        );

        Assignment::updateOrCreate(
            ['batch_id' => $batchId, 'lesson_id' => $assignmentLesson->id],
            [
                'title' => 'Final Submission: ' . $course->title,
                'description' => $assignmentData['description'],
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

    private function getQuizDataForCourse($title, $moduleIndex)
    {
        $titleLower = strtolower($title);

        if (str_contains($titleLower, 'react')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'What is JSX in React?',
                            'options' => [
                                ['id' => 'a', 'text' => 'A syntax extension that allows writing HTML-like code inside JavaScript.'],
                                ['id' => 'b', 'text' => 'A CSS-in-JS styling library.'],
                                ['id' => 'c', 'text' => 'A state management library.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'Which hook is used to manage local state in a functional component?',
                            'options' => [
                                ['id' => 'a', 'text' => 'useEffect'],
                                ['id' => 'b', 'text' => 'useState'],
                                ['id' => 'c', 'text' => 'useContext'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What is the primary purpose of the useEffect hook?',
                            'options' => [
                                ['id' => 'a', 'text' => 'To perform side effects like fetching data, subscriptions, or manual DOM changes.'],
                                ['id' => 'b', 'text' => 'To style React components dynamically.'],
                                ['id' => 'c', 'text' => 'To cache heavy calculations.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'How can you pass data from a parent component down to a child component?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Using standard State.'],
                                ['id' => 'b', 'text' => 'Using Ref.'],
                                ['id' => 'c', 'text' => 'Using Props.'],
                            ],
                            'correctOptionId' => 'c',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'next.js')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'Where do React Server Components execute by default in Next.js 14 App Router?',
                            'options' => [
                                ['id' => 'a', 'text' => 'On the client-side browser.'],
                                ['id' => 'b', 'text' => 'On the server.'],
                                ['id' => 'c', 'text' => 'On both server and client.'],
                            ],
                            'correctOptionId' => 'b',
                        ],
                        [
                            'text' => 'Which folder in the project structure acts as the root route directory in Next.js 14 App Router?',
                            'options' => [
                                ['id' => 'a', 'text' => 'pages/'],
                                ['id' => 'b', 'text' => 'src/'],
                                ['id' => 'c', 'text' => 'app/'],
                            ],
                            'correctOptionId' => 'c',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What is a Server Action in Next.js 14?',
                            'options' => [
                                ['id' => 'a', 'text' => 'An asynchronous function executed on the server, triggered from the client.'],
                                ['id' => 'b', 'text' => 'A client-side animation handler.'],
                                ['id' => 'c', 'text' => 'An API endpoint configuration.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'How can you fetch data dynamically on the server inside a Server Component?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Using the standard useEffect hook.'],
                                ['id' => 'b', 'text' => 'Using async/await directly inside the component function.'],
                                ['id' => 'c', 'text' => 'Using next/router.'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'python') || str_contains($titleLower, 'data science')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'Which Python library is primarily used for data manipulation and analysis?',
                            'options' => [
                                ['id' => 'a', 'text' => 'pandas'],
                                ['id' => 'b', 'text' => 'scikit-learn'],
                                ['id' => 'c', 'text' => 'matplotlib'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What structure in pandas is a 2-dimensional labeled data structure with columns?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Series'],
                                ['id' => 'b', 'text' => 'DataFrame'],
                                ['id' => 'c', 'text' => 'Panel'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'Which library is commonly used for plotting charts and data visualization in Python?',
                            'options' => [
                                ['id' => 'a', 'text' => 'matplotlib'],
                                ['id' => 'b', 'text' => 'numpy'],
                                ['id' => 'c', 'text' => 'sqlite3'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What does NumPy stand for?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Numerical Python'],
                                ['id' => 'b', 'text' => 'Number Python'],
                                ['id' => 'c', 'text' => 'Name Python'],
                            ],
                            'correctOptionId' => 'a',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'machine learning')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'What is supervised learning?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Training a model on unlabeled datasets.'],
                                ['id' => 'b', 'text' => 'Training a model on labeled datasets.'],
                                ['id' => 'c', 'text' => 'Leaving a model to learn from environment feedback.'],
                            ],
                            'correctOptionId' => 'b',
                        ],
                        [
                            'text' => 'Which algorithm is commonly used for classification tasks?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Linear Regression'],
                                ['id' => 'b', 'text' => 'K-Means Clustering'],
                                ['id' => 'c', 'text' => 'Decision Tree'],
                            ],
                            'correctOptionId' => 'c',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What is overfitting in machine learning?',
                            'options' => [
                                ['id' => 'a', 'text' => 'When a model performs well on training data but poorly on unseen data.'],
                                ['id' => 'b', 'text' => 'When a model fails to capture patterns in both training and test data.'],
                                ['id' => 'c', 'text' => 'When a model has too few features.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'Which metric is commonly used to evaluate regression models?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Accuracy'],
                                ['id' => 'b', 'text' => 'Mean Squared Error (MSE)'],
                                ['id' => 'c', 'text' => 'F1-Score'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'ui/ux') || str_contains($titleLower, 'ui ux') || str_contains($titleLower, 'figma') || str_contains($titleLower, 'design')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'What does UI stand for in UI/UX Design?',
                            'options' => [
                                ['id' => 'a', 'text' => 'User Integration'],
                                ['id' => 'b', 'text' => 'User Interface'],
                                ['id' => 'c', 'text' => 'Unique Interface'],
                            ],
                            'correctOptionId' => 'b',
                        ],
                        [
                            'text' => 'What is the main goal of UX design?',
                            'options' => [
                                ['id' => 'a', 'text' => 'To make components as colorful as possible.'],
                                ['id' => 'b', 'text' => 'To speed up web application performance.'],
                                ['id' => 'c', 'text' => 'To build intuitive, useful, and meaningful user journeys.'],
                            ],
                            'correctOptionId' => 'c',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What is wireframing in design?',
                            'options' => [
                                ['id' => 'a', 'text' => 'A low-fidelity visual layout of a page or screen.'],
                                ['id' => 'b', 'text' => 'Connecting components to databases.'],
                                ['id' => 'c', 'text' => 'Creating final production-ready graphics.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What color model is typically used for digital screens?',
                            'options' => [
                                ['id' => 'a', 'text' => 'CMYK'],
                                ['id' => 'b', 'text' => 'RGB'],
                                ['id' => 'c', 'text' => 'Pantone'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'laravel')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'Which file is used to define API routes in Laravel?',
                            'options' => [
                                ['id' => 'a', 'text' => 'routes/web.php'],
                                ['id' => 'b', 'text' => 'routes/api.php'],
                                ['id' => 'c', 'text' => 'routes/console.php'],
                            ],
                            'correctOptionId' => 'b',
                        ],
                        [
                            'text' => 'Which Artisan command is used to create a new controller?',
                            'options' => [
                                ['id' => 'a', 'text' => 'php artisan new:controller'],
                                ['id' => 'b', 'text' => 'php artisan make:controller'],
                                ['id' => 'c', 'text' => 'php artisan create:controller'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What package is built-in Laravel for light-weight token authentication?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Laravel Passport'],
                                ['id' => 'b', 'text' => 'Laravel Sanctum'],
                                ['id' => 'c', 'text' => 'Socialite'],
                            ],
                            'correctOptionId' => 'b',
                        ],
                        [
                            'text' => 'What format does a Laravel API Resource convert data to by default?',
                            'options' => [
                                ['id' => 'a', 'text' => 'XML'],
                                ['id' => 'b', 'text' => 'JSON'],
                                ['id' => 'c', 'text' => 'YAML'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'vue.js') || str_contains($titleLower, 'vue')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'Which directive is used for two-way data binding in Vue?',
                            'options' => [
                                ['id' => 'a', 'text' => 'v-bind'],
                                ['id' => 'b', 'text' => 'v-on'],
                                ['id' => 'c', 'text' => 'v-model'],
                            ],
                            'correctOptionId' => 'c',
                        ],
                        [
                            'text' => 'How do you render a list of items in Vue dynamically?',
                            'options' => [
                                ['id' => 'a', 'text' => 'v-repeat'],
                                ['id' => 'b', 'text' => 'v-for'],
                                ['id' => 'c', 'text' => 'v-list'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'What is Vue Router used for?',
                            'options' => [
                                ['id' => 'a', 'text' => 'To handle navigation and routing between pages.'],
                                ['id' => 'b', 'text' => 'To manage global store state.'],
                                ['id' => 'c', 'text' => 'To compile template code.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'Which function serves as the entry point for Vue 3 Composition API?',
                            'options' => [
                                ['id' => 'a', 'text' => 'created'],
                                ['id' => 'b', 'text' => 'setup'],
                                ['id' => 'c', 'text' => 'mounted'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'dart')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'Which keyword is used to declare a variable whose value cannot be reassigned?',
                            'options' => [
                                ['id' => 'a', 'text' => 'final'],
                                ['id' => 'b', 'text' => 'var'],
                                ['id' => 'c', 'text' => 'dynamic'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What function is the starting entry point of every Dart program?',
                            'options' => [
                                ['id' => 'a', 'text' => 'start()'],
                                ['id' => 'b', 'text' => 'main()'],
                                ['id' => 'c', 'text' => 'run()'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'How do you define an asynchronous function in Dart?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Using the async keyword before the function body.'],
                                ['id' => 'b', 'text' => 'Using the thread keyword.'],
                                ['id' => 'c', 'text' => 'Calling await() inside standard function.'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What is sound null safety in Dart?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Variables cannot be null unless explicitly marked nullable.'],
                                ['id' => 'b', 'text' => 'Variables cannot be empty.'],
                                ['id' => 'c', 'text' => 'Null values are automatically converted to empty strings.'],
                            ],
                            'correctOptionId' => 'a',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'flutter')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'What is the basic structural element of a Flutter UI?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Widget'],
                                ['id' => 'b', 'text' => 'Activity'],
                                ['id' => 'c', 'text' => 'Div'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'Which layout widget aligns its children vertically?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Row'],
                                ['id' => 'b', 'text' => 'Column'],
                                ['id' => 'c', 'text' => 'Stack'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'Which lifecycle method is called first when a StatefulWidget is created?',
                            'options' => [
                                ['id' => 'a', 'text' => 'build'],
                                ['id' => 'b', 'text' => 'dispose'],
                                ['id' => 'c', 'text' => 'initState'],
                            ],
                            'correctOptionId' => 'c',
                        ],
                        [
                            'text' => 'Which widget provides a default drawer, app bar, and bottom navigation layout?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Scaffold'],
                                ['id' => 'b', 'text' => 'Container'],
                                ['id' => 'c', 'text' => 'Card'],
                            ],
                            'correctOptionId' => 'a',
                        ]
                    ]
                ];
            }
        }

        if (str_contains($titleLower, 'css')) {
            if ($moduleIndex == 1) {
                return [
                    'questions' => [
                        [
                            'text' => 'What does CSS stand for?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Cascading Style Sheets'],
                                ['id' => 'b', 'text' => 'Computer Style Sheets'],
                                ['id' => 'c', 'text' => 'Creative Style Sheets'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'Which CSS property is used to change the text color of an element?',
                            'options' => [
                                ['id' => 'a', 'text' => 'text-color'],
                                ['id' => 'b', 'text' => 'fg-color'],
                                ['id' => 'c', 'text' => 'color'],
                            ],
                            'correctOptionId' => 'c',
                        ]
                    ]
                ];
            } else {
                return [
                    'questions' => [
                        [
                            'text' => 'Which CSS layout model is best suited for 1-dimensional positioning (row or column)?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Flexbox'],
                                ['id' => 'b', 'text' => 'Grid'],
                                ['id' => 'c', 'text' => 'Float'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'text' => 'What does the em unit represent in CSS sizing?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Sizing relative to the root html font size.'],
                                ['id' => 'b', 'text' => 'Sizing relative to the element font size or parent font size.'],
                                ['id' => 'c', 'text' => 'Exact screen pixels.'],
                            ],
                            'correctOptionId' => 'b',
                        ]
                    ]
                ];
            }
        }

        // Default fallback if no specific course matches
        if ($moduleIndex == 1) {
            return [
                'questions' => [
                    [
                        'text' => 'What is a variable in programming?',
                        'options' => [
                            ['id' => 'a', 'text' => 'A container for storing data values.'],
                            ['id' => 'b', 'text' => 'A constant mathematical value.'],
                            ['id' => 'c', 'text' => 'An HTML tag name.'],
                        ],
                        'correctOptionId' => 'a',
                    ],
                    [
                        'text' => 'Which operator is typically used for variable assignment?',
                        'options' => [
                            ['id' => 'a', 'text' => '=='],
                            ['id' => 'b', 'text' => '='],
                            ['id' => 'c', 'text' => '==='],
                        ],
                        'correctOptionId' => 'b',
                    ]
                ]
            ];
        } else {
            return [
                'questions' => [
                    [
                        'text' => 'What is a loop used for in programming?',
                        'options' => [
                            ['id' => 'a', 'text' => 'To repeat a block of code multiple times.'],
                            ['id' => 'b', 'text' => 'To declare multiple classes.'],
                            ['id' => 'c', 'text' => 'To terminate function execution.'],
                        ],
                        'correctOptionId' => 'a',
                    ],
                    [
                        'text' => 'What is a function in programming?',
                        'options' => [
                            ['id' => 'a', 'text' => 'A reusable block of code that performs a specific action.'],
                            ['id' => 'b', 'text' => 'A styling class.'],
                            ['id' => 'c', 'text' => 'An asynchronous event compiler.'],
                        ],
                        'correctOptionId' => 'a',
                    ]
                ]
            ];
        }
    }

    private function getAssignmentDataForCourse($title)
    {
        $titleLower = strtolower($title);

        if (str_contains($titleLower, 'react')) {
            return [
                'content' => 'Buatlah sebuah aplikasi Todo List interaktif menggunakan React. Fitur yang wajib ada: 1) Tambah, edit, hapus, dan tandai selesai tugas. 2) Filter tugas berdasarkan status (Semua, Aktif, Selesai). 3) Simpan data tugas di LocalStorage agar tidak hilang saat reload halaman. Pastikan kode bersih, modular menggunakan komponen-komponen terpisah, dan menggunakan React Hooks (useState, useEffect) secara tepat.',
                'description' => 'Tugas Akhir: Aplikasi Todo List dengan React & Hooks. Kumpulkan link repositori GitHub dan tangkapan layar jalannya aplikasi.',
            ];
        }

        if (str_contains($titleLower, 'next.js')) {
            return [
                'content' => 'Buat sebuah aplikasi blog sederhana menggunakan Next.js App Router. Aplikasi ini harus menggunakan Server Components untuk mengambil daftar artikel dari JSONPlaceholder API, dan menggunakan Server Actions untuk form komentar sederhana.',
                'description' => 'Tugas Akhir untuk Next.js 14. Pastikan kode yang Anda buat memenuhi standar clean code, serta manfaatkan fitur-fitur utama Next.js 14 dengan tepat (App Router, Server Actions, Server Components). Upload repositori GitHub Anda.',
            ];
        }

        if (str_contains($titleLower, 'python') || str_contains($titleLower, 'data science')) {
            return [
                'content' => 'Lakukan analisis eksplorasi data (EDA) pada dataset perumahan (Housing Dataset) menggunakan Python. Langkah yang harus dilakukan: 1) Bersihkan data dari missing values dan duplikat. 2) Lakukan visualisasi korelasi antar fitur menggunakan heatmap Seaborn. 3) Temukan 3 insight bisnis penting terkait faktor yang paling mempengaruhi harga rumah. Tulis laporan analisis Anda menggunakan Jupyter Notebook (.ipynb).',
                'description' => 'Tugas Akhir: Analisis Eksplorasi Data (EDA) Perumahan menggunakan Pandas, Seaborn, dan Jupyter Notebook.',
            ];
        }

        if (str_contains($titleLower, 'machine learning')) {
            return [
                'content' => 'Buatlah model klasifikasi menggunakan algoritma Random Forest untuk memprediksi apakah seorang pelanggan akan churn (berhenti berlangganan) atau tidak berdasarkan dataset Customer Churn. Langkah kerja: 1) Preprocessing data (scaling & encoding). 2) Split data menjadi train & test set (80:20). 3) Latih model Random Forest. 4) Evaluasi model menggunakan Confusion Matrix dan Classification Report (Precision, Recall, F1-Score). Tulis penjelasan lengkap dan kode Anda dalam file PDF/Notebook.',
                'description' => 'Tugas Akhir: Pemodelan Klasifikasi Customer Churn dengan Random Forest.',
            ];
        }

        if (str_contains($titleLower, 'ui/ux') || str_contains($titleLower, 'ui ux') || str_contains($titleLower, 'figma') || str_contains($titleLower, 'design')) {
            return [
                'content' => 'Desainlah high-fidelity mockup untuk aplikasi mobile bertema \'Food Delivery App\' sebanyak minimal 3 screen (Home, Product Detail, dan Cart). Langkah: 1) Definisikan user persona dan user flow singkat. 2) Terapkan prinsip desain seperti visual hierarchy, grid system, dan kontras warna yang baik. 3) Kumpulkan dalam format PDF presentasi portofolio atau link prototype Figma.',
                'description' => 'Tugas Akhir: Desain UI/UX High-Fidelity Mockup Food Delivery Mobile App.',
            ];
        }

        if (str_contains($titleLower, 'laravel')) {
            return [
                'content' => 'Membangun RESTful API untuk sistem \'Manajemen Inventaris Barang\'. Spesifikasi API: 1) Endpoint CRUD untuk resource Barang (Resource & Controller). 2) Validasi input request (misal: nama barang wajib diisi, stok harus angka). 3) Gunakan Laravel API Resource untuk memformat response JSON. 4) Terapkan token authentication menggunakan Laravel Sanctum untuk mengamankan endpoint store, update, dan delete.',
                'description' => 'Tugas Akhir: Membangun RESTful API Manajemen Inventaris dengan Laravel & Sanctum.',
            ];
        }

        if (str_contains($titleLower, 'vue.js') || str_contains($titleLower, 'vue')) {
            return [
                'content' => 'Buatlah aplikasi web \'Katalog Buku Pribadi\' menggunakan Vue 3. Fitur yang wajib ada: 1) Menampilkan daftar buku yang disimpan pada array lokal. 2) Form untuk menambahkan buku baru (judul, penulis, tahun terbit). 3) Fitur pencarian buku berdasarkan judul secara realtime menggunakan Computed Properties. 4) Terapkan Vue 3 Composition API dengan <script setup>.',
                'description' => 'Tugas Akhir: Pembuatan Katalog Buku Pribadi menggunakan Vue 3 & Composition API.',
            ];
        }

        if (str_contains($titleLower, 'dart')) {
            return [
                'content' => 'Buatlah program Dart bertema \'Sistem Kasir Minimarket\' yang menerapkan konsep OOP (Object-Oriented Programming). Buatlah class Product (properti id, name, price) dan class Cart yang berisi list item belanjaan beserta method untuk menambah barang dan menghitung total harga belanjaan setelah diskon 10%. Gunakan List, Map, dan penanganan null safety secara tepat.',
                'description' => 'Tugas Akhir: Pembuatan Aplikasi Kasir Minimarket dengan Dart OOP & Null Safety.',
            ];
        }

        if (str_contains($titleLower, 'flutter')) {
            return [
                'content' => 'Buatlah antarmuka aplikasi (UI mockup) halaman profil pengguna \'User Profile Dashboard\' menggunakan Flutter. Komponen UI yang wajib digunakan: Scaffold, AppBar, CircleAvatar untuk foto profil, Card untuk statistik (followers, posts, following), ListTile untuk menu pengaturan (Ubah Profil, Keamanan, Keluar), dan SingleChildScrollView agar halaman responsif jika layar kecil.',
                'description' => 'Tugas Akhir: Pembuatan Halaman Dashboard Profil Pengguna dengan Flutter UI Components.',
            ];
        }

        if (str_contains($titleLower, 'css')) {
            return [
                'content' => 'Buatlah sebuah layout halaman landing page responsif tanpa menggunakan CSS framework (Tailwind/Bootstrap). Halaman wajib menerapkan: 1) CSS Grid untuk layout utama galeri produk. 2) CSS Flexbox untuk header navigasi dan footer. 3) Media Queries untuk breakpoints mobile, tablet, dan desktop. 4) Efek transisi halus (transition/hover animation) pada card produk.',
                'description' => 'Tugas Akhir: Landing Page Responsif dengan CSS Grid, Flexbox, & Media Queries.',
            ];
        }

        // Default fallback
        return [
            'content' => 'Silakan buat ringkasan atau laporan implementasi proyek akhir berdasarkan seluruh materi yang telah Anda pelajari pada kursus ini. Laporan harus memuat: 1) Latar belakang masalah. 2) Solusi yang dibangun. 3) Screenshot hasil akhir. Kumpulkan dalam format dokumen PDF.',
            'description' => 'Tugas Akhir: Laporan Implementasi Proyek Akhir Kursus. Kumpulkan dalam format PDF.',
        ];
    }
}
