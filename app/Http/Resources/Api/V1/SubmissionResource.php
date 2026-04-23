<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SubmissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'assignment_id' => $this->assignment_id,
            'student' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'avatar' => $this->user->profile->avatar_url ?? null,
            ],
            'assignment' => [
                'id' => $this->assignment->id,
                'title' => $this->assignment->title,
                'type' => $this->assignment->type,
                'due_date' => $this->assignment->due_date,
                'max_points' => $this->assignment->max_points,
                'is_class_based' => (bool)$this->assignment->batch_id,
                'class_info' => $this->assignment->batch ? [
                    'id' => $this->assignment->batch->id,
                    'name' => $this->assignment->batch->name,
                ] : null,
                'course_title' => $this->assignment->batch 
                    ? ($this->assignment->batch->courses->first()->title ?? 'N/A')
                    : ($this->assignment->lesson->section->course->title ?? 'N/A'),
            ],
            'content' => $this->content,
            'answers' => $this->answers,
            'files' => $this->files,
            'status' => $this->status,
            'submitted_at' => $this->submitted_at,
            'points_awarded' => $this->points_awarded,
            'instructor_feedback' => $this->instructor_feedback,
            'graded_at' => $this->graded_at,
            'ai_score' => $this->ai_score,
            'ai_feedback' => $this->ai_feedback,
            'ai_status' => $this->ai_status,
            'ai_evaluated_at' => $this->ai_evaluated_at,
        ];
    }
}
