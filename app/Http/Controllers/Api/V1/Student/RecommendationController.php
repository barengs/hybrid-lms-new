<?php

namespace App\Http\Controllers\Api\V1\Student;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Course;
use EchoLabs\Prism\Facades\Prism;
use EchoLabs\Prism\Enums\Provider;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

use App\Http\Resources\Api\V1\CourseResource;
use App\Traits\ApiResponse;
use Illuminate\Support\Facades\Log;

class RecommendationController extends Controller
{
    use ApiResponse;
    /**
     * Get onboarding questions.
     * 
     * Returns a pool of random questions from the database.
     */
    public function getOnboardingQuestions(): JsonResponse
    {
        $questions = \App\Models\OnboardingQuestion::where('is_active', true)
            ->inRandomOrder()
            ->limit(5)
            ->get();

        return $this->successResponse($questions, 'Onboarding questions fetched successfully.');
    }

    /**
     * Submit onboarding interests and get recommendations.
     */
    public function submitInterests(Request $request): JsonResponse
    {
        $request->validate([
            'answers' => 'required|array',
        ]);

        try {
            $user = $request->user();
            $answers = $request->input('answers');

            // 1. Save interests to profile
            $user->profile()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'interests' => $answers,
                    'onboarding_completed' => true
                ]
            );

            // 2. Fetch data for AI analysis
            // Course pool (Random published courses)
            $allCourses = Course::with('category:id,name')
                ->published()
                ->limit(20)
                ->get();

            // Popular courses (Top 5 by total_enrollments)
            $popularCourses = Course::published()
                ->orderBy('total_enrollments', 'desc')
                ->limit(5)
                ->get();

            // 3. Prepare AI Prompt
            $userProfileText = "User: {$user->name}. Interests: " . json_encode($answers);
            
            $coursePoolJson = $allCourses->map(fn($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'category' => $c->category->name ?? 'General',
                'description' => $c->description
            ])->toJson();

            $popularJson = $popularCourses->map(fn($c) => [
                'id' => $c->id,
                'title' => $c->title,
                'popularity' => 'High'
            ])->toJson();

            $prompt = "
                Anda adalah konsultan pendidikan AI. 
                Profil Siswa: {$userProfileText}
                
                Daftar Kursus Tersedia: {$coursePoolJson}
                
                Kursus Paling Diminati (Popular): {$popularJson}
                
                Tugas Anda:
                1. Berikan rekomendasi 3 kursus yang paling cocok dengan minat dan gaya belajar siswa.
                2. Berikan alasan singkat dalam Bahasa Indonesia mengapa kursus tersebut direkomendasikan (tailored feedback).
                3. Utamakan kursus populer jika relevan dengan minat mereka, namun tetap utamakan kecocokan minat.

                Format output wajib JSON murni:
                {
                    \"recommended_ids\": [1, 2, 3],
                    \"reasoning\": \"Berdasarkan minat Anda pada... kami merekomendasikan...\"
                }
                Jangan berikan teks penjelasan lain.
            ";

            try {
                $response = Prism::text()
                    ->using(Provider::Gemini, 'gemini-flash-latest')
                    ->withPrompt($prompt)
                    ->generate();

                $aiResult = json_decode($response->text, true);
                $recommendedIds = $aiResult['recommended_ids'] ?? [];
                $reasoning = $aiResult['reasoning'] ?? 'Kami merekomendasikan kursus ini berdasarkan minat Anda.';

                if (empty($recommendedIds)) {
                    $enrolledIds = $user->enrollments()->whereNotNull('course_id')->pluck('course_id')->toArray();
                    $recommendedIds = Course::published()
                        ->where('type', 'self_paced')
                        ->whereNotIn('id', $enrolledIds)
                        ->limit(3)
                        ->pluck('id')
                        ->toArray();
                }

                $recommendations = Course::whereIn('id', $recommendedIds)
                    ->with('instructor', 'category')
                    ->get();

            } catch (\Exception $e) {
                Log::error('AI Recommendation Error: ' . $e->getMessage());
                $recommendations = $popularCourses->take(3);
                $reasoning = 'Kami merekomendasikan kursus populer pilihan kami untuk memulai perjalanan Anda.';
            }

            return $this->successResponse([
                'courses' => CourseResource::collection($recommendations),
                'reasoning' => $reasoning
            ], 'Interests submitted and recommendations generated.');

        } catch (\Exception $e) {
            Log::error('Onboarding Submission Error: ' . $e->getMessage());
            return $this->errorResponse('Failed to process onboarding.', 500);
        }
    }

    /**
     * Rekomendasi Kursus (Dashboard)
     */
    public function recommend(Request $request): JsonResponse
    {
        try {
            $user = $request->user();
            $interests = $user->profile->interests ?? [];
            
            // Get already enrolled course IDs to exclude them
            $enrolledIds = $user->enrollments()->whereNotNull('course_id')->pluck('course_id')->toArray();

            if (empty($interests)) {
                $recommendations = Course::with('instructor', 'category')
                    ->published()
                    ->where('type', 'self_paced') // Only recommend public/general materials
                    ->whereNotIn('id', $enrolledIds)
                    ->orderBy('total_enrollments', 'desc')
                    ->limit(3)
                    ->get();
                
                return $this->successResponse(
                    CourseResource::collection($recommendations),
                    'Popular general courses recommended.'
                );
            }

            // Fetch pool of courses excluding enrolled ones and restricted to self_paced
            $allCourses = Course::published()
                ->where('type', 'self_paced') // Only recommend public/general materials
                ->whereNotIn('id', $enrolledIds)
                ->limit(15)
                ->get();
            
            $prompt = "Siswa tertarik pada: " . json_encode($interests) . ". Rekomendasikan 3 ID kursus dari daftar ini: " . $allCourses->map(fn($c) => ['id' => $c->id, 'title' => $c->title, 'category' => $c->category->name ?? 'General'])->toJson() . ". Kembalikan hanya array ID dalam format JSON: [1, 2, 3]";
            
            try {
                $response = Prism::text()
                    ->using(Provider::Gemini, 'gemini-flash-latest')
                    ->withPrompt($prompt)
                    ->generate();

                $ids = json_decode($response->text, true);
                if (!is_array($ids)) {
                    // Try to extract array if AI wrapped it in markdown or text
                    preg_match('/\[.*\]/', $response->text, $matches);
                    $ids = isset($matches[0]) ? json_decode($matches[0], true) : [];
                }

                $recommendations = Course::whereIn('id', is_array($ids) ? $ids : [])
                    ->with('instructor', 'category')
                    ->get();
                    
                if ($recommendations->isEmpty()) {
                    $recommendations = $allCourses->take(3);
                }
            } catch (\Exception $e) {
                $recommendations = $allCourses->take(3);
            }

            return $this->successResponse(
                CourseResource::collection($recommendations), 
                'Recommendations generated based on interests.'
            );

        } catch (\Exception $e) {
            return $this->errorResponse('Failed to generate recommendations.', 500);
        }
    }
}
