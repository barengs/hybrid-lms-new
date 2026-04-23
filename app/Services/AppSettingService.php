<?php

namespace App\Services;

use App\Models\AppSetting;
use Illuminate\Support\Facades\Cache;

class AppSettingService
{
    /**
     * Get a setting value by key.
     */
    public function get(string $key, $default = null)
    {
        $cacheKey = "app_setting_{$key}";

        return Cache::rememberForever($cacheKey, function () use ($key, $default) {
            $setting = AppSetting::where('key', $key)->first();
            
            if (!$setting) {
                return $default;
            }

            return $setting->casted_value;
        });
    }

    /**
     * Update or create a setting.
     */
    public function set(string $key, $value, string $type = 'string', string $group = 'general')
    {
        $setting = AppSetting::updateOrCreate(
            ['key' => $key],
            [
                'value' => is_array($value) ? json_encode($value) : $value,
                'type' => $type,
                'group' => $group
            ]
        );

        Cache::forget("app_setting_{$key}");

        return $setting;
    }

    /**
     * Get AI configuration.
     */
    public function getAiConfig(): array
    {
        return [
            'provider' => $this->get('ai_provider', config('prism.default_provider', 'ollama')),
            'model' => $this->get('ai_model', 'llama3'), // Default to llama3 for ollama, or gemini-1.5-flash for gemini
            'temperature' => $this->get('ai_temperature', 0.7),
        ];
    }
}
