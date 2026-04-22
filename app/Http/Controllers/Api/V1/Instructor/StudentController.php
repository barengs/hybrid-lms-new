<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;

class StudentController extends Controller
{
    use ApiResponse;

    /**
     * Get all students under this instructor's courses or classes (batches).
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        // 1. Retrieve enrollments for courses created by the instructor
        // 2. OR enrollments in batches/classrooms managed by the instructor
        // 3. AND the enrollment must be active/completed (for valid students)
        
        $enrollments = Enrollment::with(['user.profile', 'course', 'batch'])
            ->where(function ($query) use ($user) {
                // Group 1: Independent Courses
                $query->whereHas('course', function ($q) use ($user) {
                    $q->where('instructor_id', $user->id);
                })
                // Group 2: Classroom / Batches
                ->orWhereHas('batch', function ($q) use ($user) {
                    $q->where('instructor_id', $user->id);
                });
            })
            ->get();

        // Use the collection helper to group them cleanly by the user's ID
        $grouped = $enrollments->groupBy('user_id');

        $students = $grouped->map(function ($userEnrollments) {
            $firstRecord = $userEnrollments->first();
            $studentData = $firstRecord->user;

            $enrolledItems = $userEnrollments->map(function ($enroll) {
                // Determine if this is a classroom batch enrollment or independent course enrollment
                if ($enroll->batch_id !== null && $enroll->batch !== null) {
                    return [
                        'courseId' => 'batch-' . $enroll->batch->id,
                        'courseTitle' => $enroll->batch->name ?? 'Unknown Class',
                        'type' => 'class', // Flag indicator
                        'progress' => $enroll->progress_percentage ?? 0,
                        'enrolledAt' => $enroll->enrolled_at ? $enroll->enrolled_at->toIso8601String() : $enroll->created_at->toIso8601String(),
                        'lastAccessedAt' => $enroll->updated_at->toIso8601String(),
                        'completedLessons' => is_array($enroll->completed_lessons) ? count($enroll->completed_lessons) : 0,
                        'totalLessons' => 0, // Requires eager loading of batch->courses->lessons
                        'assignmentsCompleted' => 0, 
                        'totalAssignments' => 0, 
                        'quizzesPassed' => 0,
                        'totalQuizzes' => 0,
                        'status' => $enroll->is_completed ? 'completed' : 'active',
                    ];
                }

                // Default fallback to individual course
                return [
                    'courseId' => 'course-' . ($enroll->course ? $enroll->course->id : ''),
                    'courseTitle' => $enroll->course ? $enroll->course->title : 'Unknown Course',
                    'type' => 'course', // Flag indicator
                    'progress' => $enroll->progress_percentage ?? 0,
                    'enrolledAt' => $enroll->enrolled_at ? $enroll->enrolled_at->toIso8601String() : $enroll->created_at->toIso8601String(),
                    'lastAccessedAt' => $enroll->updated_at->toIso8601String(),
                    'completedLessons' => is_array($enroll->completed_lessons) ? count($enroll->completed_lessons) : 0,
                    'totalLessons' => 0, 
                    'assignmentsCompleted' => 0,
                    'totalAssignments' => 0,
                    'quizzesPassed' => 0,
                    'totalQuizzes' => 0,
                    'status' => $enroll->is_completed ? 'completed' : 'active',
                ];
            })->values()->toArray();

            // Calculate aggregations
            $totalProgressSum = array_reduce($enrolledItems, fn($carry, $item) => $carry + $item['progress'], 0);
            $totalEnrolled = count($enrolledItems);
            $completedCount = count(array_filter($enrolledItems, fn($c) => $c['status'] === 'completed'));
            
            // Generate avatar fallback if no DB image
            $avatarUrl = $studentData->profile && $studentData->profile->avatar 
                ? url('storage/' . $studentData->profile->avatar) 
                : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' . urlencode($studentData->name);

            return [
                'id' => 'student-' . $studentData->id,
                'name' => $studentData->name,
                'email' => $studentData->email,
                'avatar' => $avatarUrl,
                'enrolledCourses' => $enrolledItems,
                'totalProgress' => $totalEnrolled > 0 ? round($totalProgressSum / $totalEnrolled) : 0,
                'totalCoursesEnrolled' => $totalEnrolled,
                'totalCoursesCompleted' => $completedCount,
                'lastActiveAt' => $userEnrollments->max('updated_at')->toIso8601String(),
                'joinedAt' => $studentData->created_at->toIso8601String(),
            ];
        })->values()->toArray();

        return response()->json([
            'success' => true,
            'message' => 'Instructor students retrieved successfully.',
            'data' => $students
        ]);
    }
}
