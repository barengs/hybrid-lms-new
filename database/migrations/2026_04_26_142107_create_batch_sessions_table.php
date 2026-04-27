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
        Schema::create('batch_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('session_date');
            $table->string('duration')->nullable(); // e.g. "1 hour", "90 mins"
            $table->string('recording_url')->nullable();
            $table->string('status')->default('upcoming'); // upcoming, in_progress, completed
            $table->json('materials')->nullable(); // Array of material titles/links
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('batch_sessions');
    }
};
