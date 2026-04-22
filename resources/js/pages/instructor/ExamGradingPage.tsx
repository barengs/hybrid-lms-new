import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { Card, CardHeader, CardTitle, Button, Avatar, Textarea, Input, Progress } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { getTimeAgo } from '@/lib/utils';

// Mock data for exam details
const mockExam = {
  id: 'exam-1',
  title: 'Final Project Evaluation',
  description: 'Comprehensive evaluation of the final project covering all aspects learned throughout the course.',
  course: {
    id: 'course-2',
    title: 'Full Stack Development with Node.js',
    isClassBased: true,
    classInfo: {
      id: 'class-1',
      name: 'Batch A - Evening Class',
    },
  },
  dueDate: '2024-12-20T23:59:59Z',
  maxPoints: 150,
  totalSubmissions: 28,
  gradedSubmissions: 15,
  averageGrade: 82,
  sections: [
    { id: 'sec1', title: 'Frontend Implementation', maxPoints: 50 },
    { id: 'sec2', title: 'Backend API', maxPoints: 40 },
    { id: 'sec3', title: 'Database Design', maxPoints: 30 },
    { id: 'sec4', title: 'Documentation', maxPoints: 20 },
    { id: 'sec5', title: 'Deployment', maxPoints: 10 },
  ],
};

// Mock student submission
const mockSubmission = {
  id: 'sub-1',
  student: {
    id: 'student-1',
    name: 'Budi Hartono',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiH',
    email: 'budi.hartono@email.com',
  },
  submittedAt: '2024-12-16T11:30:00Z',
  attachments: ['project.zip', 'documentation.pdf'],
  answers: [
    {
      question: 'Describe your frontend architecture decisions',
      answer: 'I used React with Redux for state management. The component structure follows a modular approach with reusable components. I implemented responsive design using Tailwind CSS.'
    },
    {
      question: 'Explain your backend API design',
      answer: 'I designed a RESTful API with Node.js and Express. Authentication is handled with JWT tokens. I implemented proper error handling and validation middleware.'
    }
  ],
  timeSpent: '03:45:22', // 3 hours, 45 minutes, 22 seconds
  attempts: 2,
};

export function ExamGradingPage() {
  useParams<{ examId: string; submissionId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [grades, setGrades] = useState<Record<string, number>>({
    sec1: 45,
    sec2: 38,
    sec3: 28,
    sec4: 18,
    sec5: 9,
  });
  const [feedback, setFeedback] = useState('Excellent work on this comprehensive project! Your frontend implementation is clean and well-structured. The backend API design shows a solid understanding of REST principles. Your database design is efficient with proper normalization. The documentation is thorough and helpful. For deployment, consider adding monitoring and logging for production environments.');

  const handleGradeChange = (sectionId: string, points: number) => {
    setGrades(prev => ({
      ...prev,
      [sectionId]: Math.max(0, Math.min(points, mockExam.sections.find(s => s.id === sectionId)?.maxPoints || 0))
    }));
  };

  const calculateTotalGrade = () => {
    return Object.values(grades).reduce((sum, grade) => sum + grade, 0);
  };

  const calculatePercentage = () => {
    const total = calculateTotalGrade();
    return Math.round((total / mockExam.maxPoints) * 100);
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
              {language === 'id' ? 'Penilaian Ujian' : 'Exam Grading'}
            </h1>
            <p className="text-gray-600">
              {language === 'id'
                ? 'Memberikan nilai dan umpan balik untuk ujian siswa'
                : 'Grading student exam and providing feedback'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Exam & Student Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Exam Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Detail Ujian' : 'Exam Details'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-2">{mockExam.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{mockExam.description}</p>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{mockExam.course.title}</span>
                  </div>
                  {mockExam.course.isClassBased && mockExam.course.classInfo && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{mockExam.course.classInfo.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Batas Waktu' : 'Due'}: {new Date(mockExam.dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Poin Maksimal' : 'Max Points'}: {mockExam.maxPoints}
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
                    <span className="text-gray-500">{language === 'id' ? 'Waktu Dikerjakan' : 'Time Spent'}:</span>
                    <span>{mockSubmission.timeSpent}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === 'id' ? 'Percobaan' : 'Attempts'}:</span>
                    <span>{mockSubmission.attempts}</span>
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

          {/* Middle Column - Section Grading */}
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
                      {calculateTotalGrade()} / {mockExam.maxPoints}
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
                    <p className="text-2xl font-bold text-blue-600">{mockExam.totalSubmissions}</p>
                    <p className="text-sm text-gray-600">
                      {language === 'id' ? 'Total Pengumpulan' : 'Total Submissions'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{mockExam.gradedSubmissions}</p>
                    <p className="text-sm text-gray-600">
                      {language === 'id' ? 'Sudah Dinilai' : 'Graded'}
                    </p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${(mockExam.gradedSubmissions / mockExam.totalSubmissions) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{language === 'id' ? 'Progres Penilaian' : 'Grading Progress'}</span>
                  <span>{Math.round((mockExam.gradedSubmissions / mockExam.totalSubmissions) * 100)}%</span>
                </div>

                {/* Performance Chart */}
                <div className="mt-6">
                  <h4 className="font-medium text-gray-900 mb-3">
                    {language === 'id' ? 'Statistik Kelas' : 'Class Statistics'}
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Rata-rata Kelas' : 'Class Average'}</span>
                      <span className="font-medium">{mockExam.averageGrade}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Nilai Tertinggi' : 'Highest Score'}</span>
                      <span className="font-medium text-green-600">95%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Nilai Terendah' : 'Lowest Score'}</span>
                      <span className="font-medium text-red-600">62%</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Sections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Bagian Ujian' : 'Exam Sections'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <div className="space-y-4">
                  {mockExam.sections.map((section) => {
                    const grade = grades[section.id] || 0;
                    const percentage = Math.round((grade / section.maxPoints) * 100);

                    return (
                      <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">{section.title}</h4>
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max={section.maxPoints}
                              value={grade}
                              onChange={(e) => handleGradeChange(section.id, parseInt(e.target.value) || 0)}
                              className="w-20 text-right"
                            />
                            <span className="text-gray-500">/ {section.maxPoints}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <Progress value={percentage} size="sm" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
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
                      ? 'Umpan balik yang komprehensif akan membantu siswa memahami pencapaian mereka dan area untuk pengembangan lebih lanjut.'
                      : 'Comprehensive feedback will help students understand their achievements and areas for further development.'}
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
