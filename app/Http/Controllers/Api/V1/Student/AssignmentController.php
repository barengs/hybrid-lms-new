<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Jobs\GradeSubmission;
use App\Models\Assignment;
use App\Models\Batch;
use App\Models\Submission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Http\Resources\Api\V1\AssignmentResource;
use App\Http\Resources\Api\V1\SubmissionResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Intervention\Image\Laravel\Facades\Image;

class AssignmentController extends Controller
{
    use ApiResponse;

    /**
     * Daftar Tugas Saya
     * 
     * Mengambil daftar tugas yang harus dikerjakan siswa dari batch yang diikuti.
     *
     * @group Tugas Siswa
     * @queryParam batch_id string Filter berdasarkan ID Batch.
     * @responseField success boolean Status keberhasilan request.
     * @responseField data object[] Daftar tugas.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            
            $query = Assignment::query()
                ->whereHas('batch.enrollments', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->active();
                })
                ->where('is_published', true);

            if ($request->batch_id) {
                $query->where('batch_id', $request->batch_id);
            }

            $assignments = $query->with(['batch.courses:id,title', 'submissions' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->orderBy('due_date', 'asc')
                ->paginate($request->per_page ?? 10);

            // Map the collection to set mySubmission relation
            $assignments->getCollection()->each(function ($assignment) {
                $assignment->setRelation('mySubmission', $assignment->submissions->first());
            });

            return $this->successResponse(
                AssignmentResource::collection($assignments)->response()->getData(true), 
                'Assignments retrieved successfully.'
            );

        } catch (\Exception $e) {
            Log::error('Student Assignment List Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve assignments.', 500);
        }
    }

    /**
     * Detail Tugas
     * 
     * Melihat detail tugas dan status pengumpulan saya.
     *
     * @group Tugas Siswa
     * @responseField success boolean Status keberhasilan request.
     * @responseField data object Data detail tugas.
     */
    public function show(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();

            // Try to find the assignment:
            // 1) First, by its own primary key (assignment_id)
            // 2) Fallback: by lesson_id (for navigation from lesson/course pages)
            $assignment = Assignment::where('is_published', '=', true)
                ->whereHas('batch.enrollments', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->active();
                })
                ->with(['batch', 'submissions' => function($q) use ($user) {
                    $q->where('user_id', $user->id);
                }])
                ->where('id', $id)
                ->first();

            // Fallback: try lookup by lesson_id
            if (!$assignment) {
                $assignment = Assignment::where('is_published', '=', true)
                    ->whereHas('batch.enrollments', function ($q) use ($user) {
                        $q->where('user_id', $user->id)->active();
                    })
                    ->with(['batch', 'submissions' => function($q) use ($user) {
                        $q->where('user_id', $user->id);
                    }])
                    ->where('lesson_id', $id)
                    ->first();
            }

            if (!$assignment) {
                Log::warning("AssignmentController@show: Not found for user={$user->id} id={$id} (tried both assignment_id and lesson_id)");
                return $this->errorResponse('Assignment not found or access denied.', 404);
            }

            $assignment->setRelation('mySubmission', $assignment->submissions->first());

            return $this->successResponse(new AssignmentResource($assignment), 'Assignment details retrieved successfully.');

        } catch (\Exception $e) {
            Log::error('Assignment Detail Error: ' . $e->getMessage() . ' | ' . $e->getFile() . ':' . $e->getLine());
            return $this->errorResponse('Failed to retrieve assignment.', 500);
        }
    }

    /**
     * Kumpulkan Tugas
     * 
     * Mengirimkan jawaban (file atau teks) untuk tugas tertentu.
     *
     * @group Tugas Siswa
     * @bodyParam file file File tugas (opsional).
     * @bodyParam content string Jawaban teks / konten (opsional).
     * @responseField success boolean Status keberhasilan request.
     * @responseField data object Data pengumpulan.
     */
    public function submit(Request $request, string $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            // Try lookup by assignment ID first, then by lesson_id as fallback
            $assignment = Assignment::where('is_published', '=', true)
                ->whereHas('batch.enrollments', function ($q) use ($user) {
                    $q->where('user_id', $user->id)->active();
                })
                ->where('id', $id)
                ->first();

            if (!$assignment) {
                $assignment = Assignment::where('is_published', '=', true)
                    ->whereHas('batch.enrollments', function ($q) use ($user) {
                        $q->where('user_id', $user->id)->active();
                    })
                    ->where('lesson_id', $id)
                    ->first();
            }

            if (!$assignment) {
                return $this->errorResponse('Assignment not found.', 404);
            }

            // 1. Validation
            $request->validate([
                'file' => ['nullable', 'file', 'max:10240'], 
                'content' => ['nullable', 'string'],
                'answers' => ['nullable', 'array'],
            ]);

            if (!$request->hasFile('file') && !$request->filled('content') && !$request->filled('answers')) {
                return $this->errorResponse('Please provide a file, text content, or quiz answers.', 422);
            }

            // 2. Submission Handling
            $submission = Submission::where('assignment_id', $assignment->id)
                ->where('user_id', $user->id)
                ->first();

            if ($submission && !$assignment->allow_multiple_submissions) {
                return $this->errorResponse('Multiple submissions are not allowed.', 422);
            }

            $files = $submission ? ($submission->files ?? []) : [];
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $mimeType = $file->getMimeType();
                $fileName = $file->getClientOriginalName();
                $fileSize = $file->getSize();
                $path = '';

                if (str_starts_with($mimeType, 'image/')) {
                    $filenameUuid = Str::uuid() . '.webp';
                    $path = 'submissions/' . $filenameUuid;

                    $image = Image::read($file);
                    $image->scale(width: 800);
                    $encoded = $image->toWebp(quality: 80);
                    Storage::disk('public')->put($path, (string) $encoded);

                    $fileName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME) . '.webp';
                    $mimeType = 'image/webp';
                    $fileSize = strlen((string) $encoded);
                } else {
                     $path = $file->store('submissions', 'public');
                }

                $files[] = [
                    'path' => $path,
                    'name' => $fileName,
                    'size' => $fileSize,
                    'mime' => $mimeType,
                ];
            }

            // 3. Automated Grading for MCQ (Quiz)
            $pointsAwarded = null;
            $status = 'submitted';
            
            if ($assignment->type === 'quiz' && $request->filled('answers')) {
                $questions = $assignment->content['questions'] ?? [];
                $totalQuestions = count($questions);
                $correctCount = 0;
                
                if ($totalQuestions > 0) {
                    foreach ($questions as $question) {
                        $qId = $question['id'] ?? null;
                        $correctAnswer = $question['correct_answer'] ?? null;
                        
                        if ($qId && isset($request->answers[$qId]) && $request->answers[$qId] === $correctAnswer) {
                            $correctCount++;
                        }
                    }
                    
                    $pointsAwarded = ($correctCount / $totalQuestions) * $assignment->max_points;
                    $status = 'graded';
                }
            }

            // 4. Save/Update
            $isFirstSubmission = !$submission;
            if ($submission) {
                $submission->update([
                    'files' => $files, 
                    'content' => $request->content ?? $submission->content,
                    'answers' => $request->answers ?? $submission->answers,
                    'submitted_at' => now(),
                    'status' => $status,
                    'points_awarded' => $pointsAwarded ?? $submission->points_awarded,
                    'graded_at' => $status === 'graded' ? now() : $submission->graded_at,
                    'ai_status' => $status === 'graded' ? $submission->ai_status : 'pending',
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
                    'graded_at' => $status === 'graded' ? now() : null,
                    'ai_status' => $status === 'graded' ? 'completed' : 'pending',
                ]);
            }

            // 5. Dispatch AI Grading Job for non-quiz assignments (quiz already auto-graded)
            $needsAiGrading = $assignment->gradable && $assignment->type !== 'quiz';
            if ($needsAiGrading) {
                GradeSubmission::dispatch($submission)->onQueue('default');
                $submission->update(['ai_status' => 'processing']);
            }

            // 6. Build informative response for the student
            $submissionData = new SubmissionResource($submission->refresh());

            $responseMessage = match (true) {
                $status === 'graded' => 'Tugas berhasil dikumpulkan dan telah dinilai otomatis!',
                $needsAiGrading     => 'Tugas berhasil dikumpulkan! AI sedang mengevaluasi jawabanmu, hasilnya akan segera tersedia.',
                default             => 'Tugas berhasil dikumpulkan! Menunggu penilaian dari instruktur.',
            };

            $meta = [
                'submission_status' => $submission->status,
                'ai_status'         => $submission->ai_status ?? 'not_applicable',
                'is_first_submission' => $isFirstSubmission,
                'submitted_at'      => $submission->submitted_at,
            ];

            return response()->json([
                'success' => true,
                'message' => $responseMessage,
                'data'    => $submissionData,
                'meta'    => $meta,
            ], 200);

        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Exception $e) {
            Log::error('Assignment Submission Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to submit assignment.', 500);
        }
    }
}
