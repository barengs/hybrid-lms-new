/**
 * Permission Grid Configuration
 * Maps flat Spatie permissions into a Menu/Action matrix.
 */

export interface PermissionModule {
  id: string;
  label: { id: string; en: string };
  actions: {
    create?: string;
    read?: string;
    update?: string;
    delete?: string;
    approve?: string;
    manage?: string; // Catch-all for generic management
    other?: Array<{ label: string; permission: string }>;
  };
}

export const PERMISSION_MATRIX: PermissionModule[] = [
  {
    id: 'users',
    label: { id: 'Manajemen Pengguna', en: 'User Management' },
    actions: {
      read: 'manage users',
      create: 'manage users',
      update: 'manage users',
      delete: 'manage users',
    },
  },
  {
    id: 'instructors',
    label: { id: 'Manajemen Instruktur', en: 'Instructor Management' },
    actions: {
      read: 'manage instructors',
      update: 'manage instructors',
      approve: 'manage instructors',
    },
  },
  {
    id: 'courses',
    label: { id: 'Manajemen Kursus', en: 'Course Management' },
    actions: {
      read: 'view enrolled courses',
      create: 'create courses',
      update: 'edit courses',
      delete: 'delete courses',
      approve: 'approve courses',
    },
  },
  {
    id: 'categories',
    label: { id: 'Kategori Kursus', en: 'Course Categories' },
    actions: {
      read: 'manage categories',
      create: 'manage categories',
      update: 'manage categories',
      delete: 'manage categories',
    },
  },
  {
    id: 'payouts',
    label: { id: 'Pembayaran & Keuangan', en: 'Payouts & Finance' },
    actions: {
      read: 'view instructor payouts',
      approve: 'approve payouts',
      other: [
        { label: 'Manage Commission', permission: 'manage commission' }
      ]
    },
  },
  {
    id: 'settings',
    label: { id: 'Pengaturan Platform', en: 'Platform Settings' },
    actions: {
      read: 'manage settings',
      update: 'manage settings',
    },
  },
  {
    id: 'content',
    label: { id: 'Konten & Moderasi', en: 'Content & Moderation' },
    actions: {
      read: 'moderate content',
      update: 'moderate content',
      delete: 'moderate content',
      approve: 'moderate content',
    },
  },
];

export const ACTIONS = [
  { id: 'read', label: { id: 'Lihat', en: 'Read' } },
  { id: 'create', label: { id: 'Tambah', en: 'Create' } },
  { id: 'update', label: { id: 'Edit', en: 'Update' } },
  { id: 'delete', label: { id: 'Hapus', en: 'Delete' } },
  { id: 'approve', label: { id: 'Approve', en: 'Approve' } },
];

/**
 * Transforms a list of permission names into a structure optimized for the Matrix UI.
 */
export const getPermissionsFromMatrix = (matrixSelection: Record<string, string[]>): string[] => {
  const permissions = new Set<string>();
  
  Object.entries(matrixSelection).forEach(([moduleId, actions]) => {
    const module = PERMISSION_MATRIX.find(m => m.id === moduleId);
    if (!module) return;

    actions.forEach(actionId => {
      // @ts-ignore
      const perm = module.actions[actionId];
      if (perm) permissions.add(perm);
    });
  });

  return Array.from(permissions);
};

/**
 * Transforms flat permissions from API into Matrix selection state
 */
export const getMatrixFromPermissions = (permissions: string[]): Record<string, string[]> => {
  const selection: Record<string, string[]> = {};

  PERMISSION_MATRIX.forEach(module => {
    const selectedActions: string[] = [];
    
    // Check main actions
    ACTIONS.forEach(action => {
       // @ts-ignore
       const permName = module.actions[action.id];
       if (permName && permissions.includes(permName)) {
         selectedActions.push(action.id);
       }
    });

    if (selectedActions.length > 0) {
      selection[module.id] = selectedActions;
    }
  });

  return selection;
};
