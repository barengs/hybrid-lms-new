<?php

namespace App\Services;

use App\Models\Submission;
use EchoLabs\Prism\Prism;
use EchoLabs\Prism\Enums\Provider;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser;
use Illuminate\Support\Facades\Log;

class AiGradingService
{
    protected $pdfParser;
    protected $settingService;

    public function __construct(AppSettingService $settingService)
    {
        $this->pdfParser = new Parser();
        $this->settingService = $settingService;
    }

    /**
     * Evaluate a student submission using AI.
     */
    public function evaluate(Submission $submission)
    {
        try {
            $assignment = $submission->assignment;
            
            // 1. Gather all content
            $textContent = $submission->content ?? '';
            $filesContent = $this->extractFilesContent($submission->files ?? []);
            
            $fullContent = "Student Content: \n" . $textContent . "\n\nFiles Content: \n" . $filesContent;
            
            // 2. Prepare Prompt based on Assignment Type
            $context = "Assignment Title: {$assignment->title}\n";
            $context .= "Assignment Description: {$assignment->description}\n";
            $context .= "Max Points: {$assignment->max_points}\n";
            $type = $assignment->type; // assignment, project, etc.

            $prompt = $this->generatePrompt($context, $fullContent, $type);

            // 3. Get AI Config from Database
            $aiConfig = $this->settingService->getAiConfig();
            
            $providerEnum = match (strtolower($aiConfig['provider'])) {
                'gemini' => Provider::Gemini,
                'openai' => Provider::OpenAI,
                'anthropic' => Provider::Anthropic,
                default => Provider::Ollama,
            };
            
            $response = Prism::text()
                ->using($providerEnum, $aiConfig['model'])
                ->withPrompt($prompt)
                ->generate();

            $result = json_decode($response->text, true);

            if (!$result || !isset($result['score'])) {
                // Fallback attempt if JSON is wrapped in markdown
                if (preg_match('/\{.*\}/s', $response->text, $matches)) {
                    $result = json_decode($matches[0], true);
                }
            }

            if ($result) {
                $submission->update([
                    'ai_score' => $result['score'] ?? null,
                    'ai_feedback' => $result['feedback'] ?? 'No feedback provided.',
                    'ai_status' => 'completed',
                    'ai_evaluated_at' => now(),
                ]);
                
                return $result;
            }

            throw new \Exception("AI failed to return valid JSON: " . $response->text);

        } catch (\Exception $e) {
            Log::error("AI Grading Error for Submission {$submission->id}: " . $e->getMessage());
            
            $submission->update([
                'ai_status' => 'failed',
                'ai_feedback' => 'AI Evaluation failed: ' . $e->getMessage(),
            ]);
            
            return null;
        }
    }

    /**
     * Extract text from various file types.
     */
    protected function extractFilesContent(array $files): string
    {
        $allContent = "";
        
        foreach ($files as $file) {
            $path = $file['path'] ?? null;
            if (!$path || !Storage::disk('public')->exists($path)) continue;
            
            $extension = pathinfo($file['name'] ?? '', PATHINFO_EXTENSION);
            $allContent .= "--- File: {$file['name']} ---\n";

            try {
                if (in_array($extension, ['js', 'php', 'py', 'ts', 'html', 'css', 'txt', 'sql', 'json'])) {
                    $allContent .= Storage::disk('public')->get($path);
                } elseif ($extension === 'pdf') {
                    $pdf = $this->pdfParser->parseContent(Storage::disk('public')->get($path));
                    $allContent .= $pdf->getText();
                } else {
                    $allContent .= "[Binary file or unsupported format: {$extension}. Only metadata/name analyzed.]\n";
                }
            } catch (\Exception $e) {
                $allContent .= "[Error reading file: " . $e->getMessage() . "]\n";
            }
            
            $allContent .= "\n\n";
        }
        
        return $allContent;
    }

    /**
     * Generate prompt based on content and type.
     */
    protected function generatePrompt(string $context, string $content, string $type): string
    {
        $instructions = "You are an expert pedagogical AI. Your task is to grade a student submission.\n\n";
        $instructions .= "CONTEXT:\n{$context}\n\n";
        $instructions .= "STUDENT SUBMISSION CONTENT:\n{$content}\n\n";
        
        if ($type === 'project' || str_contains(strtolower($context), 'coding')) {
            $instructions .= "CRITERIA FOR CODING:\n";
            $instructions .= "- Logic correctness and functionality.\n";
            $instructions .= "- Code quality and readability (naming, indentation).\n";
            $instructions .= "- Efficient use of algorithms/data structures.\n";
            $instructions .= "- Adherence to best practices.\n\n";
        } else {
            $instructions .= "CRITERIA FOR ASSIGNMENT:\n";
            $instructions .= "- Completeness and accuracy.\n";
            $instructions .= "- Clarity of thought and structure.\n";
            $instructions .= "- Relevance to the task description.\n\n";
        }

        $instructions .= "FORMAT:\n";
        $instructions .= "Return your evaluation ONLY as a JSON object with keys 'score' (number) and 'feedback' (detailed string).\n";
        $instructions .= "Example: {\"score\": 85, \"feedback\": \"Excellent work...\"}\n";
        $instructions .= "Ensure the score is between 0 and the Max Points specified above.\n";
        $instructions .= "Do not include any other text or markdown blocks, only the JSON.";

        return $instructions;
    }
}
