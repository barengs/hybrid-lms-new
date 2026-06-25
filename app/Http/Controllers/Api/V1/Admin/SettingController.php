<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AppSetting;
use App\Services\AppSettingService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class SettingController extends Controller
{
    protected $settingService;

    public function __construct(AppSettingService $settingService)
    {
        $this->settingService = $settingService;
    }

    /**
     * Get all settings grouped by group.
     */
    public function index(): JsonResponse
    {
        $settings = AppSetting::all();
        
        // Mask the AI API key so it doesn't get double-encrypted when saving via UI
        $settings->transform(function ($setting) {
            if ($setting->key === 'ai_api_key' && !empty($setting->value)) {
                $setting->value = '********';
            }
            return $setting;
        });

        return response()->json([
            'success' => true,
            'data' => $settings->groupBy('group')
        ]);
    }

    /**
     * Update bulk settings.
     */
    public function updateBulk(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'nullable',
            'settings.*.type' => 'sometimes|string',
            'settings.*.group' => 'sometimes|string',
        ]);

        foreach ($request->settings as $item) {
            // Skip updating if it's the masked API key
            if ($item['key'] === 'ai_api_key' && $item['value'] === '********') {
                continue;
            }
            
            $this->settingService->set(
                $item['key'],
                $item['value'],
                $item['type'] ?? 'string',
                $item['group'] ?? 'general'
            );
        }

        return response()->json([
            'success' => true,
            'message' => 'Settings updated successfully'
        ]);
    }

    /**
     * Upload media (e.g. logo, favicon) and update setting.
     */
    public function uploadMedia(Request $request): JsonResponse
    {
        $request->validate([
            'key' => 'required|string',
            'file' => 'required|image|max:2048', // max 2MB
        ]);

        $key = $request->key;
        $file = $request->file('file');
        
        $path = '';

        if ($key !== 'favicon') {
            // Convert to WebP for everything except favicon
            $image = Image::read($file);
            $filename = $key . '_' . time() . '.webp';
            $encoded = $image->toWebp(80);
            Storage::disk('public')->put('settings/' . $filename, $encoded);
            $path = 'storage/settings/' . $filename;
        } else {
            // Store favicon directly (usually .ico or .png)
            $filename = $key . '_' . time() . '.' . $file->getClientOriginalExtension();
            $pathStr = $file->storeAs('settings', $filename, 'public');
            $path = 'storage/' . $pathStr;
        }

        $this->settingService->set($key, $path, 'string', 'general');

        return response()->json([
            'success' => true,
            'message' => ucfirst($key) . ' uploaded successfully',
            'url' => asset($path),
            'path' => $path
        ]);
    }
}
