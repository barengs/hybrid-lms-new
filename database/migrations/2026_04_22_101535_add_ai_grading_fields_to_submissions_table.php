<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->integer('ai_score')->nullable()->after('points_awarded');
            $table->text('ai_feedback')->nullable()->after('ai_score');
            $table->enum('ai_status', ['pending', 'processing', 'completed', 'failed'])->default('pending')->after('ai_feedback');
            $table->timestamp('ai_evaluated_at')->nullable()->after('ai_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('submissions', function (Blueprint $table) {
            $table->dropColumn(['ai_score', 'ai_feedback', 'ai_status', 'ai_evaluated_at']);
        });
    }
};
