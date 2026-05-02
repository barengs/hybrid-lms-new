<?php

namespace App\Jobs;

use App\Models\Submission;
use App\Services\AiGradingService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class GradeSubmission implements ShouldQueue
{
    use Queueable, InteractsWithQueue, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds the job can run before timing out.
     */
    public int $timeout = 120;

    /**
     * Create a new job instance.
     */
    public function __construct(public Submission $submission)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AiGradingService $aiService): void
    {
        Log::info("GradeSubmission job started for submission ID: {$this->submission->id}");

        $this->submission->update(['ai_status' => 'processing']);

        $aiService->evaluate($this->submission);

        Log::info("GradeSubmission job completed for submission ID: {$this->submission->id}");
    }

    /**
     * Handle a job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("GradeSubmission job FAILED for submission ID: {$this->submission->id}. Error: " . $exception->getMessage());

        $this->submission->update([
            'ai_status' => 'failed',
            'ai_feedback' => 'Evaluasi AI gagal setelah beberapa percobaan.',
        ]);
    }
}
