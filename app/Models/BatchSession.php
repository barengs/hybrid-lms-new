<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchSession extends Model
{
    protected $fillable = [
        'batch_id',
        'batch_topic_id',
        'title',
        'type',
        'description',
        'session_date',
        'duration',
        'recording_url',
        'meeting_url',
        'status',
        'materials',
    ];

    protected function casts(): array
    {
        return [
            'session_date' => 'datetime',
            'materials' => 'array',
        ];
    }

    public function batch()
    {
        return $this->belongsTo(Batch::class);
    }

    public function topic()
    {
        return $this->belongsTo(BatchTopic::class, 'batch_topic_id');
    }



    public function comments()
    {
        return $this->hasMany(BatchSessionComment::class);
    }
}
