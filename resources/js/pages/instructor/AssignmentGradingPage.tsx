import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  Download,
  Star,
  ChevronLeft,
  Save,
  MessageSquare,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Avatar, Textarea, Input } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { getTimeAgo } from '@/lib/utils';

// Mock data for assignment details
const mockAssignment = {
  id: 'assign-1',
  title: 'React Component Design',
  description: 'Create a reusable React component that displays a user profile card with avatar, name, email, and bio. The component should accept props for customization and follow best practices for accessibility.',
  course: {
    id: 'course-1',
    title: 'React Masterclass: From Zero to Hero',
    isClassBased: false,
  },
  dueDate: '2024-12-15T23:59:59Z',
  maxPoints: 100,
  totalSubmissions: 24,
  gradedSubmissions: 18,
  averageGrade: 85,
  rubric: [
    { id: 'r1', criterion: 'Component Structure', description: 'Well-organized component with proper separation of concerns', points: 25 },
    { id: 'r2', criterion: 'Props Handling', description: 'Proper use of props with validation and default values', points: 20 },
    { id: 'r3', criterion: 'Accessibility', description: 'Follows WCAG guidelines and proper ARIA attributes', points: 20 },
    { id: 'r4', criterion: 'Code Quality', description: 'Clean, readable code with proper comments', points: 20 },
    { id: 'r5', criterion: 'Functionality', description: 'Component works as expected with no bugs', points: 15 },
  ],
};

// Mock student submission
const mockSubmission = {
  id: 'sub-1',
  student: {
    id: 'student-1',
    name: 'Ahmad Rizki',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    email: 'ahmad.rizki@email.com',
  },
  submittedAt: '2024-12-15T14:30:00Z',
  attachments: ['solution.pdf', 'component.jsx'],
  answers: [
    {
      question: 'Explain your component design choices',
      answer: 'I chose to separate the avatar and user info into different components to promote reusability. The main component accepts all user data as props and renders them appropriately. I used proper semantic HTML elements and added ARIA attributes for accessibility.'
    },
    {
      question: 'How did you handle edge cases?',
      answer: 'I added prop types validation to ensure all required props are passed. I also provided default values for optional props. For the avatar, I added a fallback to display initials if the image fails to load.'
    }
  ]
};

export function AssignmentGradingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [grades, setGrades] = useState<Record<string, number>>({
    r1: 25,
    r2: 18,
    r3: 20,
    r4: 18,
    r5: 14,
  });
  const [feedback, setFeedback] = useState('Great work overall! Your component structure is well-organized and follows React best practices. The accessibility implementation is particularly impressive. Consider adding more PropTypes validation for enhanced type safety.');

  const handleGradeChange = (rubricId: string, points: number) => {
    setGrades(prev => ({
      ...prev,
      [rubricId]: Math.max(0, Math.min(points, mockAssignment.rubric.find(r => r.id === rubricId)?.points || 0))
    }));
  };

  const calculateTotalGrade = () => {
    return Object.values(grades).reduce((sum, grade) => sum + grade, 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotalGrade();
    return Math.round((total / mockAssignment.maxPoints) * 100);
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            leftIcon={<ChevronLeft className="w-5 h-5" />}
            onClick={() => navigate('/instructor/grading')}
          >
            {language === 'id' ? 'Kembali' : 'Back'}
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Penilaian Tugas' : 'Assignment Grading'}
            </h1>
            <p className="text-gray-600">
              {language === 'id'
                ? 'Memberikan nilai dan umpan balik untuk tugas siswa'
                : 'Grading student assignment and providing feedback'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Assignment & Student Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Detail Tugas' : 'Assignment Details'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-2">{mockAssignment.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{mockAssignment.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{mockAssignment.course.title}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Batas Waktu' : 'Due'}: {new Date(mockAssignment.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Poin Maksimal' : 'Max Points'}: {mockAssignment.maxPoints}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Student Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  {language === 'id' ? 'Informasi Siswa' : 'Student Information'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <Avatar src={mockSubmission.student.avatar} name={mockSubmission.student.name} size="lg" />
                  <div>
                    <h3 className="font-medium text-gray-900">{mockSubmission.student.name}</h3>
                    <p className="text-sm text-gray-500">{mockSubmission.student.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === 'id' ? 'Dikirim' : 'Submitted'}:</span>
                    <span>{getTimeAgo(mockSubmission.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === 'id' ? 'Lampiran' : 'Attachments'}:</span>
                    <span>{mockSubmission.attachments.length}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Attachments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Lampiran' : 'Attachments'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                {mockSubmission.attachments.length > 0 ? (
                  <div className="space-y-2">
                    {mockSubmission.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{attachment}</span>
                        </div>
                        <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                          {language === 'id' ? 'Unduh' : 'Download'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    {language === 'id' ? 'Tidak ada lampiran' : 'No attachments'}
                  </p>
                )}
              </div>
            </Card>
          </div>

          {/* Middle Column - Rubric Grading */}
          <div className="lg:col-span-2 space-y-6">
            {/* Grading Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {language === 'id' ? 'Ringkasan Penilaian' : 'Grading Summary'}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      {calculateTotalGrade()} / {mockAssignment.maxPoints}
                    </div>
                    <div className="text-sm text-gray-500">
                      {calculatePercentage()}% {language === 'id' ? 'rata-rata' : 'average'}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{mockAssignment.totalSubmissions}</p>
                    <p className="text-sm text-gray-600">
                      {language === 'id' ? 'Total Pengumpulan' : 'Total Submissions'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{mockAssignment.gradedSubmissions}</p>
                    <p className="text-sm text-gray-600">
                      {language === 'id' ? 'Sudah Dinilai' : 'Graded'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(mockAssignment.gradedSubmissions / mockAssignment.totalSubmissions) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{language === 'id' ? 'Progres Penilaian' : 'Grading Progress'}</span>
                  <span>{Math.round((mockAssignment.gradedSubmissions / mockAssignment.totalSubmissions) * 100)}%</span>
                </div>
              </div>
            </Card>

            {/* Rubric */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Rubrik Penilaian' : 'Grading Rubric'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAssignment.rubric.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{item.criterion}</h4>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            max={item.points}
                            value={grades[item.id] || 0}
                            onChange={(e) => handleGradeChange(item.id, parseInt(e.target.value) || 0)}
                            className="w-20 text-right"
                          />
                          <span className="text-gray-500">/ {item.points}</span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${((grades[item.id] || 0) / item.points) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Student Answers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {language === 'id' ? 'Jawaban Siswa' : 'Student Answers'}
                </CardTitle>
              </CardHeader>
              <div className="p-6 space-y-6">
                {mockSubmission.answers.map((answer, index) => (
                  <div key={index}>
                    <h4 className="font-medium text-gray-900 mb-2">{answer.question}</h4>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700">{answer.answer}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column - Feedback */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  {language === 'id' ? 'Umpan Balik & Komentar' : 'Feedback & Comments'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder={language === 'id' ? 'Tulis umpan balik untuk siswa...' : 'Write feedback for the student...'}
                  rows={6}
                  className="mb-4"
                />

                <div className="flex items-center gap-2 p-4 bg-blue-50 rounded-lg mb-6">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-sm text-blue-800">
                    {language === 'id'
                      ? 'Umpan balik yang konstruktif akan membantu siswa memahami kekuatan dan area peningkatan mereka.'
                      : 'Constructive feedback will help students understand their strengths and areas for improvement.'}
                  </p>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => navigate('/instructor/grading')}>
                    {language === 'id' ? 'Batal' : 'Cancel'}
                  </Button>
                  <Button leftIcon={<Save className="w-4 h-4" />}>
                    {language === 'id' ? 'Simpan Nilai' : 'Save Grade'}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
