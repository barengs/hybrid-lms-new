<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    $course = \App\Models\Course::first();
    $reviews = \App\Models\CourseReview::with('user.profile')->where('course_id', $course->id)->get()->map(function ($review) {
        $avatar = $review->user->profile && $review->user->profile->avatar
            ? url('storage/' . $review->user->profile->avatar)
            : null;
        
        return [
            'id' => $review->id,
            'user_name' => $review->user->name,
            'user_avatar' => $avatar,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at->toIso8601String(),
        ];
    });
    
    // Simulate API Response
    $response = response()->json([
        'success' => true,
        'message' => 'Test',
        'data' => $reviews,
    ]);
    
    echo $response->getContent();
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
