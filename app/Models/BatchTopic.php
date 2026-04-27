<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BatchTopic extends Model
{
    use HasFactory;

    protected $fillable = [
        'batch_id',
        'title',
        'sort_order',
    ];

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function sessions()
    {
        return $this->hasMany(BatchSession::class)->orderBy('session_date');
    }

    public function assignments()
    {
        return $this->hasMany(Assignment::class)->orderBy('due_date');
    }
}
