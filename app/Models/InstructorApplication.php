<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InstructorApplication extends Model
{
    protected $fillable = [
        'user_id',
        'expertise',
        'experience',
        'portfolio_url',
        'motivation',
        'certificate_path',
        'status',
        'notes',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
