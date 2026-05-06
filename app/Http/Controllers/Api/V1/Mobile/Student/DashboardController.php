<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Assignment;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\Api\V1\DashboardResource;
use App\Http\Resources\Api\V1\CourseResource;
use App\Models\Course;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Enums\Provider;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Dashboard Mobile - Statistik & Tugas
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

            // 3. Upcoming Assignments (Hanya ambil info dasar untuk mobile)
            $upcomingAssignments = Assignment::whereHas('batch.enrollments', function($q) use ($user) {
                    $q->where('user_id', $user->id)->active();
                })
                ->where('due_date', '>', now())
                ->orderBy('due_date', 'asc')
                ->take(5) // Beri sedikit lebih banyak untuk mobile scroll
                ->with('batch.courses:id,title')
                ->get();

            $data = [
                'stats' => [
                    'active_enrollments' => $activeEnrollments,
                    'completed_courses' => $completedCourses,
                ],
                'upcoming_assignments' => $upcomingAssignments
            ];

            return $this->successResponse(new DashboardResource($data), 'Mobile dashboard data retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('Mobile Student Dashboard Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve mobile dashboard data.', 500);
        }
    }

    /**
     * My Learning - Optimized for Mobile
     */
    public function myLearning(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            // Ambil semua tipe pembelajaran dengan struktur yang konsisten
            $generalCourses = Enrollment::where('user_id', $user->id)
                ->whereHas('course', function($q) {
                    $q->where('type', 'self_paced');
                })
                ->with(['course.instructor:id,name'])
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
                        'progress' => (int)$enrollment->progress_percentage,
                        'enrolled_at' => $enrollment->enrolled_at?->toIso8601String(),
                    ];
                });

            $enrolledBatches = \App\Models\Batch::whereHas('enrollments', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('type', 'structured')
                ->with(['courses:id,title,thumbnail', 'instructor:id,name', 'enrollments' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->latest()
                ->get()
                ->map(function ($batch) {
                    $enrollment = $batch->enrollments->first();
                    return [
                        'type' => 'batch',
                        'id' => $batch->id,
                        'title' => $batch->name,
                        'slug' => $batch->slug,
                        'class_code' => $batch->class_code,
                        'thumbnail' => $batch->courses->first()?->thumbnail,
                        'instructor' => $batch->instructor?->name,
                        'status' => $batch->status,
                        'progress' => (int)($enrollment?->progress_percentage ?? 0),
                        'enrolled_at' => $enrollment?->enrolled_at?->toIso8601String(),
                    ];
                });

            $enrolledClasses = \App\Models\Batch::whereHas('enrollments', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->where('type', 'classroom')
                ->with(['courses:id,title,thumbnail', 'instructor:id,name', 'enrollments' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->latest()
                ->get()
                ->map(function ($batch) {
                    $enrollment = $batch->enrollments->first();
                    return [
                        'type' => 'class',
                        'id' => $batch->id,
                        'title' => $batch->name,
                        'slug' => $batch->slug,
                        'class_code' => $batch->class_code,
                        'thumbnail' => $batch->courses->first()?->thumbnail,
                        'instructor' => $batch->instructor?->name,
                        'status' => $batch->status,
                        'progress' => (int)($enrollment?->progress_percentage ?? 0),
                        'enrolled_at' => $enrollment?->enrolled_at?->toIso8601String(),
                    ];
                });

            return $this->successResponse([
                'courses' => $generalCourses,
                'batches' => $enrolledBatches,
                'classes' => $enrolledClasses,
                'summary' => [
                    'total_all' => $generalCourses->count() + $enrolledBatches->count() + $enrolledClasses->count(),
                    'total_courses' => $generalCourses->count(),
                    'total_batches' => $enrolledBatches->count(),
                    'total_classes' => $enrolledClasses->count(),
                ]
            ], 'Mobile learning data retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('Mobile My Learning Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve mobile learning data.', 500);
        }
    }
    /**
     * Rekomendasi Kursus khusus Mobile
     */
    public function recommendations(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $interests = $user->profile->interests ?? [];
            $enrolledIds = $user->enrollments()->whereNotNull('course_id')->pluck('course_id')->toArray();

            if (empty($interests)) {
                $recommendations = Course::with('instructor', 'category')
                    ->published()
                    ->where('type', 'self_paced')
                    ->whereNotIn('id', $enrolledIds)
                    ->orderBy('total_enrollments', 'desc')
                    ->limit(3)
                    ->get();
                
                return $this->successResponse(
                    CourseResource::collection($recommendations),
                    'Popular courses recommended for mobile.'
                );
            }

            // AI analysis simplified for mobile response time
            $allCourses = Course::published()
                ->where('type', 'self_paced')
                ->whereNotIn('id', $enrolledIds)
                ->limit(10)
                ->get();
            
            $prompt = "Siswa tertarik pada: " . json_encode($interests) . ". Rekomendasikan 3 ID kursus dari daftar ini: " . $allCourses->map(fn($c) => ['id' => $c->id, 'title' => $c->title])->toJson() . ". Kembalikan hanya array ID dalam format JSON: [1, 2, 3]";
            
            try {
                $response = Prism::text()
                    ->using(Provider::Gemini, 'gemini-flash-latest')
                    ->withPrompt($prompt)
                    ->generate();

                $ids = json_decode($response->text, true);
                if (!is_array($ids)) {
                    preg_match('/\[.*\]/', $response->text, $matches);
                    $ids = isset($matches[0]) ? json_decode($matches[0], true) : [];
                }

                $recommendations = Course::whereIn('id', is_array($ids) ? $ids : [])
                    ->with('instructor', 'category')
                    ->get();
                    
                if ($recommendations->isEmpty()) {
                    $recommendations = $allCourses->take(3);
                }
            } catch (\Exception $e) {
                $recommendations = $allCourses->take(3);
            }

            return $this->successResponse(
                CourseResource::collection($recommendations), 
                'Mobile recommendations generated.'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to generate recommendations.', 500);
        }
    }
}
