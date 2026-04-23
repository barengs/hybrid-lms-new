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
        Schema::create('menus', function (Blueprint $create) {
            $create->id();
            $create->foreignId('parent_id')->nullable()->constrained('menus')->onDelete('cascade');
            $create->string('key')->unique();
            $create->string('label_id');
            $create->string('label_en');
            $create->string('route')->nullable();
            $create->string('icon')->nullable(); // Lucide icon name
            $create->string('permission_name')->nullable(); // Required Spatie permission
            $create->string('role_group')->default('admin'); // admin, instructor, student
            $create->integer('order')->default(0);
            $create->boolean('is_active')->default(true);
            $create->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('menus');
    }
};
