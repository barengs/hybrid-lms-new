<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Jobs\GradeSubmission;
use App\Models\Assignment;
use App\Models\Submission;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class AssignmentController extends Controller
{
    use ApiResponse;

    /**
     * Daftar Tugas (Mobile)
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $query = Assignment::query()
                ->where(function ($q) use ($user) {
                    $q->whereHas('batch.enrollments', function ($eq) use ($user) {
                        $eq->where('user_id', $user->id)->active();
                    })
                    ->orWhereHas('lesson.section.course.enrollments', function ($eq) use ($user) {
                        $eq->where('user_id', $user->id)->active();
                    });
                })
                ->where('is_published', true);

            $assignments = $query->with(['submissions' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->orderBy('due_date', 'asc')
                ->get()
                ->map(function($a) {
                    $submission = $a->submissions->first();
                    return [
                        'id' => $a->id,
                        'title' => $a->title,
                        'type' => $a->type,
                        'due_date' => $a->due_date,
                        'status' => $submission ? $submission->status : 'pending',
                        'score' => $submission ? $submission->points_awarded : null,
                    ];
                });

            return $this->successResponse($assignments, 'Daftar tugas berhasil dimuat.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat daftar tugas.', 500);
        }
    }

    /**
     * Detail Tugas & Kuis (Mobile)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();

            $assignment = Assignment::where('is_published', true)
                ->where('id', $id)
                ->with(['submissions' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->firstOrFail();

            $submission = $assignment->submissions->first();

            $data = [
                'id' => $assignment->id,
                'title' => $assignment->title,
                'description' => $assignment->description,
                'type' => $assignment->type,
                'content' => $assignment->content, // Questions for quiz, or instructions
                'due_date' => $assignment->due_date,
                'max_points' => $assignment->max_points,
                'submission' => $submission ? [
                    'status' => $submission->status,
                    'content' => $submission->content,
                    'answers' => $submission->answers,
                    'score' => $submission->points_awarded,
                    'ai_feedback' => $submission->ai_feedback,
                    'submitted_at' => $submission->submitted_at,
                ] : null
            ];

            return $this->successResponse($data, 'Detail tugas berhasil dimuat.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat detail tugas.', 500);
        }
    }

    /**
     * Submit Tugas / Kuis (Mobile)
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            $assignment = Assignment::findOrFail($id);

            $request->validate([
                'file' => 'nullable|file|max:10240',
                'content' => 'nullable|string',
                'answers' => 'nullable|array',
            ]);

            $submission = Submission::where('assignment_id', $assignment->id)
                ->where('user_id', $user->id)
                ->first();

            if ($submission && !$assignment->allow_multiple_submissions) {
                return $this->errorResponse('Anda sudah mengumpulkan tugas ini.', 422);
            }

            $files = $submission ? ($submission->files ?? []) : [];
            if ($request->hasFile('file')) {
                $path = $request->file('file')->store('submissions', 'public');
                $files[] = [
                    'path' => $path,
                    'name' => $request->file('file')->getClientOriginalName(),
                    'mime' => $request->file('file')->getMimeType(),
                ];
            }

            // Auto-grading untuk Kuis
            $pointsAwarded = null;
            $status = 'submitted';
            
            if ($assignment->type === 'quiz' && $request->filled('answers')) {
                $questions = $assignment->content['questions'] ?? [];
                $totalQuestions = count($questions);
                $correctCount = 0;
                
                foreach ($questions as $question) {
                    $qId = $question['id'] ?? null;
                    $correctAnswer = $question['correct_answer'] ?? null;
                    if (isset($request->answers[$qId]) && $request->answers[$qId] === $correctAnswer) {
                        $correctCount++;
                    }
                }
                
                $pointsAwarded = ($totalQuestions > 0) ? ($correctCount / $totalQuestions) * $assignment->max_points : 0;
                $status = 'graded';
            }

            if ($submission) {
                $submission->update([
                    'files' => $files,
                    'content' => $request->content ?? $submission->content,
                    'answers' => $request->answers ?? $submission->answers,
                    'submitted_at' => now(),
                    'status' => $status,
                    'points_awarded' => $pointsAwarded ?? $submission->points_awarded,
                ]);
            } else {
                $submission = Submission::create([
                    'assignment_id' => $assignment->id,
                    'user_id' => $user->id,
                    'files' => $files,
                    'content' => $request->content,
                    'answers' => $request->answers,
                    'submitted_at' => now(),
                    'status' => $status,
                    'points_awarded' => $pointsAwarded,
                ]);
            }

            // AI Grading Dispatch
            if ($assignment->gradable && $assignment->type !== 'quiz') {
                GradeSubmission::dispatch($submission);
                $submission->update(['ai_status' => 'processing']);
            }

            return $this->successResponse([
                'status' => $submission->status,
                'score' => $submission->points_awarded
            ], 'Tugas berhasil dikumpulkan.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengumpulkan tugas.', 500);
        }
    }
}
