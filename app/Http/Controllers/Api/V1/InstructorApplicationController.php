<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\User;
use App\Models\InstructorApplication;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Laravel\Facades\Image;

class InstructorApplicationController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'fullName' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'required|string|max:20',
            'expertise' => 'required|string',
            'experience' => 'required|string',
            'portfolio' => 'nullable|url',
            'motivation' => 'required|string',
            'certificate' => 'required|file|mimes:pdf,jpg,jpeg,png|max:2048',
        ]);

        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                'name' => $request->fullName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'status' => 'pending', // Wait for approval
            ]);
            $user->assignRole('instructor');

            // Handle file upload
            $certificatePath = null;
            if ($request->hasFile('certificate')) {
                $file = $request->file('certificate');
                $extension = $file->getClientOriginalExtension();
                
                if (in_array(strtolower($extension), ['jpg', 'jpeg', 'png'])) {
                    $filename = uniqid() . '.webp';
                    $path = 'certificates/' . $filename;
                    
                    $image = Image::read($file);
                    // Scale down if too large, maintain aspect ratio
                    $image->scaleDown(width: 1200);
                    $encoded = $image->toWebp(quality: 80);
                    
                    Storage::disk('public')->put($path, (string) $encoded);
                    $certificatePath = $path;
                } else {
                    $certificatePath = $file->store('certificates', 'public');
                }
            }

            // Create Application
            InstructorApplication::create([
                'user_id' => $user->id,
                'expertise' => $request->expertise,
                'experience' => $request->experience,
                'portfolio_url' => $request->portfolio,
                'motivation' => $request->motivation,
                'certificate_path' => $certificatePath,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Application submitted successfully',
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Instructor registration failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to submit application'], 500);
        }
    }
}
