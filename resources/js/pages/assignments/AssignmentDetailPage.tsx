import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  ArrowLeft,
  Upload,
  Download,
  Star,
  BookOpen,
  Paperclip,
  Send,
  X,
  File,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

type AssignmentStatus = 'pending' | 'submitted' | 'graded' | 'overdue';

interface AssignmentDetail {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  title: string;
  description: string;
  instructions: string;
  attachments: { name: string; url: string; size: string }[];
  dueDate: string;
  maxScore: number;
  createdAt: string;
  status: AssignmentStatus;
  submission?: {
    content: string;
    attachments: { name: string; url: string; size: string }[];
    submittedAt: string;
    score?: number;
    feedback?: string;
    gradedAt?: string;
  };
}

// Mock assignment data
const mockAssignment: AssignmentDetail = {
  id: 'assign-1',
  courseId: 'course-1',
  courseTitle: 'React Masterclass: From Zero to Hero',
  courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
  instructorName: 'Budi Santoso',
  instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  title: 'Build a Todo App with React Hooks',
  description:
    'In this assignment, you will create a fully functional todo application using React Hooks. This will test your understanding of useState, useEffect, and useContext.',
  instructions: `## Requirements

1. **Create a Todo List Component**
   - Display a list of todo items
   - Each item should show the task and a completion status

2. **Add Todo Functionality**
   - Input field to add new todos
   - Button to submit new todo
   - Validate that empty todos cannot be added

3. **Edit and Delete**
   - Ability to edit existing todos
   - Ability to delete todos
   - Confirmation before deleting

4. **State Management**
   - Use useState for local state
   - Use useEffect for side effects (e.g., localStorage)
   - Bonus: Use useContext for global state

5. **Styling**
   - Clean and responsive design
   - Use CSS modules or styled-components

## Submission Guidelines

- Submit your code as a GitHub repository link
- Include a README with setup instructions
- Deploy your app (Vercel, Netlify, etc.) and include the live link
- Include screenshots of your application

## Grading Criteria

| Criteria | Points |
|----------|--------|
| Functionality | 40 |
| Code Quality | 25 |
| UI/UX Design | 20 |
| Documentation | 15 |
| **Total** | **100** |
`,
  attachments: [
    { name: 'starter-template.zip', url: '#', size: '2.5 MB' },
    { name: 'design-mockup.figma', url: '#', size: '1.2 MB' },
  ],
  dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
  maxScore: 100,
  createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  status: 'pending',
};

export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [submissionContent, setSubmissionContent] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // In real app, fetch assignment by id
  const assignment = mockAssignment;
  console.log('Assignment ID:', id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
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

  const getStatusBadge = () => {
    const days = getDaysRemaining(assignment.dueDate);
    switch (assignment.status) {
      case 'pending':
        if (days <= 0) {
          return (
            <Badge variant="danger" size="lg">
              <AlertCircle className="w-4 h-4 mr-1" />
              {language === 'id' ? 'Jatuh Tempo Hari Ini' : 'Due Today'}
            </Badge>
          );
        }
        if (days <= 2) {
          return (
            <Badge variant="warning" size="lg">
              <Clock className="w-4 h-4 mr-1" />
              {days} {language === 'id' ? 'hari lagi' : 'days left'}
            </Badge>
          );
        }
        return (
          <Badge variant="primary" size="lg">
            <Clock className="w-4 h-4 mr-1" />
            {days} {language === 'id' ? 'hari lagi' : 'days left'}
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="secondary" size="lg">
            <Upload className="w-4 h-4 mr-1" />
            {language === 'id' ? 'Menunggu Penilaian' : 'Awaiting Grade'}
          </Badge>
        );
      case 'graded':
        return (
          <Badge variant="success" size="lg">
            <CheckCircle className="w-4 h-4 mr-1" />
            {language === 'id' ? 'Dinilai' : 'Graded'}: {assignment.submission?.score}/{assignment.maxScore}
          </Badge>
        );
      case 'overdue':
        return (
          <Badge variant="danger" size="lg">
            <AlertCircle className="w-4 h-4 mr-1" />
            {language === 'id' ? 'Terlambat' : 'Overdue'}
          </Badge>
        );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      }));
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim() && uploadedFiles.length === 0) {
      alert(language === 'id' ? 'Harap isi konten atau upload file.' : 'Please provide content or upload files.');
      return;
    }

    setIsSubmitting(true);
    // In real app, submit to API
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    alert(language === 'id' ? 'Tugas berhasil dikirim!' : 'Assignment submitted successfully!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/assignments"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'id' ? 'Kembali ke Tugas' : 'Back to Assignments'}
        </Link>

        {/* Assignment Header */}
        <Card className="mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Course Thumbnail */}
            <div className="md:w-48 h-32 flex-shrink-0">
              <img
                src={assignment.courseThumbnail}
                alt={assignment.courseTitle}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>

            {/* Assignment Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{assignment.courseTitle}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                </div>
                {getStatusBadge()}
              </div>

              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                <Avatar src={assignment.instructorAvatar} name={assignment.instructorName} size="xs" />
                <span>{assignment.instructorName}</span>
              </div>

              {/* Meta */}
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {language === 'id' ? 'Dibuat:' : 'Created:'} {formatDate(assignment.createdAt)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {language === 'id' ? 'Batas:' : 'Due:'} {formatDate(assignment.dueDate)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  <span>
                    {language === 'id' ? 'Nilai Maks:' : 'Max Score:'} {assignment.maxScore}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{language === 'id' ? 'Deskripsi' : 'Description'}</CardTitle>
          </CardHeader>
          <p className="text-gray-600">{assignment.description}</p>
        </Card>

        {/* Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{language === 'id' ? 'Instruksi' : 'Instructions'}</CardTitle>
          </CardHeader>
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
              {assignment.instructions}
            </pre>
          </div>
        </Card>

        {/* Attachments */}
        {assignment.attachments.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Lampiran' : 'Attachments'}</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {assignment.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{file.size}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                    {language === 'id' ? 'Unduh' : 'Download'}
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Submission Section */}
        {assignment.status === 'pending' || assignment.status === 'overdue' ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {language === 'id' ? 'Kirim Tugas' : 'Submit Assignment'}
              </CardTitle>
            </CardHeader>
            
            {/* Submission Content */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'id' ? 'Jawaban / Link' : 'Answer / Link'}
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder={
                    language === 'id'
                      ? 'Tulis jawaban atau link repository/deployment Anda...'
                      : 'Write your answer or paste your repository/deployment link...'
                  }
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'id' ? 'Lampiran (Opsional)' : 'Attachments (Optional)'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Paperclip className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {language === 'id'
                        ? 'Klik untuk upload atau drag & drop file'
                        : 'Click to upload or drag & drop files'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {language === 'id' ? 'Maksimal 10MB per file' : 'Max 10MB per file'}
                    </p>
                  </label>
                </div>

                {/* Uploaded Files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-400">({file.size})</span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500"
                          aria-label="Remove file"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {language === 'id' ? 'Kirim Tugas' : 'Submit Assignment'}
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Submission Result */
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {assignment.status === 'graded'
                  ? language === 'id'
                    ? 'Hasil Penilaian'
                    : 'Grading Result'
                  : language === 'id'
                  ? 'Tugas Terkirim'
                  : 'Submission'}
              </CardTitle>
            </CardHeader>

            {assignment.submission && (
              <div className="space-y-4">
                {/* Submitted Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    {language === 'id' ? 'Jawaban Anda' : 'Your Answer'}
                  </label>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">
                    {assignment.submission.content || '(No content)'}
                  </p>
                </div>

                {/* Submitted At */}
                <div className="text-sm text-gray-500">
                  <Upload className="w-4 h-4 inline mr-1" />
                  {language === 'id' ? 'Dikirim pada:' : 'Submitted at:'}{' '}
                  {formatDate(assignment.submission.submittedAt)}
                </div>

                {/* Grade (if graded) */}
                {assignment.status === 'graded' && (
                  <>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg flex-1">
                          <p className="text-3xl font-bold text-green-600">
                            {assignment.submission.score}
                          </p>
                          <p className="text-sm text-gray-500">
                            {language === 'id' ? 'dari' : 'of'} {assignment.maxScore}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg flex-1">
                          <p className="text-3xl font-bold text-blue-600">
                            {Math.round((assignment.submission.score! / assignment.maxScore) * 100)}%
                          </p>
                          <p className="text-sm text-gray-500">
                            {language === 'id' ? 'Persentase' : 'Percentage'}
                          </p>
                        </div>
                      </div>

                      {/* Feedback */}
                      {assignment.submission.feedback && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {language === 'id' ? 'Feedback dari Instruktur' : 'Instructor Feedback'}
                          </label>
                          <p className="text-gray-700">{assignment.submission.feedback}</p>
                        </div>
                      )}

                      {/* Graded At */}
                      {assignment.submission.gradedAt && (
                        <p className="text-sm text-gray-500 mt-3">
                          <CheckCircle className="w-4 h-4 inline mr-1 text-green-500" />
                          {language === 'id' ? 'Dinilai pada:' : 'Graded at:'}{' '}
                          {formatDate(assignment.submission.gradedAt)}
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
