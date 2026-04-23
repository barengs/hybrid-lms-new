<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class InstructorManagementController extends Controller
{
    /**
     * Display a listing of instructors.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::role('instructor')->with(['profile']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $instructors = $query->latest()->paginate($request->get('per_page', 10));

        // Adding placeholder stats for now (Revenue, Rating)
        // In a real scenario, these would be calculated via joins or aggregations
        $instructors->getCollection()->transform(function ($instructor) {
            $instructor->stats = [
                'coursesCreated' => DB::table('courses')->where('instructor_id', $instructor->id)->count(),
                'totalStudents' => 0, // Placeholder
                'totalRevenue' => 0, // Placeholder
                'rating' => 0, // Placeholder
            ];
            return $instructor;
        });

        return response()->json([
            'success' => true,
            'data' => $instructors
        ]);
    }

    /**
     * Get instructor management statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => User::role('instructor')->count(),
            'active' => User::role('instructor')->where('status', 'active')->count(),
            'pending' => User::role('instructor')->where('status', 'pending')->count(),
            'suspended' => User::role('instructor')->where('status', 'suspended')->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Display the specified instructor.
     */
    public function show(User $instructor): JsonResponse
    {
        if (!$instructor->isInstructor()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not an instructor'
            ], 404);
        }

        $instructor->load(['profile', 'courses', 'courses.category']);
        
        // Load batches (classes) where this user is the primary instructor
        $batches = \App\Models\Batch::where('instructor_id', $instructor->id)
            ->with(['enrollments'])
            ->get();

        // Calculate detailed stats
        $instructor->stats = [
            'totalCourses' => $instructor->courses->count(),
            'publishedCourses' => $instructor->courses->where('status', 'published')->count(),
            'totalClasses' => $batches->count(),
            'totalStudents' => $batches->sum('current_students'),
            'totalRevenue' => 0, // Placeholder for now
            'averageRating' => $instructor->courses->avg('rating') ?: 0,
            'totalReviews' => 0, // Placeholder for now
        ];

        // Format courses for the frontend
        $instructor->courses_data = $instructor->courses->map(function($course) {
            return [
                'id' => $course->id,
                'title' => $course->title,
                'thumbnail' => $course->thumbnail,
                'category' => $course->category?->name ?? 'Uncategorized',
                'studentsEnrolled' => 0, // Placeholder
                'rating' => $course->rating ?: 0,
                'price' => $course->price,
                'status' => $course->status,
                'created_at' => $course->created_at,
            ];
        });

        // Format batches for the frontend
        $instructor->batches_data = $batches->map(function($batch) {
            return [
                'id' => $batch->id,
                'name' => $batch->name,
                'courseTitle' => $batch->name, // Or join with courses if needed
                'studentsCount' => $batch->current_students,
                'schedule' => $batch->description, // Or use a schedule field if available
                'status' => $batch->status,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $instructor
        ]);
    }

    /**
     * Update instructor status.
     */
    public function updateStatus(Request $request, User $instructor): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:active,suspended,pending,rejected'
        ]);

        if (!$instructor->isInstructor()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not an instructor'
            ], 404);
        }

        $instructor->status = $request->status;
        $instructor->save();

        return response()->json([
            'success' => true,
            'message' => "Instructor status updated to {$request->status}",
            'data' => ['status' => $instructor->status]
        ]);
    }

    /**
     * Remove the specified instructor.
     */
    public function destroy(User $instructor): JsonResponse
    {
        if (!$instructor->isInstructor()) {
            return response()->json([
                'success' => false,
                'message' => 'User is not an instructor'
            ], 404);
        }

        $instructor->delete();

        return response()->json([
            'success' => true,
            'message' => 'Instructor deleted successfully'
        ]);
    }
}
