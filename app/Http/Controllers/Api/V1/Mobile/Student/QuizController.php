<?php

namespace App\Http\Controllers\Api\V1\Mobile\Student;

use App\Http\Controllers\Controller;
use App\Models\Quiz;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class QuizController extends Controller
{
    use ApiResponse;

    /**
     * Detail Kuis Baru (Mobile)
     */
    public function show(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            
            $quiz = Quiz::with(['questions' => function($q) {
                    $q->orderBy('sort_order');
                }, 'questions.options'])
                ->where('is_published', true)
                ->findOrFail($id);

            $lastResult = \App\Models\QuizResult::where('quiz_id', $quiz->id)
                ->where('user_id', $user->id)
                ->orderBy('created_at', 'desc')
                ->first();

            // Re-format to match mobile expectations if needed
            $data = [
                'id' => $quiz->id,
                'title' => $quiz->title,
                'description' => $quiz->description,
                'time_limit' => $quiz->time_limit,
                'passing_score' => $quiz->passing_score,
                'questions' => $quiz->questions->map(function($q) {
                    return [
                        'id' => $q->id,
                        'text' => $q->question_text,
                        'type' => $q->question_type,
                        'points' => $q->points,
                        'options' => $q->options->map(function($o) {
                            return [
                                'id' => $o->id,
                                'text' => $o->option_text,
                                'is_correct' => $o->is_correct, // Careful: only send this if teacher allows
                            ];
                        })
                    ];
                }),
                'results' => $lastResult ? [
                    'score' => $lastResult->score,
                    'correct_count' => $lastResult->correct_answers,
                    'total_questions' => $lastResult->total_questions,
                    'passed' => $lastResult->passed,
                    'completed_at' => $lastResult->completed_at,
                ] : null
            ];

            return $this->successResponse($data, 'Detail kuis berhasil dimuat.');
        } catch (\Exception $e) {
            return $this->errorResponse('Gagal memuat detail kuis.', 500);
        }
    }

    /**
     * Submit Kuis Baru (Mobile)
     */
    public function submit(Request $request, int $id): JsonResponse
    {
        try {
            $user = $request->user();
            $quiz = Quiz::with('questions.options')->findOrFail($id);
            
            $request->validate([
                'answers' => 'required|array',
            ]);

            $questions = $quiz->questions;
            $totalPoints = $questions->sum('points');
            $earnedPoints = 0;
            $correctCount = 0;

            foreach ($questions as $question) {
                $qId = $question->id;
                $userAnswerId = $request->answers[$qId] ?? null;
                
                // For multiple choice, check if the selected option is correct
                $correctOption = $question->options->where('is_correct', true)->first();
                
                if ($userAnswerId && $correctOption && $userAnswerId == $correctOption->id) {
                    $earnedPoints += $question->points;
                    $correctCount++;
                }
            }

            $score = ($totalPoints > 0) ? round(($earnedPoints / $totalPoints) * 100) : 0;
            $passed = $score >= $quiz->passing_score;

            // Track completion in enrollment
            if ($passed) {
                $section = $quiz->section;
                $courseId = $section->course_id;
                
                $enrollment = \App\Models\Enrollment::where('user_id', $user->id)
                    ->where('course_id', $courseId)
                    ->first();
                
                if ($enrollment) {
                    $completedQuizzes = $enrollment->completed_quizzes ?? [];
                    if (!in_array($quiz->id, $completedQuizzes)) {
                        $completedQuizzes[] = (int)$quiz->id;
                        
                        // Recalculate progress
                        $totalLessons = \App\Models\Lesson::whereHas('section', function($q) use ($courseId) {
                            $q->where('course_id', $courseId);
                        })->count();
                        
                        $totalQuizzes = \App\Models\Quiz::whereHas('section', function($q) use ($courseId) {
                            $q->where('course_id', $courseId);
                        })->count();
                        
                        $totalItems = $totalLessons + $totalQuizzes;
                        $completedItems = count($enrollment->completed_lessons ?? []) + count($completedQuizzes);
                        
                        $progress = ($totalItems > 0) ? round(($completedItems / $totalItems) * 100) : 100;
                        
                        $enrollment->update([
                            'completed_quizzes' => $completedQuizzes,
                            'progress_percentage' => $progress,
                            'is_completed' => ($progress >= 100),
                            'completed_at' => ($progress >= 100) ? now() : $enrollment->completed_at
                        ]);
                    }
                }
            }
            
            // Save to quiz_results
            \App\Models\QuizResult::create([
                'quiz_id' => $quiz->id,
                'user_id' => $user->id,
                'score' => $score,
                'correct_answers' => $correctCount,
                'total_questions' => $questions->count(),
                'answers' => $request->answers,
                'passed' => $passed,
                'completed_at' => now(),
            ]);
            
            return $this->successResponse([
                'score' => $score,
                'correct_count' => $correctCount,
                'total_questions' => $questions->count(),
                'passed' => $passed,
                'message' => $passed ? 'Selamat! Anda lulus kuis.' : 'Maaf, Anda belum lulus kuis ini.'
            ], 'Kuis berhasil dikumpulkan.');

        } catch (\Exception $e) {
            return $this->errorResponse('Gagal mengumpulkan kuis.', 500);
        }
    }
}
