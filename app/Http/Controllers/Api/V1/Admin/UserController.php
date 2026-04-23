<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Mail\UserWelcomeMail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    /**
     * Display a listing of the users.
     */
    public function index(Request $request): JsonResponse
    {
        $query = User::with(['profile', 'roles'])->withTrashed();

        // Search filter
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Role filter
        if ($request->has('role') && $request->role !== 'all') {
            $query->role($request->role);
        }

        // Status filter
        if ($request->has('status') && $request->status !== 'all') {
            if ($request->status === 'active') {
                $query->where('status', 'active')->whereNull('deleted_at');
            } elseif ($request->status === 'suspended') {
                $query->where('status', 'suspended');
            } elseif ($request->status === 'deleted') {
                $query->onlyTrashed();
            }
        }

        $users = $query->latest()->paginate($request->get('per_page', 10));

        return response()->json([
            'success' => true,
            'data' => $users
        ]);
    }

    /**
     * Get user management statistics.
     */
    public function stats(): JsonResponse
    {
        $thirtyDaysAgo = Carbon::now()->subDays(30);

        $stats = [
            'total' => User::withTrashed()->count(),
            'students' => User::role('student')->count(),
            'instructors' => User::role('instructor')->count(),
            'admins' => User::role('admin')->count(),
            'active' => User::where('status', 'active')->count(),
            'suspended' => User::where('status', 'suspended')->count(),
            'newThisMonth' => User::where('created_at', '>', $thirtyDaysAgo)->count(),
        ];

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'roles' => 'required|array',
            'bio' => 'nullable|string',
            'address' => 'nullable|string',
        ]);

        try {
            return DB::transaction(function () use ($request) {
                $password = $request->password;
                $user = User::create([
                    'name' => $request->name,
                    'email' => $request->email,
                    'password' => Hash::make($password),
                    'status' => 'active',
                ]);

                // Create profile
                $user->profile()->create([
                    'bio' => $request->bio,
                    'address' => $request->address,
                ]);

                // Assign roles
                $user->syncRoles($request->roles);

                // Send welcome email
                try {
                    Mail::to($user->email)->send(new UserWelcomeMail($user, $password));
                    $emailSent = true;
                } catch (\Exception $e) {
                    $emailSent = false;
                }

                return response()->json([
                    'success' => true,
                    'message' => $emailSent 
                        ? 'User created successfully and welcome email sent.' 
                        : 'User created successfully but welcome email failed to send.',
                    'data' => $user->load(['profile', 'roles']),
                    'email_sent' => $emailSent
                ], 201);
            });
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'roles' => 'required|array',
            'bio' => 'nullable|string',
            'address' => 'nullable|string',
            'status' => 'required|in:active,suspended',
        ]);

        try {
            DB::transaction(function () use ($request, $user) {
                $userData = [
                    'name' => $request->name,
                    'email' => $request->email,
                    'status' => $request->status,
                ];

                if ($request->filled('password')) {
                    $userData['password'] = Hash::make($request->password);
                }

                $user->update($userData);

                // Update profile
                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    ['bio' => $request->bio, 'address' => $request->address]
                );

                // Sync roles
                $user->syncRoles($request->roles);
            });

            return response()->json([
                'success' => true,
                'message' => 'User updated successfully',
                'data' => $user->load(['profile', 'roles'])
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle user status (active/suspended).
     */
    public function toggleStatus(User $user): JsonResponse
    {
        $user->status = $user->status === 'active' ? 'suspended' : 'active';
        $user->save();

        return response()->json([
            'success' => true,
            'message' => "User status changed to {$user->status}",
            'data' => ['status' => $user->status]
        ]);
    }

    /**
     * Remove the specified user from storage (Soft Delete).
     */
    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User moved to trash successfully'
        ]);
    }

    /**
     * Restore a soft-deleted user.
     */
    public function restore($id): JsonResponse
    {
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return response()->json([
            'success' => true,
            'message' => 'User restored successfully'
        ]);
    }

    /**
     * Handle bulk actions for users.
     */
    public function bulkActions(Request $request): JsonResponse
    {
        $request->validate([
            'ids' => 'required|array',
            'action' => 'required|in:activate,suspend,delete,restore',
        ]);

        $ids = $request->ids;
        $action = $request->action;

        try {
            switch ($action) {
                case 'activate':
                    User::whereIn('id', $ids)->update(['status' => 'active']);
                    break;
                case 'suspend':
                    User::whereIn('id', $ids)->update(['status' => 'suspended']);
                    break;
                case 'delete':
                    User::whereIn('id', $ids)->delete();
                    break;
                case 'restore':
                    User::onlyTrashed()->whereIn('id', $ids)->restore();
                    break;
            }

            return response()->json([
                'success' => true,
                'message' => "Bulk {$action} action completed successfully"
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Bulk action failed: ' . $e->getMessage()
            ], 500);
        }
    }
}
