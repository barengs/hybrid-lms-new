import { useState, useRef } from 'react';
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
  Loader2,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import {
  useGetAssignmentDetailQuery,
  useSubmitAssignmentMutation,
  type SubmissionData,
  type AssignmentDetailData,
} from '@/store/features/student/studentApiSlice';

// -------------------------------------------------------
// Helpers
// -------------------------------------------------------
function formatDate(dateString: string, locale: string) {
  return new Date(dateString).toLocaleDateString(locale === 'id' ? 'id-ID' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDaysRemaining(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

// -------------------------------------------------------
// Status Badge
// -------------------------------------------------------
function StatusBadge({
  assignment,
  language,
}: {
  assignment: AssignmentDetailData;
  language: string;
}) {
  const sub = assignment.my_submission;
  const status = sub?.status ?? 'pending';

  if (status === 'graded') {
    return (
      <Badge variant="success" size="md">
        <CheckCircle className="w-4 h-4 mr-1" />
        {language === 'id' ? 'Dinilai' : 'Graded'}: {sub?.points_awarded ?? '?'}/
        {assignment.max_points}
      </Badge>
    );
  }
  if (status === 'submitted' || status === 'late') {
    return (
      <Badge variant="secondary" size="md">
        <Upload className="w-4 h-4 mr-1" />
        {language === 'id' ? 'Menunggu Penilaian' : 'Awaiting Grade'}
      </Badge>
    );
  }

  // Not yet submitted — show due date state
  if (!assignment.due_date) {
    return (
      <Badge variant="primary" size="md">
        {language === 'id' ? 'Belum Dikerjakan' : 'Not Submitted'}
      </Badge>
    );
  }

  const days = getDaysRemaining(assignment.due_date);
  if (days <= 0)
    return (
      <Badge variant="danger" size="md">
        <AlertCircle className="w-4 h-4 mr-1" />
        {language === 'id' ? 'Terlambat' : 'Overdue'}
      </Badge>
    );
  if (days <= 2)
    return (
      <Badge variant="warning" size="md">
        <Clock className="w-4 h-4 mr-1" />
        {days} {language === 'id' ? 'hari lagi' : 'days left'}
      </Badge>
    );
  return (
    <Badge variant="primary" size="md">
      <Clock className="w-4 h-4 mr-1" />
      {days} {language === 'id' ? 'hari lagi' : 'days left'}
    </Badge>
  );
}

// -------------------------------------------------------
// AI Status Banner
// -------------------------------------------------------
function AiStatusBanner({
  submission,
  maxPoints,
  language,
}: {
  submission: SubmissionData;
  maxPoints: number;
  language: string;
}) {
  const { ai_status, ai_score, ai_feedback } = submission;

  const info: Record<string, { color: string; bg: string; border: string; label: string }> = {
    processing: {
      color: 'text-blue-700',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      label: language === 'id' ? 'AI sedang mengevaluasi tugasmu...' : 'AI is evaluating your submission...',
    },
    completed: {
      color: 'text-teal-700',
      bg: 'bg-teal-50',
      border: 'border-teal-200',
      label: language === 'id' ? 'Evaluasi AI Selesai' : 'AI Evaluation Complete',
    },
    failed: {
      color: 'text-red-700',
      bg: 'bg-red-50',
      border: 'border-red-200',
      label: language === 'id' ? 'Evaluasi AI Gagal' : 'AI Evaluation Failed',
    },
    pending: {
      color: 'text-gray-600',
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      label: language === 'id' ? 'Menunggu evaluasi AI' : 'Awaiting AI evaluation',
    },
  };

  if (!ai_status || ai_status === 'not_applicable') return null;
  const cfg = info[ai_status] ?? info.pending;

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start gap-3">
        {ai_status === 'processing' ? (
          <Loader2 className={`w-5 h-5 mt-0.5 animate-spin ${cfg.color}`} />
        ) : ai_status === 'completed' ? (
          <Sparkles className={`w-5 h-5 mt-0.5 ${cfg.color}`} />
        ) : ai_status === 'failed' ? (
          <AlertCircle className={`w-5 h-5 mt-0.5 ${cfg.color}`} />
        ) : (
          <HelpCircle className={`w-5 h-5 mt-0.5 ${cfg.color}`} />
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${cfg.color}`}>{cfg.label}</p>

          {ai_status === 'processing' && (
            <>
              <div className="mt-2 h-1.5 w-full bg-blue-200 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full animate-pulse w-2/3" />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {language === 'id'
                  ? 'Hasilnya akan muncul di sini begitu AI selesai menilai.'
                  : 'Results will appear here once the AI finishes grading.'}
              </p>
            </>
          )}

          {ai_status === 'completed' && ai_score !== null && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-teal-500" />
                <span className="font-bold text-teal-700">
                  {language === 'id' ? 'Skor AI:' : 'AI Score:'} {ai_score} / {maxPoints}
                </span>
              </div>
              {ai_feedback && (
                <p className="text-sm text-gray-700 bg-white/60 rounded-lg p-3 leading-relaxed">
                  {ai_feedback}
                </p>
              )}
            </div>
          )}

          {ai_status === 'failed' && (
            <p className="text-xs text-red-600 mt-1">
              {language === 'id'
                ? 'Evaluasi otomatis gagal. Instruktur akan menilai secara manual.'
                : 'Automated evaluation failed. The instructor will grade manually.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Submit Result Banner (shown immediately after submit)
// -------------------------------------------------------
function SubmitResultBanner({
  message,
  meta,
  language,
}: {
  message: string;
  meta: { submission_status: string; ai_status: string; is_first_submission: boolean };
  language: string;
}) {
  const isSuccess = true;
  return (
    <div
      className={`rounded-xl border p-4 ${
        isSuccess ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 mt-0.5 text-green-600 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-700 text-sm">{message}</p>
          <div className="flex flex-wrap gap-3 mt-2">
            <span className="text-xs bg-white/70 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
              {language === 'id' ? 'Status:' : 'Status:'}{' '}
              <strong>
                {meta.submission_status === 'submitted'
                  ? language === 'id'
                    ? 'Terkumpul'
                    : 'Submitted'
                  : meta.submission_status === 'graded'
                  ? language === 'id'
                    ? 'Dinilai'
                    : 'Graded'
                  : meta.submission_status}
              </strong>
            </span>
            {meta.ai_status !== 'not_applicable' && (
              <span className="text-xs bg-white/70 text-gray-600 px-2 py-1 rounded-full border border-gray-200">
                AI:{' '}
                <strong>
                  {meta.ai_status === 'processing'
                    ? language === 'id'
                      ? 'Sedang Proses'
                      : 'Processing'
                    : meta.ai_status === 'completed'
                    ? language === 'id'
                      ? 'Selesai'
                      : 'Done'
                    : meta.ai_status}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Main Page
// -------------------------------------------------------
export function AssignmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();

  const assignmentId = Number(id);

  const { data: assignment, isLoading, isError, error } = useGetAssignmentDetailQuery(
    assignmentId,
    { skip: !id }
  );
  const [submitAssignment, { isLoading: isSubmitting }] = useSubmitAssignmentMutation();

  const [submissionContent, setSubmissionContent] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [submitResult, setSubmitResult] = useState<{
    message: string;
    meta: { submission_status: string; ai_status: string; is_first_submission: boolean; submitted_at: string };
  } | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!submissionContent.trim() && selectedFiles.length === 0) {
      setSubmitError(
        language === 'id'
          ? 'Harap isi jawaban atau upload file terlebih dahulu.'
          : 'Please provide an answer or upload a file.'
      );
      return;
    }

    setSubmitError(null);
    setSubmitResult(null);

    const formData = new FormData();
    if (submissionContent.trim()) {
      formData.append('content', submissionContent);
    }
    if (selectedFiles.length > 0) {
      // Backend only handles single file, send first file
      formData.append('file', selectedFiles[0]);
    }

    try {
      const result = await submitAssignment({ assignmentId, formData }).unwrap();
      setSubmitResult({ message: result.message, meta: result.meta });
      setSelectedFiles([]);
    } catch (err: any) {
      const msg =
        err?.data?.message ??
        (language === 'id' ? 'Gagal mengirim tugas, coba lagi.' : 'Failed to submit. Please try again.');
      setSubmitError(msg);
    }
  };

  // ---- Loading ----
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px] gap-3 text-gray-500">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{language === 'id' ? 'Memuat tugas...' : 'Loading assignment...'}</span>
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !assignment) {
    const errMsg =
      (error as any)?.data?.message ??
      (language === 'id' ? 'Tugas tidak ditemukan.' : 'Assignment not found.');
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Link to="/assignments" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali' : 'Back'}
          </Link>
          <Card>
            <div className="flex flex-col items-center py-12 text-center gap-3 text-red-500">
              <AlertCircle className="w-10 h-10" />
              <p className="font-semibold">{errMsg}</p>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const sub = assignment.my_submission;
  const isGraded = sub?.status === 'graded';
  const hasSubmitted = !!sub;
  const canResubmit = hasSubmitted && assignment.allow_multiple_submissions && !isGraded;
  const showForm = !hasSubmitted || canResubmit;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back */}
        <Link to="/assignments" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft className="w-4 h-4" />
          {language === 'id' ? 'Kembali ke Tugas' : 'Back to Assignments'}
        </Link>

        {/* Header Card */}
        <Card className="mb-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <BookOpen className="w-4 h-4" />
              <span>{language === 'id' ? 'Tugas' : 'Assignment'}</span>
            </div>
            <StatusBadge assignment={assignment} language={language} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{assignment.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {assignment.due_date && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>
                  {language === 'id' ? 'Batas:' : 'Due:'}{' '}
                  {formatDate(assignment.due_date, language)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>
                {language === 'id' ? 'Nilai Maks:' : 'Max Score:'} {assignment.max_points}
              </span>
            </div>
          </div>
        </Card>

        {/* Description */}
        {assignment.description && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Deskripsi' : 'Description'}</CardTitle>
            </CardHeader>
            <p className="text-gray-600 leading-relaxed">{assignment.description}</p>
          </Card>
        )}

        {/* Instructions */}
        {assignment.instructions && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Instruksi' : 'Instructions'}</CardTitle>
            </CardHeader>
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                {assignment.instructions}
              </pre>
            </div>
          </Card>
        )}

        {/* ---- POST-SUBMIT SUCCESS BANNER ---- */}
        {submitResult && (
          <div className="mb-6">
            <SubmitResultBanner message={submitResult.message} meta={submitResult.meta} language={language} />
          </div>
        )}

        {/* ---- AI STATUS BANNER (from saved submission) ---- */}
        {sub && sub.ai_status && sub.ai_status !== 'not_applicable' && (
          <div className="mb-6">
            <AiStatusBanner submission={sub} maxPoints={assignment.max_points} language={language} />
          </div>
        )}

        {/* ---- EXISTING SUBMISSION RESULT ---- */}
        {hasSubmitted && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {isGraded
                  ? language === 'id' ? 'Hasil Penilaian' : 'Grading Result'
                  : language === 'id' ? 'Tugas Terkumpul' : 'Submission Received'}
              </CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {sub.content && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">
                    {language === 'id' ? 'Jawaban Anda' : 'Your Answer'}
                  </p>
                  <p className="text-gray-700 p-3 bg-gray-50 rounded-lg leading-relaxed">
                    {sub.content}
                  </p>
                </div>
              )}
              {sub.files && sub.files.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">
                    {language === 'id' ? 'File Terlampir' : 'Attached Files'}
                  </p>
                  <div className="space-y-2">
                    {sub.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm">
                        <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span>{f.name}</span>
                        <span className="text-gray-400 text-xs">
                          ({(f.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Upload className="w-4 h-4" />
                {language === 'id' ? 'Dikirim pada:' : 'Submitted at:'}{' '}
                {formatDate(sub.submitted_at, language)}
              </p>

              {isGraded && sub.points_awarded !== null && (
                <div className="border-t pt-4 space-y-3">
                  <div className="flex gap-4">
                    <div className="flex-1 p-4 bg-green-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-green-600">{sub.points_awarded}</p>
                      <p className="text-sm text-gray-500">
                        {language === 'id' ? 'dari' : 'of'} {assignment.max_points}
                      </p>
                    </div>
                    <div className="flex-1 p-4 bg-blue-50 rounded-lg text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        {Math.round((sub.points_awarded / assignment.max_points) * 100)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        {language === 'id' ? 'Persentase' : 'Percentage'}
                      </p>
                    </div>
                  </div>
                  {sub.instructor_feedback && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        {language === 'id' ? 'Feedback Instruktur' : 'Instructor Feedback'}
                      </p>
                      <p className="text-gray-700 leading-relaxed">{sub.instructor_feedback}</p>
                    </div>
                  )}
                  {sub.graded_at && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      {language === 'id' ? 'Dinilai pada:' : 'Graded at:'}{' '}
                      {formatDate(sub.graded_at, language)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* ---- SUBMISSION FORM ---- */}
        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {canResubmit
                  ? language === 'id' ? 'Perbarui Pengumpulan' : 'Update Submission'
                  : language === 'id' ? 'Kirim Tugas' : 'Submit Assignment'}
              </CardTitle>
            </CardHeader>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {submitError}
              </div>
            )}

            <div className="space-y-5">
              {/* Text Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'id' ? 'Jawaban / Link' : 'Answer / Link'}
                  <span className="text-gray-400 font-normal ml-1">
                    ({language === 'id' ? 'opsional' : 'optional'})
                  </span>
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  placeholder={
                    language === 'id'
                      ? 'Tuliskan jawaban atau link repository/deployment Anda...'
                      : 'Write your answer or paste your repository/deployment link...'
                  }
                  rows={6}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-400 transition"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'id' ? 'Lampiran File' : 'File Attachment'}
                  <span className="text-gray-400 font-normal ml-1">
                    ({language === 'id' ? 'opsional' : 'optional'})
                  </span>
                </label>
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition"
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                    accept=".pdf,.zip,.rar,.doc,.docx,.png,.jpg,.jpeg"
                  />
                  <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {language === 'id' ? 'Klik untuk upload file' : 'Click to upload a file'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PDF, ZIP, DOC, DOCX, PNG, JPG — {language === 'id' ? 'Maks 10MB' : 'Max 10MB'}
                  </p>
                </div>

                {selectedFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(index)}
                          className="p-1 text-gray-400 hover:text-red-500 transition flex-shrink-0"
                          aria-label="Remove file"
                          disabled={isSubmitting}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2">
                {isSubmitting ? (
                  <div className="flex items-center gap-3 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm font-medium">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'id'
                      ? 'Sedang mengupload & mengirim tugas...'
                      : 'Uploading & submitting assignment...'}
                  </div>
                ) : (
                  <Button
                    leftIcon={<Send className="w-4 h-4" />}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {canResubmit
                      ? language === 'id' ? 'Perbarui Tugas' : 'Update Submission'
                      : language === 'id' ? 'Kirim Tugas' : 'Submit Assignment'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Not submittable info */}
        {!showForm && !hasSubmitted && (
          <Card className="mb-6">
            <div className="flex items-center gap-3 text-gray-500 py-4">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">
                {language === 'id'
                  ? 'Pengumpulan tidak tersedia untuk tugas ini.'
                  : 'Submission is not available for this assignment.'}
              </span>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
