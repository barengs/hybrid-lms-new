import { useState, useRef } from 'react';
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
  Loader2,
  Camera,
  X
} from 'lucide-react';
import { Card, Button, Badge, Input, Dropdown, Modal, Avatar, type DropdownItem } from '@/components/ui';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

type ClassStatus = 'active' | 'archived';

import { 
  useGetClassesQuery, 
  useCreateClassMutation, 
  useUpdateClassMutation, 
  useDeleteClassMutation,
  type ClassItem
} from '@/store/features/classes/classesApiSlice';
import { useGetInstructorCoursesQuery } from '@/store/features/instructor/instructorApiSlice';


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
  const [newClassBanner, setNewClassBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // API Hooks
  const { data: classesData, isLoading } = useGetClassesQuery();
  const { data: courses = [] } = useGetInstructorCoursesQuery();
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass] = useUpdateClassMutation();
  const [deleteClass] = useDeleteClassMutation();

  const classes = classesData?.data?.items || [];
  const metaStats = classesData?.data?.meta?.statistics;

  // Stats - Use meta stats if available, else calculate
  const stats = {
    totalClasses: metaStats?.total_batches ?? classes.length,
    activeClasses: metaStats?.active_batches ?? classes.filter((c) => c.status === 'active' || c.status === 'open' || c.status === 'in_progress').length,
    archivedClasses: metaStats?.archived_batches ?? classes.filter((c) => c.status === 'archived').length,
    totalStudents: metaStats?.total_students ?? classes.reduce((sum, c) => sum + (Number(c.students_count) || 0), 0),
    avgGrade: metaStats?.average_grade ?? (classes.length > 0 
      ? Math.round(
          classes.filter((c) => c.status === 'active' || c.status === 'open' || c.status === 'in_progress').reduce((sum, c) => sum + (Number(c.assessment_stats?.class_average_score) || 0), 0) /
          (classes.filter((c) => c.status === 'active' || c.status === 'open' || c.status === 'in_progress').length || 1)
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

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewClassBanner(file);
      setBannerPreview(URL.createObjectURL(file));
    }
  };

  const removeBanner = () => {
    setNewClassBanner(null);
    setBannerPreview(null);
  };

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
       const formData = new FormData();
       formData.append('name', newClassName);
       formData.append('code', newClassCode);
       formData.append('description', newClassDescription);
       if (selectedCourseId) {
         formData.append('courseId', selectedCourseId);
       }
       if (newClassBanner) {
         formData.append('thumbnail', newClassBanner);
       }

       await createClass(formData).unwrap();
       
       toast.success(language === 'id' ? 'Kelas berhasil dibuat' : 'Class created successfully');
       setShowCreateModal(false);
       
       // Reset form
       setNewClassName('');
       setNewClassCode('');
       setNewClassDescription('');
       setSelectedCourseId('');
       setNewClassBanner(null);
       setBannerPreview(null);
    } catch (err: any) {
       console.error('Failed to create class', err);
       const message = err.data?.message || (language === 'id' ? 'Gagal membuat kelas' : 'Failed to create class');
       toast.error(message);
       if (err.data?.errors) {
         Object.values(err.data.errors).flat().forEach((msg: any) => toast.error(msg as string));
       }
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
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
                <div className="relative h-40 overflow-hidden rounded-t-xl">
                  {cls.thumbnail ? (
                    <img
                      src={cls.thumbnail}
                      alt={cls.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <BookOpen className="w-12 h-12 text-white/20" />
                    </div>
                  )}
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

                <div className="p-4">
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
                      {Number(cls.students_count || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 ring-2 ring-white">
                          +{Number(cls.students_count || 0) - 4}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {getTimeAgo(cls.lastActivityAt || cls.updated_at || cls.created_at || new Date().toISOString())}
                    </div>
                  </div>
                </div>

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

        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={language === 'id' ? 'Buat Kelas Baru' : 'Create New Class'}
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {language === 'id' ? 'Banner Kelas (Opsional)' : 'Class Banner (Optional)'}
              </label>
              
              {bannerPreview ? (
                <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-gray-200">
                  <img 
                    src={bannerPreview} 
                    alt="Banner preview" 
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={removeBanner}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full text-red-500 hover:bg-white shadow-sm transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video w-full border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <div className="p-3 bg-gray-50 rounded-full group-hover:bg-blue-100 transition-colors">
                    <Camera className="w-6 h-6 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-500 group-hover:text-blue-600">
                    {language === 'id' ? 'Klik untuk unggah banner' : 'Click to upload banner'}
                  </p>
                  <p className="text-xs text-gray-400">
                    JPG, PNG or WEBP (Max. 2MB)
                  </p>
                </div>
              )}
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleBannerChange}
                accept="image/*"
                className="hidden"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Nama Kelas *' : 'Class Name *'}
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
                {courses.map((course: any) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
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
