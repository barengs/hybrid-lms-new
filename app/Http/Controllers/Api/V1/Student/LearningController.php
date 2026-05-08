<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LearningController extends Controller
{
    use ApiResponse;

    /**
     * Get learning content for a specific course (syllabus and progress).
     */
    public function show(Request $request, string $slug): JsonResponse
    {
        try {
            $user = $request->user();

            $course = Course::where('slug', $slug)
                ->with([
                    'instructor:id,name',
                    'sections' => function($q) {
                        $q->orderBy('sort_order');
                    },
                    'sections.lessons' => function($q) {
                        $q->orderBy('sort_order');
                    }
                ])
                ->firstOrFail();

            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                return $this->errorResponse('You are not enrolled in this course.', 403);
            }

            $completedLessons = $enrollment->completed_lessons ?? [];

            $sections = $course->sections->map(function ($section) use ($completedLessons) {
                // Get Lessons (Filter out legacy quiz placeholders)
                $lessons = $section->lessons
                    ->reject(fn($l) => $l->type === 'quiz' && empty($l->content))
                    ->map(function ($lesson) use ($completedLessons) {
                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'type' => $lesson->type,
                            'duration' => $lesson->duration,
                            'is_completed' => in_array($lesson->id, $completedLessons),
                            'is_locked' => false,
                            'sort_order' => $lesson->sort_order,
                        ];
                    });

                // Get Quizzes
                $completedQuizzes = $enrollment->completed_quizzes ?? [];
                $quizzes = \App\Models\Quiz::where('section_id', $section->id)
                    ->where('is_published', true)
                    ->get()
                    ->map(function ($quiz) use ($completedQuizzes) {
                        return [
                            'id' => $quiz->id,
                            'quiz_id' => $quiz->id,
                            'title' => $quiz->title,
                            'type' => 'quiz_v2',
                            'duration' => ($quiz->time_limit ?? 0) * 60,
                            'is_completed' => in_array($quiz->id, $completedQuizzes),
                            'is_locked' => false,
                            'sort_order' => $quiz->sort_order,
                        ];
                    });

                // Merge and Sort
                $allItems = $lessons->concat($quizzes)->sortBy('sort_order')->values();

                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'sort_order' => $section->sort_order,
                    'lessons' => $allItems
                ];
            });

            $data = [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail,
                'instructor_name' => $course->instructor->name,
                'progress' => $enrollment->progress_percentage,
                'total_lessons' => $course->lessons_count ?? $course->sections->sum(fn($s) => $s->lessons->count()),
                'completed_lessons' => count($completedLessons),
                'sections' => $sections
            ];

            return $this->successResponse($data, 'Learning content retrieved successfully.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve learning content: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get specific lesson details for a student.
     */
    public function showLesson(Request $request, string $slug, int $lessonId): JsonResponse
    {
        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();
            
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                return $this->errorResponse('You are not enrolled in this course.', 403);
            }

            $lesson = \App\Models\Lesson::with(['attachments', 'section'])
                ->find($lessonId);

            if (!$lesson) {
                return $this->errorResponse('Materi pelajaran (ID: '.$lessonId.') tidak ditemukan di database.', 404);
            }

            // Check if lesson belongs to the course
            if ($lesson->section->course_id != $course->id) {
                return $this->errorResponse('Pelajaran ini bukan bagian dari kursus ' . $course->title, 404);
            }

            // Bridge: If it's a quiz with no content, try to find a relational quiz to use as content
            if ($lesson->type === 'quiz' && empty($lesson->content)) {
                $relatedQuiz = \App\Models\Quiz::with(['questions.options'])
                    ->where('section_id', $lesson->section_id)
                    ->where('title', $lesson->title)
                    ->first();
                
                if ($relatedQuiz) {
                    $legacyFormat = [
                        'id' => $relatedQuiz->id,
                        'title' => $relatedQuiz->title,
                        'description' => $relatedQuiz->description,
                        'timeLimit' => $relatedQuiz->time_limit,
                        'passingScore' => $relatedQuiz->passing_score,
                        'questions' => $relatedQuiz->questions->map(function($q) {
                            return [
                                'id' => $q->id,
                                'text' => $q->question_text,
                                'options' => $q->options->map(function($o) {
                                    return [
                                        'id' => $o->id,
                                        'text' => $o->option_text
                                    ];
                                }),
                                'correctOptionId' => $q->options->where('is_correct', true)->first()?->id
                            ];
                        })
                    ];
                    $lesson->content = json_encode($legacyFormat);
                }
            }

            $completedLessons = $enrollment->completed_lessons ?? [];

            // Find next and previous lessons for navigation
            $allLessons = \App\Models\Lesson::whereHas('section', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })
                ->join('sections', 'lessons.section_id', '=', 'sections.id')
                ->orderBy('sections.sort_order')
                ->orderBy('lessons.sort_order')
                ->select('lessons.id')
                ->get()
                ->pluck('id')
                ->toArray();

            $currentIndex = array_search($lesson->id, $allLessons);
            $nextLessonId = $allLessons[$currentIndex + 1] ?? null;
            $prevLessonId = $allLessons[$currentIndex - 1] ?? null;

            // Fetch assignment ID if it exists for this lesson
            $assignment = \App\Models\Assignment::where('lesson_id', $lesson->id)
                ->when($enrollment->batch_id, function($q) use ($enrollment) {
                    $q->where('batch_id', $enrollment->batch_id);
                })
                ->first();

            $content = $lesson->content;
            if (is_string($content) && !empty($content)) {
                $decoded = json_decode($content, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    $content = $decoded;
                }
            }

            $data = [
                'id' => $lesson->id,
                'title' => $lesson->title,
                'type' => $lesson->type,
                'content' => $lesson->content,
                'video_url' => $lesson->video_url,
                'duration' => $lesson->duration,
                'is_completed' => in_array($lesson->id, $completedLessons),
                'attachments' => $lesson->attachments,
                'next_lesson_id' => $nextLessonId,
                'prev_lesson_id' => $prevLessonId,
                'assignment_id' => $assignment ? $assignment->id : null,
                'assignment_type' => $assignment ? $assignment->type : null,
            ];

            return $this->successResponse($data, 'Lesson details retrieved successfully.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve lesson: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Mark a lesson as complete for a student and update progress.
     */
    public function markComplete(Request $request, string $slug, int $lessonId): JsonResponse
    {
        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();
            
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                return $this->errorResponse('You are not enrolled in this course.', 403);
            }

            $completedLessons = $enrollment->completed_lessons ?? [];

            if (!in_array($lessonId, $completedLessons)) {
                $completedLessons[] = (int)$lessonId;
                
                // Calculate progress
                $totalLessons = \App\Models\Lesson::whereHas('section', function($q) use ($course) {
                    $q->where('course_id', $course->id);
                })->count();

                $progress = ($totalLessons > 0) ? round((count($completedLessons) / $totalLessons) * 100) : 100;

                $enrollment->update([
                    'completed_lessons' => $completedLessons,
                    'progress_percentage' => $progress,
                    'is_completed' => ($progress >= 100),
                    'completed_at' => ($progress >= 100) ? now() : $enrollment->completed_at
                ]);
            }

            return $this->successResponse([
                'success' => true,
                'progress' => $enrollment->progress_percentage
            ], 'Lesson marked as complete.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update progress: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get student learning history/activity.
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $history = Enrollment::where('user_id', $user->id)
                ->with(['course:id,title,slug,thumbnail,instructor_id', 'course.instructor:id,name'])
                ->latest('updated_at')
                ->get()
                ->map(function ($enrollment) {
                    return [
                        'id' => $enrollment->id,
                        'course_title' => $enrollment->course->title,
                        'course_slug' => $enrollment->course->slug,
                        'thumbnail' => $enrollment->course->thumbnail,
                        'instructor' => $enrollment->course->instructor?->name,
                        'progress' => $enrollment->progress_percentage,
                        'is_completed' => $enrollment->is_completed,
                        'enrolled_at' => $enrollment->enrolled_at,
                        'last_activity' => $enrollment->updated_at,
                    ];
                });

            return $this->successResponse($history, 'Learning history retrieved successfully.');

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve learning history: ' . $e->getMessage(), 500);
        }
    }
}
