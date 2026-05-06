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

            $sections = $course->sections->map(function ($section) use ($completedLessons) {
                return [
                    'id' => $section->id,
                    'title' => $section->title,
                    'lessons' => $section->lessons->map(function ($lesson) use ($completedLessons) {
                        return [
                            'id' => $lesson->id,
                            'title' => $lesson->title,
                            'type' => $lesson->type,
                            'duration' => $lesson->duration,
                            'is_completed' => in_array($lesson->id, $completedLessons),
                            'is_locked' => false,
                        ];
                    })
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

            if (!$enrollment) {
                return $this->errorResponse('Anda belum terdaftar di kursus ini.', 403);
            }

            $lesson = Lesson::with(['attachments'])
                ->find($lessonId);

            if (!$lesson) {
                return $this->errorResponse('Materi tidak ditemukan.', 404);
            }

            $completedLessons = $enrollment->completed_lessons ?? [];

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

            if (!$enrollment) {
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
