<?php

namespace Database\Seeders;

use App\Models\Lesson;
use App\Models\Quiz;
use App\Models\QuizQuestion;
use App\Models\QuizOption;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class MigrateQuizzesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();
        try {
            $quizLessons = Lesson::where('type', 'quiz')->get();

            foreach ($quizLessons as $lesson) {
                $content = $lesson->content;
                if (is_string($content)) {
                    $content = json_decode($content, true);
                }

                if (!$content || !isset($content['questions'])) {
                    echo "Skipping lesson ID {$lesson->id}: No questions found.\n";
                    continue;
                }

                $quiz = Quiz::create([
                    'section_id' => $lesson->section_id,
                    'title' => $lesson->title,
                    'description' => $content['description'] ?? null,
                    'time_limit' => $content['timeLimit'] ?? null,
                    'passing_score' => $content['passingScore'] ?? 70,
                    'sort_order' => $lesson->sort_order,
                    'is_published' => true,
                ]);

                foreach ($content['questions'] as $index => $qData) {
                    $question = QuizQuestion::create([
                        'quiz_id' => $quiz->id,
                        'question_text' => $qData['text'] ?? ($qData['question'] ?? 'No Question Text'),
                        'question_type' => 'multiple_choice',
                        'sort_order' => $index,
                    ]);

                    $options = $qData['options'] ?? [];
                    $correctId = $qData['correctOptionId'] ?? ($qData['answer'] ?? null);

                    foreach ($options as $optData) {
                        $optText = is_array($optData) ? ($optData['text'] ?? '') : $optData;
                        $optId = is_array($optData) ? ($optData['id'] ?? null) : $optData;
                        
                        QuizOption::create([
                            'quiz_question_id' => $question->id,
                            'option_text' => $optText,
                            'is_correct' => ($optId != null && $optId === $correctId) || ($optText === $correctId),
                        ]);
                    }
                }
                
                echo "Migrated Quiz: {$lesson->title}\n";
            }

            DB::commit();
            echo "Successfully migrated all quizzes.\n";
        } catch (\Exception $e) {
            DB::rollBack();
            echo "Error during migration: " . $e->getMessage() . "\n";
        }
    }
}
