<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TransactionController extends Controller
{
    use ApiResponse;

    /**
     * List all transactions with filters and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Order::with(['user:id,name,email', 'items.course:id,title,thumbnail', 'payments' => function($q) {
                $q->latest()->limit(1);
            }]);

            // Search filter (Order Number, User Name, Course Title)
            if ($request->has('search')) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', function ($q) use ($search) {
                            $q->where('name', 'like', "%{$search}%")
                                ->orWhere('email', 'like', "%{$search}%");
                        })
                        ->orWhereHas('items', function ($q) use ($search) {
                            $q->where('course_title', 'like', "%{$search}%");
                        });
                });
            }

            // Status filter
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            // Sort
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            $perPage = $request->get('per_page', 10);
            $transactions = $query->paginate($perPage);

            return $this->successResponse($transactions, 'Transactions retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve transactions: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get transaction statistics.
     */
    public function stats(): JsonResponse
    {
        try {
            $now = Carbon::now();
            $startOfMonth = $now->copy()->startOfMonth();
            $startOfLastMonth = $now->copy()->subMonth()->startOfMonth();
            $endOfLastMonth = $now->copy()->subMonth()->endOfMonth();

            // Total Stats
            $totalTransactions = Order::count();
            $completedTransactions = Order::where('status', 'paid')->count();
            $pendingTransactions = Order::where('status', 'pending')->count();
            $failedTransactions = Order::whereIn('status', ['failed', 'expired', 'cancelled'])->count();
            $refundedTransactions = Order::where('status', 'refunded')->count();

            // Revenue Stats
            $totalRevenue = Order::where('status', 'paid')->sum('total');
            $thisMonthRevenue = Order::where('status', 'paid')
                ->where('paid_at', '>=', $startOfMonth)
                ->sum('total');
            
            $lastMonthRevenue = Order::where('status', 'paid')
                ->whereBetween('paid_at', [$startOfLastMonth, $endOfLastMonth])
                ->sum('total');

            // Growth calculation
            $revenueGrowth = 0;
            if ($lastMonthRevenue > 0) {
                $revenueGrowth = (($thisMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100;
            } else if ($thisMonthRevenue > 0) {
                $revenueGrowth = 100;
            }

            $averageTransaction = $completedTransactions > 0 ? $totalRevenue / $completedTransactions : 0;

            return $this->successResponse([
                'total' => $totalTransactions,
                'completed' => $completedTransactions,
                'pending' => $pendingTransactions,
                'failed' => $failedTransactions,
                'refunded' => $refundedTransactions,
                'total_revenue' => (float)$totalRevenue,
                'this_month_revenue' => (float)$thisMonthRevenue,
                'revenue_growth' => round($revenueGrowth, 2),
                'average_transaction' => (float)$averageTransaction,
            ], 'Transaction statistics retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve statistics: ' . $e->getMessage(), 500);
        }
    }

    /**
     * Get transaction detail.
     */
    public function show($id): JsonResponse
    {
        try {
            $order = Order::with(['user', 'items.course', 'payments'])->findOrFail($id);
            return $this->successResponse($order, 'Transaction details retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Transaction not found.', 404);
        }
    }
}
