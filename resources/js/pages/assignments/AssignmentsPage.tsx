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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';

interface AssignmentWithStatus {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  title: string;
  description: string;
  dueDate: string;
  maxScore: number;
  status: AssignmentStatus;
  submittedAt?: string;
  score?: number;
  feedback?: string;
}

// Mock assignments data
const mockAssignments: AssignmentWithStatus[] = [
  {
    id: 'assign-1',
    courseId: 'course-1',
    courseTitle: 'React Masterclass: From Zero to Hero',
    courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    title: 'Build a Todo App with React Hooks',
    description: 'Create a fully functional todo application using React Hooks (useState, useEffect, useContext).',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    maxScore: 100,
    status: 'pending',
  },
  {
    id: 'assign-2',
    courseId: 'course-1',
    courseTitle: 'React Masterclass: From Zero to Hero',
    courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    title: 'State Management with Redux',
    description: 'Implement Redux in your todo app with actions, reducers, and store.',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
    maxScore: 100,
    status: 'pending',
  },
  {
    id: 'assign-3',
    courseId: 'course-2',
    courseTitle: 'Web Development Fundamentals',
    courseThumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400',
    title: 'Responsive Landing Page',
    description: 'Create a responsive landing page using HTML, CSS, and JavaScript.',
    dueDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    maxScore: 100,
    status: 'submitted',
    submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'assign-4',
    courseId: 'course-2',
    courseTitle: 'Web Development Fundamentals',
    courseThumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400',
    title: 'CSS Flexbox Layout',
    description: 'Build a complex layout using CSS Flexbox.',
    dueDate: new Date(Date.now() - 10 * 86400000).toISOString(),
    maxScore: 100,
    status: 'graded',
    submittedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    score: 92,
    feedback: 'Excellent work! Great use of flexbox properties.',
  },
  {
    id: 'assign-5',
    courseId: 'course-3',
    courseTitle: 'Python untuk Data Science',
    courseThumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    title: 'Data Analysis with Pandas',
    description: 'Analyze a dataset using Pandas library and create visualizations.',
    dueDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    maxScore: 100,
    status: 'overdue',
  },
  {
    id: 'assign-6',
    courseId: 'course-3',
    courseTitle: 'Python untuk Data Science',
    courseThumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    title: 'Machine Learning Basics',
    description: 'Implement a simple machine learning model using scikit-learn.',
    dueDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    maxScore: 100,
    status: 'graded',
    submittedAt: new Date(Date.now() - 16 * 86400000).toISOString(),
    score: 85,
    feedback: 'Good implementation. Consider tuning hyperparameters for better accuracy.',
  },
];

export function AssignmentsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AssignmentStatus | 'all'>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');

  // Get unique courses
  const courses = Array.from(
    new Map(mockAssignments.map((a) => [a.courseId, { id: a.courseId, title: a.courseTitle }])).values()
  );

  // Filter assignments
  const filteredAssignments = mockAssignments.filter((assignment) => {
    const matchesSearch =
      assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || assignment.status === statusFilter;
    const matchesCourse = courseFilter === 'all' || assignment.courseId === courseFilter;
    return matchesSearch && matchesStatus && matchesCourse;
  });

  // Stats
  const stats = {
    total: mockAssignments.length,
    pending: mockAssignments.filter((a) => a.status === 'pending').length,
    submitted: mockAssignments.filter((a) => a.status === 'submitted').length,
    graded: mockAssignments.filter((a) => a.status === 'graded').length,
    overdue: mockAssignments.filter((a) => a.status === 'overdue').length,
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: AssignmentStatus, dueDate: string, score?: number, maxScore?: number) => {
    switch (status) {
      case 'pending':
        const days = getDaysRemaining(dueDate);
        if (days <= 1) {
          return (
            <Badge variant="warning" size="sm">
              <AlertCircle className="w-3 h-3 mr-1" />
              {days <= 0
                ? language === 'id'
                  ? 'Hari Ini'
                  : 'Due Today'
                : language === 'id'
                ? 'Besok'
                : 'Tomorrow'}
            </Badge>
          );
        }
        return (
          <Badge variant="primary" size="sm">
            <Clock className="w-3 h-3 mr-1" />
            {days} {language === 'id' ? 'hari lagi' : 'days left'}
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="secondary" size="sm">
            <Upload className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Menunggu Penilaian' : 'Awaiting Grade'}
          </Badge>
        );
      case 'graded':
        return (
          <Badge variant="success" size="sm">
            <CheckCircle className="w-3 h-3 mr-1" />
            {score}/{maxScore}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="danger" size="sm">
            <AlertCircle className="w-3 h-3 mr-1" />
            {language === 'id' ? 'Terlambat' : 'Overdue'}
          </Badge>
        );
    }
  };

  const getStatusIcon = (status: AssignmentStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'submitted':
        return <Upload className="w-5 h-5 text-yellow-500" />;
      case 'graded':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

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
              ? 'Lihat dan kelola semua tugas dari kursus yang Anda ikuti.'
              : 'View and manage all assignments from your enrolled courses.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card
            className={`p-4 cursor-pointer transition-all ${
              statusFilter === 'all' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('all')}
          >
            <div className="text-center">
              <FileText className="w-6 h-6 text-gray-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Total' : 'Total'}</p>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all ${
              statusFilter === 'pending' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('pending')}
          >
            <div className="text-center">
              <Clock className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Pending' : 'Pending'}</p>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all ${
              statusFilter === 'submitted' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('submitted')}
          >
            <div className="text-center">
              <Upload className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.submitted}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Dikirim' : 'Submitted'}</p>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all ${
              statusFilter === 'graded' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('graded')}
          >
            <div className="text-center">
              <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.graded}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Dinilai' : 'Graded'}</p>
            </div>
          </Card>
          <Card
            className={`p-4 cursor-pointer transition-all ${
              statusFilter === 'overdue' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setStatusFilter('overdue')}
          >
            <div className="text-center">
              <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Terlambat' : 'Overdue'}</p>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
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
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={courseFilter}
                onChange={(e) => setCourseFilter(e.target.value)}
                aria-label="Filter by course"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">{language === 'id' ? 'Semua Kursus' : 'All Courses'}</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Assignments List */}
        {filteredAssignments.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Tidak Ada Tugas' : 'No Assignments'}
            </h3>
            <p className="text-gray-500">
              {searchQuery || statusFilter !== 'all' || courseFilter !== 'all'
                ? language === 'id'
                  ? 'Tidak ada tugas yang cocok dengan filter Anda.'
                  : 'No assignments match your filters.'
                : language === 'id'
                ? 'Belum ada tugas dari kursus yang Anda ikuti.'
                : 'No assignments from your enrolled courses yet.'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => (
              <Link
                key={assignment.id}
                to={`/assignments/${assignment.id}`}
                className="block"
              >
                <Card className="hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Course Thumbnail */}
                    <div className="sm:w-32 h-20 flex-shrink-0 hidden sm:block">
                      <img
                        src={assignment.courseThumbnail}
                        alt={assignment.courseTitle}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Assignment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          {/* Status Icon & Title */}
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(assignment.status)}
                            <h3 className="font-semibold text-gray-900 truncate">
                              {assignment.title}
                            </h3>
                          </div>

                          {/* Course Name */}
                          <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                            <BookOpen className="w-4 h-4" />
                            <span className="truncate">{assignment.courseTitle}</span>
                          </div>

                          {/* Description */}
                          <p className="text-sm text-gray-600 line-clamp-1 mb-2">
                            {assignment.description}
                          </p>

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {language === 'id' ? 'Batas:' : 'Due:'} {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-500">
                              <Star className="w-4 h-4" />
                              <span>
                                {language === 'id' ? 'Maks:' : 'Max:'} {assignment.maxScore}
                              </span>
                            </div>
                            {assignment.submittedAt && (
                              <div className="flex items-center gap-1 text-gray-500">
                                <Upload className="w-4 h-4" />
                                <span>
                                  {language === 'id' ? 'Dikirim:' : 'Submitted:'}{' '}
                                  {formatDate(assignment.submittedAt)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status Badge & Arrow */}
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(assignment.status, assignment.dueDate, assignment.score, assignment.maxScore)}
                          <ChevronRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>

                      {/* Feedback Preview (for graded) */}
                      {assignment.status === 'graded' && assignment.feedback && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm text-green-800">
                          <span className="font-medium">{language === 'id' ? 'Feedback:' : 'Feedback:'}</span>{' '}
                          {assignment.feedback}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Average Score */}
        {stats.graded > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Ringkasan Nilai' : 'Grade Summary'}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">
                  {Math.round(
                    mockAssignments
                      .filter((a) => a.status === 'graded' && a.score !== undefined)
                      .reduce((sum, a) => sum + (a.score || 0), 0) /
                      stats.graded
                  )}
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Rata-rata Nilai' : 'Average Score'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-green-600">
                  {Math.max(
                    ...mockAssignments
                      .filter((a) => a.status === 'graded' && a.score !== undefined)
                      .map((a) => a.score || 0)
                  )}
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Nilai Tertinggi' : 'Highest Score'}</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-3xl font-bold text-gray-900">{stats.graded}</p>
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
