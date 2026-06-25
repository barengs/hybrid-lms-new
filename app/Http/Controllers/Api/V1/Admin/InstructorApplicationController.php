<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\InstructorApplication;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InstructorApplicationController extends Controller
{
    public function index()
    {
        $applications = InstructorApplication::with('user')
            ->orderBy('created_at', 'desc')
            ->get();
            
        return response()->json($applications);
    }

    public function approve($id)
    {
        try {
            DB::beginTransaction();

            $application = InstructorApplication::findOrFail($id);
            $application->status = 'approved';
            $application->save();

            $user = $application->user;
            $user->status = 'active';
            $user->save();

            DB::commit();

            return response()->json([
                'message' => 'Application approved successfully',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Application approval failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to approve application'], 500);
        }
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'notes' => 'required|string',
        ]);

        try {
            $application = InstructorApplication::findOrFail($id);
            $application->status = 'rejected';
            $application->notes = $request->notes;
            $application->save();

            return response()->json([
                'message' => 'Application rejected successfully',
            ]);
        } catch (\Exception $e) {
            Log::error('Application rejection failed: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to reject application'], 500);
        }
    }
}
