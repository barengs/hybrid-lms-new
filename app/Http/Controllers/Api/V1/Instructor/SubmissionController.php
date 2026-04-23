<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\Assignment;
use App\Services\AiGradingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Resources\Api\V1\SubmissionResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;

class SubmissionController extends Controller
{
    use ApiResponse;

    protected $aiService;

    public function __construct(AiGradingService $aiService)
    {
        $this->aiService = $aiService;
    }

    /**
     * Daftar Seluruh Pengumpulan Tugas
     * 
     * Mengambil daftar semua pengumpulan tugas dari siswa di kursus/kelas milik instruktur.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();

            $submissions = Submission::whereHas('assignment', function ($query) use ($user) {
                    $query->whereHas('batch.courses', function ($inner) use ($user) {
                        $inner->where('instructor_id', $user->id);
                    })->orWhereHas('lesson.section.course', function ($inner) use ($user) {
                        $inner->where('instructor_id', $user->id);
                    });
                })
                ->with(['user.profile', 'assignment.batch.courses', 'assignment.lesson.section.course'])
                ->when($request->status, function ($query, $status) {
                    if ($status === 'pending') {
                        $query->whereIn('status', ['submitted', 'late']);
                    } else {
                        $query->where('status', $status);
                    }
                })
                ->when($request->type, function ($query, $type) {
                    $query->whereHas('assignment', function($q) use ($type) {
                        $q->where('type', $type);
                    });
                })
                ->orderBy('submitted_at', 'desc')
                ->paginate($request->per_page ?? 10);

            return $this->successResponse(
                SubmissionResource::collection($submissions)->response()->getData(true),
                'Submissions retrieved successfully.'
            );

        } catch (\Exception $e) {
            Log::error('Instructor Submission List Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve submissions.', 500);
        }
    }

    /**
     * Detail Pengumpulan
     */
    public function show(string $id): JsonResponse
    {
        try {
            $submission = Submission::with(['user.profile', 'assignment.batch.courses', 'assignment.lesson.section.course'])
                ->findOrFail($id);

            return $this->successResponse(new SubmissionResource($submission), 'Submission details retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Submission not found.', 404);
        }
    }

    /**
     * Beri Nilai Manual
     */
    public function grade(Request $request, string $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'points_awarded' => ['required', 'numeric', 'min:0'],
                'instructor_feedback' => ['nullable', 'string'],
            ]);

            $submission = Submission::findOrFail($id);

            $submission->update([
                'points_awarded' => $validated['points_awarded'],
                'instructor_feedback' => $validated['instructor_feedback'],
                'status' => 'graded',
                'graded_at' => now(),
                'graded_by' => $request->user()->id,
            ]);

            return $this->successResponse(new SubmissionResource($submission->load(['user', 'assignment'])), 'Submission graded successfully.');
        } catch (\Exception $e) {
            Log::error('Instructor Grading Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to grade submission.', 500);
        }
    }

    /**
     * Pemicu Penilaian AI
     */
    public function aiGrade(string $id): JsonResponse
    {
        try {
            $submission = Submission::findOrFail($id);
            
            $submission->update(['ai_status' => 'processing']);
            
            $result = $this->aiService->evaluate($submission);
            
            if ($result) {
                return $this->successResponse(new SubmissionResource($submission->fresh(['user', 'assignment'])), 'AI evaluation completed successfully.');
            }

            return $this->errorResponse('AI evaluation failed or returned invalid result.', 500);

        } catch (\Exception $e) {
            Log::error('Instructor AI Grading Trigger Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to trigger AI evaluation.', 500);
        }
    }
}
