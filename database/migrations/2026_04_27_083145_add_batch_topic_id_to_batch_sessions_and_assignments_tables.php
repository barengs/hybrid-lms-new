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
        Schema::table('batch_sessions', function (Blueprint $table) {
            $table->foreignId('batch_topic_id')->nullable()->constrained()->nullOnDelete();
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->foreignId('batch_topic_id')->nullable()->constrained()->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_sessions', function (Blueprint $table) {
            $table->dropForeign(['batch_topic_id']);
            $table->dropColumn('batch_topic_id');
        });

        Schema::table('assignments', function (Blueprint $table) {
            $table->dropForeign(['batch_topic_id']);
            $table->dropColumn('batch_topic_id');
        });
    }
};
