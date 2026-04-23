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
  Plus,
  RotateCcw,
  Loader2,
  MapPin,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Select, Modal, DataTable, Textarea, MultiSelect } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import {
  useGetUsersQuery,
  useGetUserStatsQuery,
  useGetRolesQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useToggleUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useBulkUserActionMutation,
  type AdminUser,
} from '@/store/features/admin/adminUserApiSlice';
import toast from 'react-hot-toast';

export function AdminUsersPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [selectedUsers, setSelectedUsers] = useState<AdminUser[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    roles: [] as string[],
    bio: '',
    address: '',
    status: 'active' as AdminUser['status'],
  });

  // API Hooks
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsersQuery({
    page,
    search: searchQuery,
    role: roleFilter,
    status: statusFilter,
  });

  const { data: stats, isLoading: isLoadingStats } = useGetUserStatsQuery();
  const { data: rolesList } = useGetRolesQuery();

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [bulkAction, { isLoading: isBulkLoading }] = useBulkUserActionMutation();

  // Handlers
  const handleAddUser = async () => {
    try {
      if (formData.roles.length === 0) {
        toast.error(language === 'id' ? 'Pilih setidaknya satu role' : 'Select at least one role');
        return;
      }
      const response = await createUser(formData).unwrap();
      toast.success(response.message);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', roles: [], bio: '', address: '', status: 'active' });
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to create user');
    }
  };

  const handleEditUser = async () => {
    if (!editingUser) return;
    try {
      const response = await updateUser({ id: editingUser.id, data: formData }).unwrap();
      toast.success(response.message);
      setShowEditModal(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUserId) return;
    try {
      const response = await deleteUser(deletingUserId).unwrap();
      toast.success(response.message);
      setShowDeleteModal(false);
      setDeletingUserId(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete user');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await toggleStatus(userId).unwrap();
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to toggle status');
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      const response = await restoreUser(userId).unwrap();
      toast.success(response.message);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to restore user');
    }
  };

  const handleBulkOperation = async (action: string) => {
    try {
      const ids = selectedUsers.map(u => u.id);
      const response = await bulkAction({ ids, action }).unwrap();
      toast.success(response.message);
      setSelectedUsers([]);
    } catch (err: any) {
      toast.error(err.data?.message || 'Bulk operation failed');
    }
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      roles: user.roles.map(r => r.name),
      bio: user.profile?.bio || '',
      address: user.profile?.address || '',
      status: user.status,
    });
    setShowEditModal(true);
  };

  const getUserActions = (user: AdminUser): DropdownItem[] => [
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
      disabled: !!user.deleted_at,
    },
    {
      label: language === 'id' ? 'Pulihkan' : 'Restore',
      icon: <RotateCcw className="w-4 h-4" />,
      onClick: () => handleRestoreUser(user.id),
      hidden: !user.deleted_at,
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
      hidden: !!user.deleted_at,
    },
  ];

  const getRoleBadge = (role: string) => {
    const variants: Record<string, any> = {
      student: 'secondary',
      instructor: 'primary',
      admin: 'danger',
      curriculum: 'warning',
      marketing: 'success',
    };
    const variant = variants[role.toLowerCase()] || 'outline';
    return <Badge key={role} variant={variant} size="sm" className="capitalize mr-1 mb-1">{role}</Badge>;
  };

  const getStatusBadge = (user: AdminUser) => {
    if (user.deleted_at) {
      return (
        <Badge variant="danger" size="sm">
          <Trash2 className="w-3 h-3 mr-1" />
          {language === 'id' ? 'Terhapus' : 'Deleted'}
        </Badge>
      );
    }
    return user.status === 'active' ? (
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
  const columns = useMemo<ColumnDef<AdminUser>[]>(
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
              <Avatar src={user.profile?.avatar ?? undefined} name={user.name} size="sm" />
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
        accessorKey: 'roles',
        header: 'Role',
        cell: ({ row }) => (
          <div className="flex flex-wrap max-w-[200px]">
            {row.original.roles.map(r => getRoleBadge(r.name))}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original),
      },
      {
        accessorKey: 'created_at',
        header: language === 'id' ? 'Terdaftar' : 'Registered',
        cell: ({ row }) => {
          const date = row.original.created_at;
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
        enableSorting: true,
      },
      {
        accessorKey: 'last_login_at',
        header: language === 'id' ? 'Login Terakhir' : 'Last Login',
        cell: ({ row }) => {
          const login = row.original.last_login_at;
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
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
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
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          {isLoadingStats ? (
            Array(7).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-gray-50 h-20"> </Card>
            ))
          ) : (
            <>
              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.total || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.students || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.instructors || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Instruktur' : 'Instructors'}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.admins || 0)}</p>
                  <p className="text-xs text-gray-500">Admin</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.active || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Aktif' : 'Active'}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <UserX className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.suspended || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Suspend' : 'Suspended'}</p>
                </div>
              </Card>

              <Card className="flex items-center gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{formatNumber(stats?.newThisMonth || 0)}</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Baru' : 'New'}</p>
                </div>
              </Card>
            </>
          )}
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedUsers.length} {language === 'id' ? 'pengguna dipilih' : 'users selected'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleBulkOperation('activate')} disabled={isBulkLoading}>
                  {language === 'id' ? 'Aktifkan' : 'Activate'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkOperation('suspend')} disabled={isBulkLoading}>
                  {language === 'id' ? 'Suspend' : 'Suspend'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleBulkOperation('restore')} disabled={isBulkLoading} className="bg-white">
                   <RotateCcw className="w-3.5 h-3.5 mr-1 text-green-600" />
                   {language === 'id' ? 'Pulihkan' : 'Restore'}
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkOperation('delete')} disabled={isBulkLoading}>
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
                    ...(rolesList?.map(r => ({ value: r.name, label: r.name.charAt(0).toUpperCase() + r.name.slice(1) })) || []),
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
                    { value: 'deleted', label: language === 'id' ? 'Terhapus' : 'Deleted' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={usersData?.data || []}
            isLoading={isLoadingUsers}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={setSelectedUsers}
          />
        </Card>

        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={language === 'id' ? 'Tambah Pengguna Baru' : 'Add New User'}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <p className="text-xs text-gray-500 mt-1">
                {language === 'id' ? 'Password akan dikirim ke email pengguna.' : 'Password will be sent to the user\'s email.'}
              </p>
            </div>

            <MultiSelect
              label="Role"
              placeholder={language === 'id' ? 'Pilih satu atau lebih role...' : 'Select one or more roles...'}
              options={rolesList?.map(role => ({ value: role.name, label: role.name })) || []}
              selectedValues={formData.roles}
              onChange={(values) => setFormData({ ...formData, roles: values })}
            />

            <Textarea
              label={language === 'id' ? 'Bio / Ringkasan' : 'Bio / Summary'}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder={language === 'id' ? 'Tulis sedikit tentang pengguna...' : 'Write something about the user...'}
              rows={2}
            />

            <Textarea
              label={language === 'id' ? 'Alamat' : 'Address'}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder={language === 'id' ? 'Alamat lengkap...' : 'Full address...'}
              rows={2}
            />

            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-1">
              <Button size="sm" variant="outline" onClick={() => setShowAddModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleAddUser} disabled={isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'id' ? 'Memproses...' : 'Processing...'}
                  </>
                ) : (
                  <>{language === 'id' ? 'Tambah Pengguna' : 'Add User'}</>
                )}
              </Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={language === 'id' ? 'Edit Pengguna' : 'Edit User'}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
            </div>

            <Select
              label={language === 'id' ? 'Status Akun' : 'Account Status'}
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as AdminUser['status'] })}
              options={[
                { value: 'active', label: language === 'id' ? 'Aktif' : 'Active' },
                { value: 'suspended', label: language === 'id' ? 'Suspended' : 'Suspended' },
              ]}
            />

            <MultiSelect
              label="Role"
              placeholder={language === 'id' ? 'Pilih satu atau lebih role...' : 'Select one or more roles...'}
              options={rolesList?.map(role => ({ value: role.name, label: role.name })) || []}
              selectedValues={formData.roles}
              onChange={(values) => setFormData({ ...formData, roles: values })}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Password Baru' : 'New Password'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {language === 'id' ? 'Kosongkan jika tidak ingin mengubah.' : 'Leave blank to keep current.'}
              </p>
            </div>

            <Textarea
              label={language === 'id' ? 'Bio / Ringkasan' : 'Bio / Summary'}
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={2}
            />

            <Textarea
              label={language === 'id' ? 'Alamat' : 'Address'}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
            />

            <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-white pb-1">
              <Button size="sm" variant="outline" onClick={() => setShowEditModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleEditUser} disabled={isUpdating}>
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </>
                ) : (
                  <>{language === 'id' ? 'Simpan' : 'Save'}</>
                )}
              </Button>
            </div>
          </div>
        </Modal>

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
              <Button size="sm" variant="danger" onClick={handleDeleteUser} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'id' ? 'Hapus' : 'Delete')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
