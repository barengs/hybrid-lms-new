<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClassroomResource extends JsonResource
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
            'name' => $this->name,
            'slug' => $this->slug,
            'thumbnail' => $this->thumbnail ? Storage::disk('public')->url($this->thumbnail) : null,
            'description' => $this->description,
            'class_code' => $this->class_code,
            'status' => $this->status,
            'type' => 'classroom',
            'instructor' => $this->whenLoaded('instructor', function() {
                return [
                    'id' => $this->instructor->id,
                    'name' => $this->instructor->name,
                    'email' => $this->instructor->email,
                    'avatar' => $this->instructor->profile->avatar ?? null, 
                ];
            }),
            'courses' => $this->whenLoaded('courses', function() {
                return $this->courses->map(function($course) {
                    return [
                        'id' => $course->id,
                        'title' => $course->title,
                        'slug' => $course->slug,
                        'thumbnail' => $course->thumbnail,
                        'sections_count' => $course->sections_count ?? $course->sections()->count(),
                        // Map Sections as Topics
                        'topics' => $course->relationLoaded('sections') ? $course->sections->map(function($section) {
                            return [
                                'id' => $section->id,
                                'title' => $section->title,
                                'materials_count' => $section->relationLoaded('lessons') ? $section->lessons->count() : 0,
                                // Map Lessons as Materials
                                'materials' => $section->relationLoaded('lessons') ? $section->lessons->map(function($lesson) {
                                            return [
                                                'id' => $lesson->id,
                                                'title' => $lesson->title,
                                                'type' => $lesson->type, // video, document, etc.
                                                'content_url' => $lesson->content_url, // if applicable
                                                'duration' => $lesson->duration,
                                            ];
                                        }) : [],
                                    ];
                                }) : [],
                        'pivot' => $course->pivot ?? null,
                    ];
                });
            }),
            'sessions' => $this->whenLoaded('sessions', function() {
                return $this->sessions->map(function($session) {
                    return [
                        'id' => $session->id,
                        'batch_topic_id' => $session->batch_topic_id,
                        'title' => $session->title,
                        'type' => $session->type,
                        'description' => $session->description,
                        'sessionDate' => $session->session_date,
                        'duration' => $session->duration,
                        'recordingUrl' => $session->recording_url,
                        'meetingUrl' => $session->meeting_url,
                        'status' => $session->status,
                        'materials' => $session->materials ?? [],
                        'comments' => $session->relationLoaded('comments') ? $session->comments->map(function($comment) {
                            return [
                                'id' => $comment->id,
                                'comment' => $comment->comment,
                                'created_at' => $comment->created_at,
                                'user' => [
                                    'name' => $comment->user->name,
                                    'avatar' => $comment->user->profile->avatar ?? null,
                                ],
                                'replies' => $comment->relationLoaded('replies') ? $comment->replies->map(function($reply) {
                                    return [
                                        'id' => $reply->id,
                                        'comment' => $reply->comment,
                                        'created_at' => $reply->created_at,
                                        'user' => [
                                            'name' => $reply->user->name,
                                            'avatar' => $reply->user->profile->avatar ?? null,
                                        ],
                                    ];
                                }) : [],
                            ];
                        }) : [],
                    ];
                });
            }),
            'additionalMaterials' => $this->whenLoaded('additionalMaterials', function() {
                return $this->additionalMaterials->map(function($attachment) {
                    return [
                        'id' => $attachment->id,
                        'title' => $attachment->title,
                        'type' => $attachment->file_type,
                        'size' => round($attachment->file_size / 1024 / 1024, 2) . ' MB',
                        'uploadedAt' => $attachment->created_at,
                        'url' => $attachment->url,
                    ];
                });
            }),
            'assignments' => $this->whenLoaded('assignments', function() {
                return $this->assignments->map(function($assignment) {
                    $submission = $assignment->submissions->first(); // Since we filtered by current user in controller
                    return [
                        'id' => $assignment->id,
                        'batch_topic_id' => $assignment->batch_topic_id,
                        'title' => $assignment->title,
                        'description' => $assignment->description,
                        'due_date' => $assignment->due_date,
                        'status' => $submission ? $submission->status : 'pending',
                        'grade' => $submission ? $submission->score : null,
                        'totalPoints' => $assignment->max_points,
                    ];
                });
            }),
            'classwork_topics' => $this->whenLoaded('batchTopics', function() {
                return $this->batchTopics->map(function($topic) {
                    $topicSessions = $this->sessions ? $this->sessions->where('batch_topic_id', $topic->id)->values() : collect();
                    $topicAssignments = $this->assignments ? $this->assignments->where('batch_topic_id', $topic->id)->values() : collect();
                    
                    return [
                        'id' => $topic->id,
                        'title' => $topic->title,
                        'sort_order' => $topic->sort_order,
                        // Map the items to a unified format or separate them
                        'sessions' => $topicSessions->map(function($session) {
                            return [
                                'id' => $session->id,
                                'title' => $session->title,
                                'type' => $session->type,
                                'sessionDate' => $session->session_date,
                                'meetingUrl' => $session->meeting_url,
                            ];
                        }),
                        'assignments' => $topicAssignments->map(function($assignment) {
                            return [
                                'id' => $assignment->id,
                                'title' => $assignment->title,
                                'due_date' => $assignment->due_date,
                            ];
                        }),
                    ];
                });
            }),
            'timeline' => $this->whenLoaded('activities', function() {
                return $this->activities->map(function($activity) {
                    $item = $activity->activityable;
                    $type = strtolower(class_basename($item));
                    if ($type === 'batchsession') $type = 'session';
                    
                    $isCompleted = $activity->completions->isNotEmpty();

                    return [
                        'id' => $activity->id,
                        'title' => $item->title ?? $item->name,
                        'type' => $type,
                        'reference_id' => $item->id,
                        'slug' => $item->slug ?? null,
                        'sort_order' => $activity->sort_order,
                        'is_required' => $activity->is_required,
                        'is_completed' => $isCompleted,
                        'completed_at' => $isCompleted ? $activity->completions->first()->completed_at : null,
                        'meta' => [
                            'thumbnail' => $item->thumbnail ?? null,
                            'duration' => $item->duration ?? null,
                            'date' => $item->session_date ?? $item->due_date ?? null,
                        ]
                    ];
                });
            }),
            'students_count' => $this->current_students,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'is_open_for_enrollment' => $this->is_open_for_enrollment,
            'course' => $this->whenLoaded('courses', function() {
                $course = $this->courses->first();
                return $course ? [
                    'id' => $course->id,
                    'title' => $course->title,
                    'slug' => $course->slug,
                    'thumbnail' => $course->thumbnail,
                ] : null;
            }),
            'topicsCount' => $this->whenLoaded('courses', function() {
                return $this->courses->sum(function($course) {
                    return $course->sections->count();
                });
            }),
            'materialsCount' => $this->whenLoaded('courses', function() {
                return $this->courses->sum(function($course) {
                    return $course->sections->sum(function($section) {
                        return $section->lessons->count();
                    });
                });
            }),
            'averageGrade' => $this->grades->avg('overall_score') ?? 0,
            
            // Student specific fields
            'is_enrolled' => $this->whenLoaded('enrollments', function() use ($request) {
                 return $this->enrollments->contains('user_id', $request->user()->id ?? 0);
            }),
            
            // Instructor View: Detailed Student List
            'students' => $this->whenLoaded('enrollments', function() {
                return $this->enrollments->map(function($enrollment) {
                    $grade = $this->grades->where('user_id', $enrollment->user_id)->first();
                    return [
                        'id' => $enrollment->user_id,
                        'name' => $enrollment->student->name ?? 'Unknown',
                        'email' => $enrollment->student->email ?? 'N/A',
                        'avatar' => $enrollment->student->profile->avatar ?? null,
                        'joined_at' => $enrollment->enrolled_at,
                        'progress' => $enrollment->progress_percentage,
                        'assignments_completed' => 0, // Placeholder - requires heavy query or cache
                        'assignments_total' => 0,    // Placeholder
                        'grade_score' => $grade->overall_score ?? null,
                        'grade_letter' => $grade->letter_grade ?? null,
                    ];
                });
            }),
            // Instructor View: Assessment Stats
            'assessment_stats' => $this->whenLoaded('assignments', function() {
                $totalAssignments = $this->assignments->count();
                // Submissions requiring grading: submitted but not graded
                $ungradedCount = 0;
                
                // This is N+1 if not careful, but for a single batch detail it's acceptable or needs eager loading 'assignments.submissions'
                foreach ($this->assignments as $assignment) {
                     // We need to count submissions where status is 'submitted'
                     // Assuming 'submissions' relation is loaded or we load it now
                     $ungradedCount += $assignment->submissions()->where('status', 'submitted')->count();
                }

                return [
                    'assignments_count' => $totalAssignments,
                    'ungraded_submissions_count' => $ungradedCount,
                    'class_average_score' => $this->grades->avg('overall_score') ?? 0,
                    'achieving_students_count' => $this->grades->where('overall_score', '>=', 80)->count(),
                    'needs_attention_count' => $this->grades->where('overall_score', '<', 50)->count(),
                ];
            }),
        ];
    }
}
