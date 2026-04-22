import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  DollarSign,
  Star,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  Trash2,
  Copy,
  Archive,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Input, Dropdown, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { useGetInstructorCoursesQuery, type InstructorCourse } from '@/store/features/instructor/instructorApiSlice';

type CourseStatus = 'draft' | 'pending' | 'published' | 'rejected';

export function InstructorCoursesPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<CourseStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'students' | 'revenue'>('newest');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<InstructorCourse | null>(null);

  const { data: courses = [], isLoading, error } = useGetInstructorCoursesQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-500">
              {language === 'id' ? 'Memuat kursus...' : 'Loading courses...'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
     return (
        <DashboardLayout>
           <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>
                 {language === 'id' 
                    ? 'Gagal memuat data kursus. Silakan coba lagi nanti.' 
                    : 'Failed to load courses. Please try again later.'}
              </p>
           </div>
        </DashboardLayout>
     );
  }

  // Stats
  const stats = {
    totalCourses: courses.length,
    published: courses.filter((c) => c.status === 'published').length,
    pending: courses.filter((c) => c.status === 'pending').length,
    draft: courses.filter((c) => c.status === 'draft').length,
    totalStudents: courses.reduce((sum, c) => sum + c.totalStudents, 0),
    totalRevenue: courses.reduce((sum, c) => sum + c.totalRevenue, 0),
    monthlyRevenue: courses.reduce((sum, c) => sum + c.revenueThisMonth, 0),
  };

  // Filter and sort courses
  const filteredCourses = courses
    .filter((course) => {
      const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'students':
          return b.totalStudents - a.totalStudents;
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Dipublikasi' : 'Published'}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="warning" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Menunggu Review' : 'Pending Review'}
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary" size="sm">
            <Edit className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Draft' : 'Draft'}
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="danger" size="sm">
            <XCircle className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Ditolak' : 'Rejected'}
          </Badge>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDeleteCourse = () => {
    if (selectedCourse) {
      console.log('Deleting course:', selectedCourse.id);
      setShowDeleteModal(false);
      setSelectedCourse(null);
    }
  };

  const getCourseActions = (course: InstructorCourse) => [
    {
      label: language === 'id' ? 'Edit Kursus' : 'Edit Course',
      icon: <Edit className="w-4 h-4" />,
      onClick: () => navigate(`/instructor/courses/${course.id}/edit`),
    },
    {
      label: language === 'id' ? 'Lihat Statistik' : 'View Statistics',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => navigate(`/instructor/courses/${course.id}/analytics`),
    },
    {
      label: language === 'id' ? 'Kelola Siswa' : 'Manage Students',
      icon: <Users className="w-4 h-4" />,
      onClick: () => navigate(`/instructor/courses/${course.id}/students`),
    },
    ...(course.status === 'published'
      ? [
        {
          label: language === 'id' ? 'Lihat Kursus' : 'View Course',
          icon: <Eye className="w-4 h-4" />,
          onClick: () => navigate(`/course/${course.slug}`),
        },
      ]
      : []),
    {
      label: language === 'id' ? 'Duplikasi' : 'Duplicate',
      icon: <Copy className="w-4 h-4" />,
      onClick: () => console.log('Duplicate:', course.id),
    },
    { divider: true, label: '' },
    ...(course.status === 'draft'
      ? [
        {
          label: language === 'id' ? 'Hapus Kursus' : 'Delete Course',
          icon: <Trash2 className="w-4 h-4" />,
          onClick: () => {
            setSelectedCourse(course);
            setShowDeleteModal(true);
          },
          danger: true,
        },
      ]
      : [
        {
          label: language === 'id' ? 'Arsipkan' : 'Archive',
          icon: <Archive className="w-4 h-4" />,
          onClick: () => console.log('Archive:', course.id),
          danger: true,
        },
      ]),
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Kursus Saya' : 'My Courses'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Kelola semua kursus yang Anda buat.'
                : 'Manage all the courses you have created.'}
            </p>
          </div>
          <Link
            to="/instructor/courses/create"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            {language === 'id' ? 'Buat Kursus Baru' : 'Create New Course'}
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total Kursus' : 'Total Courses'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-5 h-5 text-green-600" />
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
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total Pendapatan' : 'Total Revenue'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Bulan Ini' : 'This Month'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {language === 'id' ? 'Semua' : 'All'} ({stats.totalCourses})
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'published'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {language === 'id' ? 'Dipublikasi' : 'Published'} ({stats.published})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'pending'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            {language === 'id' ? 'Menunggu Review' : 'Pending'} ({stats.pending})
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${statusFilter === 'draft'
              ? 'bg-gray-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Draft ({stats.draft})
          </button>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'id' ? 'Cari kursus...' : 'Search courses...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'students' | 'revenue')}
                aria-label="Sort by"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{language === 'id' ? 'Terbaru' : 'Newest'}</option>
                <option value="students">{language === 'id' ? 'Siswa Terbanyak' : 'Most Students'}</option>
                <option value="revenue">{language === 'id' ? 'Pendapatan Tertinggi' : 'Highest Revenue'}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Courses List */}
        {filteredCourses.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Tidak Ada Kursus' : 'No Courses Found'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || statusFilter !== 'all'
                ? language === 'id'
                  ? 'Tidak ada kursus yang cocok dengan filter Anda.'
                  : 'No courses match your filters.'
                : language === 'id'
                  ? 'Mulai buat kursus pertama Anda.'
                  : 'Start creating your first course.'}
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
              >
                <Plus className="w-4 h-4" />
                {language === 'id' ? 'Buat Kursus Baru' : 'Create New Course'}
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card 
                key={course.id} 
                className="hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full overflow-hidden border-transparent hover:border-blue-500/20"
                onClick={() => navigate(`/instructor/courses/${course.id}/edit`)}
              >
                  {/* Thumbnail */}
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    {course.thumbnail ? (
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <BookOpen className="w-12 h-12 opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-2 left-2">
                      {getStatusBadge(course.status)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 flex flex-col">
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight min-h-[3rem]">
                          {course.title}
                        </h3>
                        <Dropdown
                          trigger={
                            <button
                              className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors -mr-2"
                              aria-label="Course actions"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-5 h-5" />
                            </button>
                          }
                          items={getCourseActions(course).map(action => ({
                             ...action,
                             onClick: () => {
                                // Original onClick logic is preserved in getCourseActions, we don't need to wrap it here 
                                // because the Dropdown component likely handles the click. 
                                // However, if Dropdown doesn't stop prop automatically, we might have an issue.
                                // Let's rely on the trigger stopping propagation for the menu OPENING.
                                // For menu ITEMS, it's a different component scope.
                                // But usually, clicking an item navigates away or closes modal, so it's fine.
                                if ('onClick' in action && typeof action.onClick === 'function') {
                                    action.onClick();
                                }
                             }
                          }))}
                          align="right"
                        />
                      </div>

                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500 mb-4 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>
                            {course.totalLessons} {language === 'id' ? 'Pljrn' : 'Lessons'}
                          </span>
                        </div>
                        {course.status === 'published' && course.rating > 0 && (
                          <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span>{course.rating}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 ml-auto font-medium text-gray-900">
                           {course.price === 0 ? (language === 'id' ? 'Gratis' : 'Free') : formatCurrency(course.price)}
                        </div>
                      </div>

                      {/* Stats Grid - Compact */}
                      {course.status === 'published' && (
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-gray-100 mt-2">
                          <div>
                             <p className="text-xs text-gray-500 mb-0.5">{language === 'id' ? 'Siswa' : 'Students'}</p>
                             <p className="font-semibold text-gray-900">{formatNumber(course.totalStudents)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-xs text-gray-500 mb-0.5">{language === 'id' ? 'Pendapatan' : 'Revenue'}</p>
                             <p className="font-semibold text-gray-900">{formatCurrency(course.totalRevenue)}</p>
                          </div>
                        </div>
                      )}

                      {/* Pending/Rejected Message */}
                      {course.status !== 'published' && (
                        <div className="pt-4 border-t border-gray-100 mt-2">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                <span>{language === 'id' ? 'Update:' : 'Updated:'} {formatDate(course.updatedAt)}</span>
                            </div>
                        </div>
                      )}
                  </div>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Hapus Kursus' : 'Delete Course'}
          size="md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'id' ? 'Apakah Anda yakin?' : 'Are you sure?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'id'
                ? `Anda akan menghapus kursus "${selectedCourse?.title}". Tindakan ini tidak dapat dibatalkan.`
                : `You are about to delete "${selectedCourse?.title}". This action cannot be undone.`}
            </p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button variant="danger" onClick={handleDeleteCourse}>
                {language === 'id' ? 'Ya, Hapus' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
