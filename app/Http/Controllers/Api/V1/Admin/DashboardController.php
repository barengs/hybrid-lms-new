<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\Api\V1\DashboardResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Dapatkan Statistik Admin
     * 
     * Mengambil data statistik untuk dashboard admin termasuk total pengguna, instruktur, pendapatan, dan pesanan terbaru.
     *
     * @group Dashboard Admin
     * @responseField success boolean Status keberhasilan request.
     * @responseField message string Pesan respon.
     * @responseField data object Data statistik dashboard.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            // 1. User Stats
            $usersCount = User::count();
            $newUsersThisMonth = User::whereMonth('created_at', now()->month)->count();
            $instructorsCount = User::role('instructor')->count();
            $studentsCount = User::role('student')->count();
            
            // 2. Course Stats
            $totalCourses = Course::count();
            $newCoursesThisMonth = Course::whereMonth('created_at', now()->month)->count();
            $pendingCourseReviews = Course::where('status', 'pending')->count();

            // 3. Revenue Stats
            $totalRevenue = Order::where('status', 'paid')->sum('total');
            $revenueThisMonth = Order::where('status', 'paid')->whereMonth('created_at', now()->month)->sum('total');
            
            // 4. Pending Approvals
            $pendingInstructors = User::role('instructor')->whereNull('email_verified_at')->count();
            $pendingPayouts = \App\Models\InstructorPayout::where('status', 'pending')->count() ?? 0;
            $totalPayoutAmount = \App\Models\InstructorPayout::where('status', 'pending')->sum('amount') ?? 0;

            // 5. Recent Orders
            $recentOrders = Order::with(['user:id,name,email', 'items.course:id,title'])
                ->where('status', 'paid')
                ->latest()
                ->take(5)
                ->get()
                ->map(function ($order) {
                    return [
                        'id' => $order->id,
                        'user' => $order->user->name,
                        'course' => $order->items->first()?->course->title ?? 'Various Courses',
                        'amount' => $order->total,
                        'status' => 'completed',
                        'time' => $order->created_at->diffForHumans()
                    ];
                });

            // 6. Top Courses
            $topCourses = Course::with('instructor:id,name')
                ->withCount('enrollments')
                ->orderByDesc('enrollments_count')
                ->take(3)
                ->get()
                ->map(function ($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'instructor' => $course->instructor->name ?? 'Unknown',
                        'enrollments' => $course->enrollments_count,
                        'revenue' => Order::whereHas('items', function($q) use ($course) {
                            $q->where('course_id', $course->id);
                        })->where('status', 'paid')->sum('total')
                    ];
                });

            // 7. Pending Verifications Details
            $pendingVerificationsDetails = User::role('instructor')
                ->whereNull('email_verified_at')
                ->latest()
                ->take(3)
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->profile->avatar ?? null,
                        'appliedAt' => $user->created_at->format('Y-m-d')
                    ];
                });

            $data = [
                'stats' => [
                    'totalUsers' => $usersCount,
                    'newUsersThisMonth' => $newUsersThisMonth,
                    'totalCourses' => $totalCourses,
                    'newCoursesThisMonth' => $newCoursesThisMonth,
                    'totalRevenue' => $totalRevenue,
                    'revenueThisMonth' => $revenueThisMonth,
                    'pendingVerifications' => $pendingInstructors,
                    'pendingCourseReviews' => $pendingCourseReviews,
                    'pendingPayouts' => $pendingPayouts,
                    'totalPayoutAmount' => $totalPayoutAmount,
                ],
                'recent_transactions' => $recentOrders,
                'top_courses' => $topCourses,
                'pending_verifications' => $pendingVerificationsDetails,
            ];

            return $this->successResponse(new DashboardResource($data), 'Admin dashboard data retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('Admin Dashboard Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve dashboard data.', 500);
        }
    }
}
