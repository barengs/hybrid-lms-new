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

            $val = $setting->casted_value;
            
            if ($key === 'ai_api_key' && !empty($val)) {
                try {
                    $val = \Illuminate\Support\Facades\Crypt::decryptString($val);
                } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
                    // Fallback jika data sebelumnya belum dienkripsi
                }
            }
            
            return $val;
        });
    }

    /**
     * Update or create a setting.
     */
    public function set(string $key, $value, string $type = 'string', string $group = 'general')
    {
        if ($key === 'ai_api_key' && !empty($value)) {
            $value = \Illuminate\Support\Facades\Crypt::encryptString($value);
        }

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
        $provider = $this->get('ai_provider', config('prism.default_provider', 'ollama'));
        $defaultModel = strtolower($provider) === 'gemini' ? 'gemini-1.5-flash' : 'llama3';

        return [
            'provider' => $provider,
            'model' => $this->get('ai_model', $defaultModel),
            'temperature' => $this->get('ai_temperature', 0.7),
            'api_key' => $this->get('ai_api_key', ''),
        ];
    }
}
