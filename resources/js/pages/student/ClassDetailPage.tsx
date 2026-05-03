import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  FileText,
  Award,
  Video,
  Download,
  Upload,
  AlertCircle,
  Star,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Play,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Badge, Button, Avatar, Tabs } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate, getTimeAgo } from '@/lib/utils';
import { useGetClassQuery } from '@/store/features/classes/classesApiSlice';
import { LearningTimeline } from '@/components/student/LearningTimeline';
import { Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { SessionDetailModal } from '@/components/modals/SessionDetailModal';
import { usePostSessionCommentMutation } from '@/store/features/classes/classesApiSlice';
import { toast } from 'react-hot-toast';


export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'classwork' | 'grades'>('info');
  
  // Session Modal State
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postComment] = usePostSessionCommentMutation();

  const { data: response, isLoading, isError } = useGetClassQuery(classId || '');
  const classData = response?.data;

  const handleOpenSession = (session: any) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const handlePostComment = async (comment: string, parentId?: number) => {
    if (!selectedSession) return;
    try {
      await postComment({ 
        sessionId: selectedSession.id, 
        comment, 
        parentId 
      }).unwrap();
      toast.success(language === 'id' ? 'Komentar terkirim' : 'Comment posted');
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal mengirim komentar' : 'Failed to post comment');
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError || !classData) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {language === 'id' ? 'Kelas tidak ditemukan' : 'Class not found'}
          </h2>
          <Link to="/my-classes">
            <Button variant="outline">
              {language === 'id' ? 'Kembali ke Kelas Saya' : 'Back to My Classes'}
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate internal state/helpers
  const isActive = classData.status === 'open' || classData.status === 'active' || classData.status === 'in_progress' || !classData.status;

  // Assignments Mapping (Backend might provide this differently, placeholder for now)
  const assignments = classData.assignments || [];
  const completedAssignments = assignments.filter((a) => a.status === 'graded');
  const averageGrade = completedAssignments.length > 0
    ? completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / completedAssignments.length
    : 0;
  const totalPoints = completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
  const maxPoints = completedAssignments.reduce((sum, a) => sum + (a.totalPoints || 100), 0);

  return (
    <DashboardLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/my-classes">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {language === 'id' ? 'Kembali ke Kelas Saya' : 'Back to My Classes'}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {classData.name}
              </h1>
              <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                {isActive
                  ? language === 'id' ? 'Aktif (V2)' : 'Active (V2)'
                  : language === 'id' ? 'Selesai' : 'Completed'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              {classData.instructor && (
                <>
                  <Avatar src={classData.instructor.avatar} name={classData.instructor.name} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {classData.instructor.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {classData.instructor.email}
                    </p>
                  </div>
                </>
              )}
            </div>
            <p className="text-gray-600 dark:text-gray-400">{classData.description}</p>
          </div>

          {classData.nextSession && (
            <Card className="lg:w-64">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {language === 'id' ? 'Sesi Berikutnya' : 'Next Session'}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {formatDate(classData.nextSession)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {getTimeAgo(classData.nextSession)}
              </p>
              <Button size="sm" className="w-full">
                {language === 'id' ? 'Gabung Sesi' : 'Join Session'}
              </Button>
            </Card>
          )}
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Jadwal' : 'Schedule'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule?.day || (language === 'id' ? 'Senin - Jumat' : 'Mon - Fri')}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Waktu' : 'Time'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule?.time || '09:00 - 12:00'}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Lokasi' : 'Location'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule?.location || (language === 'id' ? 'Ruang Virtual' : 'Virtual Room')}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Siswa' : 'Students'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.students_count}/{classData.max_students || 50}
            </p>
          </Card>
        </div>
      </div>

      {/* Progress */}
      {isActive && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'id' ? 'Progress Kelas' : 'Class Progress'}
            </p>
            <p className="text-sm font-bold text-blue-600">{classData.progress}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${classData.progress || 0}%` }}
            />
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'info',
            label: language === 'id' ? 'Tentang Kelas' : 'About Class',
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 'classwork',
            label: language === 'id' ? 'Aktivitas Kelas' : 'Classwork',
            icon: <FileText className="w-4 h-4" />,
            badge: classData.classwork_topics?.length || 0,
          },
          {
            id: 'grades',
            label: language === 'id' ? 'Nilai' : 'Grades',
            icon: <Award className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'id' ? 'Tentang Kelas' : 'About Class'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'id' ? 'Deskripsi' : 'Description'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{classData.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'id' ? 'Tanggal Mulai' : 'Start Date'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(classData.start_date || classData.created_at)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'id' ? 'Tanggal Selesai' : 'End Date'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {classData.end_date ? formatDate(classData.end_date) : '-'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'classwork' && (
          <div className="space-y-8">
            {/* Learning Roadmap / Timeline */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {language === 'id' ? 'Alur Belajar' : 'Learning Roadmap'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {language === 'id' 
                      ? 'Ikuti langkah-langkah di bawah ini untuk menyelesaikan kelas.' 
                      : 'Follow the steps below to complete the class.'}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-4 py-1">
                   {classData.timeline?.filter((t: any) => t.is_completed).length || 0} / {classData.timeline?.length || 0} {language === 'id' ? 'Selesai' : 'Done'}
                </Badge>
              </div>
              
              {classData.timeline && classData.timeline.length > 0 ? (
                <LearningTimeline 
                  activities={classData.timeline} 
                  language={language} 
                />
              ) : (
                <div className="space-y-4">
                  {/* Debug: {classData.classwork_topics?.length} topics found */}
                  {classData.classwork_topics && classData.classwork_topics.length > 0 ? (
                    classData.classwork_topics.map((topic: any) => (
                      <Card key={topic.id} className="p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-50">
                           <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                             {topic.title}
                           </h4>
                           <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-none">
                             {(topic.sessions?.length || 0) + (topic.assignments?.length || 0)} {language === 'id' ? 'Materi' : 'Items'}
                           </Badge>
                        </div>
                        <div className="space-y-3">
                           {topic.sessions?.map((session: any) => (
                             <div key={session.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-50 hover:border-blue-100 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm">
                                   <Video className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-bold text-gray-800">{session.title}</p>
                                   <div className="flex items-center gap-3 mt-1">
                                      <p className="text-[10px] text-gray-500 flex items-center gap-1 uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        {session.sessionDate ? formatDate(session.sessionDate) : '-'}
                                      </p>
                                      <Badge variant="outline" size="sm" className="text-[10px] uppercase">{session.type}</Badge>
                                   </div>
                                </div>
                             </div>
                           ))}
                           {topic.assignments?.map((assignment: any) => (
                             <div key={assignment.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-50 hover:border-orange-100 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 shadow-sm">
                                   <FileText className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                   <p className="text-sm font-bold text-gray-800">{assignment.title}</p>
                                   <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 uppercase tracking-wider">
                                      <Calendar className="w-3 h-3" />
                                      {language === 'id' ? 'Batas Waktu' : 'Due'}: {assignment.due_date ? formatDate(assignment.due_date) : '-'}
                                   </p>
                                </div>
                             </div>
                           ))}
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-16 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4">
                        <BookOpen className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-500 font-bold text-lg">
                        {language === 'id' ? 'Belum ada materi pembelajaran' : 'No learning materials yet'}
                      </p>
                      <p className="text-gray-400 text-sm mt-1">
                        {language === 'id' ? 'Silahkan hubungi pengajar Anda.' : 'Please contact your instructor.'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* Grades Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Rata-rata Nilai' : 'Average Grade'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">{averageGrade.toFixed(1)}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Total Poin' : 'Total Points'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalPoints}/{maxPoints}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Tugas Dinilai' : 'Graded Assignments'}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedAssignments.length}/{assignments.length}
                  </p>
                </div>
              </Card>
            </div>

            {/* Grades List */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'id' ? 'Rincian Nilai' : 'Grade Details'}
              </h3>
              <div className="space-y-4">
                {assignments
                  .filter((a: any) => a.status === 'graded')
                  .map((assignment: any) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {assignment.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'id' ? 'Diserahkan' : 'Submitted'}{' '}
                          {assignment.submittedAt && formatDate(assignment.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {assignment.grade}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          / {assignment.totalPoints}
                        </p>
                      </div>
                    </div>
                  ))}
                {completedAssignments.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'id'
                        ? 'Belum ada tugas yang dinilai'
                        : 'No graded assignments yet'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <SessionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        session={selectedSession}
        onPostComment={handlePostComment}
      />
    </DashboardLayout>
  );
}
