<?php

namespace App\Http\Controllers\Api\V1\Classroom;

use App\Http\Controllers\Controller;
use App\Models\BatchSession;
use App\Models\BatchSessionComment;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;

class SessionCommentController extends Controller
{
    use ApiResponse;

    public function store(Request $request, $sessionId)
    {
        $request->validate([
            'comment' => 'required|string',
            'parent_id' => 'nullable|exists:batch_session_comments,id',
        ]);

        $session = BatchSession::findOrFail($sessionId);

        $comment = BatchSessionComment::create([
            'batch_session_id' => $session->id,
            'user_id' => $request->user()->id,
            'comment' => $request->comment,
            'parent_id' => $request->parent_id,
        ]);

        return $this->successResponse(
            $comment->load('user.profile'),
            'Comment posted successfully',
            201
        );
    }
}
