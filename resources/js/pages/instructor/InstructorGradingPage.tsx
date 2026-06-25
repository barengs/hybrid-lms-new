import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit3,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  FileText,
  Download,
  Upload,
  Star,
  AlertCircle,
  Check,
  FolderOpen,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Dropdown, Avatar, Progress } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';
import { 
  useGetInstructorSubmissionsQuery, 
  useGradeSubmissionMutation, 
  useAiGradeSubmissionMutation,
  type InstructorSubmission
} from '@/store/features/instructor/instructorApiSlice';
import toast from 'react-hot-toast';

export function InstructorGradingPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<'all' | 'submitted' | 'graded' | 'late'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<InstructorSubmission | null>(null);

  // Form states
  const [manualPoints, setManualPoints] = useState<number | ''>('');
  const [manualFeedback, setManualFeedback] = useState('');

  // API Hooks
  const { data: submissions = [], isLoading } = useGetInstructorSubmissionsQuery({ 
    status: statusFilter !== 'all' ? statusFilter : undefined 
  });
  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  const [aiGradeSubmission, { isLoading: isAiGrading }] = useAiGradeSubmissionMutation();

  // Stats
  const stats = useMemo(() => {
    const total = submissions.length;
    const pending = submissions.filter(s => s.status === 'submitted' || s.status === 'late').length;
    const graded = submissions.filter(s => s.status === 'graded').length;
    const late = submissions.filter(s => s.status === 'late').length;
    const gradedSubmissions = submissions.filter(s => s.points_awarded !== null);
    const avgGrade = gradedSubmissions.length > 0
      ? (gradedSubmissions.reduce((sum, s) => sum + (s.points_awarded || 0), 0) / 
         gradedSubmissions.reduce((sum, s) => sum + s.assignment.max_points, 0)) * 100
      : 0;

    return { total, pending, graded, late, avgGrade };
  }, [submissions]);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return [...submissions]
      .filter(submission => {
        const matchesSearch =
          submission.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.assignment.course_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.assignment.title.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesSearch;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
          case 'oldest':
            return new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
          case 'highest':
            return (b.points_awarded || 0) - (a.points_awarded || 0);
          case 'lowest':
            return (a.points_awarded || 0) - (b.points_awarded || 0);
          default:
            return new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime();
        }
      });
  }, [submissions, searchQuery, sortBy]);

  const handleOpenSubmission = (submission: InstructorSubmission) => {
    navigate(`/instructor/grading/assignments/${submission.assignment.id}/submissions/${submission.id}`);
  };

  const getStatusBadge = (status: InstructorSubmission['status']) => {
    switch (status) {
      case 'submitted':
        return <Badge variant="warning">{language === 'id' ? 'Menunggu' : 'Pending'}</Badge>;
      case 'graded':
        return <Badge variant="success">{language === 'id' ? 'Dinilai' : 'Graded'}</Badge>;
      case 'late':
        return <Badge variant="danger">{language === 'id' ? 'Terlambat' : 'Late'}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'quiz' ? 'secondary' : 'primary'}>
        {type === 'quiz' 
          ? (language === 'id' ? 'Kuis' : 'Quiz') 
          : (type === 'project' ? (language === 'id' ? 'Proyek' : 'Project') : (language === 'id' ? 'Tugas' : 'Assignment'))}
      </Badge>
    );
  };

  const getSubmissionActions = (submission: InstructorSubmission) => [
    {
      label: language === 'id' ? 'Lihat & Nilai' : 'View & Grade',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: () => handleOpenSubmission(submission),
    },
    {
      label: language === 'id' ? 'Lihat Kursus' : 'View Course',
      icon: <BookOpen className="w-4 h-4" />,
      onClick: () => navigate(
        submission.assignment.is_class_based
          ? `/instructor/classes/${submission.assignment.class_info?.id}`
          : `/instructor/courses/${submission.assignment.id}/edit`
      ),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Penilaian' : 'Grading'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Kelola dan beri nilai tugas serta ujian siswa.'
                : 'Manage and grade student assignments and exams.'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              {language === 'id' ? 'Ekspor Nilai' : 'Export Grades'}
            </Button>
            <Button variant="outline" leftIcon={<Upload className="w-4 h-4" />}>
              {language === 'id' ? 'Impor Nilai' : 'Import Grades'}
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Dinilai' : 'Graded'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.late}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Terlambat' : 'Late'}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgGrade)}%</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Rata-rata' : 'Average'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'id' ? 'Cari siswa, kursus, atau tugas...' : 'Search students, courses, or assignments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</option>
                <option value="submitted">{language === 'id' ? 'Menunggu' : 'Pending'}</option>
                <option value="graded">{language === 'id' ? 'Dinilai' : 'Graded'}</option>
                <option value="late">{language === 'id' ? 'Terlambat' : 'Late'}</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{language === 'id' ? 'Terbaru' : 'Newest'}</option>
                <option value="oldest">{language === 'id' ? 'Terlama' : 'Oldest'}</option>
                <option value="highest">{language === 'id' ? 'Nilai Tertinggi' : 'Highest Grade'}</option>
                <option value="lowest">{language === 'id' ? 'Nilai Terendah' : 'Lowest Grade'}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Submissions Table */}
        {filteredSubmissions.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Tidak Ada Penilaian' : 'No Submissions Found'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all'
                ? language === 'id'
                  ? 'Tidak ada penilaian yang cocok dengan filter Anda.'
                  : 'No submissions match your filters.'
                : language === 'id'
                  ? 'Belum ada tugas atau ujian yang perlu dinilai.'
                  : 'No assignments or exams need grading yet.'}
            </p>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Siswa' : 'Student'}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Kursus' : 'Course'}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Tugas/Ujian' : 'Assignment/Exam'}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Tanggal Kirim' : 'Submitted'}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Status' : 'Status'}
                    </th>
                    <th className="text-left py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Nilai' : 'Grade'}
                    </th>
                    <th className="text-right py-4 px-4 font-medium text-gray-600">
                      {language === 'id' ? 'Aksi' : 'Actions'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={submission.student.avatar} name={submission.student.name} size="md" />
                          <div>
                            <p className="font-medium text-gray-900">{submission.student.name}</p>
                            <p className="text-sm text-gray-500">{submission.student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {submission.assignment.is_class_based ? (
                            <FolderOpen className="w-4 h-4 text-gray-400" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{submission.assignment.course_title}</p>
                            {submission.assignment.is_class_based && submission.assignment.class_info && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Users className="w-3 h-3" />
                                <span>{submission.assignment.class_info.name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(submission.assignment.type)}
                          <span className="line-clamp-1">{submission.assignment.title}</span>
                          {submission.assignment.type === 'quiz' && (
                            <Badge variant="outline" size="sm" className="text-[10px] text-blue-500 border-blue-200 bg-blue-50">
                              {language === 'id' ? 'Otomatis' : 'Auto'}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500">
                          {getTimeAgo(submission.submitted_at)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="py-4 px-4">
                        {submission.points_awarded !== null ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{submission.points_awarded}</span>
                            <span className="text-gray-400">/ {submission.assignment.max_points}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Dropdown
                          trigger={
                            <button
                              className="p-2 hover:bg-gray-100 rounded-lg"
                              aria-label="Submission actions"
                            >
                              <MoreVertical className="w-5 h-5 text-gray-500" />
                            </button>
                          }
                          items={getSubmissionActions(submission)}
                          align="right"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

      </div>
    </DashboardLayout>
  );
}
