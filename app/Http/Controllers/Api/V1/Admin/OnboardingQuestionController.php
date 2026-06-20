<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\OnboardingQuestion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class OnboardingQuestionController extends Controller
{
    /**
     * Display a listing of onboarding questions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = OnboardingQuestion::query();

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where('question', 'like', "%{$search}%");
        }

        $questions = $query->orderBy('sort_order')->orderBy('id')->get();

        return response()->json([
            'data' => $questions,
        ]);
    }

    /**
     * Store a newly created onboarding question.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:onboarding_questions'],
            'options' => ['required', 'array', 'min:2'],
            'options.*.value' => ['required', 'string', 'max:255'],
            'options.*.label' => ['required', 'string', 'max:255'],
            'options.*.icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        // Auto-generate slug if not provided
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['question']);
        }

        // Ensure unique slug
        $originalSlug = $validated['slug'];
        $counter = 1;
        while (OnboardingQuestion::where('slug', $validated['slug'])->exists()) {
            $validated['slug'] = $originalSlug . '-' . $counter++;
        }

        // Default sort_order to max + 1
        if (!isset($validated['sort_order'])) {
            $validated['sort_order'] = OnboardingQuestion::max('sort_order') + 1;
        }

        $question = OnboardingQuestion::create($validated);

        return response()->json([
            'message' => 'Onboarding question created successfully.',
            'data' => $question,
        ], 201);
    }

    /**
     * Display the specified onboarding question.
     */
    public function show(OnboardingQuestion $onboardingQuestion): JsonResponse
    {
        return response()->json([
            'data' => $onboardingQuestion,
        ]);
    }

    /**
     * Update the specified onboarding question.
     */
    public function update(Request $request, OnboardingQuestion $onboardingQuestion): JsonResponse
    {
        $validated = $request->validate([
            'question' => ['sometimes', 'required', 'string', 'max:500'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('onboarding_questions')->ignore($onboardingQuestion->id)],
            'options' => ['sometimes', 'required', 'array', 'min:2'],
            'options.*.value' => ['required', 'string', 'max:255'],
            'options.*.label' => ['required', 'string', 'max:255'],
            'options.*.icon' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $onboardingQuestion->update($validated);

        return response()->json([
            'message' => 'Onboarding question updated successfully.',
            'data' => $onboardingQuestion->fresh(),
        ]);
    }

    /**
     * Remove the specified onboarding question.
     */
    public function destroy(OnboardingQuestion $onboardingQuestion): JsonResponse
    {
        $onboardingQuestion->delete();

        return response()->json([
            'message' => 'Onboarding question deleted successfully.',
        ]);
    }

    /**
     * Reorder onboarding questions.
     */
    public function reorder(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'questions' => ['required', 'array'],
            'questions.*.id' => ['required', 'exists:onboarding_questions,id'],
            'questions.*.sort_order' => ['required', 'integer', 'min:0'],
        ]);

        foreach ($validated['questions'] as $item) {
            OnboardingQuestion::where('id', $item['id'])->update(['sort_order' => $item['sort_order']]);
        }

        return response()->json([
            'message' => 'Onboarding questions reordered successfully.',
        ]);
    }

    /**
     * Toggle active status of an onboarding question.
     */
    public function toggleActive(int $id): JsonResponse
    {
        $question = OnboardingQuestion::findOrFail($id);
        $question->update(['is_active' => !$question->is_active]);

        return response()->json([
            'message' => 'Onboarding question status updated.',
            'data' => $question->fresh(),
        ]);
    }
}
