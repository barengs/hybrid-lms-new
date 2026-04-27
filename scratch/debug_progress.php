<?php
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use App\Models\Course;
use App\Models\Enrollment;

$user = User::where('email', 'student@molang.com')->first();
$course = Course::where('slug', 'modern-web-development-with-react')->first();
$enrollment = Enrollment::where('user_id', $user->id)->where('course_id', $course->id)->first();

if (!$enrollment) {
    echo "Enrollment not found!\n";
    exit;
}

echo "User ID: {$user->id}\n";
echo "Course ID: {$course->id}\n";
echo "Progress: {$enrollment->progress_percentage}\n";
echo "Completed Lessons: " . json_encode($enrollment->completed_lessons) . "\n";

// Count total lessons
$totalLessons = \App\Models\Lesson::whereHas('section', function($q) use ($course) {
    $q->where('course_id', $course->id);
})->count();
echo "Total Lessons in DB: {$totalLessons}\n";

// Check if lessons in completed_lessons actually exist
$existingLessons = \App\Models\Lesson::whereIn('id', $enrollment->completed_lessons ?? [])->pluck('id')->toArray();
echo "Valid Lessons in Completed: " . json_encode($existingLessons) . "\n";
