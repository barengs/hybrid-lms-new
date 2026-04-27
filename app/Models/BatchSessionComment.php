<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class BatchSessionComment extends Model
{
    protected $fillable = [
        'batch_session_id',
        'user_id',
        'comment',
        'parent_id',
    ];

    public function session()
    {
        return $this->belongsTo(BatchSession::class, 'batch_session_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function replies()
    {
        return $this->hasMany(BatchSessionComment::class, 'parent_id');
    }
}
