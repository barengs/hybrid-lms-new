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
                'title' => 'Digital Marketing Strategy',
                'price' => 120.00,
                'category_id' => $categoryModels[3]->id,
                'instructor_id' => $instructor2->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Financial Management for Startups',
                'price' => 150.00,
                'category_id' => $categoryModels[2]->id,
                'instructor_id' => $instructor2->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800&auto=format&fit=crop',
            ],
        ];

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
            $this->seedCourseContent($course);
        }

        // 4. Create Structured BATCH (Traditional Learning Session)
        $batch = Batch::updateOrCreate(
            ['slug' => Str::slug('Mobile Programming with Flutter')],
            [
                'instructor_id' => $instructor1->id,
                'name' => 'Batch Flutter September 2024',
                'class_code' => 'FLT101',
                'description' => 'Sesi belajar intensif Mobile Programming dengan Flutter dalam rentang waktu tertentu.',
                'type' => 'structured', // Tipe BATCH
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
            'Advanced State Management',
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
                'type' => 'classroom', // Tipe KELAS
                'status' => 'open',
                'start_date' => now(),
                'end_date' => now()->addYear(), // Jangka panjang
                'is_public' => true,
                'max_students' => 100,
            ]
        );

        // Associate some existing courses to this classroom
        $classroom->courses()->syncWithoutDetaching([
            $createdCourses[0]->id => ['order' => 1, 'is_required' => true],
            $createdCourses[2]->id => ['order' => 2, 'is_required' => false],
        ]);

        // 5a. Seed Sessions for Classroom
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
                    ['type' => 'youtube', 'title' => 'Video Review Komponen', 'url' => 'dQw4w9WgXcQ'], // YouTube video ID
                    ['type' => 'link', 'title' => 'Dokumentasi React Docs', 'url' => 'https://react.dev'],
                ],
            ],
            [
                'title' => 'Q&A: Troubleshooting State & Props',
                'type' => 'online_class',
                'description' => 'Sesi tatap muka online untuk tanya jawab seputar kendala di modul 1.',
                'session_date' => now()->addDays(1)->setTime(19, 30),
                'duration' => '1 Jam',
                'status' => 'upcoming',
                'meeting_url' => 'molang-qa-state-props',
                'materials' => [
                    ['type' => 'link', 'title' => 'Papan Tulis Kolaboratif', 'url' => 'https://miro.com/example'],
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

        foreach ($sessions as $sData) {
            $session = $classroom->sessions()->create($sData);
            
            // Add a comment to the first session
            if ($sData['title'] === 'Pengenalan React & Dasar Komponen') {
                $student = User::where('email', 'student@molang.com')->first();
                if ($student) {
                    $session->comments()->create([
                        'user_id' => $student->id,
                        'comment' => 'Materi yang sangat membantu pak! Apakah ada link tambahan untuk latihan state?',
                    ]);
                    
                    $instructor = User::where('email', 'instructor@molang.com')->first();
                    if ($instructor) {
                        $session->comments()->create([
                            'user_id' => $instructor->id,
                            'comment' => 'Terima kasih John. Coba cek dokumentasi di bagian "Beta Docs" untuk contoh lebih interaktif.',
                        ]);
                    }
                }
            }
        }

        // 5b. Seed Additional Materials (Attachments) for Classroom
        $classroom->additionalMaterials()->create([
            'title' => 'Buku Panduan React (Indonesian)',
            'file_path' => 'materials/react-guide.pdf',
            'file_name' => 'react-guide.pdf',
            'file_type' => 'document',
            'file_size' => 5 * 1024 * 1024, // 5MB
        ]);

        $classroom->additionalMaterials()->create([
            'title' => 'Video Tips Productivity Developer',
            'file_path' => 'materials/tips.mp4',
            'file_name' => 'tips.mp4',
            'file_type' => 'video',
            'file_size' => 25 * 1024 * 1024, // 25MB
        ]);

        // 6. Create Dummy Students and Enrollments
        $students = [
            ['email' => 'student@molang.com', 'name' => 'John Student'],
            ['email' => 'alice@molang.com', 'name' => 'Alice Wonderland'],
            ['email' => 'bob@molang.com', 'name' => 'Bob Builder'],
        ];

        // Clear existing enrollments to avoid stale data
        Enrollment::whereIn('user_id', User::whereIn('email', array_column($students, 'email'))->pluck('id'))->delete();

        foreach ($students as $sData) {
            $student = User::updateOrCreate(
                ['email' => $sData['email']],
                [
                    'name' => $sData['name'],
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                ]
            );
            if (!$student->hasRole('student')) {
                $student->assignRole('student');
            }

            // Enroll in some courses/batches
            $numEnrollments = rand(1, 3);
            $targetCourses = $sData['email'] === 'student@molang.com' 
                ? collect($createdCourses)->take(2) 
                : collect($createdCourses)->random($numEnrollments);
            
            foreach ($targetCourses as $course) {
                $progress = rand(60, 95); // High progress for demo
                
                // Get all lesson IDs for this course to calculate which ones are completed
                $lessonIds = \App\Models\Lesson::whereHas('section', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })->pluck('id')->toArray();
                
                $totalLessons = count($lessonIds);
                $numCompleted = round(($progress / 100) * $totalLessons);
                $completedLessons = array_slice($lessonIds, 0, $numCompleted);
                
                Enrollment::updateOrCreate(
                    ['user_id' => $student->id, 'course_id' => $course->id],
                    [
                        'enrolled_at' => now()->subDays(rand(1, 30)),
                        'progress_percentage' => $progress,
                        'completed_lessons' => $completedLessons,
                    ]
                );
            }

            // Also enroll in the classroom
            Enrollment::updateOrCreate(
                ['user_id' => $student->id, 'batch_id' => $classroom->id],
                [
                    'enrolled_at' => now(),
                    'progress_percentage' => 0,
                ]
            );
        }
    }

    /**
     * Helper to seed modules, lessons, quizzes, and assignments for a course.
     */
    private function seedCourseContent($course, $batchId = null)
    {
        for ($i = 1; $i <= 3; $i++) {
            $section = Section::updateOrCreate(
                ['course_id' => $course->id, 'sort_order' => $i],
                ['title' => "Module $i: " . ($i == 1 ? 'Introduction' : ($i == 2 ? 'Core Concepts' : 'Final Project Preparation'))]
            );

            for ($j = 1; $j <= 2; $j++) {
                $quizData = [
                    'id' => "quiz-$i-$j",
                    'title' => "Quiz Materi $i.$j",
                    'description' => "Uji pemahaman Anda mengenai materi di Modul $i.",
                    'timeLimit' => 10,
                    'passingScore' => 70,
                    'questions' => [
                        [
                            'id' => 'q1',
                            'text' => 'Manakah pernyataan yang paling tepat mengenai materi ini?',
                            'options' => [
                                ['id' => 'a', 'text' => 'Pernyataan A (Benar)'],
                                ['id' => 'b', 'text' => 'Pernyataan B'],
                                ['id' => 'c', 'text' => 'Pernyataan C'],
                            ],
                            'correctOptionId' => 'a',
                        ],
                        [
                            'id' => 'q2',
                            'text' => 'Apa komponen utama dari pembahasan di atas?',
                            'options' => [
                                ['id' => 'x', 'text' => 'Komponen X'],
                                ['id' => 'y', 'text' => 'Komponen Y (Benar)'],
                                ['id' => 'z', 'text' => 'Komponen Z'],
                            ],
                            'correctOptionId' => 'y',
                        ],
                    ],
                ];

                $lesson = Lesson::updateOrCreate(
                    ['section_id' => $section->id, 'sort_order' => $j],
                    [
                        'title' => ($i == 3 && $j == 2) ? 'Final Project Submission' : ($j == 1 ? "Lesson $i.$j: Video Material" : "Lesson $i.$j: Quiz"),
                        'type' => ($i == 3 && $j == 2) ? 'assignment' : ($j == 1 ? 'video' : 'quiz'),
                        'content' => $j == 2 ? json_encode($quizData) : 'Sample content for this lesson.',
                        'duration' => 600,
                        'is_published' => true,
                    ]
                );

                if ($batchId) {
                    if ($j == 2 || ($i == 3 && $j == 2)) {
                        Assignment::updateOrCreate(
                            ['batch_id' => $batchId, 'lesson_id' => $lesson->id],
                            [
                                'title' => $lesson->title,
                                'description' => 'Simulation assignment for batch ' . $batchId,
                                'type' => ($i == 3 && $j == 2) ? 'assignment' : 'quiz',
                                'max_points' => 100,
                                'is_published' => true,
                                'content' => $quizData,
                            ]
                        );
                    }
                }
            }
        }
    }
}
