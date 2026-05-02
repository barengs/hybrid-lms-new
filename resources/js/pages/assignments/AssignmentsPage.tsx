import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  Search,
  Filter,
  ChevronRight,
  BookOpen,
  Upload,
  Star,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import {
  useGetAssignmentsQuery,
  type AssignmentListItem,
} from '@/store/features/student/studentApiSlice';

type StatusFilter = 'all' | 'pending' | 'submitted' | 'graded' | 'overdue';

function getAssignmentStatus(item: AssignmentListItem): 'pending' | 'submitted' | 'graded' | 'overdue' {
  if (item.my_submission?.status === 'graded') return 'graded';
  if (item.my_submission?.status === 'submitted' || item.my_submission?.status === 'late') return 'submitted';
  if (item.due_date && new Date(item.due_date) < new Date() && !item.my_submission) return 'overdue';
  return 'pending';
}

function getDaysRemaining(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function StatusBadge({ item, language }: { item: AssignmentListItem; language: string }) {
  const status = getAssignmentStatus(item);
  const sub = item.my_submission;

  if (status === 'graded') {
    return (
      <Badge variant="success" size="sm">
        <CheckCircle className="w-3 h-3 mr-1" />
        {sub?.points_awarded ?? '?'}/{item.max_points}
      </Badge>
    );
  }
  if (status === 'submitted') {
    return (
      <Badge variant="secondary" size="sm">
        <Upload className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Menunggu Penilaian' : 'Awaiting Grade'}
      </Badge>
    );
  }
  if (status === 'overdue') {
    return (
      <Badge variant="danger" size="sm">
        <AlertCircle className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Terlambat' : 'Overdue'}
      </Badge>
    );
  }
  // Pending
  if (!item.due_date) {
    return (
      <Badge variant="primary" size="sm">
        {language === 'id' ? 'Belum Dikerjakan' : 'Not Submitted'}
      </Badge>
    );
  }
  const days = getDaysRemaining(item.due_date);
  if (days <= 1) {
    return (
      <Badge variant="warning" size="sm">
        <AlertCircle className="w-3 h-3 mr-1" />
        {days <= 0
          ? language === 'id' ? 'Hari Ini' : 'Due Today'
          : language === 'id' ? 'Besok' : 'Tomorrow'}
      </Badge>
    );
  }
  return (
    <Badge variant="primary" size="sm">
      <Clock className="w-3 h-3 mr-1" />
      {days} {language === 'id' ? 'hari lagi' : 'days left'}
    </Badge>
  );
}

function StatusIcon({ item }: { item: AssignmentListItem }) {
  const status = getAssignmentStatus(item);
  switch (status) {
    case 'graded':   return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'submitted': return <Upload className="w-5 h-5 text-yellow-500" />;
    case 'overdue':  return <AlertCircle className="w-5 h-5 text-red-500" />;
    default:         return <Clock className="w-5 h-5 text-blue-500" />;
  }
}

export function AssignmentsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { data, isLoading, isError, refetch } = useGetAssignmentsQuery({ per_page: 50 });

  const assignments: AssignmentListItem[] = data?.data ?? [];

  // Client-side filter
  const filtered = assignments.filter((a) => {
    const status = getAssignmentStatus(a);
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.batch?.name ?? '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: assignments.length,
    pending:   assignments.filter((a) => getAssignmentStatus(a) === 'pending').length,
    submitted: assignments.filter((a) => getAssignmentStatus(a) === 'submitted').length,
    graded:    assignments.filter((a) => getAssignmentStatus(a) === 'graded').length,
    overdue:   assignments.filter((a) => getAssignmentStatus(a) === 'overdue').length,
  };

  // ---- Loading ----
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{language === 'id' ? 'Memuat tugas...' : 'Loading assignments...'}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {language === 'id' ? 'Gagal memuat tugas' : 'Failed to load assignments'}
          </h2>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-4 h-4" />
            {language === 'id' ? 'Coba Lagi' : 'Try Again'}
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Tugas Saya' : 'My Assignments'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Lihat dan kelola semua tugas dari batch yang Anda ikuti.'
              : 'View and manage all assignments from your enrolled batches.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {(
            [
              { key: 'all' as StatusFilter, icon: <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />, count: stats.total, label: language === 'id' ? 'Total' : 'Total' },
              { key: 'pending' as StatusFilter, icon: <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />, count: stats.pending, label: 'Pending' },
              { key: 'submitted' as StatusFilter, icon: <Upload className="w-6 h-6 text-yellow-500 mx-auto mb-2" />, count: stats.submitted, label: language === 'id' ? 'Dikirim' : 'Submitted' },
              { key: 'graded' as StatusFilter, icon: <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />, count: stats.graded, label: language === 'id' ? 'Dinilai' : 'Graded' },
              { key: 'overdue' as StatusFilter, icon: <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />, count: stats.overdue, label: language === 'id' ? 'Terlambat' : 'Overdue' },
            ] as const
          ).map(({ key, icon, count, label }) => (
            <Card
              key={key}
              className={`p-4 cursor-pointer transition-all ${statusFilter === key ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setStatusFilter(key)}
            >
              <div className="text-center">
                {icon}
                <p className="text-2xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'id' ? 'Cari tugas...' : 'Search assignments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Filter className="w-4 h-4" />
              <span>{filtered.length} {language === 'id' ? 'tugas' : 'assignments'}</span>
            </div>
          </div>
        </Card>

        {/* List */}
        {filtered.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Tidak Ada Tugas' : 'No Assignments'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? language === 'id'
                  ? 'Tidak ada tugas yang cocok dengan filter Anda.'
                  : 'No assignments match your filters.'
                : language === 'id'
                ? 'Belum ada tugas dari batch yang Anda ikuti.'
                : 'No assignments from your enrolled batches yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filtered.map((assignment) => {
              const status = getAssignmentStatus(assignment);
              const sub = assignment.my_submission;
              return (
                <Link
                  key={assignment.id}
                  to={`/assignments/${assignment.id}`}
                  className="block"
                >
                  <Card className="hover:shadow-lg transition-shadow">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Assignment Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Status Icon & Title */}
                            <div className="flex items-center gap-2 mb-1">
                              <StatusIcon item={assignment} />
                              <h3 className="font-semibold text-gray-900 truncate">{assignment.title}</h3>
                            </div>

                            {/* Batch / Course Name */}
                            {assignment.batch && (
                              <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                <BookOpen className="w-4 h-4" />
                                <span className="truncate">{assignment.batch.name}</span>
                              </div>
                            )}

                            {/* Description */}
                            {assignment.description && (
                              <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                                {assignment.description}
                              </p>
                            )}

                            {/* Meta */}
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {assignment.due_date && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    {language === 'id' ? 'Batas:' : 'Due:'}{' '}
                                    {formatDate(assignment.due_date, language)}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-1 text-gray-500">
                                <Star className="w-4 h-4" />
                                <span>
                                  {language === 'id' ? 'Maks:' : 'Max:'} {assignment.max_points}
                                </span>
                              </div>
                              {sub?.submitted_at && (
                                <div className="flex items-center gap-1 text-gray-500">
                                  <Upload className="w-4 h-4" />
                                  <span>
                                    {language === 'id' ? 'Dikirim:' : 'Submitted:'}{' '}
                                    {formatDate(sub.submitted_at, language)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Status Badge & Arrow */}
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <StatusBadge item={assignment} language={language} />
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>

                        {/* Feedback preview */}
                        {status === 'graded' && sub?.instructor_feedback && (
                          <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                            <span className="font-medium">
                              {language === 'id' ? 'Feedback:' : 'Feedback:'}
                            </span>{' '}
                            {sub.instructor_feedback}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}

        {/* Grade Summary */}
        {stats.graded > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Ringkasan Nilai' : 'Grade Summary'}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(
                    assignments
                      .filter((a) => getAssignmentStatus(a) === 'graded' && a.my_submission?.points_awarded != null)
                      .reduce((sum, a) => sum + (a.my_submission?.points_awarded ?? 0), 0) /
                      Math.max(stats.graded, 1)
                  )}
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Rata-rata Nilai' : 'Average Score'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">{stats.graded}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Tugas Dinilai' : 'Graded'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{stats.pending + stats.submitted}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Dalam Proses' : 'In Progress'}</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
