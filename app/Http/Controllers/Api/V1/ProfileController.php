<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    use ApiResponse;

    /**
     * Get user profile.
     * 
     * @group User Profile
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile', 'roles');
        
        return $this->successResponse($user, 'Profile retrieved successfully.');
    }

    /**
     * Update user profile.
     * 
     * @group User Profile
     */
    public function update(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'password' => ['sometimes', 'confirmed', Password::defaults()],
            'bio' => ['sometimes', 'nullable', 'string'],
            'avatar' => ['sometimes', 'nullable', 'string'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:20'],
        ]);

        if ($request->has('name')) {
            $user->name = $request->name;
        }

        if ($request->has('email')) {
            $user->email = $request->email;
        }

        if ($request->has('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        // Update profile details
        $profileData = $request->only(['bio', 'avatar', 'phone']);
        if (!empty($profileData)) {
            $user->profile()->update($profileData);
        }

        return $this->successResponse($user->load('profile'), 'Profile updated successfully.');
    }

    /**
     * Delete user account.
     * 
     * @group User Profile
     */
    public function destroy(Request $request): JsonResponse
    {
        $user = $request->user();

        // Optional: Perform additional checks before deletion
        // e.g., check for active subscriptions or pending payments

        $user->delete(); // This will perform a soft delete if the model uses SoftDeletes trait

        return $this->successResponse(null, 'Account deleted successfully.');
    }
}
