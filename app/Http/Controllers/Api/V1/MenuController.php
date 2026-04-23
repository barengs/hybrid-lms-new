<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MenuController extends Controller
{
    /**
     * Get menus for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['data' => []]);
        }

        $roleGroups = $this->getRoleGroups($user);

        // Fetch top-level active menus for the user's role groups
        $menus = Menu::with(['children' => function ($query) {
                $query->active()->orderBy('order');
            }])
            ->active()
            ->whereNull('parent_id')
            ->whereIn('role_group', $roleGroups)
            ->orderBy('order')
            ->get();

        // Filter menus based on user permissions
        $filteredMenus = $menus->map(function ($menu) use ($user) {
            $filteredChildren = $menu->children->filter(function ($child) use ($user) {
                // If permission is required, check if user has it
                if ($child->permission_name && !$user->can($child->permission_name)) {
                    return false;
                }
                return true;
            })->values();

            // If it's a group (no route) and has no children, hide it
            if (!$menu->route && $filteredChildren->isEmpty()) {
                return null;
            }

            // If it's a menu item with a permission, check it
            if ($menu->permission_name && !$user->can($menu->permission_name)) {
                return null;
            }

            $menu->setRelation('children', $filteredChildren);
            return $menu;
        })->filter()->values();

        return response()->json([
            'data' => $filteredMenus
        ]);
    }

    /**
     * Map user roles to role_groups in menus table.
     */
    private function getRoleGroups($user): array
    {
        $roleNames = $user->getRoleNames()->toArray();
        $groups = [];

        foreach ($roleNames as $role) {
            if ($role === 'admin' || $role === 'super-admin' || $role === 'admin-sistem') {
                $groups[] = 'admin';
            } elseif ($role === 'instructor') {
                $groups[] = 'instructor';
            } elseif ($role === 'student') {
                $groups[] = 'student';
            }
        }

        return array_unique($groups);
    }
}
