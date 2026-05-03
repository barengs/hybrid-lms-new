<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchActivity extends Model
{
    protected $fillable = [
        'batch_id',
        'activityable_id',
        'activityable_type',
        'sort_order',
        'is_required',
    ];

    public function activityable()
    {
        return $this->morphTo();
    }

    public function completions()
    {
        return $this->hasMany(BatchActivityCompletion::class);
    }
}
