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
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Select, DataTable, Avatar, LoadingScreen } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { cn, formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import { useGetAdminCoursesQuery, useGetAdminCourseStatsQuery, type AdminCourse as Course } from '@/store/api/courseManagementApiSlice';
import { useGetCategoriesQuery, type Category } from '@/store/features/category/categoryApiSlice';

export function CoursesManagementPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedCourses, setSelectedCourses] = useState<Course[]>([]);

  // API Queries
  const { data: statsData, isLoading: statsLoading } = useGetAdminCourseStatsQuery();
  const { data: coursesData, isLoading: coursesLoading } = useGetAdminCoursesQuery({
    page: currentPage,
    per_page: pageSize,
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
    category_id: categoryFilter === 'all' ? undefined : categoryFilter,
  });
  const { data: categoriesData } = useGetCategoriesQuery();

  const stats = statsData?.data || { total: 0, pending: 0, published: 0, rejected: 0, revision: 0, totalStudents: 0 };
  const courses = coursesData?.data?.data || [];
  const categories = categoriesData || [];

  // Pending courses for the highlight section
  const { data: allPendingData } = useGetAdminCoursesQuery({ status: 'pending', per_page: 5 });
  const pendingCourses = allPendingData?.data?.data || [];

  const getStatusBadge = (status: Course['status']) => {
    const config = {
      draft: { variant: 'secondary' as const, label: 'Draft', icon: Clock, colorClass: 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400' },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu Review' : 'Pending Review', icon: Clock, colorClass: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400' },
      published: { variant: 'success' as const, label: language === 'id' ? 'Publish' : 'Published', icon: CheckCircle, colorClass: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400' },
      revision: { variant: 'primary' as const, label: language === 'id' ? 'Perlu Revisi' : 'Needs Revision', icon: Filter, colorClass: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400' },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle, colorClass: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400' },
    };
    const current = config[status] || config.draft;
    const { label, icon: Icon, colorClass } = current;
    return (
      <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium", colorClass)}>
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
    );
  };

  const getCourseActions = (course: Course): DropdownItem[] => {
    return [
      {
        label: language === 'id' ? 'Review & Detil' : 'Review & Detail',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => navigate(`/admin/courses/${course.id}/review`),
      },
    ];
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Course>[]>(
    () => [
      {
        accessorKey: 'title',
        header: language === 'id' ? 'Kursus' : 'Course',
        cell: ({ row }) => {
          const course = row.original;
          return (
            <div className="flex items-center gap-4 py-1">
              <div className="relative shrink-0">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300'}
                  alt={course.title}
                  className="w-20 h-12 object-cover rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-700"
                />
                <div className="absolute -top-2 -right-2">
                   {course.studentsEnrolled > 100 && <Badge variant="success" size="sm" className="px-1 shadow-sm">Hot</Badge>}
                </div>
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1 hover:text-blue-600 transition-colors cursor-pointer" onClick={() => navigate(`/admin/courses/${course.id}/review`)}>
                  {course.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{course.category?.name}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'instructor',
        header: language === 'id' ? 'Instruktur' : 'Instructor',
        cell: ({ row }) => {
          const instructor = row.original.instructor;
          return (
            <div className="flex items-center gap-2.5">
              <Avatar src={instructor?.avatar} name={instructor?.name} size="sm" className="ring-2 ring-white dark:ring-gray-800" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{instructor?.name}</span>
                <span className="text-[10px] text-gray-400 leading-none">{instructor?.email}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'studentsEnrolled',
        header: language === 'id' ? 'Siswa' : 'Students',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <span className="font-semibold text-gray-900 dark:text-white text-sm">{formatNumber(row.original.studentsEnrolled || 0)}</span>
          </div>
        ),
      },
      {
        accessorKey: 'price',
        header: language === 'id' ? 'Harga' : 'Price',
        cell: ({ row }) => (
          <div className="text-sm font-bold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-900/50 px-2.5 py-1 rounded-lg border border-gray-100 dark:border-gray-800 inline-block">
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
        accessorKey: 'created_at',
        header: language === 'id' ? 'Disubmit' : 'Submitted',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getTimeAgo(row.original.created_at)}</span>
            <span className="text-[10px] text-gray-400">
               {new Date(row.original.created_at).toLocaleDateString()}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors outline-none text-gray-400 hover:text-gray-600">
                <MoreVertical className="w-5 h-5" />
              </button>
            }
            items={getCourseActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language, navigate]
  );

  if (statsLoading || coursesLoading) return <LoadingScreen />;

  const statsItems = [
    { label: language === 'id' ? 'Total Kursus' : 'Total Courses', value: stats.total, icon: BookOpen, color: 'blue', gradient: 'from-blue-500/10 to-indigo-500/10', iconColor: 'text-blue-600' },
    { label: language === 'id' ? 'Antrian Review' : 'Review Queue', value: stats.pending, icon: Clock, color: 'amber', gradient: 'from-amber-500/10 to-orange-500/10', iconColor: 'text-amber-600' },
    { label: language === 'id' ? 'Terpublikasi' : 'Published', value: stats.published, icon: CheckCircle, color: 'emerald', gradient: 'from-emerald-500/10 to-teal-500/10', iconColor: 'text-emerald-600' },
    { label: language === 'id' ? 'Butuh Revisi' : 'Needs Revision', value: stats.revision, icon: Filter, color: 'violet', gradient: 'from-violet-500/10 to-purple-500/10', iconColor: 'text-violet-600' },
    { label: language === 'id' ? 'Ditolak' : 'Rejected', value: stats.rejected, icon: XCircle, color: 'rose', gradient: 'from-rose-500/10 to-red-500/10', iconColor: 'text-rose-600' },
    { label: language === 'id' ? 'Total Siswa' : 'Total Students', value: stats.totalStudents, icon: Users, color: 'sky', gradient: 'from-sky-500/10 to-cyan-500/10', iconColor: 'text-sky-600' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'id' ? 'Manajemen Kursus' : 'Course Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'id'
              ? 'Review dan kelola semua kursus platform'
              : 'Review and manage all platform courses'}
          </p>
        </div>

        {/* Stats Grid - Matching Instructor Style */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {statsItems.map((item, i) => (
            <Card key={i} className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", 
                item.color === 'blue' && "bg-blue-100",
                item.color === 'amber' && "bg-yellow-100",
                item.color === 'emerald' && "bg-green-100",
                item.color === 'violet' && "bg-purple-100",
                item.color === 'rose' && "bg-red-100",
                item.color === 'sky' && "bg-sky-100",
              )}>
                <item.icon className={cn("w-5 h-5", 
                  item.color === 'blue' && "text-blue-600",
                  item.color === 'amber' && "text-yellow-600",
                  item.color === 'emerald' && "text-green-600",
                  item.color === 'violet' && "text-purple-600",
                  item.color === 'rose' && "text-red-600",
                  item.color === 'sky' && "text-sky-600",
                )} />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight truncate">{formatNumber(item.value)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Action Call for Pending Reviews - Adjusted for consistency */}
        {pendingCourses.length > 0 && (
          <Card className="mb-6 bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                <Clock className="w-5 h-5" />
                {language === 'id' ? 'Menunggu Review' : 'Pending Review'}
                <Badge variant="warning">{pendingCourses.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingCourses.slice(0, 3).map((course: Course) => (
                  <div key={course.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-yellow-100 dark:border-yellow-900/20">
                    <div className="flex items-center gap-3">
                      <img
                        src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300'}
                        alt={course.title}
                        className="w-12 h-8 object-cover rounded shadow-sm"
                      />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{course.title}</p>
                        <p className="text-[10px] text-gray-500">{course.instructor?.name} • {getTimeAgo(course.created_at)}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => navigate(`/admin/courses/${course.id}/review`)}
                    >
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Grid View */}
        <Card className="overflow-hidden">
          {/* Table Toolbar - Matching Instructor Style */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari kursus, instruktur...' : 'Search course, instructor...'}
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'pending', label: language === 'id' ? 'Menunggu Review' : 'Pending Review' },
                    { value: 'published', label: language === 'id' ? 'Publish' : 'Published' },
                    { value: 'revision', label: language === 'id' ? 'Perlu Revisi' : 'Needs Revision' },
                    { value: 'rejected', label: language === 'id' ? 'Ditolak' : 'Rejected' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Kategori' : 'All Categories' },
                    ...(categories?.map((cat: Category) => ({ value: cat.id.toString(), label: cat.name })) || []),
                  ]}
                  className="w-full sm:w-40"
                />
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  leftIcon={<Download className="w-4 h-4" />}
                  onClick={() => {}}
                >
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          <div className="p-0 overflow-x-auto">
            <DataTable
              columns={columns}
              data={courses}
              enablePagination
              pageSize={pageSize}
              onRowSelectionChange={setSelectedCourses}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
