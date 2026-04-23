import { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Edit,
  Trash2,
  ChevronRight,
  Shield,
  Search,
  MoreVertical,
  Check,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Modal, DataTable, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import {
  useGetRolesQuery,
  useGetMatrixQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/store/features/admin/adminRoleApiSlice';
import { ACTIONS } from '@/lib/permissionMapping';
import toast from 'react-hot-toast';

export function RoleManagementPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  // Form State
  const [roleName, setRoleName] = useState('');
  const [matrixSelection, setMatrixSelection] = useState<Record<string, string[]>>({});

  // API Hooks
  const { data: roles, isLoading: isLoadingRoles } = useGetRolesQuery();
  const { data: matrixResponse, isLoading: isLoadingMatrix } = useGetMatrixQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const permissionModules = useMemo(() => matrixResponse?.data || [], [matrixResponse]);

  // Helper: Get matrix from flat permissions
  const getMatrixFromPermissions = (perms: string[]) => {
    const selection: Record<string, string[]> = {};
    permissionModules.forEach(module => {
      const selectedActions: string[] = [];
      const modulePerms = module.permissions as Record<string, string>;
      if (!modulePerms) return;

      Object.entries(modulePerms).forEach(([actionId, permName]) => {
        if (perms.includes(permName)) {
          selectedActions.push(actionId);
        }
      });

      if (selectedActions.length > 0) {
        selection[module.key] = selectedActions;
      }
    });
    return selection;
  };

  // Helper: Get flat permissions from matrix
  const getPermissionsFromMatrix = (selection: Record<string, string[]>) => {
    const perms = new Set<string>();
    Object.entries(selection).forEach(([moduleKey, actionIds]) => {
      const module = permissionModules.find(m => m.key === moduleKey);
      if (!module || !module.permissions) return;
      
      const modulePerms = module.permissions as Record<string, string>;
      actionIds.forEach(actionId => {
        if (modulePerms[actionId]) {
          perms.add(modulePerms[actionId]);
        }
      });
    });
    return Array.from(perms);
  };

  const filteredRoles = useMemo(() => {
    if (!roles) return [];
    return roles.filter(role => 
      role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [roles, searchQuery]);

  const handleOpenModal = (role?: any) => {
    if (role) {
      setEditingRole(role);
      setRoleName(role.name);
      const perms = role.permissions.map((p: any) => p.name);
      setMatrixSelection(getMatrixFromPermissions(perms));
    } else {
      setEditingRole(null);
      setRoleName('');
      setMatrixSelection({});
    }
    setShowModal(true);
  };

  const handleTogglePivot = (moduleKey: string, actionId: string) => {
    setMatrixSelection(prev => {
      const moduleActions = prev[moduleKey] || [];
      const newActions = moduleActions.includes(actionId)
        ? moduleActions.filter(a => a !== actionId)
        : [...moduleActions, actionId];
      
      return { ...prev, [moduleKey]: newActions };
    });
  };

  const handleToggleRow = (moduleKey: string) => {
    const module = permissionModules.find(m => m.key === moduleKey);
    if (!module || !module.permissions) return;

    const availableActions = Object.keys(module.permissions);
    const currentActions = matrixSelection[moduleKey] || [];

    if (currentActions.length === availableActions.length) {
      // Unselect all
      setMatrixSelection(prev => {
        const next = { ...prev };
        delete next[moduleKey];
        return next;
      });
    } else {
      // Select all available
      setMatrixSelection(prev => ({
        ...prev,
        [moduleKey]: availableActions
      }));
    }
  };

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error(language === 'id' ? 'Nama role harus diisi' : 'Role name is required');
      return;
    }

    const permissions = getPermissionsFromMatrix(matrixSelection);
    
    try {
      if (editingRole) {
        await updateRole({ id: editingRole.id, name: roleName, permissions }).unwrap();
        toast.success(language === 'id' ? 'Role berhasil diperbarui' : 'Role updated successfully');
      } else {
        await createRole({ name: roleName, permissions }).unwrap();
        toast.success(language === 'id' ? 'Role berhasil dibuat' : 'Role created successfully');
      }
      setShowModal(false);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to save role');
    }
  };

  const handleDelete = async () => {
    if (!deletingRoleId) return;
    try {
      await deleteRole(deletingRoleId).unwrap();
      toast.success(language === 'id' ? 'Role berhasil dihapus' : 'Role deleted successfully');
      setShowDeleteModal(false);
      setDeletingRoleId(null);
    } catch (err: any) {
      toast.error(err.data?.message || 'Failed to delete role');
    }
  };

  const columns = [
    {
      accessorKey: 'name',
      header: language === 'id' ? 'Nama Peran' : 'Role Name',
      cell: ({ row }: any) => {
        const isSystem = ['admin', 'instructor', 'student', 'super-admin'].includes(row.original.name.toLowerCase());
        return (
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isSystem ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-600'}`}>
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 capitalize">{row.original.name}</p>
              <p className="text-xs text-gray-500">{row.original.guard_name}</p>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: 'permissions',
      header: language === 'id' ? 'Hak Akses' : 'Permissions',
      cell: ({ row }: any) => (
        <Badge variant="outline" size="sm">
          {row.original.permissions.length} {language === 'id' ? 'Izin' : 'Permissions'}
        </Badge>
      )
    },
    {
      id: 'actions',
      header: language === 'id' ? 'Aksi' : 'Actions',
      cell: ({ row }: any) => {
        const isSystem = ['admin', 'instructor', 'student', 'super-admin'].includes(row.original.name.toLowerCase());
        return (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => handleOpenModal(row.original)}>
              <Edit className="w-4 h-4" />
            </Button>
            {!isSystem && (
              <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => {
                setDeletingRoleId(row.original.id);
                setShowDeleteModal(true);
              }}>
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <DashboardLayout>
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              {language === 'id' ? 'Manajemen Role & Permission' : 'Role & Permission Management'}
            </h1>
            <p className="text-gray-500 mt-1">
              {language === 'id' 
                ? 'Kelola peran pengguna dan pembatasan hak akses modul.' 
                : 'Manage user roles and module access restrictions.'}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="shadow-lg shadow-blue-500/20">
            <Plus className="w-5 h-5 mr-2" />
            {language === 'id' ? 'Tambah Role' : 'Add Role'}
          </Button>
        </div>

        <Card className="mb-8 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder={language === 'id' ? 'Cari role...' : 'Search roles...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
              />
            </div>
          </div>
          <DataTable 
            columns={columns} 
            data={filteredRoles} 
            isLoading={isLoadingRoles} 
          />
        </Card>

        {/* Create/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingRole ? (language === 'id' ? 'Edit Peran' : 'Edit Role') : (language === 'id' ? 'Tambah Peran Baru' : 'Add New Role')}
          size="lg"
        >
          <div className="space-y-6 max-h-[80vh] overflow-y-auto px-1">
            <div>
              <Input
                label={language === 'id' ? 'Nama Peran' : 'Role Name'}
                placeholder="e.g. Sales Manager"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="font-semibold"
              />
              <p className="mt-1 text-xs text-gray-500">
                {language === 'id' ? 'Gunakan nama yang mudah dipahami.' : 'Use a descriptive name for the role.'}
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wider min-w-[200px]">
                      {language === 'id' ? 'Modul / Menu' : 'Module / Menu'}
                    </th>
                    {ACTIONS.map(action => (
                      <th key={action.id} className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                        {language === 'id' ? action.label.id : action.label.en}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isLoadingMatrix ? (
                    <tr>
                      <td colSpan={ACTIONS.length + 1} className="py-8 text-center text-gray-500">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
                        {language === 'id' ? 'Memuat data matrix...' : 'Loading matrix data...'}
                      </td>
                    </tr>
                  ) : (
                    permissionModules.map((module) => (
                      <tr key={module.key} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                              {language === 'id' ? module.label_id : module.label_en}
                            </span>
                            <button 
                              type="button"
                              onClick={() => handleToggleRow(module.key)}
                              className="text-[10px] text-blue-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase"
                            >
                              Toggle All
                            </button>
                          </div>
                        </td>
                        {ACTIONS.map(action => {
                          const modulePerms = module.permissions as Record<string, string>;
                          const isAvailable = modulePerms && modulePerms[action.id];
                          const isSelected = matrixSelection[module.key]?.includes(action.id);
                          
                          return (
                            <td key={action.id} className="px-4 py-4 text-center">
                              {isAvailable ? (
                                <button
                                  type="button"
                                  onClick={() => handleTogglePivot(module.key, action.id)}
                                  className={`w-6 h-6 rounded-md border flex items-center justify-center mx-auto transition-all ${
                                    isSelected 
                                      ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200' 
                                      : 'border-gray-200 text-transparent hover:border-blue-400 hover:text-blue-200'
                                  }`}
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                {language === 'id' 
                  ? 'Perubahan role akan berdampak langsung pada seluruh pengguna yang memiliki role ini.' 
                  : 'Changes to roles will immediately affect all users with this role assigned.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setShowModal(false)} disabled={isCreating || isUpdating}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {language === 'id' ? 'Menyimpan...' : 'Saving...'}
                  </>
                ) : (
                  <>{language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}</>
                )}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Hapus Role?' : 'Delete Role?'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {language === 'id' 
                ? 'Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan.' 
                : 'Are you sure you want to delete this role? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : (language === 'id' ? 'Hapus' : 'Delete')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
