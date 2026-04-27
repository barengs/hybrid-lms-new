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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Badge, Button, Avatar, Tabs } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate, getTimeAgo } from '@/lib/utils';
import { useGetClassQuery } from '@/store/features/classes/classesApiSlice';
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
  const isActive = classData.status === 'open' || classData.status === 'in_progress' || !classData.status;

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
                  ? language === 'id' ? 'Aktif' : 'Active'
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
          <div className="space-y-6">
            {/* Included Courses */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Kursus Utama' : 'Main Courses'}
                </h3>
                <Badge size="sm">{classData.courses?.length || 0}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(classData.courses || []).map((course: any) => (
                  <Card key={course.id} hover className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.thumbnail || 'https://api.placeholder.com/640/360'}
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge size="sm">{language === 'id' ? 'Materi' : 'Content'}</Badge>
                        <Badge size="sm" variant="secondary">{course.level || 'Intermediate'}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration || 'Auto'}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.topics?.length || 0} {language === 'id' ? 'topik' : 'topics'}
                        </span>
                      </div>

                      <Link to={`/learn/${course.slug}`}>
                        <Button size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                          {language === 'id' ? 'Buka Materi' : 'Open Content'}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Aktivitas Kelas Dinamis */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Aktivitas Kelas' : 'Classwork'}
                </h3>
              </div>
              
              {(!classData.classwork_topics || classData.classwork_topics.length === 0) ? (
                <Card className="text-center py-12 bg-gray-50 dark:bg-gray-800 border-dashed">
                  <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium mb-1">
                    {language === 'id' ? 'Belum ada aktivitas kelas.' : 'No classwork yet.'}
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    {language === 'id' ? 'Instruktur belum menambahkan materi atau tugas ke kelas ini.' : 'Instructor has not added materials or assignments yet.'}
                  </p>
                </Card>
              ) : (
                 <div className="space-y-6">
                   {classData.classwork_topics.map((topic: any) => (
                      <div key={topic.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                        <div className="border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
                           <h4 className="text-xl font-bold text-gray-900 dark:text-white">{topic.title}</h4>
                        </div>

                        {(!topic.sessions || topic.sessions.length === 0) && (!topic.assignments || topic.assignments.length === 0) ? (
                           <div className="text-center py-6 text-gray-400 dark:text-gray-500 text-sm border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                              {language === 'id' ? 'Topik ini masih kosong.' : 'This topic is empty.'}
                           </div>
                        ) : (
                           <div className="space-y-3">
                             {/* Map sessions & materials */}
                             {topic.sessions && topic.sessions.map((session: any) => (
                                <Card key={`session-${session.id}`} hover className="cursor-pointer" onClick={() => handleOpenSession(session)}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                       <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                         session.type === 'online_class' 
                                           ? 'bg-red-100 dark:bg-red-900/30' 
                                           : 'bg-blue-100 dark:bg-blue-900/30'
                                       }`}>
                                         {session.type === 'online_class' ? (
                                           <Video className="w-6 h-6 text-red-600 dark:text-red-400" />
                                         ) : (
                                           <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                         )}
                                       </div>
                                       <div>
                                          <h5 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                             {session.title}
                                          </h5>
                                          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {session.sessionDate && (
                                               <span className="flex items-center gap-1">
                                                 <Calendar className="w-3 h-3" />
                                                 {new Date(session.sessionDate).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                                               </span>
                                            )}
                                            <Badge size="sm" variant="secondary">
                                               {session.type === 'online_class' 
                                                 ? (language === 'id' ? 'Kelas Online' : 'Online Class')
                                                 : (language === 'id' ? 'Materi' : 'Material')
                                               }
                                            </Badge>
                                          </div>
                                       </div>
                                    </div>
                                    <div className="flex gap-2">
                                       {session.type === 'online_class' && session.status === 'upcoming' && (
                                          <Button size="sm">
                                             {language === 'id' ? 'Gabung' : 'Join'}
                                          </Button>
                                       )}
                                       {session.type !== 'online_class' && session.url && (
                                          <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />} onClick={(e) => { e.stopPropagation(); window.open(session.url || '#', '_blank'); }}>
                                             {language === 'id' ? 'Unduh' : 'Download'}
                                          </Button>
                                       )}
                                    </div>
                                  </div>
                                </Card>
                             ))}
                             
                             {/* Map assignments here if any */}
                             {topic.assignments && topic.assignments.map((assignment: any) => (
                                 <Card key={`assignment-${assignment.id}`} hover className="cursor-pointer" onClick={() => navigate(`/student/assignments/${assignment.id}`)}>
                                     <div className="flex items-center justify-between">
                                         <div className="flex items-center gap-4">
                                             <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                               assignment.type === 'quiz' 
                                                 ? 'bg-purple-100 dark:bg-purple-900/30' 
                                                 : 'bg-green-100 dark:bg-green-900/30'
                                             }`}>
                                                 {assignment.type === 'quiz' ? (
                                                   <CheckCircle className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                                 ) : (
                                                   <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
                                                 )}
                                             </div>
                                             <div>
                                                 <h5 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                                                     {assignment.title}
                                                 </h5>
                                                 <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                     {assignment.due_date && (
                                                         <span className="flex items-center gap-1 text-red-500 dark:text-red-400 font-medium">
                                                             <Clock className="w-3 h-3" />
                                                             {language === 'id' ? 'Tenggat' : 'Due'}: {new Date(assignment.due_date).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', { day: 'numeric', month: 'short' })}
                                                         </span>
                                                     )}
                                                     <Badge size="sm" variant={assignment.type === 'quiz' ? 'primary' : 'success'}>
                                                         {assignment.type === 'quiz' ? (language === 'id' ? 'Kuis' : 'Quiz') : (language === 'id' ? 'Tugas' : 'Assignment')}
                                                     </Badge>
                                                     {assignment.max_points && (
                                                       <span className="text-xs text-gray-400">
                                                         {assignment.max_points} pts
                                                       </span>
                                                     )}
                                                 </div>
                                             </div>
                                         </div>
                                         <Button size="sm" variant="ghost" rightIcon={<ArrowRight className="w-4 h-4" />}>
                                            {language === 'id' ? 'Lihat' : 'View'}
                                         </Button>
                                     </div>
                                 </Card>
                             ))}
                           </div>
                        )}
                      </div>
                   ))}
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
