import { useMemo, useState } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ListChecks,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Tag,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Modal, DataTable, Input, IconSelector } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown, DashboardLoadingScreen } from '@/components/ui';
import {
  useGetOnboardingQuestionsQuery,
  useCreateOnboardingQuestionMutation,
  useUpdateOnboardingQuestionMutation,
  useDeleteOnboardingQuestionMutation,
  useToggleOnboardingQuestionActiveMutation,
  type OnboardingQuestion,
  type CreateOnboardingQuestionPayload,
  type OnboardingOption
} from '@/store/features/admin/onboardingQuestionApiSlice';

export function OnboardingQuestionsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<OnboardingQuestion | null>(null);

  // API Hooks
  const { data: questions = [], isLoading, error: queryError, refetch } = useGetOnboardingQuestionsQuery();
  const [createQuestion, { isLoading: isCreating }] = useCreateOnboardingQuestionMutation();
  const [updateQuestion, { isLoading: isUpdating }] = useUpdateOnboardingQuestionMutation();
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteOnboardingQuestionMutation();
  const [toggleActive] = useToggleOnboardingQuestionActiveMutation();

  // Form state
  const [formData, setFormData] = useState<CreateOnboardingQuestionPayload>({
    question: '',
    options: [{ value: '', label: '', icon: '' }],
    sort_order: 0,
    is_active: true,
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!questions.length) return { total: 0, active: 0, inactive: 0 };

    const total = questions.length;
    const active = questions.filter(q => q.is_active).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [questions]);

  // Filter questions
  const filteredQuestions = useMemo(() => {
    if (!searchQuery) return questions;

    const query = searchQuery.toLowerCase();
    return questions.filter(q =>
      q.question.toLowerCase().includes(query) ||
      q.slug.toLowerCase().includes(query)
    );
  }, [questions, searchQuery]);

  const handleAddOption = () => {
    setFormData(prev => ({ ...prev, options: [...prev.options, { value: '', label: '', icon: '' }] }));
  };

  const handleRemoveOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const handleOptionChange = (index: number, field: keyof OnboardingOption, value: string) => {
    setFormData(prev => {
      const newOptions = [...prev.options];
      newOptions[index] = { ...newOptions[index], [field]: value };
      return { ...prev, options: newOptions };
    });
  };

  const handleAdd = () => {
    setFormData({
      question: '',
      options: [{ value: '', label: '', icon: '' }],
      sort_order: questions.length > 0 ? Math.max(...questions.map(q => q.sort_order)) + 1 : 1,
      is_active: true
    });
    setShowAddModal(true);
  };

  const handleEdit = (question: OnboardingQuestion) => {
    setSelectedQuestion(question);
    setFormData({
      question: question.question,
      options: question.options.length ? question.options : [{ value: '', label: '', icon: '' }],
      sort_order: question.sort_order,
      is_active: question.is_active,
    });
    setShowEditModal(true);
  };

  const handleDelete = (question: OnboardingQuestion) => {
    setSelectedQuestion(question);
    setShowDeleteModal(true);
  };

  const handleToggleActive = async (question: OnboardingQuestion) => {
    try {
      await toggleActive({ id: question.id, is_active: !question.is_active }).unwrap();
      refetch();
    } catch (err) {
      console.error('Failed to toggle question status:', err);
    }
  };

  const confirmAdd = async () => {
    try {
      // Filter out empty options
      const payload = {
        ...formData,
        options: formData.options.filter(opt => opt.value.trim() !== '' && opt.label.trim() !== '')
      };
      if (payload.options.length === 0) {
        // Minimum 1 option required, could show error message
        return;
      }
      await createQuestion(payload).unwrap();
      refetch();
      setShowAddModal(false);
    } catch (err) {
      console.error('Failed to create question:', err);
    }
  };

  const confirmEdit = async () => {
    if (!selectedQuestion) return;
    try {
      const payload = {
        ...formData,
        id: selectedQuestion.id,
        options: formData.options.filter(opt => opt.value.trim() !== '' && opt.label.trim() !== '')
      };
      if (payload.options.length === 0) return;
      await updateQuestion(payload).unwrap();
      refetch();
      setShowEditModal(false);
      setSelectedQuestion(null);
    } catch (err) {
      console.error('Failed to update question:', err);
    }
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    try {
      await deleteQuestion(selectedQuestion.id).unwrap();
      setShowDeleteModal(false);
      setSelectedQuestion(null);
      refetch();
    } catch (err) {
      console.error('Failed to delete question:', err);
    }
  };

  const getActions = (question: OnboardingQuestion): DropdownItem[] => [
    {
      label: language === 'id' ? 'Edit' : 'Edit',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => handleEdit(question),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(question),
      danger: true,
    },
  ];

  // Column definitions
  const columns = useMemo<ColumnDef<OnboardingQuestion>[]>(
    () => [
      {
        accessorKey: 'question',
        header: language === 'id' ? 'Pertanyaan' : 'Question',
        cell: ({ row }) => {
          const question = row.original;
          return (
            <div>
              <p className="font-medium text-gray-900 text-sm">{question.question}</p>
              <p className="text-xs text-gray-500">{question.slug}</p>
            </div>
          );
        },
      },
      {
        accessorKey: 'options',
        header: language === 'id' ? 'Opsi Jawaban' : 'Options',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">
            {row.original.options.length} {language === 'id' ? 'opsi' : 'options'}
          </span>
        ),
      },
      {
        accessorKey: 'sort_order',
        header: language === 'id' ? 'Urutan' : 'Sort Order',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700">{row.original.sort_order}</span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
            const isActive = row.original.is_active;
            return (
          <button onClick={() => handleToggleActive(row.original)} className="focus:outline-none">
            <Badge variant={isActive ? 'success' : 'secondary'} size="sm" className="cursor-pointer hover:opacity-80">
              {isActive ? (language === 'id' ? 'Aktif' : 'Active') : (language === 'id' ? 'Nonaktif' : 'Inactive')}
            </Badge>
          </button>
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
            items={getActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language, questions]
  );
  
  if (isLoading) return <DashboardLoadingScreen />;

  if (queryError) {
      return (
          <DashboardLayout>
              <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <p className="text-gray-900 font-medium">
                      {language === 'id' ? 'Gagal memuat pertanyaan' : 'Failed to load questions'}
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
      <div>
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Pertanyaan Onboarding' : 'Onboarding Questions'}
              </h1>
              <p className="text-gray-600 mt-1">
                {language === 'id'
                  ? 'Kelola pertanyaan untuk pengguna baru'
                  : 'Manage questions for new users'}
              </p>
            </div>
            <Button onClick={handleAdd} leftIcon={<Plus className="w-4 h-4" />}>
              {language === 'id' ? 'Tambah Pertanyaan' : 'Add Question'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListChecks className="w-5 h-5 text-blue-600" />
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
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <Tag className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.inactive)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Nonaktif' : 'Inactive'}</p>
            </div>
          </Card>
        </div>

        {/* Questions Table */}
        <Card>
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari pertanyaan...' : 'Search questions...'}
                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredQuestions}
            enableRowSelection={false}
            enablePagination={true}
            pageSize={10}
          />
        </Card>

        {/* Add Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={language === 'id' ? 'Tambah Pertanyaan' : 'Add Question'}
          size="full"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Pertanyaan' : 'Question'}
              </label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder={language === 'id' ? 'Apa minat utama Anda?' : 'What is your main interest?'}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'id' ? 'Opsi Jawaban' : 'Options'}
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> {language === 'id' ? 'Tambah Opsi' : 'Add Option'}
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <div className="col-span-4">{language === 'id' ? 'Teks Jawaban' : 'Answer Label'}</div>
                  <div className="col-span-3">{language === 'id' ? 'Kode Unik (Value)' : 'Unique Value'}</div>
                  <div className="col-span-4">{language === 'id' ? 'Ikon' : 'Icon'}</div>
                  <div className="col-span-1 text-center">{language === 'id' ? 'Aksi' : 'Action'}</div>
                </div>
                <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 p-3 items-start bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-4">
                        <Input
                          value={opt.label}
                          onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                          placeholder={language === 'id' ? "Contoh: Pemrograman" : "e.g. Programming"}
                          className="w-full text-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {language === 'id' ? 'Teks yang akan dibaca pengguna' : 'Text displayed to user'}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={opt.value}
                          onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                          placeholder="programming"
                          className="w-full text-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {language === 'id' ? 'Kode sistem (tanpa spasi)' : 'System code (no space)'}
                        </p>
                      </div>
                      <div className="col-span-4">
                        <IconSelector 
                          value={opt.icon || ''}
                          onChange={(val) => handleOptionChange(idx, 'icon', val)}
                          language={language}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-1">
                        <button 
                          onClick={() => handleRemoveOption(idx)} 
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30" 
                          disabled={formData.options.length <= 1} 
                          type="button" 
                          title={language === 'id' ? "Hapus Opsi" : "Remove Option"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Urutan' : 'Sort Order'}
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'id' ? 'Aktif' : 'Active'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
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
          title={language === 'id' ? 'Edit Pertanyaan' : 'Edit Question'}
          size="full"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Pertanyaan' : 'Question'}
              </label>
              <Input
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {language === 'id' ? 'Opsi Jawaban' : 'Options'}
                </label>
                <Button type="button" variant="outline" size="sm" onClick={handleAddOption} className="text-xs">
                  <Plus className="w-3 h-3 mr-1" /> {language === 'id' ? 'Tambah Opsi' : 'Add Option'}
                </Button>
              </div>
              
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-3 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-600">
                  <div className="col-span-4">{language === 'id' ? 'Teks Jawaban' : 'Answer Label'}</div>
                  <div className="col-span-3">{language === 'id' ? 'Kode Unik (Value)' : 'Unique Value'}</div>
                  <div className="col-span-4">{language === 'id' ? 'Ikon' : 'Icon'}</div>
                  <div className="col-span-1 text-center">{language === 'id' ? 'Aksi' : 'Action'}</div>
                </div>
                <div className="divide-y divide-gray-100 max-h-[50vh] overflow-y-auto">
                  {formData.options.map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-4 p-3 items-start bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="col-span-4">
                        <Input
                          value={opt.label}
                          onChange={(e) => handleOptionChange(idx, 'label', e.target.value)}
                          placeholder={language === 'id' ? "Contoh: Pemrograman" : "e.g. Programming"}
                          className="w-full text-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {language === 'id' ? 'Teks yang akan dibaca pengguna' : 'Text displayed to user'}
                        </p>
                      </div>
                      <div className="col-span-3">
                        <Input
                          value={opt.value}
                          onChange={(e) => handleOptionChange(idx, 'value', e.target.value)}
                          placeholder="programming"
                          className="w-full text-sm"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">
                          {language === 'id' ? 'Kode sistem (tanpa spasi)' : 'System code (no space)'}
                        </p>
                      </div>
                      <div className="col-span-4">
                        <IconSelector 
                          value={opt.icon || ''}
                          onChange={(val) => handleOptionChange(idx, 'icon', val)}
                          language={language}
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-1">
                        <button 
                          onClick={() => handleRemoveOption(idx)} 
                          className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-30" 
                          disabled={formData.options.length <= 1} 
                          type="button" 
                          title={language === 'id' ? "Hapus Opsi" : "Remove Option"}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Urutan' : 'Sort Order'}
                </label>
                <Input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {language === 'id' ? 'Aktif' : 'Active'}
                  </span>
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t">
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
                ? `Apakah Anda yakin ingin menghapus pertanyaan ini? Tindakan ini tidak dapat dibatalkan.`
                : `Are you sure you want to delete this question? This action cannot be undone.`}
            </p>
            <div className="flex justify-end gap-2 border-t pt-4">
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
