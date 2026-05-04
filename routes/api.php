<?php

use App\Http\Controllers\Api\V1\Admin\CategoryController;
use App\Http\Controllers\Api\V1\Auth\AuthController;
use App\Http\Controllers\Api\V1\Auth\EmailVerificationController;
use App\Http\Controllers\Api\V1\Auth\PasswordResetController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\CheckoutController;
use App\Http\Controllers\Api\V1\CourseCatalogController;
use App\Http\Controllers\Api\V1\DiscussionController;
use App\Http\Controllers\Api\V1\Instructor\AssignmentController;
use App\Http\Controllers\Api\V1\Instructor\BatchController;
use App\Http\Controllers\Api\V1\Instructor\CourseController;
use App\Http\Controllers\Api\V1\Instructor\LessonController;
use App\Http\Controllers\Api\V1\Instructor\SectionController;
use App\Http\Controllers\Api\V1\Instructor\SubmissionController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\SettingController as AdminSettingController;
use App\Http\Controllers\Api\V1\Admin\CommissionController as AdminCommissionController;
use App\Http\Controllers\Api\V1\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\V1\Admin\RoleManagementController;
use App\Http\Controllers\Api\V1\Instructor\DashboardController as InstructorDashboardController;
use App\Http\Controllers\Api\V1\Instructor\EarningsController as InstructorEarningsController;
use App\Http\Controllers\Api\V1\Instructor\PayoutController as InstructorPayoutController;
use App\Http\Controllers\Api\V1\PaymentWebhookController;
use App\Http\Controllers\Api\V1\Student\DashboardController as StudentDashboardController;
use App\Http\Controllers\Api\V1\Student\LearningController as StudentLearningController;
use App\Http\Controllers\Api\V1\Student\RecommendationController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::prefix('v1')->group(function () {
    /*
    |--------------------------------------------------------------------------
    | Authentication Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        // Public routes
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        // Password reset
        Route::post('/forgot-password', [PasswordResetController::class, 'sendResetLink']);
        Route::post('/reset-password', [PasswordResetController::class, 'reset']);

        // Protected auth routes
        Route::middleware('auth:api')->group(function () {
            Route::post('/refresh', [AuthController::class, 'refresh']);
            Route::get('/user', [AuthController::class, 'user']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });

        // Email verification (public - signed URL)
        Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware(['signed', 'throttle:6,1'])
            ->name('verification.verify');

        });

    // Global protected routes
    Route::middleware('auth:api')->group(function () {
        Route::get('/menus', [\App\Http\Controllers\Api\V1\MenuController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Public Category Routes (Read-only)
    |--------------------------------------------------------------------------
    */
    Route::prefix('categories')->group(function () {
        // Public GET endpoints - no authentication required
        Route::get('/', [CategoryController::class, 'index']);
        Route::get('/{category}', [CategoryController::class, 'show']);
    });

    /*
    |--------------------------------------------------------------------------
    | Admin Routes
    |--------------------------------------------------------------------------
    */
    // Admin Routes - Permission-based (Dynamic, no hardcoded roles)
    Route::prefix('admin')->middleware(['auth:api'])->group(function () {
        // Dashboard - any authenticated admin user
        Route::get('dashboard', [AdminDashboardController::class, 'index']);

        // Categories CRUD - permission-based
        Route::get('categories', [CategoryController::class, 'index'])->middleware('permission:manage categories');
        Route::post('categories', [CategoryController::class, 'store'])->middleware('permission:manage categories');
        Route::put('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:manage categories');
        Route::patch('categories/{category}', [CategoryController::class, 'update'])->middleware('permission:manage categories');
        Route::delete('categories/{category}', [CategoryController::class, 'destroy'])->middleware('permission:manage categories');
        Route::post('categories/reorder', [CategoryController::class, 'reorder'])->middleware('permission:manage categories');

        // Learning Paths CRUD - permission-based
        Route::middleware('permission:manage learning paths')->group(function () {
            Route::apiResource('learning-paths', \App\Http\Controllers\Api\V1\Admin\LearningPathController::class);
            Route::post('learning-paths/{learningPath}/courses', [\App\Http\Controllers\Api\V1\Admin\LearningPathController::class, 'addCourse']);
            Route::delete('learning-paths/{learningPath}/courses/{courseId}', [\App\Http\Controllers\Api\V1\Admin\LearningPathController::class, 'removeCourse']);
            Route::post('learning-paths/{learningPath}/reorder', [\App\Http\Controllers\Api\V1\Admin\LearningPathController::class, 'reorder']);
        });

        // User Management CRUD
        Route::middleware('permission:manage users')->group(function () {
            Route::get('users/stats', [AdminUserController::class, 'stats']);
            Route::post('users/bulk', [AdminUserController::class, 'bulkActions']);
            Route::post('users/{id}/restore', [AdminUserController::class, 'restore']);
            Route::post('users/{user}/toggle-status', [AdminUserController::class, 'toggleStatus']);
            Route::apiResource('users', AdminUserController::class);

            // Instructor Management
            Route::get('instructors/stats', [\App\Http\Controllers\Api\V1\Admin\InstructorManagementController::class, 'stats']);
            Route::patch('instructors/{instructor}/status', [\App\Http\Controllers\Api\V1\Admin\InstructorManagementController::class, 'updateStatus']);
            Route::apiResource('instructors', \App\Http\Controllers\Api\V1\Admin\InstructorManagementController::class);

            // Course Management
            Route::prefix('courses')->group(function () {
                Route::get('stats', [\App\Http\Controllers\Api\V1\Admin\CourseManagementController::class, 'stats']);
                Route::patch('{course}/status', [\App\Http\Controllers\Api\V1\Admin\CourseManagementController::class, 'updateStatus']);
            });
            Route::apiResource('courses', \App\Http\Controllers\Api\V1\Admin\CourseManagementController::class)->names('admin.courses');
        });

        // Role & Permission Management (Dynamic RBAC)
        Route::get('roles', [RoleManagementController::class, 'index']);
        Route::get('roles/matrix', [RoleManagementController::class, 'matrix']);
        Route::post('roles', [RoleManagementController::class, 'store']);
        Route::put('roles/{role}', [RoleManagementController::class, 'update']);
        Route::delete('roles/{role}', [RoleManagementController::class, 'destroy']);
        Route::get('permissions', [RoleManagementController::class, 'permissions']);
        
        // User Role Assignment
        Route::post('users/{user}/roles', [RoleManagementController::class, 'assignRoleToUser']);
        Route::delete('users/{user}/roles/{role}', [RoleManagementController::class, 'removeRoleFromUser']);

        // App Settings
        Route::middleware('permission:manage settings')->group(function () {
            Route::get('settings', [AdminSettingController::class, 'index']);
            Route::post('settings/bulk', [AdminSettingController::class, 'updateBulk']);
        });

        // Commission & Finance Settings
        Route::middleware('permission:manage commission')->group(function () {
            Route::get('commission/settings', [AdminCommissionController::class, 'getSettings']);
            Route::post('commission/settings', [AdminCommissionController::class, 'updateSettings']);
        });

        // Transaction Management
        Route::middleware('permission:manage transactions')->group(function () {
            Route::get('transactions/stats', [\App\Http\Controllers\Api\V1\Admin\TransactionController::class, 'stats']);
            Route::apiResource('transactions', \App\Http\Controllers\Api\V1\Admin\TransactionController::class)->only(['index', 'show']);
        });

        // Payout Management
        Route::middleware('permission:manage commission')->group(function () {
            Route::get('payouts/stats', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'stats']);
            Route::post('payouts/{id}/approve', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'approve']);
            Route::post('payouts/{id}/reject', [\App\Http\Controllers\Api\V1\Admin\PayoutController::class, 'reject']);
            Route::apiResource('payouts', \App\Http\Controllers\Api\V1\Admin\PayoutController::class)->only(['index', 'show']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Instructor Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('instructor')->middleware(['auth:api', 'role:instructor|admin'])->group(function () {
        // Dashboard
        Route::get('dashboard', [InstructorDashboardController::class, 'index']);

        // Courses CRUD
        Route::apiResource('courses', CourseController::class);
        Route::post('courses/{course}/thumbnail', [CourseController::class, 'uploadThumbnail']);
        Route::post('courses/{course}/submit-review', [CourseController::class, 'submitForReview']);

        // Batches CRUD
        Route::apiResource('batches', BatchController::class);
        Route::post('batches/{batch}/thumbnail', [BatchController::class, 'uploadThumbnail']);
        Route::get('batches/{batch}/enrollment-stats', [BatchController::class, 'enrollmentStats']);

        // Sections CRUD (nested under courses)
        Route::post('courses/{course}/sections', [SectionController::class, 'store']);
        Route::put('courses/{course}/sections/{section}', [SectionController::class, 'update']);
        Route::delete('courses/{course}/sections/{section}', [SectionController::class, 'destroy']);
        Route::post('courses/{course}/sections/reorder', [SectionController::class, 'reorder']);

        // Lessons CRUD (nested under sections)
        Route::post('courses/{course}/sections/{section}/lessons', [LessonController::class, 'store']);
        Route::get('courses/{course}/sections/{section}/lessons/{lesson}', [LessonController::class, 'show']);
        Route::put('courses/{course}/sections/{section}/lessons/{lesson}', [LessonController::class, 'update']);
        Route::delete('courses/{course}/sections/{section}/lessons/{lesson}', [LessonController::class, 'destroy']);
        Route::post('courses/{course}/sections/{section}/lessons/reorder', [LessonController::class, 'reorder']);

        // Direct Lesson Access (Simplified)
        Route::get('courses/{course}/lessons/{lesson}', [LessonController::class, 'showData']);

        // Lesson Attachments
        Route::post('courses/{course}/sections/{section}/lessons/{lesson}/attachments', [LessonController::class, 'uploadAttachment']);
        Route::delete('courses/{course}/sections/{section}/lessons/{lesson}/attachments/{attachment}', [LessonController::class, 'deleteAttachment']);

        // Assignments & Submissions
        Route::apiResource('assignments', AssignmentController::class);
        Route::post('assignments/{assignment}/grade-submission/{submission}', [AssignmentController::class, 'gradeSubmission']);
        Route::get('submissions', [SubmissionController::class, 'index']);
        Route::get('submissions/{submission}', [SubmissionController::class, 'show']);
        Route::post('submissions/{submission}/grade', [SubmissionController::class, 'grade']);
        Route::post('submissions/{submission}/ai-grade', [SubmissionController::class, 'aiGrade']);

        // Students List
        Route::get('students', [\App\Http\Controllers\Api\V1\Instructor\StudentController::class, 'index']);

        // Earnings & Payouts
        Route::get('earnings', [InstructorEarningsController::class, 'index']);
        Route::get('payouts', [InstructorPayoutController::class, 'index']);
        Route::post('payouts', [InstructorPayoutController::class, 'store']);
    });

    /*
    |--------------------------------------------------------------------------
    | Student Routes (Structured Learning)
    |--------------------------------------------------------------------------
    */
    Route::prefix('student')->middleware(['auth:api'])->group(function () {
        // Dashboard
        Route::get('dashboard', [StudentDashboardController::class, 'index']);
        Route::get('my-learning', [StudentDashboardController::class, 'myLearning']);
        Route::get('courses/{slug}/learning', [StudentLearningController::class, 'show']);
        Route::get('courses/{slug}/lessons/{lessonId}', [StudentLearningController::class, 'showLesson']);
        Route::post('courses/{slug}/lessons/{lessonId}/complete', [StudentLearningController::class, 'markComplete']);
        
        // AI Recommendations & Onboarding
        Route::get('onboarding/questions', [RecommendationController::class, 'getOnboardingQuestions']);
        Route::post('onboarding/submit', [RecommendationController::class, 'submitInterests']);
        Route::get('recommendations', [RecommendationController::class, 'recommend']);

        // Batches (Independent Enrollment)
        Route::get('batches/available', [App\Http\Controllers\Api\V1\Student\BatchController::class, 'availableBatches']);
        Route::get('batches', [App\Http\Controllers\Api\V1\Student\BatchController::class, 'myBatches']);
        Route::get('courses/{course}/batches', [App\Http\Controllers\Api\V1\Student\BatchController::class, 'index']);
        Route::get('batches/{batch}', [App\Http\Controllers\Api\V1\Student\BatchController::class, 'show']);
        Route::post('batches/{batch}/enroll', [App\Http\Controllers\Api\V1\Student\BatchController::class, 'enroll']);

        // Assignments
        Route::get('assignments', [App\Http\Controllers\Api\V1\Student\AssignmentController::class, 'index']); // List all my assignments or filter by batch_id
        Route::get('assignments/{assignment}', [App\Http\Controllers\Api\V1\Student\AssignmentController::class, 'show']);
        Route::post('assignments/{assignment}/submit', [App\Http\Controllers\Api\V1\Student\AssignmentController::class, 'submit']);
        Route::post('assignments/{assignment}/retry-ai', [App\Http\Controllers\Api\V1\Student\AssignmentController::class, 'retryAi']);

        // Grades
        Route::get('grades', [App\Http\Controllers\Api\V1\Student\GradeController::class, 'index']);

        // Learning History
        Route::get('learning-history', [StudentLearningController::class, 'history']);
    });

    // Profile Routes
    Route::prefix('profile')->middleware(['auth:api'])->group(function () {
        Route::get('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'show']);
        Route::put('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'update']);
        Route::delete('/', [\App\Http\Controllers\Api\V1\ProfileController::class, 'destroy']);
    });

    /*
    |--------------------------------------------------------------------------
    | Discussion Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('discussions')->group(function () {
        Route::middleware('auth:api')->group(function () {
            Route::get('/', [DiscussionController::class, 'index']);
            Route::post('/', [DiscussionController::class, 'store']);
            Route::get('{discussion}', [DiscussionController::class, 'show']);
            Route::put('{discussion}', [DiscussionController::class, 'update']);
            Route::delete('{discussion}', [DiscussionController::class, 'destroy']);
            
            // Batch discussions
            Route::get('batch/{batch}', [DiscussionController::class, 'getBatchDiscussions']);
            
            // Lesson discussions
            Route::get('lesson/{lesson}', [DiscussionController::class, 'getLessonDiscussions']);
            
            // Instructor only routes
            Route::middleware('role:instructor|admin')->group(function () {
                Route::post('{discussion}/toggle-pin', [DiscussionController::class, 'togglePin']);
                Route::post('{discussion}/toggle-lock', [DiscussionController::class, 'toggleLock']);
            });
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Class Feature Routes (Hybrid LMS)
    |--------------------------------------------------------------------------
    */
    Route::prefix('classes')->middleware(['auth:api'])->group(function () {
        Route::get('/', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'store']);
        Route::get('/{id}', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'show']);
        Route::post('/activities/{id}/toggle-complete', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'toggleActivityComplete']);
        Route::post('/join', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'join']);
        
        // Session Comments
        Route::post('/sessions/{sessionId}/comments', [\App\Http\Controllers\Api\V1\Classroom\SessionCommentController::class, 'store']);

        // Course management
        Route::post('/{id}/courses', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'addCourse']);
        Route::delete('/{id}/courses/{courseId}', [App\Http\Controllers\Api\V1\Classroom\ClassController::class, 'removeCourse']);

        // Stream
        Route::get('/{id}/stream', [App\Http\Controllers\Api\V1\Classroom\ClassStreamController::class, 'index']);
        Route::post('/{id}/stream', [App\Http\Controllers\Api\V1\Classroom\ClassStreamController::class, 'store']);

        // Topics, Sessions & Additional Materials
        Route::apiResource('/{id}/topics', \App\Http\Controllers\Api\V1\Instructor\BatchTopicController::class)
            ->except(['create', 'edit'])
            ->parameters(['topics' => 'topic']);

        Route::apiResource('/{id}/sessions', \App\Http\Controllers\Api\V1\Instructor\BatchSessionController::class)
            ->except(['create', 'edit'])
            ->parameters(['sessions' => 'session']);

        // People
        Route::get('/{id}/people', [App\Http\Controllers\Api\V1\Classroom\ClassPeopleController::class, 'index']);
    });

    /*
    |--------------------------------------------------------------------------
    | Public Routes
    |--------------------------------------------------------------------------
    */
    Route::prefix('public')->group(function () {
        // Course catalog
        Route::get('courses', [CourseCatalogController::class, 'index']);
        Route::get('courses/{slug}', [CourseCatalogController::class, 'show']);
        Route::get('courses/{course}/related', [CourseCatalogController::class, 'related']);
        Route::get('categories', [CourseCatalogController::class, 'categories']);
        
        // Batches (for landing page)
        Route::get('batches', [CourseCatalogController::class, 'batches']);
        Route::get('batches/{batch}', [CourseCatalogController::class, 'batchDetail']);

        // Learning Paths (recommendations/guides)
        Route::get('learning-paths', [CourseCatalogController::class, 'learningPaths']);
        Route::get('learning-paths/{slug}', [CourseCatalogController::class, 'learningPathDetail']);
    });

    /*
    |--------------------------------------------------------------------------
    | Authenticated Routes
    |--------------------------------------------------------------------------
    */
    Route::middleware('auth:api')->group(function () {
        // Cart
        Route::prefix('cart')->group(function () {
            Route::get('/', [CartController::class, 'index']);
            Route::post('/', [CartController::class, 'addToCart']);
            Route::delete('/items/{itemId}', [CartController::class, 'removeFromCart']);
            Route::put('/items/{itemId}', [CartController::class, 'updateItem']);
            Route::delete('/', [CartController::class, 'clearCart']);
            Route::get('/summary', [CartController::class, 'summary']);
        });

        // Checkout
        Route::prefix('checkout')->group(function () {
            Route::post('/process', [CheckoutController::class, 'processCheckout']);
            Route::get('/orders/{orderNumber}', [CheckoutController::class, 'getOrder']);
            Route::get('/orders', [CheckoutController::class, 'getOrderHistory']);
            Route::get('/receipts/{orderNumber}', [CheckoutController::class, 'getReceipt']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Payment Webhook
    |--------------------------------------------------------------------------
    */
    Route::post('webhooks/payment', [PaymentWebhookController::class, 'handleWebhook']);
});
