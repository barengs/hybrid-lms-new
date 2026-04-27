<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\BatchSession;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use App\Traits\ApiResponse;

class BatchSessionController extends Controller
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

            $sessions = $batch->sessions()->orderBy('session_date', 'asc')->get();

            return $this->successResponse($sessions, 'Sessions retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Batch not found or access denied.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Session Index Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to retrieve sessions.', 500);
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
                'batch_topic_id' => ['nullable', 'exists:batch_topics,id'],
                'type' => ['required', 'in:online_class,offline_class,material,video'],
                'description' => ['nullable', 'string'],
                'session_date' => ['nullable', 'date'],
                'duration' => ['nullable', 'string', 'max:255'],
                'meeting_url' => ['nullable', 'string'],
                'status' => ['nullable', 'in:upcoming,in_progress,completed'],
                'materials' => ['nullable', 'array'], // Can hold multiple links/filenames
            ]);

            // Handle file upload if the request contains 'file' (for materials)
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $path = $file->store('batch_materials/' . $batch->id, 'public');
                
                $materials = $validated['materials'] ?? [];
                $materials[] = [
                    'type' => 'file',
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ];
                $validated['materials'] = $materials;
            }

            if (!isset($validated['session_date'])) {
                $validated['session_date'] = now(); // Ensure session_date is not null
            }
            if (!isset($validated['status'])) {
                $validated['status'] = 'upcoming';
            }

            $session = $batch->sessions()->create($validated);

            return $this->successResponse($session, 'Session created successfully.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Batch not found or access denied.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Session Store Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to create session.', 500);
        }
    }

    public function update(Request $request, string $batchId, string $sessionId): JsonResponse
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

            $session = $batch->sessions()->findOrFail($sessionId);

            $validated = $request->validate([
                'title' => ['sometimes', 'string', 'max:255'],
                'batch_topic_id' => ['nullable', 'exists:batch_topics,id'],
                'type' => ['sometimes', 'in:online_class,offline_class,material,video'],
                'description' => ['nullable', 'string'],
                'session_date' => ['sometimes', 'date'],
                'duration' => ['nullable', 'string', 'max:255'],
                'meeting_url' => ['nullable', 'string'],
                'status' => ['sometimes', 'in:upcoming,in_progress,completed'],
                'materials' => ['nullable', 'array'],
            ]);

            // Handle file upload update if needed
            if ($request->hasFile('file')) {
                $file = $request->file('file');
                $path = $file->store('batch_materials/' . $batch->id, 'public');
                
                $materials = $session->materials ?? [];
                $materials[] = [
                    'type' => 'file',
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'url' => Storage::disk('public')->url($path),
                    'size' => $file->getSize(),
                    'mime_type' => $file->getMimeType()
                ];
                $validated['materials'] = $materials;
            }

            $session->update($validated);

            return $this->successResponse($session, 'Session updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422, $e->errors());
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Session or batch not found.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Session Update Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to update session.', 500);
        }
    }

    public function destroy(Request $request, string $batchId, string $sessionId): JsonResponse
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

            $session = $batch->sessions()->findOrFail($sessionId);

            // Delete associated files if any
            if (!empty($session->materials)) {
                foreach ($session->materials as $material) {
                    if (isset($material['path'])) {
                        Storage::disk('public')->delete($material['path']);
                    }
                }
            }

            $session->delete();

            return $this->successResponse(null, 'Session deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Session or batch not found.', 404);
        } catch (\Exception $e) {
            Log::error('Batch Session Delete Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to delete session.', 500);
        }
    }
}
