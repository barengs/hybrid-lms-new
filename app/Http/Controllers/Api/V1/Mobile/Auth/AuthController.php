<?php

namespace App\Http\Controllers\Api\V1\Mobile\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    private function getUserWithPermissions($user)
    {
        return array_merge($user->load('profile', 'roles')->toArray(), [
            'permissions' => $user->getAllPermissions()->pluck('name')->toArray()
        ]);
    }

    /**
     * Register a new user (Mobile Optimized).
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        // Create empty profile
        $user->profile()->create();

        // Assign default role
        $user->assignRole('student');

        event(new Registered($user));

        // Create token
        $token = Auth::guard('api')->login($user);
        $expiresInMinutes = config('jwt.ttl', 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        return response()->json([
            'message' => 'Registration successful.',
            'data' => [
                'user' => $this->getUserWithPermissions($user),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => $expiresInMinutes * 60,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Login user (Mobile Optimized).
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (!$token = Auth::guard('api')->attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid login credentials.',
            ], 401);
        }

        $user = Auth::guard('api')->user();

        // Check if user is active
        if ($user->status === 'inactive') {
            return response()->json([
                'message' => 'Your account is inactive. Please contact support.',
            ], 403);
        }

        $expiresInMinutes = config('jwt.ttl', 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => $this->getUserWithPermissions($user),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => $expiresInMinutes * 60,
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get current user (Mobile Optimized).
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => $this->getUserWithPermissions($request->user()),
            ],
        ]);
    }

    /**
     * Logout.
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * Refresh Token.
     */
    public function refresh(Request $request): JsonResponse
    {
        try {
            $token = Auth::guard('api')->refresh();
            $user = Auth::guard('api')->user();

            $expiresInMinutes = config('jwt.ttl', 60);
            $expiresAt = now()->addMinutes($expiresInMinutes);

            return response()->json([
                'message' => 'Token refreshed.',
                'data' => [
                    'user' => $this->getUserWithPermissions($user),
                    'token' => $token,
                    'token_type' => 'Bearer',
                    'expires_in' => $expiresInMinutes * 60,
                    'expires_at' => $expiresAt->toIso8601String(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Could not refresh token'], 401);
        }
    }
}
