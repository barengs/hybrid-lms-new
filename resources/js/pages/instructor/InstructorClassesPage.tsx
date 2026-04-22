import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  BookOpen,
  Archive,
  Clock,
  CheckCircle,
  Settings,
  Trash2,
  Eye,
  Copy,
  BarChart3,
  FolderOpen,
  ArchiveRestore,
} from 'lucide-react';
import { Card, Button, Badge, Input, Dropdown, Modal, Avatar, type DropdownItem } from '@/components/ui';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';

type ClassStatus = 'active' | 'archived';

import { 
  useGetClassesQuery, 
  useCreateClassMutation, 
  useUpdateClassMutation, 
  useDeleteClassMutation,
  type ClassItem
} from '@/store/features/classes/classesApiSlice';
import { Loader2 } from 'lucide-react';


export function InstructorClassesPage() {
  const { language } = useLanguage();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ClassStatus | 'all'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);


  // Form state for creating class
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');
  const [newClassDescription, setNewClassDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');


  // API Hooks
  const { data: classesData, isLoading } = useGetClassesQuery();
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const classes = classesData?.data?.items || [];
  const metaStats = classesData?.data?.meta?.statistics;

  // Stats - Use meta stats if available, else calculate
  const stats = {
    totalClasses: metaStats?.total_batches ?? classes.length,
    activeClasses: metaStats?.active_batches ?? classes.filter((c) => c.status === 'active').length,
    archivedClasses: metaStats?.archived_batches ?? classes.filter((c) => c.status === 'archived').length,
    totalStudents: metaStats?.total_students ?? classes.reduce((sum, c) => sum + (c.students_count || 0), 0),
    avgGrade: metaStats?.average_grade ?? (classes.length > 0 
      ? Math.round(
          classes.filter((c) => c.status === 'active').reduce((sum, c) => sum + (c.averageGrade || 0), 0) /
          (classes.filter((c) => c.status === 'active').length || 1)
        )
      : 0),
  };


  // Filter classes
  const filteredClasses = classes
    .filter((cls) => {
      const matchesSearch =
        (cls.name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (cls.class_code?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || cls.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.updated_at || b.created_at || new Date()).getTime() - new Date(a.updated_at || a.created_at || new Date()).getTime());


  const getClassActions = (cls: any) => {
    const actions: DropdownItem[] = [
      {
        label: language === 'id' ? 'Lihat Detail' : 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => navigate(`/instructor/classes/${cls.id}`),
      },
      {
        label: language === 'id' ? 'Kelola Kelas' : 'Manage Class',
        icon: <Settings className="w-4 h-4" />,
        onClick: () => navigate(`/instructor/classes/${cls.id}/manage`),
      },
      {
        label: language === 'id' ? 'Salin Kode' : 'Copy Code',
        icon: <Copy className="w-4 h-4" />,
        onClick: () => {
          if (cls.class_code) {
             navigator.clipboard.writeText(cls.class_code);
             // Toast removed
          }
        },

      },
      { divider: true, label: '' },
    ];

    if (cls.status === 'active') {
      actions.push({
        label: language === 'id' ? 'Arsipkan' : 'Archive',
        icon: <Archive className="w-4 h-4" />,
        onClick: () => {
          setSelectedClass(cls);
          setShowArchiveModal(true);
        },
      });
    } else if (cls.status === 'archived') {
      actions.push({
        label: language === 'id' ? 'Aktifkan Kembali' : 'Restore',
        icon: <ArchiveRestore className="w-4 h-4" />,
        onClick: async () => {
          try {
             await updateClass({ id: cls.id, status: 'active' }).unwrap();
          } catch (err) {
             console.error('Failed to restore class', err);
          }
        },
      });
    }

    actions.push({
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => {
        setSelectedClass(cls);
        setShowDeleteModal(true);
      },
      danger: true,
    });

    return actions;
  };

  const handleCreateClass = async () => {
    try {
       await createClass({
          name: newClassName,
          code: newClassCode,
          description: newClassDescription,
          courseId: selectedCourseId || undefined
       }).unwrap();
       
       setShowCreateModal(false);
       setNewClassName('');
       setNewClassCode('');
       setNewClassDescription('');
       setSelectedCourseId('');
    } catch (err) {
       console.error('Failed to create class', err);
    }
  };


  const generateClassCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewClassCode(code);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Kelas Saya' : 'My Classes'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Kelola kelas dan atur pembelajaran untuk siswa Anda.'
                : 'Manage classes and organize learning for your students.'}
            </p>
          </div>
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
            {language === 'id' ? 'Buat Kelas Baru' : 'Create New Class'}
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FolderOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalClasses)}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total Kelas' : 'Total Classes'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeClasses}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Kelas Aktif' : 'Active Classes'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Archive className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.archivedClasses}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Diarsipkan' : 'Archived'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalStudents)}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total Siswa' : 'Total Students'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.avgGrade}%</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Rata-rata Nilai' : 'Average Grade'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'id' ? 'Cari kelas atau kode...' : 'Search classes or code...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {language === 'id' ? 'Semua' : 'All'} ({stats.totalClasses})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'active'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {language === 'id' ? 'Aktif' : 'Active'} ({stats.activeClasses})
              </button>
              <button
                onClick={() => setStatusFilter('archived')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === 'archived'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {language === 'id' ? 'Arsip' : 'Archived'} ({stats.archivedClasses})
              </button>
            </div>
          </div>
        </Card>

        {/* Classes Grid */}
        {filteredClasses.length === 0 ? (
          <Card className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Belum Ada Kelas' : 'No Classes Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? language === 'id'
                  ? 'Tidak ada kelas yang cocok dengan filter Anda.'
                  : 'No classes match your filters.'
                : language === 'id'
                  ? 'Buat kelas pertama Anda untuk memulai mengajar.'
                  : 'Create your first class to start teaching.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowCreateModal(true)}>
                {language === 'id' ? 'Buat Kelas Baru' : 'Create New Class'}
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClasses.map((cls) => (
              <Card key={cls.id} className="hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-40 overflow-hidden rounded-t-xl">
                  <img
                    src={cls.thumbnail}
                    alt={cls.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={cls.status === 'active' ? 'success' : 'secondary'} size="sm">
                      {cls.status === 'active'
                        ? language === 'id'
                          ? 'Aktif'
                          : 'Active'
                        : language === 'id'
                          ? 'Diarsipkan'
                          : 'Archived'}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3">
                    <Dropdown
                      trigger={
                        <button
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30"
                          aria-label="Class actions"
                        >
                          <MoreVertical className="w-4 h-4 text-white" />
                        </button>
                      }
                      items={getClassActions(cls)}
                      align="right"
                    />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white font-bold text-lg line-clamp-1">{cls.name}</p>
                    <p className="text-white/80 text-sm flex items-center gap-1">
                      <span className="bg-white/20 px-2 py-0.5 rounded text-xs">{cls.class_code}</span>
                    </p>

                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Course Link */}
                  {cls.course ? (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <BookOpen className="w-4 h-4" />
                      <span className="line-clamp-1">{cls.course.title}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                      <BookOpen className="w-4 h-4" />
                      <span>{language === 'id' ? 'Tanpa kursus terkait' : 'No linked course'}</span>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{cls.topicsCount || 0}</p>
                      <p className="text-xs text-gray-500">{language === 'id' ? 'Topik' : 'Topics'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{cls.materialsCount || 0}</p>
                      <p className="text-xs text-gray-500">{language === 'id' ? 'Materi' : 'Materials'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{cls.students_count || 0}</p>
                      <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-50 rounded-lg">
                      <p className="text-lg font-bold text-gray-900">{cls.averageGrade || 0}%</p>
                      <p className="text-xs text-gray-500">{language === 'id' ? 'Nilai' : 'Grade'}</p>
                    </div>

                  </div>

                  {/* Students Avatars */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {(cls.recentStudents || []).slice(0, 4).map((student: any) => (
                        <Avatar
                          key={student.id}
                          src={student.avatar}
                          name={student.name}
                          size="sm"
                          className="ring-2 ring-white"
                        />
                      ))}
                      {(cls.students_count || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                          +{(cls.students_count || 0) - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(cls.lastActivityAt || cls.updated_at || cls.created_at || new Date().toISOString())}
                    </div>

                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-100 p-3 flex gap-2">
                  <Link
                    to={`/instructor/classes/${cls.id}`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {language === 'id' ? 'Lihat' : 'View'}
                  </Link>
                  <Link
                    to={`/instructor/classes/${cls.id}/manage`}
                    className="flex-1 text-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    {language === 'id' ? 'Kelola' : 'Manage'}
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create Class Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={language === 'id' ? 'Buat Kelas Baru' : 'Create New Class'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Kelas' : 'Class Name'} *
              </label>
              <Input
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: React Advanced 2024 - Batch A' : 'e.g., React Advanced 2024 - Batch A'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Kode Kelas' : 'Class Code'} *
              </label>
              <div className="flex gap-2">
                <Input
                  value={newClassCode}
                  onChange={(e) => setNewClassCode(e.target.value.toUpperCase())}
                  placeholder="RA2024A"
                  className="flex-1"
                />
                <Button variant="outline" onClick={generateClassCode}>
                  {language === 'id' ? 'Generate' : 'Generate'}
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'id'
                  ? 'Kode ini digunakan siswa untuk bergabung ke kelas.'
                  : 'Students will use this code to join the class.'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Deskripsi' : 'Description'}
              </label>
              <textarea
                value={newClassDescription}
                onChange={(e) => setNewClassDescription(e.target.value)}
                placeholder={language === 'id' ? 'Deskripsi singkat tentang kelas...' : 'Brief description about the class...'}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Tautkan ke Kursus (Opsional)' : 'Link to Course (Optional)'}
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Select course"
              >
                <option value="">{language === 'id' ? 'Pilih kursus...' : 'Select a course...'}</option>
                <option value="course-1">React Masterclass: From Zero to Hero</option>
                <option value="course-2">Full Stack Development with Node.js</option>
                <option value="course-3">UI/UX Design Fundamentals</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'id'
                  ? 'Kursus yang ditautkan akan memberikan akses materi ke siswa di kelas ini.'
                  : 'Linked course materials will be accessible to students in this class.'}
              </p>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleCreateClass}
                disabled={!newClassName.trim() || !newClassCode.trim() || isCreating}
                isLoading={isCreating}
              >
                {language === 'id' ? 'Buat Kelas' : 'Create Class'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Archive Confirmation Modal */}
        <Modal
          isOpen={showArchiveModal}
          onClose={() => setShowArchiveModal(false)}
          title={language === 'id' ? 'Arsipkan Kelas' : 'Archive Class'}
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {language === 'id'
                ? `Apakah Anda yakin ingin mengarsipkan kelas "${selectedClass?.name}"? Siswa tidak akan dapat mengakses kelas ini setelah diarsipkan.`
                : `Are you sure you want to archive "${selectedClass?.name}"? Students will not be able to access this class after archiving.`}
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowArchiveModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                variant="secondary"
                onClick={async () => {
                  if (selectedClass) {
                    try {
                      await updateClass({ id: selectedClass.id, status: 'archived' }).unwrap();
                      setShowArchiveModal(false);
                    } catch (err) {
                       console.error('Failed to archive class', err);
                    }
                  }
                }}
              >
                {language === 'id' ? 'Arsipkan' : 'Archive'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Hapus Kelas' : 'Delete Class'}
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-red-800">
                {language === 'id'
                  ? `Apakah Anda yakin ingin menghapus kelas "${selectedClass?.name}"? Semua data termasuk topik, materi, dan nilai siswa akan dihapus secara permanen.`
                  : `Are you sure you want to delete "${selectedClass?.name}"? All data including topics, materials, and student grades will be permanently deleted.`}
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (selectedClass) {
                    try {
                      await deleteClass(selectedClass.id).unwrap();
                      setShowDeleteModal(false);
                    } catch (err) {
                       console.error('Failed to delete class', err);
                    }
                  }
                }}
              >
                {language === 'id' ? 'Hapus Permanen' : 'Delete Permanently'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
