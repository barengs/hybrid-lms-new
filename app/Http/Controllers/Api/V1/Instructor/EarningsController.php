<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Services\InstructorFinancialService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class EarningsController extends Controller
{
    protected $financialService;

    public function __construct(InstructorFinancialService $financialService)
    {
        $this->financialService = $financialService;
    }

    /**
     * Get instructor earnings overview.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        $summary = $this->financialService->getEarningsSummary($user);
        $courseRevenue = $this->financialService->getRevenueByCourse($user);
        $transactions = $this->financialService->getRecentTransactions($user);

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $summary,
                'course_earnings' => $courseRevenue,
                'recent_transactions' => $transactions,
            ]
        ]);
    }
}
