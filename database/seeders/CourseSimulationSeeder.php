<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Course;
use App\Models\Section;
use App\Models\Lesson;
use App\Models\Batch;
use App\Models\Assignment;
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
        // 1. Create/Update Instructor
        $instructor = User::updateOrCreate(
            ['email' => 'instructor@molang.com'],
            [
                'name' => 'Syed Hasnain',
                'password' => Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );
        if (!$instructor->hasRole('instructor')) {
            $instructor->assignRole('instructor');
        }

        // 2. Create Categories
        $categories = [
            'Development' => 'Software development and programming',
            'Design' => 'Graphics and UI/UX design',
            'Business' => 'Business and marketing strategy',
        ];

        $categoryModels = [];
        foreach ($categories as $name => $desc) {
            $categoryModels[] = Category::updateOrCreate(
                ['slug' => Str::slug($name)],
                ['name' => $name, 'description' => $desc]
            );
        }

        // 3. Create Individual Courses
        $individualCourses = [
            [
                'title' => 'Modern Web Development with React',
                'price' => 100.00,
                'discount_price' => 75.00,
                'category_id' => $categoryModels[0]->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'UI/UX Design Masterclass',
                'price' => 80.00,
                'category_id' => $categoryModels[1]->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1586717791821-3f44a563eb4c?q=80&w=800&auto=format&fit=crop',
            ],
            [
                'title' => 'Intro to Programming (Free)',
                'price' => 0.00,
                'category_id' => $categoryModels[0]->id,
                'thumbnail' => 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=800&auto=format&fit=crop',
            ],
        ];

        foreach ($individualCourses as $cData) {
            $course = Course::updateOrCreate(
                ['slug' => Str::slug($cData['title'])],
                array_merge($cData, [
                    'instructor_id' => $instructor->id,
                    'subtitle' => 'Learn from scratch with expert guidance.',
                    'description' => 'Comprehensive course designed to take you from beginner to advanced level.',
                    'status' => 'published',
                    'type' => 'self_paced',
                    'published_at' => now(),
                ])
            );

            $this->seedCourseContent($course);
        }

        // 4. Create Classroom (Batch)
        $batch = Batch::updateOrCreate(
            ['slug' => Str::slug('Mobile Programming with Flutter')],
            [
                'instructor_id' => $instructor->id,
                'name' => 'Mobile Programming with Flutter',
                'class_code' => 'FLT101', // Fixed code for simulation
                'description' => 'Interactive bootcamp for mobile development.',
                'type' => 'classroom',
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
                    'instructor_id' => $instructor->id,
                    'category_id' => $categoryModels[0]->id,
                    'title' => $title,
                    'status' => 'published',
                    'type' => 'structured',
                    'published_at' => now(),
                    'thumbnail' => 'https://images.unsplash.com/photo-1617042375876-a13e36734a04?q=80&w=800&auto=format&fit=crop',
                ]
            );

            $batch->courses()->syncWithoutDetaching([
                $course->id => ['order' => $index + 1, 'is_required' => true]
            ]);
            
            $this->seedCourseContent($course, $batch->id);
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

                // For Classrooms/Batches, we also create an Assignment record
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
