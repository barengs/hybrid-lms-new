<?php

namespace Database\Seeders;

use App\Models\Menu;
use Illuminate\Database\Seeder;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Clear existing menus
        Menu::query()->delete();

        // 1. STUDENT MENUS
        $this->createStudentMenus();

        // 2. INSTRUCTOR MENUS
        $this->createInstructorMenus();

        // 3. ADMIN MENUS
        $this->createAdminMenus();
    }

    private function createStudentMenus()
    {
        $group = 'student';

        // Main Group (No parent)
        $main = Menu::create([
            'key' => 'student_main',
            'label_id' => 'Utama',
            'label_en' => 'Main',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'student_dashboard',
            'label_id' => 'Dashboard',
            'label_en' => 'Dashboard',
            'route' => '/dashboard',
            'icon' => 'LayoutDashboard',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'student_courses',
            'label_id' => 'Kursus Saya',
            'label_en' => 'My Courses',
            'route' => '/my-courses',
            'icon' => 'BookOpen',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'student_classes',
            'label_id' => 'Kelas Saya',
            'label_en' => 'My Classes',
            'route' => '/my-classes',
            'icon' => 'Users',
            'role_group' => $group,
            'order' => 3
        ]);

        // Learning Group
        $learning = Menu::create([
            'key' => 'student_learning',
            'label_id' => 'Pembelajaran',
            'label_en' => 'Learning',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $learning->id,
            'key' => 'student_assignments',
            'label_id' => 'Tugas',
            'label_en' => 'Assignments',
            'route' => '/assignments',
            'icon' => 'ClipboardList',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $learning->id,
            'key' => 'student_discussions',
            'label_id' => 'Forum Diskusi',
            'label_en' => 'Discussion Forum',
            'route' => '/discussions',
            'icon' => 'MessageSquare',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $learning->id,
            'key' => 'student_certificates',
            'label_id' => 'Sertifikat',
            'label_en' => 'Certificates',
            'route' => '/certificates',
            'icon' => 'Award',
            'role_group' => $group,
            'order' => 3
        ]);

        // Gamification Group
        $gamification = Menu::create([
            'key' => 'student_gamification',
            'label_id' => 'Gamifikasi',
            'label_en' => 'Gamification',
            'role_group' => $group,
            'order' => 3
        ]);

        Menu::create([
            'parent_id' => $gamification->id,
            'key' => 'student_leaderboard',
            'label_id' => 'Papan Peringkat',
            'label_en' => 'Leaderboard',
            'route' => '/leaderboard',
            'icon' => 'BarChart3',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $gamification->id,
            'key' => 'student_badges',
            'label_id' => 'Lencana Saya',
            'label_en' => 'My Badges',
            'route' => '/badges',
            'icon' => 'Award',
            'role_group' => $group,
            'order' => 2
        ]);
    }

    private function createInstructorMenus()
    {
        $group = 'instructor';

        $main = Menu::create([
            'key' => 'instructor_main',
            'label_id' => 'Utama',
            'label_en' => 'Main',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'instructor_dashboard',
            'label_id' => 'Dashboard',
            'label_en' => 'Dashboard',
            'route' => '/instructor',
            'icon' => 'LayoutDashboard',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'instructor_courses',
            'label_id' => 'Kursus Saya',
            'label_en' => 'My Courses',
            'route' => '/instructor/courses',
            'icon' => 'BookOpen',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'instructor_classes',
            'label_id' => 'Kelas',
            'label_en' => 'Classes',
            'route' => '/instructor/classes',
            'icon' => 'FolderOpen',
            'role_group' => $group,
            'order' => 3
        ]);

        $management = Menu::create([
            'key' => 'instructor_management',
            'label_id' => 'Manajemen',
            'label_en' => 'Management',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'instructor_students',
            'label_id' => 'Siswa',
            'label_en' => 'Students',
            'route' => '/instructor/students',
            'icon' => 'Users',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'instructor_grading',
            'label_id' => 'Penilaian',
            'label_en' => 'Grading',
            'route' => '/instructor/grading',
            'icon' => 'FileText',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'instructor_discussions',
            'label_id' => 'Diskusi',
            'label_en' => 'Discussion',
            'route' => '/discussions',
            'icon' => 'MessageSquare',
            'role_group' => $group,
            'order' => 3
        ]);

        $finance = Menu::create([
            'key' => 'instructor_finance',
            'label_id' => 'Keuangan',
            'label_en' => 'Finance',
            'role_group' => $group,
            'order' => 3
        ]);

        Menu::create([
            'parent_id' => $finance->id,
            'key' => 'instructor_earnings',
            'label_id' => 'Pendapatan',
            'label_en' => 'Earnings',
            'route' => '/instructor/earnings',
            'icon' => 'DollarSign',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $finance->id,
            'key' => 'instructor_payouts',
            'label_id' => 'Penarikan',
            'label_en' => 'Payouts',
            'route' => '/instructor/payouts',
            'icon' => 'CreditCard',
            'role_group' => $group,
            'order' => 2
        ]);
    }

    private function createAdminMenus()
    {
        $group = 'admin';

        $main = Menu::create([
            'key' => 'admin_main',
            'label_id' => 'Utama',
            'label_en' => 'Main',
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $main->id,
            'key' => 'admin_dashboard',
            'label_id' => 'Dashboard',
            'label_en' => 'Dashboard',
            'route' => '/admin',
            'icon' => 'LayoutDashboard',
            'role_group' => $group,
            'order' => 1
        ]);

        $management = Menu::create([
            'key' => 'admin_management',
            'label_id' => 'Manajemen',
            'label_en' => 'Management',
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'admin_users',
            'label_id' => 'Pengguna',
            'label_en' => 'Users',
            'route' => '/admin/users',
            'icon' => 'Users',
            'permission_name' => 'manage users',
            'permissions' => [
                'read' => 'manage users',
                'create' => 'manage users',
                'update' => 'manage users',
                'delete' => 'manage users',
            ],
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'admin_instructors',
            'label_id' => 'Instruktur',
            'label_en' => 'Instructors',
            'route' => '/admin/instructors',
            'icon' => 'UserCheck',
            'permission_name' => 'verify instructors',
            'permissions' => [
                'read' => 'verify instructors',
                'update' => 'verify instructors',
                'approve' => 'verify instructors',
            ],
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'admin_courses',
            'label_id' => 'Kursus',
            'label_en' => 'Courses',
            'route' => '/admin/courses',
            'icon' => 'BookOpen',
            'permission_name' => 'manage all courses',
            'permissions' => [
                'read' => 'view enrolled courses',
                'create' => 'create courses',
                'update' => 'edit courses',
                'delete' => 'delete courses',
                'approve' => 'approve courses',
            ],
            'role_group' => $group,
            'order' => 3
        ]);

        Menu::create([
            'parent_id' => $management->id,
            'key' => 'admin_categories',
            'label_id' => 'Kategori',
            'label_en' => 'Categories',
            'route' => '/admin/categories',
            'icon' => 'FolderOpen',
            'permission_name' => 'manage categories',
            'permissions' => [
                'read' => 'manage categories',
                'create' => 'manage categories',
                'update' => 'manage categories',
                'delete' => 'manage categories',
            ],
            'role_group' => $group,
            'order' => 4
        ]);

        $finance = Menu::create([
            'key' => 'admin_finance',
            'label_id' => 'Keuangan',
            'label_en' => 'Finance',
            'role_group' => $group,
            'order' => 3
        ]);

        Menu::create([
            'parent_id' => $finance->id,
            'key' => 'admin_transactions',
            'label_id' => 'Transaksi',
            'label_en' => 'Transactions',
            'route' => '/admin/transactions',
            'icon' => 'CreditCard',
            'permission_name' => 'manage transactions',
            'permissions' => [
                'read' => 'manage transactions',
            ],
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $finance->id,
            'key' => 'admin_payouts',
            'label_id' => 'Pembayaran Instruktur',
            'label_en' => 'Instructor Payouts',
            'route' => '/admin/payouts',
            'icon' => 'DollarSign',
            'permission_name' => 'process payouts',
            'permissions' => [
                'read' => 'process payouts',
                'approve' => 'process payouts',
            ],
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $finance->id,
            'key' => 'admin_commission',
            'label_id' => 'Pengaturan Komisi',
            'label_en' => 'Commission Settings',
            'route' => '/admin/commission',
            'icon' => 'Layers',
            'permission_name' => 'manage commission',
            'permissions' => [
                'read' => 'manage commission',
                'update' => 'manage commission',
            ],
            'role_group' => $group,
            'order' => 3
        ]);

        $platform = Menu::create([
            'key' => 'admin_platform',
            'label_id' => 'Platform',
            'label_en' => 'Platform',
            'role_group' => $group,
            'order' => 4
        ]);

        Menu::create([
            'parent_id' => $platform->id,
            'key' => 'admin_settings',
            'label_id' => 'Pengaturan',
            'label_en' => 'Settings',
            'route' => '/admin/settings',
            'icon' => 'Settings',
            'permission_name' => 'manage settings',
            'permissions' => [
                'read' => 'manage settings',
                'update' => 'manage settings',
            ],
            'role_group' => $group,
            'order' => 1
        ]);

        Menu::create([
            'parent_id' => $platform->id,
            'key' => 'admin_roles',
            'label_id' => 'Manajemen Role',
            'label_en' => 'Role Management',
            'route' => '/admin/roles',
            'icon' => 'ShieldCheck',
            'permission_name' => 'manage roles',
            'permissions' => [
                'read' => 'manage roles',
                'create' => 'manage roles',
                'update' => 'manage roles',
                'delete' => 'manage roles',
            ],
            'role_group' => $group,
            'order' => 2
        ]);

        Menu::create([
            'parent_id' => $platform->id,
            'key' => 'admin_moderation',
            'label_id' => 'Moderasi',
            'label_en' => 'Moderation',
            'route' => '/admin/moderation',
            'icon' => 'ShieldCheck',
            'permission_name' => 'moderate content',
            'permissions' => [
                'read' => 'moderate content',
                'update' => 'moderate content',
                'delete' => 'moderate content',
                'approve' => 'moderate content',
            ],
            'role_group' => $group,
            'order' => 3
        ]);
    }
}
