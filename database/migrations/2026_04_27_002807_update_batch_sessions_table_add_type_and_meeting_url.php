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
            $table->string('type')->default('material')->after('title'); // material, online_class
            $table->string('meeting_url')->nullable()->after('recording_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('batch_sessions', function (Blueprint $table) {
            $table->dropColumn(['type', 'meeting_url']);
        });
    }
};
