<?php

namespace App\Http\Controllers\Api\V1\Auth;

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
    /**
     * Register a new user.
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

        // Create token with expiration
        $token = Auth::guard('api')->login($user);
        $expiresInMinutes = config('jwt.ttl', 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        return response()->json([
            'message' => 'Registration successful. Please verify your email.',
            'data' => [
                'user' => $user->load('profile', 'roles'),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => $expiresInMinutes * 60, // in seconds
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ], 201);
    }

    /**
     * Login user and create token.
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

        // Create token with expiration
        $expiresInMinutes = config('jwt.ttl', 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        return response()->json([
            'message' => 'Login successful.',
            'data' => [
                'user' => $user->load('profile', 'roles'),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => $expiresInMinutes * 60, // in seconds
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    /**
     * Logout user (revoke token).
     */
    public function logout(Request $request): JsonResponse
    {
        Auth::guard('api')->logout();

        return response()->json([
            'message' => 'Logout successful.',
        ]);
    }

    /**
     * Refresh authentication token.
     * 
     * This endpoint allows the frontend to refresh the token before it expires,
     * maintaining the user's session if they are still active.
     */
    public function refresh(Request $request): JsonResponse
    {
        $token = Auth::guard('api')->refresh();
        $user = Auth::guard('api')->user();

        // Create new token with expiration
        $expiresInMinutes = config('jwt.ttl', 60);
        $expiresAt = now()->addMinutes($expiresInMinutes);

        return response()->json([
            'message' => 'Token refreshed successfully.',
            'data' => [
                'user' => $user->load('profile', 'roles'),
                'token' => $token,
                'token_type' => 'Bearer',
                'expires_in' => $expiresInMinutes * 60, // in seconds
                'expires_at' => $expiresAt->toIso8601String(),
            ],
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                'user' => $request->user()->load('profile', 'roles'),
            ],
        ]);
    }
}
