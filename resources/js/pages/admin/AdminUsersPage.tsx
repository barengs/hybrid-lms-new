import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  UserCheck,
  UserX,
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Shield,
  Calendar,
  Clock,
  Download,
  Eye,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Select, Modal, DataTable } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
}

// Mock users data
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    role: 'student',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    lastLogin: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'user-2',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    role: 'instructor',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'user-3',
    name: 'Budi Santoso',
    email: 'budi.santoso@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiS',
    role: 'student',
    status: 'suspended',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'user-4',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    role: 'instructor',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'user-5',
    name: 'Rudi Hermawan',
    email: 'rudi.h@example.com',
    role: 'student',
    status: 'active',
    isVerified: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastLogin: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'user-6',
    name: 'Ani Wijaya',
    email: 'ani.wijaya@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ani',
    role: 'admin',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    lastLogin: new Date(Date.now() - 1800000).toISOString(),
  },
];

export function AdminUsersPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as User['role'],
  });

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockUsers.length;
    const students = mockUsers.filter(u => u.role === 'student').length;
    const instructors = mockUsers.filter(u => u.role === 'instructor').length;
    const admins = mockUsers.filter(u => u.role === 'admin').length;
    const active = mockUsers.filter(u => u.status === 'active').length;
    const suspended = mockUsers.filter(u => u.status === 'suspended').length;
    const newThisMonth = mockUsers.filter(u => {
      const thirtyDaysAgo = Date.now() - 86400000 * 30;
      return new Date(u.createdAt).getTime() > thirtyDaysAgo;
    }).length;

    return { total, students, instructors, admins, active, suspended, newThisMonth };
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    let users = [...mockUsers];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      users = users.filter(u => u.role === roleFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      users = users.filter(u => u.status === statusFilter);
    }

    return users;
  }, [searchQuery, roleFilter, statusFilter]);

  // Handlers
  const handleAddUser = () => {
    console.log('Adding user:', formData);
    setShowAddModal(false);
    setFormData({ name: '', email: '', password: '', role: 'student' });
  };

  const handleEditUser = () => {
    console.log('Editing user:', editingUser, formData);
    setShowEditModal(false);
    setEditingUser(null);
  };

  const handleDeleteUser = () => {
    console.log('Deleting user:', deletingUserId);
    setShowDeleteModal(false);
    setDeletingUserId(null);
  };

  const handleToggleStatus = (userId: string) => {
    console.log('Toggling status for user:', userId);
    // In real app, call API
  };

  const handleBulkSuspend = () => {
    console.log('Bulk suspend:', selectedUsers.map(u => u.id));
    setSelectedUsers([]);
  };

  const handleBulkActivate = () => {
    console.log('Bulk activate:', selectedUsers.map(u => u.id));
    setSelectedUsers([]);
  };

  const handleBulkDelete = () => {
    console.log('Bulk delete:', selectedUsers.map(u => u.id));
    setSelectedUsers([]);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
    setShowEditModal(true);
  };

  const getUserActions = (user: User): DropdownItem[] => [
    {
      label: language === 'id' ? 'Lihat Detail' : 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => navigate(`/admin/users/${user.id}`),
    },
    {
      label: language === 'id' ? 'Edit' : 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => openEditModal(user),
    },
    {
      label: user.status === 'active'
        ? (language === 'id' ? 'Suspend' : 'Suspend')
        : (language === 'id' ? 'Aktifkan' : 'Activate'),
      icon: user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />,
      onClick: () => handleToggleStatus(user.id),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setDeletingUserId(user.id);
        setShowDeleteModal(true);
      },
      danger: true,
    },
  ];

  const getRoleBadge = (role: User['role']) => {
    const config = {
      student: { variant: 'secondary' as const, label: language === 'id' ? 'Siswa' : 'Student' },
      instructor: { variant: 'primary' as const, label: language === 'id' ? 'Instruktur' : 'Instructor' },
      admin: { variant: 'danger' as const, label: 'Admin' },
    };
    const { variant, label } = config[role];
    return <Badge variant={variant} size="sm">{label}</Badge>;
  };

  const getStatusBadge = (status: User['status']) => {
    return status === 'active' ? (
      <Badge variant="success" size="sm">
        <CheckCircle className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Aktif' : 'Active'}
      </Badge>
    ) : (
      <Badge variant="warning" size="sm">
        <XCircle className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Suspend' : 'Suspended'}
      </Badge>
    );
  };

  // Column definitions for DataTable
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: language === 'id' ? 'Pengguna' : 'User',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div>
                <button
                  onClick={() => navigate(`/admin/users/${user.id}`)}
                  className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer text-left"
                >
                  {user.name}
                </button>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => getRoleBadge(row.original.role),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'createdAt',
        header: language === 'id' ? 'Terdaftar' : 'Registered',
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-gray-400" />
                {new Date(date).toLocaleDateString('id-ID')}
              </div>
              <div className="text-xs text-gray-500">{getTimeAgo(date)}</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'lastLogin',
        header: language === 'id' ? 'Login Terakhir' : 'Last Login',
        cell: ({ row }) => {
          const login = row.original.lastLogin;
          if (!login) return <span className="text-gray-400">-</span>;
          return (
            <div className="text-sm text-gray-700">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-gray-400" />
                {new Date(login).toLocaleDateString('id-ID')}
              </div>
              <div className="text-xs text-gray-500">{getTimeAgo(login)}</div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: language === 'id' ? 'Aksi' : 'Actions',
        cell: ({ row }) => (
          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            }
            items={getUserActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language]
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Manajemen Pengguna' : 'User Management'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Kelola semua pengguna platform'
                : 'Manage all platform users'}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowAddModal(true)} leftIcon={<UserPlus className="w-4 h-4" />}>
            {language === 'id' ? 'Tambah Pengguna' : 'Add User'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.students)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.instructors)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Instruktur' : 'Instructors'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.admins)}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.active)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Aktif' : 'Active'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.suspended)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Suspend' : 'Suspended'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.newThisMonth)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Baru' : 'New'}</p>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedUsers.length} {language === 'id' ? 'pengguna dipilih' : 'users selected'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleBulkActivate}>
                  {language === 'id' ? 'Aktifkan' : 'Activate'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleBulkSuspend}>
                  {language === 'id' ? 'Suspend' : 'Suspend'}
                </Button>
                <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                  {language === 'id' ? 'Hapus' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Users Table with Filters */}
        <Card>
          {/* Filters & Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari nama atau email...' : 'Search name or email...'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                <Select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Role' : 'All Roles' },
                    { value: 'student', label: language === 'id' ? 'Siswa' : 'Student' },
                    { value: 'instructor', label: language === 'id' ? 'Instruktur' : 'Instructor' },
                    { value: 'admin', label: 'Admin' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'active', label: language === 'id' ? 'Aktif' : 'Active' },
                    { value: 'suspended', label: language === 'id' ? 'Suspend' : 'Suspended' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredUsers}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={setSelectedUsers}
          />
        </Card>

        {/* Add User Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={language === 'id' ? 'Tambah Pengguna Baru' : 'Add New User'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="john@example.com"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              options={[
                { value: 'student', label: language === 'id' ? 'Siswa' : 'Student' },
                { value: 'instructor', label: language === 'id' ? 'Instruktur' : 'Instructor' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button size="sm" variant="outline" onClick={() => setShowAddModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleAddUser}>
                {language === 'id' ? 'Tambah Pengguna' : 'Add User'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={language === 'id' ? 'Edit Pengguna' : 'Edit User'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              options={[
                { value: 'student', label: language === 'id' ? 'Siswa' : 'Student' },
                { value: 'instructor', label: language === 'id' ? 'Instruktur' : 'Instructor' },
                { value: 'admin', label: 'Admin' },
              ]}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Password Baru (kosongkan jika tidak ingin mengubah)' : 'New Password (leave blank to keep current)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button size="sm" variant="outline" onClick={() => setShowEditModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleEditUser}>
                {language === 'id' ? 'Simpan' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Konfirmasi Hapus' : 'Confirm Delete'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.'
                : 'Are you sure you want to delete this user? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDeleteUser}>
                {language === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
