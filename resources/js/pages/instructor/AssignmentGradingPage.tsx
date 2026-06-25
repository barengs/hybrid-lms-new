import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  CheckCircle,
  Edit3,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Avatar, Textarea, Input, Badge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { getTimeAgo } from '@/lib/utils';
import { 
  useGetInstructorSubmissionQuery,
  useGradeSubmissionMutation,
  useAiGradeSubmissionMutation
} from '@/store/features/instructor/instructorApiSlice';
import toast from 'react-hot-toast';

const FileViewer = ({ fileUrl, fileName }: { fileUrl: string; fileName: string }) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoadingText, setIsLoadingText] = useState(false);
  
  const isImage = fileName.match(/\.(jpeg|jpg|gif|png|webp)$/i);
  const isPdf = fileName.match(/\.(pdf)$/i);
  const isOffice = fileName.match(/\.(doc|docx|xls|xlsx|ppt|pptx)$/i);
  const isCode = fileName.match(/\.(txt|js|jsx|ts|tsx|php|py|java|cpp|c|cs|html|css|json|sql|md|csv)$/i);

  useEffect(() => {
    if (isCode) {
      setIsLoadingText(true);
      fetch(fileUrl)
        .then(res => res.text())
        .then(text => {
          setTextContent(text);
          setIsLoadingText(false);
        })
        .catch(err => {
          console.error('Failed to load text file', err);
          setTextContent('Failed to load file content.');
          setIsLoadingText(false);
        });
    }
  }, [fileUrl, isCode]);

  return (
    <div className="w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
      <div className="p-2 bg-gray-200 border-b border-gray-300 text-sm font-medium flex justify-between items-center">
        <span>{fileName}</span>
      </div>
      <div className="overflow-x-auto">
        {isImage && (
          <img src={fileUrl} alt={fileName} className="max-w-full h-auto mx-auto" />
        )}
        {isPdf && (
          <iframe src={fileUrl} className="w-full h-[600px] border-0" title={fileName} />
        )}
        {isOffice && (
          <div className="w-full h-[600px] bg-white flex flex-col items-center justify-center relative">
            <iframe src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`} className="w-full h-full border-0 absolute inset-0 z-10" title={fileName} />
            <div className="z-0 p-4 text-center">
              <p className="text-gray-500 mb-2">Loading document...</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Note: Office document preview requires the file URL to be publicly accessible from the internet.</p>
            </div>
          </div>
        )}
        {isCode && (
          <div className="w-full bg-slate-900 text-gray-100 p-4 overflow-auto max-h-[600px] text-left">
            {isLoadingText ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-400"></div>
              </div>
            ) : (
              <pre className="text-sm font-mono whitespace-pre-wrap"><code>{textContent}</code></pre>
            )}
          </div>
        )}
        {!isImage && !isPdf && !isOffice && !isCode && (
          <div className="p-8 text-center text-gray-500">
            Preview is not available for this file type. Please download to view.
          </div>
        )}
      </div>
    </div>
  );
};

export function AssignmentGradingPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { submissionId } = useParams();
  
  const { data: submission, isLoading, error } = useGetInstructorSubmissionQuery(submissionId as string, {
    skip: !submissionId
  });

  const [gradeSubmission, { isLoading: isGrading }] = useGradeSubmissionMutation();
  const [aiGradeSubmission, { isLoading: isAiGrading }] = useAiGradeSubmissionMutation();

  const [manualPoints, setManualPoints] = useState<number | ''>('');
  const [manualFeedback, setManualFeedback] = useState('');

  // Update local state when submission data is loaded
  useEffect(() => {
    if (submission) {
      setManualPoints(submission.points_awarded ?? '');
      setManualFeedback(submission.instructor_feedback ?? '');
    }
  }, [submission]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !submission) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
          <AlertCircle className="w-12 h-12 mb-4" />
          <p>{language === 'id' ? 'Tugas tidak ditemukan' : 'Submission not found'}</p>
          <Button className="mt-4" onClick={() => navigate('/instructor/grading')}>
            {language === 'id' ? 'Kembali' : 'Back'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleManualGrade = async () => {
    try {
      await gradeSubmission({
        id: submission.id,
        points_awarded: Number(manualPoints),
        instructor_feedback: manualFeedback,
      }).unwrap();
      toast.success(language === 'id' ? 'Nilai berhasil disimpan' : 'Grade saved successfully');
      navigate('/instructor/grading');
    } catch (err) {
      toast.error('Failed to save grade');
    }
  };

  const handleAiGrade = async () => {
    try {
      const result = await aiGradeSubmission(submission.id).unwrap();
      setManualPoints(result.ai_score ?? '');
      setManualFeedback(result.ai_feedback ?? '');
      toast.success(language === 'id' ? 'AI berhasil menganalisis tugas' : 'AI successfully analyzed the submission');
    } catch (err) {
      toast.error('AI analysis failed');
    }
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
                  <Avatar src={submission.student.avatar} name={submission.student.name} size="lg" />
                  <div>
                    <h3 className="font-medium text-gray-900">{submission.student.name}</h3>
                    <p className="text-sm text-gray-500">{submission.student.email}</p>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === 'id' ? 'Dikirim' : 'Submitted'}:</span>
                    <span>{getTimeAgo(submission.submitted_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{language === 'id' ? 'Lampiran' : 'Attachments'}:</span>
                    <span>{submission.files ? submission.files.length : 0}</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Assignment Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Detail Tugas' : 'Assignment Details'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                <h3 className="font-medium text-gray-900 mb-2">{submission.assignment.title}</h3>
                
                <div className="space-y-3 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen className="w-4 h-4 text-gray-400" />
                    <span>{submission.assignment.course_title}</span>
                  </div>
                  {submission.assignment.is_class_based && submission.assignment.class_info && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span>{submission.assignment.class_info.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Batas Waktu' : 'Due'}: {new Date(submission.assignment.due_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Star className="w-4 h-4 text-gray-400" />
                    <span>
                      {language === 'id' ? 'Poin Maksimal' : 'Max Points'}: {submission.assignment.max_points}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Middle Column - Content & Attachments */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student Answers / Content */}
            {submission.content && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    {language === 'id' ? 'Konten Jawaban' : 'Submission Content'}
                  </CardTitle>
                </CardHeader>
                <div className="p-6">
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg whitespace-pre-wrap text-sm text-gray-700">
                    {submission.content}
                  </div>
                </div>
              </Card>
            )}

            {/* Attachments with Document Viewer */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'id' ? 'Lampiran Dokumen' : 'Document Attachments'}
                </CardTitle>
              </CardHeader>
              <div className="p-6">
                {submission.files && submission.files.length > 0 ? (
                  <div className="space-y-6">
                    {/* List of files with download links */}
                    <div className="flex flex-wrap gap-2">
                      {submission.files.map((file, index) => (
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

                    {/* Previews */}
                    <div className="space-y-4">
                      {submission.files.map((file, index) => {
                        const fileUrl = `${import.meta.env.VITE_URL_API_IMAGE}/${file.path}`;
                        return (
                          <FileViewer key={`preview-${index}`} fileUrl={fileUrl} fileName={file.name} />
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm italic">
                    {language === 'id' ? 'Tidak ada lampiran' : 'No attachments'}
                  </p>
                )}
              </div>
            </Card>

            {/* Grading Area */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    {language === 'id' ? 'Form Penilaian' : 'Grading Form'}
                  </CardTitle>
                  {submission.assignment.type !== 'quiz' && (
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
              </CardHeader>
              <div className="p-6">
                
                {/* AI Suggestion */}
                {submission.ai_status === 'completed' && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-bold text-purple-900">{language === 'id' ? 'Saran AI' : 'AI Suggestion'}</span>
                      <Badge variant="outline" className="bg-white ml-auto border-purple-200">{submission.ai_score} / {submission.assignment.max_points}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-purple-600 border-purple-200 hover:bg-purple-100 ml-2"
                        onClick={() => {
                          setManualPoints(submission.ai_score ?? '');
                          setManualFeedback(submission.ai_feedback ?? '');
                        }}
                      >
                        {language === 'id' ? 'Gunakan Saran AI' : 'Use AI Suggestion'}
                      </Button>
                    </div>
                    <p className="text-sm text-purple-800 italic">{submission.ai_feedback}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Poin' : 'Points'} ({submission.assignment.max_points} {language === 'id' ? 'maksimal' : 'maximum'})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={submission.assignment.max_points}
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
                        value={manualPoints && submission.assignment.max_points ? Math.round((Number(manualPoints) / submission.assignment.max_points) * 100) : 0}
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

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => navigate('/instructor/grading')} disabled={isGrading}>
                    {language === 'id' ? 'Batal' : 'Cancel'}
                  </Button>
                  <Button 
                    leftIcon={<Save className="w-4 h-4" />}
                    onClick={handleManualGrade}
                    isLoading={isGrading}
                    disabled={manualPoints === ''}
                  >
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
