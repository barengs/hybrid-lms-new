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
    setSelectedSubmission(submission);
    setManualPoints(submission.points_awarded ?? '');
    setManualFeedback(submission.instructor_feedback ?? '');
  };

  const handleManualGrade = async () => {
    if (!selectedSubmission) return;
    try {
      await gradeSubmission({
        id: selectedSubmission.id,
        points_awarded: Number(manualPoints),
        instructor_feedback: manualFeedback,
      }).unwrap();
      toast.success(language === 'id' ? 'Nilai berhasil disimpan' : 'Grade saved successfully');
      setSelectedSubmission(null);
    } catch (err) {
      toast.error('Failed to save grade');
    }
  };

  const handleAiGrade = async () => {
    if (!selectedSubmission) return;
    try {
      const result = await aiGradeSubmission(selectedSubmission.id).unwrap();
      setManualPoints(result.ai_score ?? '');
      setManualFeedback(result.ai_feedback ?? '');
      toast.success(language === 'id' ? 'AI berhasil menganalisis tugas' : 'AI successfully analyzed the submission');
      // Update local state for immediate feedback
      setSelectedSubmission(prev => prev ? { ...prev, ...result } : null);
    } catch (err) {
      toast.error('AI analysis failed');
    }
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

        {/* Submission Detail Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setSelectedSubmission(null)} />

              <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium leading-6 text-gray-900">
                      {language === 'id' ? 'Detail Penilaian' : 'Grading Details'}
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500"
                      onClick={() => setSelectedSubmission(null)}
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                    <Avatar src={selectedSubmission.student.avatar} name={selectedSubmission.student.name} size="lg" />
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{selectedSubmission.student.name}</h4>
                      <p className="text-gray-500">{selectedSubmission.student.email}</p>
                    </div>
                    <div className="ml-auto text-right">
                      {getStatusBadge(selectedSubmission.status)}
                      <p className="mt-2 text-sm text-gray-500">
                        {language === 'id' ? 'Dikirim' : 'Submitted'}: {getTimeAgo(selectedSubmission.submitted_at)}
                      </p>
                    </div>
                  </div>

                  {/* Course & Assignment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {selectedSubmission.assignment.is_class_based ? (
                            <FolderOpen className="w-5 h-5" />
                          ) : (
                            <BookOpen className="w-5 h-5" />
                          )}
                          {language === 'id' ? 'Kursus' : 'Course'}
                        </CardTitle>
                      </CardHeader>
                      <div className="p-4">
                        <p className="font-medium text-gray-900">{selectedSubmission.assignment.course_title}</p>
                        {selectedSubmission.assignment.is_class_based && selectedSubmission.assignment.class_info && (
                          <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{selectedSubmission.assignment.class_info.name}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{language === 'id' ? 'Batas waktu' : 'Due'}: {new Date(selectedSubmission.assignment.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {getTypeBadge(selectedSubmission.assignment.type)}
                          {language === 'id' ? 'Tugas/Ujian' : 'Assignment/Exam'}
                        </CardTitle>
                      </CardHeader>
                      <div className="p-4">
                        <p className="font-medium text-gray-900">{selectedSubmission.assignment.title}</p>
                        <div className="mt-2 text-sm text-gray-500">
                          {language === 'id' ? 'Poin Maksimal' : 'Max Points'}: {selectedSubmission.assignment.max_points}
                        </div>
                      </div>
                    </Card>
                  </div>

                   {/* Text Content */}
                   {selectedSubmission.content && (
                    <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        {language === 'id' ? 'Konten Jawaban' : 'Submission Content'}
                      </h4>
                      <div className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSubmission.content}</div>
                    </div>
                  )}

                  {/* Attachments */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {language === 'id' ? 'Lampiran File' : 'File Attachments'}
                    </h4>
                    {selectedSubmission.files && selectedSubmission.files.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.files.map((file, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                            <FileText className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <a 
                              href={`${import.meta.env.VITE_URL_API_IMAGE}/${file.path}`} 
                              target="_blank" 
                              rel="noreferrer"
                              className="text-blue-600 hover:text-blue-800 ml-2"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm italic">
                        {language === 'id' ? 'Tidak ada lampiran' : 'No attachments'}
                      </p>
                    )}
                  </div>

                  {/* Grading Form */}
                  <div className="space-y-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        {language === 'id' ? 'Form Penilaian' : 'Grading Form'}
                      </h4>
                      {selectedSubmission.assignment.type !== 'quiz' && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          leftIcon={<Edit3 className="w-4 h-4" />}
                          onClick={handleAiGrade}
                          isLoading={isAiGrading}
                        >
                          {language === 'id' ? 'Nilai dengan AI' : 'Grade with AI'}
                        </Button>
                      )}
                    </div>

                    {selectedSubmission.ai_status === 'completed' && (
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-bold text-purple-900">{language === 'id' ? 'Saran AI' : 'AI Suggestion'}</span>
                          <Badge variant="outline" className="bg-white ml-auto">{selectedSubmission.ai_score} / {selectedSubmission.assignment.max_points}</Badge>
                        </div>
                        <p className="text-sm text-purple-800 italic">{selectedSubmission.ai_feedback}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'id' ? 'Poin' : 'Points'} ({selectedSubmission.assignment.max_points} {language === 'id' ? 'maksimal' : 'maximum'})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedSubmission.assignment.max_points}
                          value={manualPoints}
                          onChange={(e) => setManualPoints(Number(e.target.value))}
                          placeholder={language === 'id' ? 'Masukkan poin' : 'Enter points'}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'id' ? 'Persentase' : 'Percentage'}
                        </label>
                        <div className="relative">
                          <Input
                            type="number"
                            readOnly
                            value={manualPoints && selectedSubmission.assignment.max_points ? Math.round((Number(manualPoints) / selectedSubmission.assignment.max_points) * 100) : 0}
                            className="pr-12 bg-gray-50"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Umpan Balik Instruktur' : 'Instructor Feedback'}
                      </label>
                      <textarea
                        value={manualFeedback}
                        onChange={(e) => setManualFeedback(e.target.value)}
                        placeholder={language === 'id' ? 'Berikan umpan balik kepada siswa...' : 'Provide feedback to the student...'}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)} disabled={isGrading}>
                    {language === 'id' ? 'Batal' : 'Cancel'}
                  </Button>
                  <Button 
                    leftIcon={<Check className="w-4 h-4" />} 
                    onClick={handleManualGrade} 
                    isLoading={isGrading}
                    disabled={manualPoints === ''}
                  >
                    {language === 'id' ? 'Simpan Nilai' : 'Save Grade'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
