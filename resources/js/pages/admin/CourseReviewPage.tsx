import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Send,
  Users,
  Clock,
  Tag,
  DollarSign,
  BookOpen,
  FileText,
  Video,
  Download,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, getTimeAgo } from '@/lib/utils';

// Mock course data
const mockCourse = {
  id: 'course-3',
  title: 'UI/UX Design Fundamentals',
  description: 'Comprehensive guide to UI/UX design principles, covering user research, wireframing, prototyping, and usability testing.',
  thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600',
  instructor: {
    id: 'inst-2',
    name: 'Dewi Lestari',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    email: 'dewi.lestari@example.com',
  },
  category: 'Design',
  level: 'Beginner',
  price: 199000,
  language: 'Indonesian',
  status: 'pending' as const,
  submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),

  learningObjectives: [
    'Understand fundamental UI/UX design principles',
    'Conduct effective user research and testing',
    'Create wireframes and prototypes',
    'Apply design thinking methodology',
    'Use industry-standard design tools',
  ],

  requirements: [
    'No prior design experience required',
    'Computer with internet access',
    'Willingness to learn and practice',
  ],

  targetAudience: [
    'Beginners interested in UI/UX design',
    'Developers wanting to improve design skills',
    'Career changers entering tech field',
  ],

  syllabus: [
    {
      section: 'Introduction to UI/UX',
      lessons: [
        { title: 'What is UI/UX Design?', duration: '15 min', type: 'video' },
        { title: 'Design Thinking Process', duration: '20 min', type: 'video' },
        { title: 'Industry Overview', duration: '10 min', type: 'reading' },
      ],
    },
    {
      section: 'User Research',
      lessons: [
        { title: 'Understanding Users', duration: '25 min', type: 'video' },
        { title: 'Research Methods', duration: '30 min', type: 'video' },
        { title: 'Creating User Personas', duration: '20 min', type: 'video' },
        { title: 'Research Assignment', duration: '45 min', type: 'assignment' },
      ],
    },
    {
      section: 'Wireframing & Prototyping',
      lessons: [
        { title: 'Wireframing Basics', duration: '30 min', type: 'video' },
        { title: 'Low-Fidelity Prototypes', duration: '25 min', type: 'video' },
        { title: 'High-Fidelity Prototypes', duration: '35 min', type: 'video' },
        { title: 'Wireframe Project', duration: '60 min', type: 'assignment' },
      ],
    },
  ],
};

const mockReviewHistory = [
  {
    id: 'rev-1',
    reviewer: 'Admin Team',
    action: 'submitted',
    comment: 'Course submitted for review',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function CourseReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'overview' | 'syllabus' | 'content'>('overview');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);

  // Review checklist
  const [checklist, setChecklist] = useState({
    titleClear: false,
    objectivesDefined: false,
    syllabusComprehensive: false,
    contentQuality: false,
    pricingAppropriate: false,
  });

  const [overallFeedback, setOverallFeedback] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  const course = mockCourse;

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = () => {
    console.log('Approving course:', id);
    setShowApproveModal(false);
    navigate('/admin/courses');
  };

  const handleReject = () => {
    console.log('Rejecting course:', id, 'Reason:', overallFeedback);
    setShowRejectModal(false);
    navigate('/admin/courses');
  };

  const handleRequestRevision = () => {
    console.log('Requesting revision for:', id, 'Notes:', revisionNotes);
    setShowRevisionModal(false);
    navigate('/admin/courses');
  };

  const getStatusBadge = () => {
    const config = {
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu Review' : 'Pending Review' },
    };
    const { variant, label } = config[course.status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getLessonTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-blue-500" />;
      case 'reading':
        return <FileText className="w-4 h-4 text-green-500" />;
      case 'assignment':
        return <BookOpen className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const allChecked = Object.values(checklist).every(v => v);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali ke Daftar Kursus' : 'Back to Courses List'}
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                {getStatusBadge()}
                <Badge variant="secondary">{course.category}</Badge>
                <Badge variant="secondary">{course.level}</Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowRevisionModal(true)}
                leftIcon={<Send className="w-4 h-4" />}
              >
                {language === 'id' ? 'Minta Revisi' : 'Request Changes'}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowRejectModal(true)}
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                {language === 'id' ? 'Tolak' : 'Reject'}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowApproveModal(true)}
                leftIcon={<CheckCircle className="w-4 h-4" />}
                disabled={!allChecked}
              >
                {language === 'id' ? 'Setujui' : 'Approve'}
              </Button>
            </div>
          </div>

          {/* Course Preview */}
          <Card className="mb-6">
            <div className="flex gap-6">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-64 h-40 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-2">{language === 'id' ? 'Instruktur' : 'Instructor'}</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={course.instructor.avatar} name={course.instructor.name} size="sm" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{course.instructor.name}</p>
                    <p className="text-xs text-gray-500">{course.instructor.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{formatCurrency(course.price)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{course.language}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{language === 'id' ? 'Disubmit' : 'Submitted'}: {getTimeAgo(course.submittedAt)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-700">{language === 'id' ? 'Dibuat' : 'Created'}: {getTimeAgo(course.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="border-b border-gray-200">
              <nav className="flex gap-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {language === 'id' ? 'Overview' : 'Overview'}
                </button>
                <button
                  onClick={() => setActiveTab('syllabus')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'syllabus'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {language === 'id' ? 'Silabus' : 'Syllabus'}
                </button>
                <button
                  onClick={() => setActiveTab('content')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                >
                  {language === 'id' ? 'Konten' : 'Content'}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'id' ? 'Deskripsi Kursus' : 'Course Description'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 text-sm">{course.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'id' ? 'Tujuan Pembelajaran' : 'Learning Objectives'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.learningObjectives.map((obj, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                          <span className="text-gray-700">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'id' ? 'Persyaratan' : 'Requirements'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-gray-400">•</span>
                          <span className="text-gray-700">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{language === 'id' ? 'Target Peserta' : 'Target Audience'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {course.targetAudience.map((aud, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <Users className="w-4 h-4 text-blue-500 mt-0.5" />
                          <span className="text-gray-700">{aud}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'syllabus' && (
              <div className="space-y-4">
                {course.syllabus.map((section, sIdx) => (
                  <Card key={sIdx}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {language === 'id' ? 'Bagian' : 'Section'} {sIdx + 1}: {section.section}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {section.lessons.map((lesson, lIdx) => (
                          <div key={lIdx} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                            <div className="flex items-center gap-3">
                              {getLessonTypeIcon(lesson.type)}
                              <span className="text-sm text-gray-700">{lesson.title}</span>
                            </div>
                            <span className="text-xs text-gray-500">{lesson.duration}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeTab === 'content' && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Preview Konten' : 'Content Preview'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">
                      {language === 'id'
                        ? 'Preview video dan materi akan ditampilkan di sini'
                        : 'Video and material preview will be displayed here'}
                    </p>
                    <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                      {language === 'id' ? 'Download Materi Sample' : 'Download Sample Materials'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Review Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Checklist Review' : 'Review Checklist'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.titleClear}
                      onChange={() => toggleChecklistItem('titleClear')}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'id' ? 'Judul & deskripsi jelas' : 'Title & description clear'}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.objectivesDefined}
                      onChange={() => toggleChecklistItem('objectivesDefined')}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'id' ? 'Tujuan pembelajaran terdefinisi' : 'Learning objectives defined'}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.syllabusComprehensive}
                      onChange={() => toggleChecklistItem('syllabusComprehensive')}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'id' ? 'Silabus komprehensif' : 'Syllabus comprehensive'}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.contentQuality}
                      onChange={() => toggleChecklistItem('contentQuality')}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'id' ? 'Kualitas konten baik' : 'Content quality acceptable'}
                    </span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checklist.pricingAppropriate}
                      onChange={() => toggleChecklistItem('pricingAppropriate')}
                      className="mt-1 rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {language === 'id' ? 'Harga sesuai' : 'Pricing appropriate'}
                    </span>
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Feedback Keseluruhan' : 'Overall Feedback'}</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder={language === 'id' ? 'Tulis feedback untuk instruktur...' : 'Write feedback for instructor...'}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={6}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Riwayat Review' : 'Review History'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockReviewHistory.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{item.action}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.comment}</p>
                        <p className="text-xs text-gray-400 mt-1">{getTimeAgo(item.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Approve Modal */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title={language === 'id' ? 'Setujui Kursus' : 'Approve Course'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? `Setujui kursus "${course.title}" untuk dipublikasikan?`
                : `Approve "${course.title}" for publication?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowApproveModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleApprove}>
                {language === 'id' ? 'Setujui' : 'Approve'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={language === 'id' ? 'Tolak Kursus' : 'Reject Course'}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Berikan alasan penolakan kursus ini:'
                : 'Provide reason for rejecting this course:'}
            </p>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder={language === 'id' ? 'Tulis alasan penolakan...' : 'Write rejection reason...'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRejectModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleReject}>
                {language === 'id' ? 'Tolak Kursus' : 'Reject Course'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Request Revision Modal */}
        <Modal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          title={language === 'id' ? 'Minta Revisi' : 'Request Changes'}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Berikan catatan revisi yang dibutuhkan:'
                : 'Provide revision notes needed:'}
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder={language === 'id' ? 'Tulis catatan revisi...' : 'Write revision notes...'}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={6}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRevisionModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={handleRequestRevision}>
                {language === 'id' ? 'Kirim Feedback' : 'Send Feedback'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
