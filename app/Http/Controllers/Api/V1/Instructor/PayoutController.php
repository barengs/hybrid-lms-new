<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\InstructorPayout;
use App\Services\InstructorFinancialService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class PayoutController extends Controller
{
    protected $financialService;

    public function __construct(InstructorFinancialService $financialService)
    {
        $this->financialService = $financialService;
    }

    /**
     * Get instructor payout history.
     */
    public function index(Request $request): JsonResponse
    {
        $payouts = InstructorPayout::where('instructor_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $payouts
        ]);
    }

    /**
     * Request a new payout.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        $summary = $this->financialService->getEarningsSummary($user);
        $settings = $summary['settings'];

        $request->validate([
            'amount' => 'required|numeric|min:' . $settings['minimum_payout'],
            'method' => 'required|string',
            'account_info' => 'required|string',
        ]);

        if ($request->amount > $summary['available_for_withdraw']) {
            return response()->json([
                'success' => false,
                'message' => 'Insufficient balance for this withdrawal'
            ], 422);
        }

        $payout = InstructorPayout::create([
            'instructor_id' => $user->id,
            'amount' => $request->amount,
            'status' => 'pending',
            'method' => $request->method,
            'account_info' => $request->account_info,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payout request submitted successfully',
            'data' => $payout
        ]);
    }
}
