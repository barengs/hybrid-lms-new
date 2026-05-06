<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\Enrollment;
use App\Http\Resources\Api\V1\ClassroomResource;
use App\Traits\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class BatchController extends Controller
{
    use ApiResponse;

    /**
     * Gabung Kelas via Class Code (Mobile)
     */
    public function join(Request $request): JsonResponse
    {
        $request->validate([
            'class_code' => 'required|string|size:6',
        ]);

        $batch = Batch::query()
            ->where('class_code', $request->class_code)
            ->first();

        if (!$batch) {
            return $this->errorResponse('Kode kelas tidak valid.', 404);
        }

        if (!$batch->is_open_for_enrollment) {
             return $this->errorResponse('Pendaftaran kelas ini sudah ditutup.', 403);
        }

        $user = $request->user();

        // Check if already enrolled
        if ($batch->enrollments()->where('user_id', $user->id)->exists()) {
             return $this->errorResponse('Anda sudah terdaftar di kelas ini.', 409);
        }

        // Create Enrollment
        Enrollment::create([
            'user_id' => $user->id,
            'course_id' => null,
            'batch_id' => $batch->id,
            'enrolled_at' => now(),
            'is_completed' => false,
            'progress_percentage' => 0,
        ]);

        $batch->increment('current_students', 1);

        return $this->successResponse(
            new ClassroomResource($batch->load(['courses', 'instructor'])),
            'Berhasil bergabung dengan kelas.'
        );
    }
}
