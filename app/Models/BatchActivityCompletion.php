<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchActivityCompletion extends Model
{
    protected $fillable = [
        'user_id',
        'batch_activity_id',
        'completed_at',
    ];

    protected $casts = [
        'completed_at' => 'datetime',
    ];

    public function activity()
    {
        return $this->belongsTo(BatchActivity::class, 'batch_activity_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
