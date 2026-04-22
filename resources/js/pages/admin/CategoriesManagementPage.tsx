import { useMemo, useState, useEffect } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  FolderOpen,
  TrendingUp,
  BookOpen,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Modal, DataTable, Input, EmojiSelector } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import {
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  type Category,
  type CreateCategoryPayload
} from '@/store/features/category/categoryApiSlice';

export function CategoriesManagementPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  // API Hooks
  const { data: categories = [], isLoading, error: queryError, refetch } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();

  // Form state
  const [formData, setFormData] = useState<CreateCategoryPayload>({
    name: '',
    slug: '',
    description: '',
    icon: '',
    parent_id: null,
    sort_order: 0,
    is_active: true,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!categories.length) return { total: 0, active: 0, totalCourses: 0, avgCoursesPerCategory: 0, topCategory: null };

    const total = categories.length;
    const active = categories.filter(c => c.is_active || c.active).length;
    const totalCourses = categories.reduce((sum, c) => sum + (c.courses_count || 0), 0);
    const avgCoursesPerCategory = totalCourses / total;
    const topCategory = categories.reduce((max, c) =>
      (c.courses_count || 0) > (max.courses_count || 0) ? c : max
      , categories[0]);

    return { total, active, totalCourses, avgCoursesPerCategory, topCategory };
  }, [categories]);

  // Filter categories
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return categories;

    const query = searchQuery.toLowerCase();
    return categories.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.description?.toLowerCase().includes(query) ||
      c.slug.toLowerCase().includes(query)
    );
  }, [categories, searchQuery]);

  // Auto-generate slug from name
  useEffect(() => {
    if (showAddModal && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData(prev => ({ ...prev, slug }));
    }
  }, [formData.name, showAddModal]);

  const handleAdd = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      icon: '',
      parent_id: null,
      sort_order: 0,
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      icon: category.icon || '',
      parent_id: category.parent_id || null, // Ensure explicit null
      sort_order: category.sort_order || 0,
      is_active: category.is_active || category.active || true,
    });
    setShowEditModal(true);
  };

  const handleDelete = (category: Category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmAdd = async () => {
    try {
      // Prepare payload
      const payload = {
        ...formData,
        parent_id: formData.parent_id === '' ? null : (formData.parent_id as number | null)
      };
      await createCategory(payload).unwrap();
      // Force refetch to ensure list is updated
      refetch();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create category:', err);
    }
  };

  const confirmEdit = async () => {
    if (!selectedCategory) return;
    try {
      const payload = {
        ...formData,
        id: selectedCategory.id,
        parent_id: formData.parent_id === '' ? null : (formData.parent_id as number | null)
      };
      await updateCategory(payload).unwrap();
      refetch();
      setShowEditModal(false);
      setSelectedCategory(null);
    } catch (err) {
      console.error('Failed to update category:', err);
    }
  };


  const confirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteCategory(selectedCategory.id).unwrap();
      setShowDeleteModal(false);
      setSelectedCategory(null);
      // toast.success(language === 'id' ? 'Kategori berhasil dihapus' : 'Category deleted successfully');
    } catch (err) {
      console.error('Failed to delete category:', err);
      // toast.error(language === 'id' ? 'Gagal menghapus kategori' : 'Failed to delete category');
    }
  };

  const getParentName = (parentId?: number | null) => {
    if (!parentId) return '-';
    // Use the fetched categories to find the parent name
    const parent = categories.find(c => c.id === parentId);
    return parent ? parent.name : '-';
  };

  const getCategoryActions = (category: Category): DropdownItem[] => [
    {
      label: language === 'id' ? 'Edit' : 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleEdit(category),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(category),
      danger: true,
    },
  ];

  // Column definitions
  const columns = useMemo<ColumnDef<Category>[]>(
    () => [
      {
        accessorKey: 'name',
        header: language === 'id' ? 'Kategori' : 'Category',
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex items-center gap-3">
              <span className="text-2xl">{category.icon || '📁'}</span>
              <div>
                <p className="font-medium text-gray-900 text-sm">{category.name}</p>
                <p className="text-xs text-gray-500">{category.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'description',
        header: language === 'id' ? 'Deskripsi' : 'Description',
        cell: ({ row }) => (
          <p className="text-sm text-gray-700 max-w-md truncate">
            {row.original.description || '-'}
          </p>
        ),
      },
      {
        accessorKey: 'parent_id',
        header: language === 'id' ? 'Parent' : 'Parent',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {getParentName(row.original.parent_id)}
          </span>
        ),
      },
      {
        accessorKey: 'courses_count',
        header: language === 'id' ? 'Kursus' : 'Courses',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <BookOpen className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{formatNumber(row.original.courses_count || 0)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.original.is_active || row.original.active;
            return (
          <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
            {isActive ? (language === 'id' ? 'Aktif' : 'Active') : (language === 'id' ? 'Nonaktif' : 'Inactive')}
          </Badge>
        )},
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
            items={getCategoryActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language, categories]
  );
  
  if (isLoading) {
    return (
        <DashboardLayout>
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        </DashboardLayout>
    );
  }

  if (queryError) {
      return (
          <DashboardLayout>
              <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-gray-900 font-medium">
                      {language === 'id' ? 'Gagal memuat kategori' : 'Failed to load categories'}
                  </p>
                  <Button onClick={() => window.location.reload()}>
                      {language === 'id' ? 'Coba Lagi' : 'Try Again'}
                  </Button>
              </div>
          </DashboardLayout>
      )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Manajemen Kategori' : 'Categories Management'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'id'
                  ? 'Kelola kategori kursus platform'
                  : 'Manage platform course categories'}
              </p>
            </div>
            <Button onClick={handleAdd} leftIcon={<Plus className="w-4 h-4" />}>
              {language === 'id' ? 'Tambah Kategori' : 'Add Category'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.active)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Aktif' : 'Active'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalCourses)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Kursus' : 'Courses'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{stats.avgCoursesPerCategory.toFixed(1)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Rata-rata' : 'Average'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <span className="text-2xl">{stats.topCategory?.icon || '🏆'}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 truncate max-w-[120px]">{stats.topCategory?.name || '-'}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Terpopuler' : 'Most Popular'}</p>
            </div>
          </Card>
        </div>

        {/* Categories Table */}
        <Card>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari kategori...' : 'Search categories...'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredCategories}
            enableRowSelection={false}
            enablePagination={true}
            pageSize={10}
          />
        </Card>

        {/* Add Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={language === 'id' ? 'Tambah Kategori' : 'Add Category'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Kategori' : 'Category Name'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={language === 'id' ? 'Contoh: Web Development' : 'e.g., Web Development'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="web-development"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Deskripsi' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={language === 'id' ? 'Deskripsi kategori...' : 'Category description...'}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji)
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji)
              </label>
              <EmojiSelector
                value={formData.icon}
                onChange={(val) => setFormData({ ...formData, icon: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Parent Kategori (Opsional)' : 'Parent Category (Optional)'}
              </label>
              <select
                value={formData.parent_id ?? ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'id' ? 'Tidak ada parent' : 'No parent'}</option>
                {categories.filter(c => !c.parent_id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button size="sm" variant="outline" onClick={() => setShowAddModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={confirmAdd} isLoading={isCreating}>
                {language === 'id' ? 'Tambah' : 'Add'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={language === 'id' ? 'Edit Kategori' : 'Edit Category'}
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Kategori' : 'Category Name'}
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <Input
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Deskripsi' : 'Description'}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon (Emoji)
              </label>
              <EmojiSelector
                value={formData.icon}
                onChange={(val) => setFormData({ ...formData, icon: val })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Parent Kategori (Opsional)' : 'Parent Category (Optional)'}
              </label>
              <select
                value={formData.parent_id ?? ''}
                onChange={(e) => setFormData({ ...formData, parent_id: e.target.value === '' ? null : Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'id' ? 'Tidak ada parent' : 'No parent'}</option>
                {categories.filter(c => !c.parent_id && c.id !== selectedCategory?.id).map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                ))}
              </select>
            </div>
             <div>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <span className="text-sm font-medium text-gray-700">
                        {language === 'id' ? 'Aktif' : 'Active'}
                    </span>
                </label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button size="sm" variant="outline" onClick={() => setShowEditModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={confirmEdit} isLoading={isUpdating}>
                {language === 'id' ? 'Simpan' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Konfirmasi Hapus' : 'Confirm Delete'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? `Apakah Anda yakin ingin menghapus kategori "${selectedCategory?.name}"? Tindakan ini tidak dapat dibatalkan.`
                : `Are you sure you want to delete "${selectedCategory?.name}" category? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={confirmDelete} isLoading={isDeleting}>
                {language === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
