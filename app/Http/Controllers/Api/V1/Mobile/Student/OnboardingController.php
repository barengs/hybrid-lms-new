<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\OnboardingQuestion;
use App\Http\Resources\Api\V1\CourseResource;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Prism\Prism\Facades\Prism;
use Prism\Prism\Enums\Provider;

class OnboardingController extends Controller
{
    use ApiResponse;

    /**
     * Ambil Pertanyaan Onboarding (Mobile)
     */
    public function getQuestions(): JsonResponse
    {
        $questions = OnboardingQuestion::where('is_active', true)
            ->inRandomOrder()
            ->limit(5)
            ->get();

        return $this->successResponse($questions, 'Onboarding questions fetched.');
    }

    /**
     * Submit Jawaban Onboarding & Ambil Rekomendasi (Mobile)
     */
    public function submit(Request $request): JsonResponse
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        try {
            $user = $request->user();
            $answers = $request->input('answers');

            // Save to profile
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'interests' => $answers,
                    'onboarding_completed' => true
                ]
            );

            // Logic rekomendasi AI (Simplified for mobile)
            $allCourses = Course::published()
                ->where('type', 'self_paced')
                ->limit(15)
                ->get();

            $prompt = "User Interests: " . json_encode($answers) . ". Recommend 3 course IDs from: " . $allCourses->map(fn($c) => ['id' => $c->id, 'title' => $c->title])->toJson() . ". Return JSON array: [1, 2, 3]";

            try {
                $response = Prism::text()
                    ->using(Provider::Gemini, 'gemini-flash-latest')
                    ->withPrompt($prompt)
                    ->generate();

                $ids = json_decode($response->text, true);
                if (!is_array($ids)) {
                    preg_match('/\[.*\]/', $response->text, $matches);
                    $ids = isset($matches[0]) ? json_decode($matches[0], true) : [];
                }

                $recommendations = Course::whereIn('id', is_array($ids) ? $ids : [])
                    ->with('instructor', 'category')
                    ->get();
            } catch (\Exception $e) {
                $recommendations = $allCourses->take(3);
            }

            return $this->successResponse([
                'courses' => CourseResource::collection($recommendations),
                'message' => 'Onboarding completed successfully.'
            ], 'Onboarding processed.');

        } catch (\Exception $e) {
            Log::error('Mobile Onboarding Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to process onboarding.', 500);
        }
    }
}
