<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\Api\V1\DashboardResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Statistik & Tugas Mendatang
     * 
     * Mengambil statistik dashboard siswa termasuk pendaftaran aktif, kursus selesai, dan tugas mendatang (3 terdekat).
     *
     * @group Dashboard Siswa
     * @responseField success boolean Status keberhasilan request.
     * @responseField data object Data dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // 1. Active Enrollments
            $activeEnrollments = Enrollment::where('user_id', $user->id)
                ->active()
                ->count();

            // 2. Completed Courses
            $completedCourses = Enrollment::where('user_id', $user->id)
                ->completed()
                ->count();

            // 3. Upcoming Assignments (Due soon)
            $upcomingAssignments = Assignment::whereHas('batch.enrollments', function($q) use ($user) {
                    $q->where('user_id', $user->id)->active();
                })
                ->where('due_date', '>', now())
                ->orderBy('due_date', 'asc')
                ->take(3)
                ->with('batch.courses:id,title')
                ->get();

            $data = [
                'stats' => [
                    'active_enrollments' => $activeEnrollments,
                    'completed_courses' => $completedCourses,
                ],
                'upcoming_assignments' => $upcomingAssignments
            ];

            return $this->successResponse(new DashboardResource($data), 'Student dashboard data retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('Student Dashboard Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve dashboard data.', 500);
        }
    }

    /**
     * My Learning - Unified View
     * 
     * Get all learning paths: self-paced courses, enrolled batches, and joined classes.
     *
     * @group Dashboard Siswa
     */
    public function myLearning(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // 1. General Courses (self_paced)
            $generalCourses = Enrollment::where('user_id', $user->id)
                ->whereHas('course', function($q) {
                    $q->where('type', 'self_paced');
                })
                ->with(['course.instructor:id,name'])
                ->active()
                ->latest()
                ->get()
                ->map(function ($enrollment) {
                    return [
                        'type' => 'course',
                        'id' => $enrollment->course_id,
                        'title' => $enrollment->course->title,
                        'slug' => $enrollment->course->slug,
                        'thumbnail' => $enrollment->course->thumbnail,
                        'instructor' => $enrollment->course->instructor?->name,
                        'progress' => $enrollment->progress_percentage,
                        'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                    ];
                });

            // 2. Batches (structured)
            $enrolledBatches = \App\Models\Batch::whereHas('enrollments', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('type', 'structured')
                ->with(['courses:id,title,thumbnail', 'instructor:id,name', 'enrollments' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->latest()
                ->get()
                ->map(function ($batch) use ($user) {
                    $enrollment = $batch->enrollments->first();
                    return [
                        'type' => 'batch',
                        'id' => $batch->id,
                        'title' => $batch->name,
                        'class_code' => $batch->class_code,
                        'thumbnail' => $batch->courses->first()?->thumbnail,
                        'instructor' => $batch->instructor?->name,
                        'status' => $batch->status,
                        'start_date' => $batch->start_date?->toIso8601String(),
                        'end_date' => $batch->end_date?->toIso8601String(),
                        'enrolled_at' => $enrollment?->enrolled_at?->toIso8601String() ?? $batch->created_at->toIso8601String(),
                    ];
                });

            // 3. Classes (classroom)
            $enrolledClasses = \App\Models\Batch::whereHas('enrollments', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('type', 'classroom')
                ->with(['courses:id,title,thumbnail', 'instructor:id,name', 'enrollments' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->latest()
                ->get()
                ->map(function ($batch) use ($user) {
                    $enrollment = $batch->enrollments->first();
                    return [
                        'type' => 'class',
                        'id' => $batch->id,
                        'title' => $batch->name,
                        'class_code' => $batch->class_code,
                        'thumbnail' => $batch->courses->first()?->thumbnail,
                        'instructor' => $batch->instructor?->name,
                        'status' => $batch->status,
                        'start_date' => $batch->start_date?->toIso8601String(),
                        'end_date' => $batch->end_date?->toIso8601String(),
                        'enrolled_at' => $enrollment?->enrolled_at?->toIso8601String() ?? $batch->created_at->toIso8601String(),
                    ];
                });

            return $this->successResponse([
                'courses' => $generalCourses,
                'batches' => $enrolledBatches,
                'classes' => $enrolledClasses,
                'summary' => [
                    'total_courses' => $generalCourses->count(),
                    'total_batches' => $enrolledBatches->count(),
                    'total_classes' => $enrolledClasses->count(),
                ]
            ], 'My learning data retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('My Learning Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve learning data.', 500);
        }
    }
}
