<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\InstructorPayout;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class PayoutController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of payouts.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = InstructorPayout::with(['instructor:id,name,email', 'instructor.profile:id,user_id,avatar']);

            // Search filter
            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('instructor', function($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            $perPage = $request->get('per_page', 10);
            $payouts = $query->latest()->paginate($perPage);

            return $this->successResponse($payouts, 'Payouts retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve payouts: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get payout statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();

            $totalPayouts = InstructorPayout::where('status', 'completed')->sum('amount');
            $pendingAmount = InstructorPayout::where('status', 'pending')->sum('amount');
            $pendingCount = InstructorPayout::where('status', 'pending')->count();
            $thisMonthPayouts = InstructorPayout::where('status', 'completed')
                ->where('processed_at', '>=', $startOfMonth)
                ->sum('amount');
            
            $completedCount = InstructorPayout::where('status', 'completed')->count();
            $averagePayout = $completedCount > 0 ? $totalPayouts / $completedCount : 0;

            return $this->successResponse([
                'total_payouts' => (float)$totalPayouts,
                'pending_amount' => (float)$pendingAmount,
                'pending_count' => $pendingCount,
                'this_month_payouts' => (float)$thisMonthPayouts,
                'average_payout' => (float)$averagePayout,
            ], 'Payout statistics retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Approve a payout request.
     */
    public function approve(Request $request, $id): JsonResponse
    {
        try {
            $payout = InstructorPayout::findOrFail($id);
            
            if ($payout->status !== 'pending') {
                return $this->errorResponse('Payout is not in pending status.', 400);
            }

            $payout->update([
                'status' => 'completed',
                'processed_at' => Carbon::now(),
                'notes' => $request->get('notes', $payout->notes),
            ]);

            return $this->successResponse($payout, 'Payout approved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to approve payout: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Reject a payout request.
     */
    public function reject(Request $request, $id): JsonResponse
    {
        try {
            $request->validate([
                'reason' => 'required|string'
            ]);

            $payout = InstructorPayout::findOrFail($id);
            
            if ($payout->status !== 'pending') {
                return $this->errorResponse('Payout is not in pending status.', 400);
            }

            $payout->update([
                'status' => 'rejected',
                'processed_at' => Carbon::now(),
                'notes' => $request->reason,
            ]);

            return $this->successResponse($payout, 'Payout rejected successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to reject payout: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Display the specified payout.
     */
    public function show($id): JsonResponse
    {
        try {
            $payout = InstructorPayout::with(['instructor.profile'])->findOrFail($id);
            return $this->successResponse($payout, 'Payout detail retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Payout not found.', 404);
        }
    }
}
