<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\CourseReview;
use App\Models\Enrollment;
use App\Models\Submission;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    use ApiResponse;

    /**
     * Get list of reviews for a course.
     */
    public function index(Request $request, string $slug): JsonResponse
    {
        try {
            $course = Course::where('slug', $slug)->firstOrFail();
            
            $reviews = CourseReview::with('user.profile')
                ->where('course_id', $course->id)
                ->orderBy('created_at', 'desc')
                ->get()
                ->map(function ($review) {
                    $avatar = $review->user->profile && $review->user->profile->avatar
                        ? url('storage/' . $review->user->profile->avatar)
                        : null;
                    
                    return [
                        'id' => $review->id,
                        'user_name' => $review->user->name,
                        'user_avatar' => $avatar,
                        'rating' => $review->rating,
                        'comment' => $review->comment,
                        'created_at' => $review->created_at->toIso8601String(),
                    ];
                });

            return $this->successResponse($reviews, 'Ulasan berhasil dimuat.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat ulasan.', 500);
        }
    }

    /**
     * Store a new course review.
     */
    public function store(Request $request, string $slug): JsonResponse
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        try {
            $user = $request->user();
            $course = Course::where('slug', $slug)->firstOrFail();

            // Check if user is enrolled
            $enrollment = Enrollment::where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if (!$enrollment) {
                return $this->errorResponse('Anda belum mendaftar di kursus ini.', 403);
            }

            // Check if user has completed the course
            if ($enrollment->progress_percentage < 100) {
                return $this->errorResponse('Anda harus menyelesaikan seluruh materi sebelum dapat memberikan ulasan.', 403);
            }

            // Check if user has at least one graded submission
            $hasGradedSubmission = Submission::where('user_id', $user->id)
                ->whereHas('assignment.lesson.section', function ($q) use ($course) {
                    $q->where('course_id', $course->id);
                })
                ->whereIn('status', ['graded', 'reviewed'])
                ->exists();

            if (!$hasGradedSubmission) {
                return $this->errorResponse('Anda harus memiliki setidaknya satu tugas yang sudah dinilai oleh instruktur sebelum dapat memberikan ulasan.', 403);
            }

            // Check if user already reviewed
            $existingReview = CourseReview::where('course_id', $course->id)
                ->where('user_id', $user->id)
                ->first();

            if ($existingReview) {
                return $this->errorResponse('Anda sudah memberikan ulasan untuk kursus ini.', 409);
            }

            // Save review
            $review = CourseReview::create([
                'course_id' => $course->id,
                'user_id' => $user->id,
                'rating' => $request->rating,
                'comment' => $request->comment,
            ]);

            // Update course averages
            $totalReviews = CourseReview::where('course_id', $course->id)->count();
            $averageRating = CourseReview::where('course_id', $course->id)->avg('rating');

            $course->update([
                'total_reviews' => $totalReviews,
                'average_rating' => round($averageRating, 2),
            ]);

            return $this->successResponse($review, 'Ulasan berhasil disimpan.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal menyimpan ulasan.', 500);
        }
    }
}
