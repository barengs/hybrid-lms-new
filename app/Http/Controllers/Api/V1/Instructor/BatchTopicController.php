<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BatchTopic;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use App\Traits\ApiResponse;

class BatchTopicController extends Controller
{
    use ApiResponse;

    public function index(Request $request, string $batchId): JsonResponse
    {
        try {
            $instructorId = $request->user()->id;
            $batch = Batch::where(function ($query) use ($instructorId) {
                    $query->whereHas('courses', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    })
                    ->orWhereHas('instructors', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    });
                })
                ->findOrFail($batchId);

            $topics = BatchTopic::where('batch_id', $batch->id)
                ->with(['sessions', 'assignments'])
                ->orderBy('sort_order', 'asc')
                ->get();

            return $this->successResponse($topics, 'Topics retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Batch not found or access denied.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Topic Index Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve topics.', 500);
        }
    }

    public function store(Request $request, string $batchId): JsonResponse
    {
        try {
            $instructorId = $request->user()->id;
            $batch = Batch::where(function ($query) use ($instructorId) {
                    $query->whereHas('courses', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    })
                    ->orWhereHas('instructors', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    });
                })
                ->findOrFail($batchId);

            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
            ]);

            $sortOrder = BatchTopic::where('batch_id', $batch->id)->max('sort_order') ?? 0;
            $validated['sort_order'] = $sortOrder + 1;
            $validated['batch_id'] = $batch->id;

            $topic = BatchTopic::create($validated);

            return $this->successResponse($topic, 'Topic created successfully.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Batch not found or access denied.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Topic Store Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to create topic.', 500);
        }
    }

    public function update(Request $request, string $batchId, string $topicId): JsonResponse
    {
        try {
            $instructorId = $request->user()->id;
            $batch = Batch::where(function ($query) use ($instructorId) {
                    $query->whereHas('courses', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    })
                    ->orWhereHas('instructors', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    });
                })
                ->findOrFail($batchId);

            $topic = BatchTopic::where('batch_id', $batch->id)->findOrFail($topicId);

            $validated = $request->validate([
                'title' => ['required', 'string', 'max:255'],
            ]);

            $topic->update($validated);

            return $this->successResponse($topic, 'Topic updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Topic or batch not found.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Topic Update Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to update topic.', 500);
        }
    }

    public function destroy(Request $request, string $batchId, string $topicId): JsonResponse
    {
        try {
            $instructorId = $request->user()->id;
            $batch = Batch::where(function ($query) use ($instructorId) {
                    $query->whereHas('courses', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    })
                    ->orWhereHas('instructors', function ($q) use ($instructorId) {
                        $q->where('instructor_id', $instructorId);
                    });
                })
                ->findOrFail($batchId);

            $topic = BatchTopic::where('batch_id', $batch->id)->findOrFail($topicId);
            $topic->delete();

            return $this->successResponse(null, 'Topic deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Topic or batch not found.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Topic Delete Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete topic.', 500);
        }
    }
}
