import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  BookOpen,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MoreVertical,
  Eye,
  Download,
  Filter,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select, DataTable, Avatar } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// Course interface
interface Course {
  id: string;
  title: string;
  thumbnail: string;
  instructor: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  studentsEnrolled: number;
  price: number;
  status: 'draft' | 'pending' | 'published' | 'revision' | 'rejected';
  submittedAt?: string;
  publishedAt?: string;
  createdAt: string;
}

// Mock courses data
const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Advanced React Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300',
    instructor: {
      id: 'inst-1',
      name: 'Siti Nurhaliza',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    },
    category: 'Web Development',
    studentsEnrolled: 456,
    price: 299000,
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'course-2',
    title: 'TypeScript Mastery',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300',
    instructor: {
      id: 'inst-1',
      name: 'Siti Nurhaliza',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    },
    category: 'Programming',
    studentsEnrolled: 382,
    price: 249000,
    status: 'published',
    publishedAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
    instructor: {
      id: 'inst-2',
      name: 'Dewi Lestari',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    },
    category: 'Design',
    studentsEnrolled: 287,
    price: 199000,
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'course-4',
    title: 'Next.js Full Stack Development',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
    instructor: {
      id: 'inst-3',
      name: 'Rudi Hermawan',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rudi',
    },
    category: 'Web Development',
    studentsEnrolled: 0,
    price: 349000,
    status: 'pending',
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
  },
  {
    id: 'course-5',
    title: 'Python for Data Science',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300',
    instructor: {
      id: 'inst-2',
      name: 'Dewi Lestari',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    },
    category: 'Data Science',
    studentsEnrolled: 0,
    price: 299000,
    status: 'revision',
    submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
  },
  {
    id: 'course-6',
    title: 'Mobile App Development with Flutter',
    thumbnail: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=300',
    instructor: {
      id: 'inst-4',
      name: 'Budi Santoso',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiS',
    },
    category: 'Mobile Development',
    studentsEnrolled: 0,
    price: 399000,
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function CoursesManagementPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockCourses.length;
    const pending = mockCourses.filter(c => c.status === 'pending').length;
    const published = mockCourses.filter(c => c.status === 'published').length;
    const rejected = mockCourses.filter(c => c.status === 'rejected').length;
    const revision = mockCourses.filter(c => c.status === 'revision').length;
    const totalStudents = mockCourses.reduce((sum, c) => sum + c.studentsEnrolled, 0);

    return { total, pending, published, rejected, revision, totalStudents };
  }, []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    let courses = [...mockCourses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(c =>
        c.title.toLowerCase().includes(query) ||
        c.instructor.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      courses = courses.filter(c => c.status === statusFilter);
    }

    // Category filter
    if (categoryFilter !== 'all') {
      courses = courses.filter(c => c.category === categoryFilter);
    }

    return courses;
  }, [searchQuery, statusFilter, categoryFilter]);

  // Pending courses
  const pendingCourses = useMemo(() => {
    return mockCourses.filter(c => c.status === 'pending');
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(mockCourses.map(c => c.category)));
    return cats.sort();
  }, []);

  const getStatusBadge = (status: Course['status']) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu Review' : 'Pending Review', icon: Clock },
      published: { variant: 'success' as const, label: language === 'id' ? 'Publish' : 'Published', icon: CheckCircle },
      revision: { variant: 'primary' as const, label: language === 'id' ? 'Perlu Revisi' : 'Needs Revision', icon: Filter },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle },
    };
    const { variant, label, icon: Icon } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getCourseActions = (course: Course): DropdownItem[] => {
    const actions: DropdownItem[] = [
      {
        label: language === 'id' ? 'Review Kursus' : 'Review Course',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => navigate(`/admin/courses/${course.id}/review`),
      },
    ];

    if (course.status === 'pending') {
      actions.push({
        label: language === 'id' ? 'Setujui' : 'Approve',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: () => console.log('Approve course:', course.id),
      });
      actions.push({
        label: language === 'id' ? 'Tolak' : 'Reject',
        icon: <XCircle className="w-4 h-4" />,
        onClick: () => console.log('Reject course:', course.id),
      });
    }

    return actions;
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Course>[]>(
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
        accessorKey: 'title',
        header: language === 'id' ? 'Kursus' : 'Course',
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-16 h-10 object-cover rounded"
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                <p className="text-xs text-gray-500">{course.category}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'instructor.name',
        header: language === 'id' ? 'Instruktur' : 'Instructor',
        cell: ({ row }) => {
          const instructor = row.original.instructor;
          return (
            <div className="flex items-center gap-2">
              <Avatar src={instructor.avatar} name={instructor.name} size="sm" />
              <span className="text-sm text-gray-900">{instructor.name}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'studentsEnrolled',
        header: language === 'id' ? 'Siswa' : 'Students',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="font-medium">{formatNumber(row.original.studentsEnrolled)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: language === 'id' ? 'Harga' : 'Price',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {formatCurrency(row.original.price)}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'submittedAt',
        header: language === 'id' ? 'Disubmit' : 'Submitted',
        cell: ({ row }) => {
          const date = row.original.submittedAt || row.original.publishedAt;
          return date ? (
            <div className="text-xs text-gray-700">
              {getTimeAgo(date)}
            </div>
          ) : (
            <span className="text-xs text-gray-400">-</span>
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
            items={getCourseActions(row.original)}
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
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Manajemen Kursus' : 'Course Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Review dan kelola semua kursus platform'
              : 'Review and manage all platform courses'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.pending)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Review' : 'Review'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.published)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Publish' : 'Published'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Filter className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.revision)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Revisi' : 'Revision'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.rejected)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Ditolak' : 'Rejected'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalStudents)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
            </div>
          </Card>
        </div>

        {/* Pending Review Section */}
        {pendingCourses.length > 0 && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                {language === 'id' ? 'Menunggu Review' : 'Pending Review'}
                <Badge variant="warning">{pendingCourses.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{course.title}</p>
                        <p className="text-xs text-gray-500">
                          {course.instructor.name} • {course.category} • {getTimeAgo(course.submittedAt!)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/admin/courses/${course.id}/review`)}
                      >
                        {language === 'id' ? 'Review' : 'Review'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedCourses.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedCourses.length} {language === 'id' ? 'kursus dipilih' : 'courses selected'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  {language === 'id' ? 'Setujui' : 'Approve'}
                </Button>
                <Button size="sm" variant="danger">
                  {language === 'id' ? 'Tolak' : 'Reject'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Courses Table */}
        <Card>
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari kursus, instruktur, atau kategori...' : 'Search course, instructor, or category...'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'pending', label: language === 'id' ? 'Menunggu Review' : 'Pending Review' },
                    { value: 'published', label: language === 'id' ? 'Publish' : 'Published' },
                    { value: 'revision', label: language === 'id' ? 'Perlu Revisi' : 'Needs Revision' },
                    { value: 'rejected', label: language === 'id' ? 'Ditolak' : 'Rejected' },
                    { value: 'draft', label: 'Draft' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Kategori' : 'All Categories' },
                    ...categories.map(cat => ({ value: cat, label: cat })),
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
            data={filteredCourses}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={setSelectedCourses}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
