import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Download,
  Star,
  ChevronLeft,
  Eye,
  Calendar,
  Check,
  X,
  AlertCircle,
  BarChart3,
  Filter,
  Search,
  MoreVertical,
  FolderOpen,
  Edit3,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Input, Dropdown } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';

type StatusFilter = 'all' | 'pending' | 'graded' | 'late';
type SortOption = 'newest' | 'oldest' | 'highest' | 'lowest';

interface ClassSubmission {
  id: string;
  student: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
  };
  assignment: {
    id: string;
    title: string;
    type: 'assignment' | 'exam';
    dueDate: string;
    maxPoints: number;
  };
  submittedAt: string;
  status: 'pending' | 'graded' | 'late';
  points?: number;
  grade?: number; // 0-100
  feedback?: string;
  attachments: string[];
}

// Mock class data
const mockClass = {
  id: 'class-1',
  name: 'Batch A - Evening Class',
  course: {
    id: 'course-2',
    title: 'Full Stack Development with Node.js',
  },
  students: 28,
  startDate: '2024-09-01T00:00:00Z',
  endDate: '2025-02-28T00:00:00Z',
};

// Mock submissions for this class
const mockSubmissions: ClassSubmission[] = [
  {
    id: 'sub-1',
    student: {
      id: 'student-1',
      name: 'Ahmad Rizki',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
      email: 'ahmad.rizki@email.com',
    },
    assignment: {
      id: 'assign-1',
      title: 'API Design Principles',
      type: 'assignment',
      dueDate: '2024-12-15T23:59:59Z',
      maxPoints: 100,
    },
    submittedAt: '2024-12-15T14:30:00Z',
    status: 'pending',
    attachments: ['solution.pdf'],
  },
  {
    id: 'sub-2',
    student: {
      id: 'student-2',
      name: 'Siti Nurhaliza',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
      email: 'siti.nur@email.com',
    },
    assignment: {
      id: 'assign-1',
      title: 'API Design Principles',
      type: 'assignment',
      dueDate: '2024-12-15T23:59:59Z',
      maxPoints: 100,
    },
    submittedAt: '2024-12-16T09:15:00Z',
    status: 'late',
    attachments: ['solution.pdf', 'extra-notes.docx'],
  },
  {
    id: 'sub-3',
    student: {
      id: 'student-3',
      name: 'Budi Hartono',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiH',
      email: 'budi.hartono@email.com',
    },
    assignment: {
      id: 'exam-1',
      title: 'Midterm Project',
      type: 'exam',
      dueDate: '2024-12-20T23:59:59Z',
      maxPoints: 150,
    },
    submittedAt: '2024-12-16T11:30:00Z',
    status: 'graded',
    points: 135,
    grade: 90,
    feedback: 'Excellent work! Your project demonstrates a strong understanding of full-stack development concepts.',
    attachments: ['project.zip', 'documentation.pdf'],
  },
  {
    id: 'sub-4',
    student: {
      id: 'student-4',
      name: 'Dewi Lestari',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
      email: 'dewi.lestari@email.com',
    },
    assignment: {
      id: 'assign-2',
      title: 'Database Schema Design',
      type: 'assignment',
      dueDate: '2024-12-18T23:59:59Z',
      maxPoints: 100,
    },
    submittedAt: '2024-12-17T16:45:00Z',
    status: 'pending',
    attachments: ['schema.png'],
  },
];

export function ClassGradingPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<ClassSubmission | null>(null);

  // Stats for this class
  const stats = useMemo(() => {
    const total = mockSubmissions.length;
    const pending = mockSubmissions.filter(s => s.status === 'pending').length;
    const graded = mockSubmissions.filter(s => s.status === 'graded').length;
    const late = mockSubmissions.filter(s => s.status === 'late').length;
    const avgGrade = mockSubmissions
      .filter(s => s.grade !== undefined)
      .reduce((sum, s) => sum + (s.grade || 0), 0) /
      mockSubmissions.filter(s => s.grade !== undefined).length || 0;

    return { total, pending, graded, late, avgGrade };
  }, []);

  // Filter submissions
  const filteredSubmissions = useMemo(() => {
    return mockSubmissions
      .filter(submission => {
        const matchesSearch =
          submission.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          submission.assignment.title.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || submission.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
          case 'oldest':
            return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
          case 'highest':
            return (b.grade || 0) - (a.grade || 0);
          case 'lowest':
            return (a.grade || 0) - (b.grade || 0);
          default:
            return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        }
      });
  }, [searchQuery, statusFilter, sortBy]);

  const getStatusBadge = (status: ClassSubmission['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="warning">{language === 'id' ? 'Menunggu' : 'Pending'}</Badge>;
      case 'graded':
        return <Badge variant="success">{language === 'id' ? 'Dinilai' : 'Graded'}</Badge>;
      case 'late':
        return <Badge variant="danger">{language === 'id' ? 'Terlambat' : 'Late'}</Badge>;
    }
  };

  const getTypeBadge = (type: 'assignment' | 'exam') => {
    return (
      <Badge variant={type === 'assignment' ? 'primary' : 'secondary'}>
        {type === 'assignment'
          ? (language === 'id' ? 'Tugas' : 'Assignment')
          : (language === 'id' ? 'Ujian' : 'Exam')}
      </Badge>
    );
  };

  const getSubmissionActions = (submission: ClassSubmission) => [
    {
      label: language === 'id' ? 'Lihat Detail' : 'View Details',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => setSelectedSubmission(submission),
    },
    {
      label: language === 'id' ? 'Beri Nilai' : 'Grade',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: () => setSelectedSubmission(submission),
    },
    {
      label: language === 'id' ? 'Lihat Kursus' : 'View Course',
      icon: <BookOpen className="w-4 h-4" />,
      onClick: () => navigate(`/instructor/classes/${classId}`),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Unduh Lampiran' : 'Download Attachments',
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log('Download attachments for:', submission.id),
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            leftIcon={<ChevronLeft className="w-5 h-5" />}
            onClick={() => navigate('/instructor/classes')}
          >
            {language === 'id' ? 'Kembali' : 'Back'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Penilaian Kelas' : 'Class Grading'}
            </h1>
            <p className="text-gray-600">
              {language === 'id'
                ? 'Kelola dan beri nilai tugas serta ujian untuk kelas ini'
                : 'Manage and grade assignments and exams for this class'}
            </p>
          </div>
        </div>

        {/* Class Info */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FolderOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{mockClass.name}</h2>
                  <p className="text-gray-600">{mockClass.course.title}</p>
                  <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                    <span>{formatNumber(mockClass.students)} {language === 'id' ? 'siswa' : 'students'}</span>
                    <span>•</span>
                    <span>{language === 'id' ? 'Dimulai' : 'Started'}: {new Date(mockClass.startDate).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  {language === 'id' ? 'Ekspor Nilai' : 'Export Grades'}
                </Button>
                <Button leftIcon={<BarChart3 className="w-4 h-4" />}>
                  {language === 'id' ? 'Lihat Analitik' : 'View Analytics'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

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
                placeholder={language === 'id' ? 'Cari siswa atau tugas...' : 'Search students or assignments...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'id' ? 'Semua Status' : 'All Status'}</option>
                <option value="pending">{language === 'id' ? 'Menunggu' : 'Pending'}</option>
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
                  ? 'Belum ada tugas atau ujian yang perlu dinilai untuk kelas ini.'
                  : 'No assignments or exams need grading for this class yet.'}
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
                          {getTypeBadge(submission.assignment.type)}
                          <span className="line-clamp-1">{submission.assignment.title}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-gray-500">
                          {getTimeAgo(submission.submittedAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(submission.status)}
                      </td>
                      <td className="py-4 px-4">
                        {submission.grade !== undefined ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{submission.grade}%</span>
                            <span className="text-gray-400">/ 100%</span>
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
                      <X className="w-6 h-6" />
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
                        {language === 'id' ? 'Dikirim' : 'Submitted'}: {getTimeAgo(selectedSubmission.submittedAt)}
                      </p>
                    </div>
                  </div>

                  {/* Assignment Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5" />
                          {language === 'id' ? 'Tugas/Ujian' : 'Assignment/Exam'}
                        </CardTitle>
                      </CardHeader>
                      <div className="p-4">
                        <p className="font-medium text-gray-900">{selectedSubmission.assignment.title}</p>
                        <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>{language === 'id' ? 'Batas waktu' : 'Due'}: {new Date(selectedSubmission.assignment.dueDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                          {language === 'id' ? 'Poin Maksimal' : 'Max Points'}: {selectedSubmission.assignment.maxPoints}
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Attachments */}
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">
                      {language === 'id' ? 'Lampiran' : 'Attachments'}
                    </h4>
                    {selectedSubmission.attachments.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedSubmission.attachments.map((attachment, index) => (
                          <div key={index} className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span className="text-sm">{attachment}</span>
                            <button className="text-blue-600 hover:text-blue-800">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">
                        {language === 'id' ? 'Tidak ada lampiran' : 'No attachments'}
                      </p>
                    )}
                  </div>

                  {/* Grading Form */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">
                      {language === 'id' ? 'Form Penilaian' : 'Grading Form'}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {language === 'id' ? 'Poin' : 'Points'} ({selectedSubmission.assignment.maxPoints} {language === 'id' ? 'maksimal' : 'maximum'})
                        </label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedSubmission.assignment.maxPoints}
                          defaultValue={selectedSubmission.points}
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
                            min="0"
                            max="100"
                            defaultValue={selectedSubmission.grade}
                            placeholder="0"
                            className="pr-12"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <span className="text-gray-500">%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Umpan Balik' : 'Feedback'}
                      </label>
                      <textarea
                        defaultValue={selectedSubmission.feedback}
                        placeholder={language === 'id' ? 'Berikan umpan balik kepada siswa...' : 'Provide feedback to the student...'}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                      />
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setSelectedSubmission(null)}>
                    {language === 'id' ? 'Batal' : 'Cancel'}
                  </Button>
                  <Button leftIcon={<Check className="w-4 h-4" />}>
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
