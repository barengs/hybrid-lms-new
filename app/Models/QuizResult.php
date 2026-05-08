<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizResult extends Model
{
    protected $fillable = [
        'quiz_id',
        'user_id',
        'score',
        'correct_answers',
        'total_questions',
        'answers',
        'passed',
        'completed_at',
    ];

    protected $casts = [
        'answers' => 'array',
        'passed' => 'boolean',
        'completed_at' => 'datetime',
    ];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
