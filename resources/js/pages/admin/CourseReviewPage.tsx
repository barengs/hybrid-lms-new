import { useState, useMemo } from 'react';
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
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal, LoadingScreen } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, getTimeAgo } from '@/lib/utils';
import { useGetAdminCourseQuery, useUpdateAdminCourseStatusMutation } from '@/store/api/courseManagementApiSlice';
import toast from 'react-hot-toast';

export function CourseReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();

  const { data: courseData, isLoading, error } = useGetAdminCourseQuery(id!);
  const [updateStatus, { isLoading: isUpdating }] = useUpdateAdminCourseStatusMutation();

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

  const course = courseData?.data;

  const toggleChecklistItem = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleApprove = async () => {
    try {
      await updateStatus({ 
        id: id!, 
        status: 'published',
        admin_feedback: overallFeedback || 'Course approved'
      }).unwrap();
      toast.success(language === 'id' ? 'Kursus telah dipublikasikan' : 'Course has been published');
      setShowApproveModal(false);
      navigate('/admin/courses');
    } catch (err) {
      toast.error('Failed to approve course');
    }
  };

  const handleReject = async () => {
    if (!overallFeedback) {
      toast.error(language === 'id' ? 'Tolong isi alasan penolakan' : 'Please provide a rejection reason');
      return;
    }
    try {
      await updateStatus({ 
        id: id!, 
        status: 'rejected',
        admin_feedback: overallFeedback
      }).unwrap();
      toast.success(language === 'id' ? 'Kursus telah ditolak' : 'Course has been rejected');
      setShowRejectModal(false);
      navigate('/admin/courses');
    } catch (err) {
      toast.error('Failed to reject course');
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionNotes) {
      toast.error(language === 'id' ? 'Tolong isi catatan revisi' : 'Please provide revision notes');
      return;
    }
    try {
      await updateStatus({ 
        id: id!, 
        status: 'revision',
        admin_feedback: revisionNotes
      }).unwrap();
      toast.success(language === 'id' ? 'Permintaan revisi telah dikirim' : 'Revision request has been sent');
      setShowRevisionModal(false);
      navigate('/admin/courses');
    } catch (err) {
      toast.error('Failed to request revision');
    }
  };

  const getStatusBadge = () => {
    if (!course) return null;
    const config = {
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu Review' : 'Pending Review' },
      published: { variant: 'success' as const, label: language === 'id' ? 'Terbit' : 'Published' },
      revision: { variant: 'primary' as const, label: language === 'id' ? 'Revisi' : 'Revision' },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected' },
    };
    const current = config[course.status as keyof typeof config] || { variant: 'secondary' as const, label: course.status };
    return <Badge variant={current.variant}>{current.label}</Badge>;
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

  if (isLoading) return <LoadingScreen />;
  if (!course) return <div className="p-8 text-center">Course not found or access denied.</div>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/courses"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali ke Daftar Kursus' : 'Back to Courses List'}
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white line-clamp-2">{course.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {getStatusBadge()}
                <Badge variant="secondary">{course.category?.name || 'Uncategorized'}</Badge>
                <Badge variant="secondary" className="capitalize">{course.level}</Badge>
                <Badge variant="secondary">{course.language}</Badge>
              </div>
            </div>
            {course.status === 'pending' && (
              <div className="flex flex-wrap gap-2 lg:flex-nowrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRevisionModal(true)}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {language === 'id' ? 'Minta Revisi' : 'Request Changes'}
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowRejectModal(true)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  {language === 'id' ? 'Tolak' : 'Reject'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setShowApproveModal(true)}
                  leftIcon={<CheckCircle className="w-4 h-4" />}
                  disabled={!allChecked}
                  className="shadow-md shadow-blue-500/20"
                >
                  {language === 'id' ? 'Setujui' : 'Approve'}
                </Button>
              </div>
            )}
          </div>

          {/* Course Card Preview */}
          <Card className="mb-8">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="shrink-0">
                <img
                  src={course.thumbnail || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600'}
                  alt={course.title}
                  className="w-full md:w-80 aspect-video object-cover rounded-xl shadow-lg"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-lg">{language === 'id' ? 'Detail Instruktur' : 'Instructor Details'}</h3>
                <div className="flex items-center gap-3 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <Avatar src={course.instructor?.avatar} name={course.instructor?.name} size="md" />
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{course.instructor?.name}</p>
                    <p className="text-sm text-gray-500">{course.instructor?.email || 'N/A'}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2.5 text-sm">
                    <DollarSign className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {language === 'id' ? 'Harga' : 'Price'}: 
                      <span className="font-bold text-gray-900 dark:text-white ml-1">{formatCurrency(course.price)}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Users className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {language === 'id' ? 'Pendaftar' : 'Enrollments'}: 
                      <span className="font-bold text-gray-900 dark:text-white ml-1">{course.studentsEnrolled || 0}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Calendar className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {language === 'id' ? 'Dibuat' : 'Created'}: 
                      <span className="ml-1 text-gray-900 dark:text-white">{new Date(course.created_at).toLocaleDateString()}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm">
                    <Clock className="w-4.5 h-4.5 text-gray-400 shrink-0" />
                    <span className="text-gray-600 dark:text-gray-300">
                      {language === 'id' ? 'Terakhir Update' : 'Last Updated'}: 
                      <span className="ml-1 text-gray-900 dark:text-white">{getTimeAgo(course.updated_at || course.created_at)}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Areas */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-xl w-fit">
              {[
                { id: 'overview', label: language === 'id' ? 'Ringkasan' : 'Overview' },
                { id: 'syllabus', label: language === 'id' ? 'Kurikulum' : 'Curriculum' },
                { id: 'content', label: language === 'id' ? 'Review Materi' : 'Content' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Panes */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">{language === 'id' ? 'Subjudul & Deskripsi' : 'Subtitle & Description'}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="font-medium text-gray-900 dark:text-white italic">"{course.subtitle || 'No subtitle provided.'}"</p>
                      <div className="prose dark:prose-invert max-w-none text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line bg-gray-50 dark:bg-gray-900/40 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        {course.description}
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md flex items-center gap-2">
                           <CheckCircle className="w-4 h-4 text-green-500" />
                           {language === 'id' ? 'Target Pembelajaran' : 'Learning Outcomes'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(course.outcomes || []).map((obj: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{obj}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-md flex items-center gap-2">
                           <FileText className="w-4 h-4 text-blue-500" />
                           {language === 'id' ? 'Persyaratan' : 'Requirements'}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {(course.requirements || []).map((req: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                              <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                              <span>{req}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {activeTab === 'syllabus' && (
                <div className="space-y-4">
                  {(course.sections || []).length > 0 ? (
                    course.sections!.map((section: any, sIdx: number) => (
                      <Card key={section.id} className="overflow-hidden border-l-4 border-l-blue-500">
                        <CardHeader className="bg-gray-50 dark:bg-gray-900/50">
                          <CardTitle className="text-base flex justify-between items-center">
                            <span>#{sIdx + 1}: {section.title}</span>
                            <Badge variant="secondary" size="sm">{section.lessons?.length || 0} Materi</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {(section.lessons || []).map((lesson: any, lIdx: number) => (
                              <div key={lesson.id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors group">
                                <div className="flex items-center gap-4">
                                  <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 flex items-center justify-center text-xs font-semibold text-gray-400 group-hover:text-blue-500 group-hover:border-blue-200 transition-colors">
                                    {lIdx + 1}
                                  </div>
                                  <div className="flex flex-col">
                                    <span className="text-sm font-medium text-gray-900 dark:text-white">{lesson.title}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      {getLessonTypeIcon(lesson.type)}
                                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{lesson.type}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-400 font-medium">
                                  {lesson.duration || '0'}m
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
                      <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{language === 'id' ? 'Kurikulum belum diinput.' : 'No curriculum provided yet.'}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'content' && (
                <Card className="min-h-[400px] flex items-center justify-center bg-gray-950 text-white rounded-2xl overflow-hidden relative group">
                   <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?w=1200')] bg-cover bg-center opacity-30 group-hover:scale-105 transition-transform duration-700" />
                   <div className="relative z-10 text-center p-8 bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 mx-4">
                      <Video className="w-16 h-16 text-blue-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                      <h4 className="text-xl font-bold mb-2">{language === 'id' ? 'Moderasi Lab Video' : 'Video Moderation Lab'}</h4>
                      <p className="text-gray-300 text-sm mb-8 max-w-md mx-auto">
                        {language === 'id' 
                          ? 'Gunakan area ini untuk meninjau preview video yang diunggah oleh instruktur untuk memastikan kualitas audio dan visual.'
                          : 'Use this workspace to preview video content uploaded by the instructor to ensure audio/visual quality compliance.'}
                      </p>
                      <div className="flex flex-wrap justify-center gap-3">
                         <Button variant="primary" disabled>{language === 'id' ? 'Putar Video Preview' : 'Play Preview Video'}</Button>
                         <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 transition-colors uppercase tracking-widest text-[10px] font-black">{language === 'id' ? 'Log Aset' : 'Asset Log'}</Button>
                      </div>
                   </div>
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar Area: Review Context & History */}
          <div className="space-y-6 lg:sticky lg:top-8">
            {course.status === 'pending' && (
              <Card className="border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden shadow-xl shadow-blue-500/5">
                <CardHeader className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-900/30">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-blue-900 dark:text-blue-400 uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4" />
                    {language === 'id' ? 'Audit Kelayakan' : 'Quality Audit'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  {[
                    { key: 'titleClear', label: language === 'id' ? 'Judul & Deskripsi Informatif' : 'Informative Title & Desc' },
                    { key: 'objectivesDefined', label: language === 'id' ? 'Target Pembelajaran Jelas' : 'Clear Objectives' },
                    { key: 'syllabusComprehensive', label: language === 'id' ? 'Kurikulum Lengkap & Logis' : 'Comprehensive Curriculum' },
                    { key: 'contentQuality', label: language === 'id' ? 'Standar Produksi Aset' : 'Production Standards' },
                    { key: 'pricingAppropriate', label: language === 'id' ? 'Skema Harga Wajar' : 'Fair Pricing Model' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer group select-none">
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                        checklist[item.key as keyof typeof checklist] 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                      }`}>
                        {checklist[item.key as keyof typeof checklist] && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <input
                        type="checkbox"
                        checked={checklist[item.key as keyof typeof checklist]}
                        onChange={() => toggleChecklistItem(item.key as any)}
                        className="hidden"
                      />
                      <span className={`text-sm tracking-tight ${checklist[item.key as keyof typeof checklist] ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-500 group-hover:text-gray-700 transition-colors'}`}>
                        {item.label}
                      </span>
                    </label>
                  ))}
                  
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                     <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">{language === 'id' ? 'Catatan Cepat' : 'Internal Note'}</p>
                     <textarea
                        value={overallFeedback}
                        onChange={(e) => setOverallFeedback(e.target.value)}
                        placeholder={language === 'id' ? 'Opsional: Berikan konteks untuk keputusan Anda...' : 'Optional metadata for your decision...'}
                        className="w-full text-xs p-3 rounded-xl bg-gray-50 dark:bg-gray-900 border-none outline-none ring-1 ring-inset ring-gray-200 dark:ring-gray-800 focus:ring-2 focus:ring-blue-500 transition-all"
                        rows={4}
                     />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                   <Clock className="w-4 h-4 text-gray-400" />
                   {language === 'id' ? 'Status Aktivitas' : 'Lifecycle Log'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                 <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    <div className="p-4 flex gap-4 bg-gray-50/50 dark:bg-gray-900/20">
                       <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />
                       <div className="flex-1">
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">{course.status}</p>
                          <p className="text-[10px] text-gray-500 mt-0.5">{getTimeAgo(course.updated_at || course.created_at)}</p>
                          {course.admin_feedback && (
                            <div className="mt-2 text-[11px] text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-700 italic">
                               "{course.admin_feedback}"
                            </div>
                          )}
                       </div>
                    </div>
                    <div className="p-4 flex gap-4 opacity-70">
                       <div className="w-2 h-2 rounded-full bg-gray-300 mt-2 shrink-0" />
                       <div className="flex-1">
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Submitted</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{new Date(course.created_at).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Modal Components */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title={language === 'id' ? 'Konfirmasi Publikasi' : 'Publication Confirmation'}
          size="sm"
        >
          <div className="p-6 space-y-4">
             <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
             </div>
             <p className="text-center text-gray-600 dark:text-gray-300">
                {language === 'id' 
                  ? `Kursus "${course.title}" akan segera tersedia untuk pendaftaran siswa.`
                  : `Approving "${course.title}" will make it immediately available for student enrollment.`}
             </p>
             <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowApproveModal(false)}>{language === 'id' ? 'Batal' : 'Cancel'}</Button>
                <Button variant="primary" className="flex-1" onClick={handleApprove} isLoading={isUpdating}>{language === 'id' ? 'Publikasikan' : 'Publish'}</Button>
             </div>
          </div>
        </Modal>

        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={language === 'id' ? 'Tolak Kursus' : 'Reject Course'}
          size="md"
        >
          <div className="p-6 space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'id' 
                ? 'Jelaskan alasan utama penolakan kursus ini:' 
                : 'State the primary reasons for rejecting this course:'}
            </p>
            <textarea
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder={language === 'id' ? 'Berikan detail penolakan yang jelas...' : 'Provide clear rejection rationale...'}
              className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-red-500 min-h-[120px]"
            />
            <div className="flex gap-3 pt-4 px-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRejectModal(false)}>{language === 'id' ? 'Batal' : 'Cancel'}</Button>
              <Button variant="danger" className="flex-1" onClick={handleReject} isLoading={isUpdating}>{language === 'id' ? 'Konfirmasi Tolak' : 'Confirm Reject'}</Button>
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={showRevisionModal}
          onClose={() => setShowRevisionModal(false)}
          title={language === 'id' ? 'Minta Revisi Konten' : 'Request Content Revision'}
          size="md"
        >
          <div className="p-6 space-y-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'id' 
                ? 'Apa yang perlu diperbaiki oleh instruktur?' 
                : 'What specifically needs to be improved by the instructor?'}
            </p>
            <textarea
              value={revisionNotes}
              onChange={(e) => setRevisionNotes(e.target.value)}
              placeholder={language === 'id' ? 'Sebutkan poin-poin revisi secara mendetail...' : 'List specific revision points in detail...'}
              className="w-full p-4 text-sm bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-2xl focus:ring-blue-500 min-h-[160px]"
            />
            <div className="flex gap-3 pt-4 px-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowRevisionModal(false)}>{language === 'id' ? 'Batal' : 'Cancel'}</Button>
              <Button variant="primary" className="flex-1" onClick={handleRequestRevision} isLoading={isUpdating}>{language === 'id' ? 'Kirim Catatan' : 'Submit Notes'}</Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}

