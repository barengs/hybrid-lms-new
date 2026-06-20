<?php
 
namespace App\Http\Controllers\Api\V1\Classroom;
 
use App\Http\Controllers\Controller;
use App\Models\Batch;
use App\Models\User;
use Illuminate\Http\Request;
 
class ClassPeopleController extends Controller
{
    /**
     * List Members
     * 
     * Get a list of all members (Instructors and Students) in a specific class.
     * 
     * @group Hybrid Learning
     * @subgroup Class Management
     * @urlParam id integer required The ID of the class (batch).
     * @response 200 {
     *   "instructors": [object],
     *   "students": [object]
     * }
     */
    public function index(Request $request, $id)
    {
        $batch = Batch::with(['instructor.profile', 'instructors.profile', 'enrollments.user.profile'])
            ->findOrFail($id);
 
        $user = $request->user();
        if (!$batch->enrollments()->where('user_id', $user->id)->exists() && !$batch->hasInstructorAccess($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
 
        $instructors = collect([$batch->instructor])
            ->concat($batch->instructors)
            ->filter()
            ->unique('id')
            ->map(function ($instructor) {
                return [
                    'id' => $instructor->id,
                    'name' => $instructor->name,
                    'email' => $instructor->email,
                    'avatar' => $instructor->profile && $instructor->profile->avatar ? url('storage/' . $instructor->profile->avatar) : null,
                ];
            })
            ->values();
 
        $students = $batch->enrollments->map(function ($enrollment) {
            $student = $enrollment->user;
            return [
                'id' => $student->id,
                'name' => $student->name,
                'email' => $student->email,
                'avatar' => $student->profile && $student->profile->avatar ? url('storage/' . $student->profile->avatar) : null,
            ];
        });
 
        return response()->json([
            'instructors' => $instructors,
            'students' => $students,
        ]);
    }

    /**
     * Add Co-Instructor
     * 
     * Invite / Add a co-instructor to a class by their email address.
     */
    public function addInstructor(Request $request, $id)
    {
        $batch = Batch::findOrFail($id);
        $user = $request->user();

        // Verify authorized to manage instructors
        if (!$batch->hasInstructorAccess($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'email' => 'required|email|exists:users,email',
        ]);

        $userToAdd = User::where('email', $request->email)->firstOrFail();

        // Check if the user is an instructor
        if (!$userToAdd->isInstructor()) {
            return response()->json(['message' => 'User must have instructor role.'], 422);
        }

        // Check if already main instructor
        if ($batch->instructor_id === $userToAdd->id) {
            return response()->json(['message' => 'User is already the main instructor.'], 422);
        }

        // Check if already co-instructor
        if ($batch->instructors()->where('users.id', $userToAdd->id)->exists()) {
            return response()->json(['message' => 'User is already a co-instructor.'], 422);
        }

        // Attach co-instructor
        $batch->instructors()->attach($userToAdd->id, ['role' => 'instructor']);

        return response()->json([
            'message' => 'Co-instructor added successfully.',
            'instructor' => [
                'id' => $userToAdd->id,
                'name' => $userToAdd->name,
                'email' => $userToAdd->email,
                'avatar' => $userToAdd->profile && $userToAdd->profile->avatar ? url('storage/' . $userToAdd->profile->avatar) : null,
            ]
        ]);
    }

    /**
     * Remove Co-Instructor
     * 
     * Remove a co-instructor from a class.
     */
    public function removeInstructor(Request $request, $id, $instructorId)
    {
        $batch = Batch::findOrFail($id);
        $user = $request->user();

        // Verify authorized to manage instructors
        if (!$batch->hasInstructorAccess($user)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Prevent removing the main instructor
        if ((int) $instructorId === $batch->instructor_id) {
            return response()->json(['message' => 'Cannot remove the main instructor.'], 422);
        }

        // Detach co-instructor
        $batch->instructors()->detach($instructorId);

        return response()->json([
            'message' => 'Co-instructor removed successfully.'
        ]);
    }

    /**
     * Search Instructors
     * 
     * Search for registered instructors in the system by name or email.
     */
    public function searchInstructors(Request $request)
    {
        $q = $request->query('q', '');

        $users = User::whereHas('roles', function ($query) {
                $query->whereIn('name', ['instructor', 'admin']);
            })
            ->with('profile')
            ->where(function ($query) use ($q) {
                $query->where('name', 'like', "%{$q}%")
                      ->orWhere('email', 'like', "%{$q}%");
            })
            ->limit(10)
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->profile && $user->profile->avatar ? url('storage/' . $user->profile->avatar) : null,
                ];
            });

        return response()->json($users);
    }
}
