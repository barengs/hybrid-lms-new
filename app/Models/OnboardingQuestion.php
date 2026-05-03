<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OnboardingQuestion extends Model
{
    protected $fillable = [
        'question',
        'slug',
        'options',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'options' => 'array',
        'is_active' => 'boolean',
    ];
}
