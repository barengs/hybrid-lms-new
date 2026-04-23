<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\AppSettingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CommissionController extends Controller
{
    protected $settingService;

    public function __construct(AppSettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Get commission and payout settings.
     */
    public function getSettings(): JsonResponse
    {
        $settings = [
            'platform_commission' => (float) $this->settingService->get('platform_commission', 20),
            'tax_withholding' => (float) $this->settingService->get('tax_withholding', 5),
            'minimum_payout' => (float) $this->settingService->get('minimum_payout', 100000),
            'payout_delay_days' => (int) $this->settingService->get('payout_delay_days', 7),
        ];

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Update commission and payout settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'platform_commission' => 'required|numeric|min:0|max:100',
            'tax_withholding' => 'required|numeric|min:0|max:100',
            'minimum_payout' => 'required|numeric|min:0',
            'payout_delay_days' => 'required|integer|min:0',
        ]);

        $this->settingService->set('platform_commission', $request->platform_commission, 'integer', 'finance');
        $this->settingService->set('tax_withholding', $request->tax_withholding, 'integer', 'finance');
        $this->settingService->set('minimum_payout', $request->minimum_payout, 'integer', 'finance');
        $this->settingService->set('payout_delay_days', $request->payout_delay_days, 'integer', 'finance');

        return response()->json([
            'success' => true,
            'message' => 'Commission settings updated successfully'
        ]);
    }
}
