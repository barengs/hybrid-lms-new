<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CourseManagementController extends Controller
{
    /**
     * Display a listing of courses.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Course::with(['instructor', 'category']);

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhereHas('instructor', function($sq) use ($search) {
                      $sq->where('name', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Category filter
        if ($request->has('category_id') && $request->category_id !== 'all') {
            $query->where('category_id', $request->category_id);
        }

        $courses = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $courses
        ]);
    }

    /**
     * Get course management statistics.
     */
    public function stats(): JsonResponse
    {
        $stats = [
            'total' => Course::count(),
            'pending' => Course::where('status', 'pending')->count(),
            'published' => Course::where('status', 'published')->count(),
            'revision' => Course::where('status', 'revision')->count(),
            'rejected' => Course::where('status', 'rejected')->count(),
            'totalStudents' => Course::sum('total_enrollments'),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Display the specified course with curriculum.
     */
    public function show(Course $course): JsonResponse
    {
        $course->load([
            'instructor', 
            'category', 
            'sections', 
            'sections.lessons',
            'sections.lessons.attachments'
        ]);

        return response()->json([
            'success' => true,
            'data' => $course
        ]);
    }

    /**
     * Update course status.
     */
    public function updateStatus(Request $request, Course $course): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:published,revision,rejected,pending',
            'admin_feedback' => 'nullable|string'
        ]);

        $oldStatus = $course->status;
        $course->status = $request->status;
        
        if ($request->has('admin_feedback')) {
            $course->admin_feedback = $request->admin_feedback;
        }

        if ($request->status === 'published' && $oldStatus !== 'published') {
            $course->published_at = now();
        }

        $course->save();

        return response()->json([
            'success' => true,
            'message' => "Course status updated to {$request->status}",
            'data' => $course
        ]);
    }
}
