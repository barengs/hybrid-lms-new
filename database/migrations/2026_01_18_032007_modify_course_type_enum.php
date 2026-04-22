<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Modify enum to include 'classroom' - working around Doctrine/SQLite limitation
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('courses', function (Blueprint $table) {
                $table->string('type')->default('self_paced')->change();
            });
        } else {
            DB::statement("ALTER TABLE courses MODIFY COLUMN type ENUM('self_paced', 'structured', 'classroom') DEFAULT 'self_paced'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert enum
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('courses', function (Blueprint $table) {
                $table->string('type')->default('self_paced')->change();
            });
        } else {
            DB::statement("ALTER TABLE courses MODIFY COLUMN type ENUM('self_paced', 'structured') DEFAULT 'self_paced'");
        }
    }
};
