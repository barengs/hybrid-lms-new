<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use Illuminate\Http\JsonResponse;

class PublicSettingController extends Controller
{
    /**
     * Get public platform settings.
     */
    public function index(): JsonResponse
    {
        $keys = [
            'platform_name',
            'platform_tagline',
            'logo',
            'favicon',
            'maintenance_mode',
            'maintenance_message',
            'default_language'
        ];

        $settings = AppSetting::whereIn('key', $keys)->pluck('value', 'key');

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }
}
