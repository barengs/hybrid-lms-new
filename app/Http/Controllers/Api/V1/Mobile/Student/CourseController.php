<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Lesson;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    use ApiResponse;

    /**
     * Detail Kursus & Silabus (Mobile)
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

            $completedLessons = $enrollment ? ($enrollment->completed_lessons ?? []) : [];

            $sections = $course->sections->map(function ($section) use ($completedLessons, $enrollment) {
                // Get Lessons
                $lessons = $section->lessons
                    ->reject(fn($l) => $l->type === 'quiz' && empty($l->content))
                    ->map(function ($lesson) use ($completedLessons, $enrollment) {
                        $assignment = \App\Models\Assignment::where('lesson_id', $lesson->id)
                            ->when($enrollment && $enrollment->batch_id, function($q) use ($enrollment) {
                                $q->where('batch_id', $enrollment->batch_id);
                            })
                            ->first();
                            
                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'type' => $lesson->type,
                            'duration' => $lesson->duration,
                            'is_completed' => in_array($lesson->id, $completedLessons),
                            'is_locked' => false,
                            'assignment_id' => $assignment ? $assignment->id : null,
                            'assignment_type' => $assignment ? $assignment->type : null,
                            'sort_order' => $lesson->sort_order,
                        ];
                    });

                // Get Quizzes
                $quizzes = \App\Models\Quiz::where('section_id', $section->id)
                    ->where('is_published', true)
                    ->get()
                    ->map(function ($quiz) {
                        return [
                            'id' => $quiz->id,
                            'quiz_id' => $quiz->id, // Special field for new quiz structure
                            'title' => $quiz->title,
                            'type' => 'quiz_v2', // Mark as new quiz architecture
                            'duration' => $quiz->time_limit ?? 0,
                            'is_completed' => false, // TODO: Implement quiz completion
                            'is_locked' => false,
                            'sort_order' => $quiz->sort_order,
                        ];
                    });

                // Merge and Sort
                $allItems = $lessons->concat($quizzes)->sortBy('sort_order')->values();

                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'lessons' => $allItems
                ];
            });

            $data = [
                'id' => $course->id,
                'title' => $course->title,
                'slug' => $course->slug,
                'thumbnail' => $course->thumbnail,
                'instructor_name' => $course->instructor->name,
                'is_enrolled' => $enrollment !== null,
                'progress' => $enrollment ? $enrollment->progress_percentage : 0,
                'sections' => $sections
            ];

            return $this->successResponse($data, 'Detail kursus berhasil dimuat.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat detail kursus.', 500);
        }
    }

    /**
     * Detail Materi Pelajaran (Mobile)
     */
    public function showLesson(Request $request, string $slug, int $lessonId): JsonResponse
    {
        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();
            
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            $isInstructor = $course->instructor_id === $user->id;
            $isBatchInstructor = \App\Models\Batch::whereHas('courses', function($q) use ($course) {
                $q->where('courses.id', $course->id);
            })->where(function($q) use ($user) {
                $q->where('instructor_id', $user->id)
                  ->orWhereHas('instructors', fn($iq) => $iq->where('users.id', $user->id));
            })->exists();

            if (!$enrollment && !$isInstructor && !$isBatchInstructor && !$user->hasRole('admin')) {
                return $this->errorResponse('Anda belum terdaftar di kursus ini.', 403);
            }

            $lesson = Lesson::with(['attachments'])
                ->find($lessonId);

            if (!$lesson) {
                return $this->errorResponse('Materi tidak ditemukan.', 404);
            }

            $completedLessons = $enrollment ? ($enrollment->completed_lessons ?? []) : [];

            // Navigasi
            $allLessons = Lesson::whereHas('section', function($q) use ($course) {
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
                ->when($enrollment && $enrollment->batch_id, function($q) use ($enrollment) {
                    $q->where('batch_id', $enrollment->batch_id);
                })
                ->first();

            // Bridge: If it's a quiz lesson but content is empty, try to get relational quiz data
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
                        }),
                        'last_result' => \App\Models\QuizResult::where('quiz_id', $relatedQuiz->id)
                            ->where('user_id', $user->id)
                            ->orderBy('created_at', 'desc')
                            ->first()
                    ];
                    $lesson->content = json_encode($legacyFormat);
                }
            }

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
                'is_completed' => in_array($lesson->id, $completedLessons),
                'attachments' => $lesson->attachments,
                'next_lesson_id' => $nextLessonId,
                'prev_lesson_id' => $prevLessonId,
                'assignment_id' => $assignment ? $assignment->id : null,
                'assignment_type' => $assignment ? $assignment->type : null,
            ];

            return $this->successResponse($data, 'Materi berhasil dimuat.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat materi.', 500);
        }
    }

    /**
     * Tandai Materi Selesai (Mobile)
     */
    public function markComplete(Request $request, string $slug, int $lessonId): JsonResponse
    {
        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();
            
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            $isInstructor = $course->instructor_id === $user->id;
            $isBatchInstructor = \App\Models\Batch::whereHas('courses', function($q) use ($course) {
                $q->where('courses.id', $course->id);
            })->where(function($q) use ($user) {
                $q->where('instructor_id', $user->id)
                  ->orWhereHas('instructors', fn($iq) => $iq->where('users.id', $user->id));
            })->exists();

            if (!$enrollment) {
                if ($isInstructor || $isBatchInstructor || $user->hasRole('admin')) {
                    // Instruktur/Admin tidak perlu track progress, langsung return success
                    return $this->successResponse(['progress' => 100], 'Materi selesai (Instructor preview).');
                }
                return $this->errorResponse('Anda belum terdaftar.', 403);
            }

            $completedLessons = $enrollment->completed_lessons ?? [];

            if (!in_array($lessonId, $completedLessons)) {
                $completedLessons[] = (int)$lessonId;
                
                $totalLessons = Lesson::whereHas('section', function($q) use ($course) {
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
                'progress' => $enrollment->progress_percentage
            ], 'Materi ditandai sebagai selesai.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memperbarui progres.', 500);
        }
    }

    /**
     * Daftar Kursus Mandiri (Enroll)
     */
    public function enroll(Request $request, string $slug): JsonResponse
    {
        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();

            // Cek jika sudah terdaftar
            if (Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->exists()) {
                return $this->errorResponse('Anda sudah terdaftar di kursus ini.', 409);
            }

            Enrollment::create([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'enrolled_at' => now(),
                'is_completed' => false,
                'progress_percentage' => 0,
            ]);

            return $this->successResponse(null, 'Berhasil mendaftar kursus.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mendaftar kursus.', 500);
        }
    }
}
