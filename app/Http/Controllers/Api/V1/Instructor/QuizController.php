<?php

namespace App\Http\Controllers\Api\V1\Instructor;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use App\Models\Section;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class QuizController extends Controller
{
    use ApiResponse;

    /**
     * List Quizzes
     */
    public function index(Request $request): JsonResponse
    {
        $quizzes = Quiz::whereHas('section.course', function ($query) use ($request) {
            $query->where('instructor_id', $request->user()->id);
        })
        ->with('section:id,title,course_id')
        ->withCount('questions')
        ->orderBy('updated_at', 'desc')
        ->get();

        return $this->successResponse($quizzes);
    }

    /**
     * Create Quiz (Relational v2)
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'section_id' => ['required', 'exists:sections,id'],
            'lesson_id' => ['nullable', 'exists:lessons,id'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_limit' => ['nullable', 'integer', 'min:0'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_published' => ['boolean'],
            'questions' => ['nullable', 'array'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.points' => ['required', 'integer', 'min:0'],
            'questions.*.type' => ['nullable', 'string'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.options.*.option_text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
        ]);

        // Verify section ownership
        $section = Section::findOrFail($validated['section_id']);
        if ($section->course->instructor_id != $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        try {
            return DB::transaction(function () use ($validated) {
                $quiz = Quiz::create([
                    'section_id' => $validated['section_id'],
                    'lesson_id' => $validated['lesson_id'] ?? null,
                    'title' => $validated['title'],
                    'description' => $validated['description'] ?? null,
                    'time_limit' => $validated['time_limit'] ?? 15,
                    'passing_score' => $validated['passing_score'] ?? 70,
                    'is_published' => $validated['is_published'] ?? false,
                    'sort_order' => Quiz::where('section_id', $validated['section_id'])->count() + 1,
                ]);

                if (!empty($validated['questions'])) {
                    foreach ($validated['questions'] as $qIndex => $qData) {
                        $question = $quiz->questions()->create([
                            'question_text' => $qData['question_text'],
                            'points' => $qData['points'],
                            'type' => $qData['type'] ?? 'multiple_choice',
                            'sort_order' => $qIndex + 1,
                        ]);

                        foreach ($qData['options'] as $oIndex => $oData) {
                            $question->options()->create([
                                'option_text' => $oData['option_text'],
                                'is_correct' => $oData['is_correct'],
                                'sort_order' => $oIndex + 1,
                            ]);
                        }
                    }
                }

                return $this->successResponse($quiz->load('questions.options'), 'Quiz created successfully.', 201);
            });
        } catch (\Exception $e) {
            Log::error('Instructor Quiz Creation Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to create quiz.', 500);
        }
    }

    /**
     * Show Quiz
     */
    public function show(Request $request, Quiz $quiz): JsonResponse
    {
        // Verify ownership
        if ($quiz->section->course->instructor_id != $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        return $this->successResponse($quiz->load('questions.options'));
    }

    /**
     * Update Quiz
     */
    public function update(Request $request, Quiz $quiz): JsonResponse
    {
        // Verify ownership
        if ($quiz->section->course->instructor_id != $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        $validated = $request->validate([
            'lesson_id' => ['nullable', 'exists:lessons,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'time_limit' => ['nullable', 'integer', 'min:0'],
            'passing_score' => ['nullable', 'integer', 'min:0', 'max:100'],
            'is_published' => ['boolean'],
            'questions' => ['nullable', 'array'],
            'questions.*.id' => ['nullable', 'integer'],
            'questions.*.question_text' => ['required', 'string'],
            'questions.*.points' => ['required', 'integer', 'min:0'],
            'questions.*.options' => ['required', 'array', 'min:2'],
            'questions.*.options.*.id' => ['nullable', 'integer'],
            'questions.*.options.*.option_text' => ['required', 'string'],
            'questions.*.options.*.is_correct' => ['required', 'boolean'],
        ]);

        try {
            return DB::transaction(function () use ($quiz, $validated) {
                $quiz->update([
                    'lesson_id' => $validated['lesson_id'] ?? $quiz->lesson_id,
                    'title' => $validated['title'] ?? $quiz->title,
                    'description' => $validated['description'] ?? $quiz->description,
                    'time_limit' => $validated['time_limit'] ?? $quiz->time_limit,
                    'passing_score' => $validated['passing_score'] ?? $quiz->passing_score,
                    'is_published' => $validated['is_published'] ?? $quiz->is_published,
                ]);

                if (isset($validated['questions'])) {
                    // This is a simple implementation: delete old questions and recreate
                    // For more efficiency, you'd sync them.
                    $quiz->questions()->delete();

                    foreach ($validated['questions'] as $qIndex => $qData) {
                        $question = $quiz->questions()->create([
                            'question_text' => $qData['question_text'],
                            'points' => $qData['points'],
                            'type' => 'multiple_choice',
                            'sort_order' => $qIndex + 1,
                        ]);

                        foreach ($qData['options'] as $oIndex => $oData) {
                            $question->options()->create([
                                'option_text' => $oData['option_text'],
                                'is_correct' => $oData['is_correct'],
                                'sort_order' => $oIndex + 1,
                            ]);
                        }
                    }
                }

                return $this->successResponse($quiz->load('questions.options'), 'Quiz updated successfully.');
            });
        } catch (\Exception $e) {
            Log::error('Instructor Quiz Update Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to update quiz.', 500);
        }
    }

    /**
     * Delete Quiz
     */
    public function destroy(Request $request, Quiz $quiz): JsonResponse
    {
        // Verify ownership
        if ($quiz->section->course->instructor_id != $request->user()->id) {
            return $this->errorResponse('Unauthorized.', 403);
        }

        $quiz->delete();

        return $this->successResponse(null, 'Quiz deleted successfully.');
    }
}
