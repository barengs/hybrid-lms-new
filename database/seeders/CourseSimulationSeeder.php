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

        // 6. Create Dummy Students and Enrollments
        $students = [
            ['email' => 'student@molang.com', 'name' => 'John Student'],
            ['email' => 'alice@molang.com', 'name' => 'Alice Wonderland'],
            ['email' => 'bob@molang.com', 'name' => 'Bob Builder'],
        ];

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
            $randomCourses = collect($createdCourses)->random($numEnrollments);
            
            foreach ($randomCourses as $course) {
                Enrollment::updateOrCreate(
                    ['user_id' => $student->id, 'course_id' => $course->id],
                    [
                        'enrolled_at' => now()->subDays(rand(1, 30)),
                        'progress_percentage' => rand(0, 100),
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
                    'questions' => [
                        ['question' => 'Sample Question 1?', 'options' => ['A', 'B', 'C'], 'answer' => 'A'],
                        ['question' => 'Sample Question 2?', 'options' => ['X', 'Y', 'Z'], 'answer' => 'Y'],
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
