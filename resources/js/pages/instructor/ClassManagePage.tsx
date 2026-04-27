import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  FileText,
  BarChart3,
  Settings,
  Plus,
  Edit3,
  Trash2,
  Eye,
  MoreVertical,
  Upload,
  Download,
  Clock,
  CheckCircle,
  Calendar,
  GraduationCap,
  MessageSquare,
  ChevronDown,
  FolderOpen,
  Play,
  File,
  Image,
  Video,
  Link as LinkIcon,
  Paperclip,
  Save,
  ArrowLeft,
  ArrowRight,
  FolderPlus,
  Layout
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Dropdown, Modal, Avatar, Textarea } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo, formatDate } from '@/lib/utils';

type Tab = 'content' | 'students' | 'grading' | 'settings';

interface Topic {
  id: string;
  title: string;
  description: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Material {
  id: string;
  title: string;
  type: 'document' | 'video' | 'link' | 'image';
  url?: string;
  fileName?: string;
  fileSize?: string;
  description: string;
  topicId: string;
  createdAt: string;
  updatedAt: string;
}

interface Student {
  id: string | number;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt: string;
  progress: number;
  grade?: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
}


import { 
  useGetClassQuery,
  useUpdateClassMutation,
  useCreateSessionMutation,
  useUpdateSessionMutation,
  useDeleteSessionMutation,
  useCreateTopicMutation,
  useUpdateTopicMutation,
  useDeleteTopicMutation,
  useCreateAssignmentMutation,
  useUpdateAssignmentMutation,
  useDeleteAssignmentMutation
} from '@/store/features/classes/classesApiSlice';
import { Loader2 } from 'lucide-react';


export function ClassManagePage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // API Hooks
  const { data: classDataResponse, isLoading } = useGetClassQuery(classId || '', { skip: !classId });
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  const [createSession] = useCreateSessionMutation();
  const [updateSession] = useUpdateSessionMutation();
  const [deleteSession] = useDeleteSessionMutation();
  const [createTopic] = useCreateTopicMutation();
  const [updateTopic] = useUpdateTopicMutation();
  const [deleteTopic] = useDeleteTopicMutation();
  const [createAssignment] = useCreateAssignmentMutation();
  const [updateAssignment] = useUpdateAssignmentMutation();
  const [deleteAssignment] = useDeleteAssignmentMutation();
  
  const classData = classDataResponse?.data;

  // Use derived state for topics and materials to avoid conflict between API data and local state for now
  const displayStudents: Student[] = (classData?.students || []).map((s: any) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    avatar: s.avatar,
    enrolledAt: s.joined_at,
    progress: s.progress || 0,
    grade: s.grade_score,
    assignmentsSubmitted: s.assignments_completed || 0,
    totalAssignments: s.assignments_total || 0,
  }));

  
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [editingTopic, setEditingTopic] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classStatus, setClassStatus] = useState<'active' | 'archived'>('active');

  // Session form
  const [sessionTitle, setSessionTitle] = useState('');
  const [sessionDate, setSessionDate] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [sessionType, setSessionType] = useState<'online_class' | 'offline_class'>('online_class');
  const [sessionLink, setSessionLink] = useState('');
  const [sessionTopicId, setSessionTopicId] = useState('');
  
  // Materials form
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'link' | 'image'>('document');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialTopicId, setMaterialTopicId] = useState('');
  
  // Assignment form
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentPoints, setAssignmentPoints] = useState('100');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentTopicId, setAssignmentTopicId] = useState('');
  const [assignmentType, setAssignmentType] = useState<'assignment' | 'quiz'>('assignment');

  // Topic form
  const [topicTitle, setTopicTitle] = useState('');
  
  useEffect(() => {
    if (classData) {
      setClassName(classData.name || '');
      setClassCode(classData.class_code || '');
      setClassDescription(classData.description || '');
      // Only set status if it matches the types, otherwise default to active
      if (classData.status === 'active' || classData.status === 'archived') {
         setClassStatus(classData.status);
      }
    }
  }, [classData]);

  const handleUpdateClass = async () => {
    if (!classId) return;
    try {
      await updateClass({
        id: classId,
        name: className,
        code: classCode,
        description: classDescription,
        status: classStatus
      }).unwrap();
      // Optional: show success feedback
    } catch (err) {
      console.error('Failed to update class', err);
    }
  };



  const handleEditSession = (session: any) => {
    setEditingSession(session);
    setSessionTitle(session.title || '');
    // Assuming sessionDate is 'YYYY-MM-DD' and sessionTime is 'HH:MM' or we just parse it
    // Note: Adjust according to actual data structure
    setSessionDate(session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '');
    setSessionTime(session.duration ? session.duration.split(' ')[0] : ''); // mock handling
    setSessionType(session.type || 'online_class');
    setSessionLink(session.link || '');
    setShowSessionModal(true);
  };

  const handleDeleteSession = async (session: any) => {
    if (confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus sesi ini?' : 'Are you sure you want to delete this session?')) {
      if (!classId) return;
      try {
        await deleteSession({ classId, sessionId: session.id }).unwrap();
      } catch (err) {
        console.error('Failed to delete session:', err);
      }
    }
  };

  const handleSaveSession = async () => {
    if (!classId) return;
    try {
      if (editingSession) {
        await updateSession({
          classId,
          sessionId: editingSession.id,
          data: {
            title: sessionTitle,
            session_date: sessionDate + (sessionTime ? ' ' + sessionTime : ''),
            duration: sessionTime ? sessionTime + ' hours' : null,
            type: sessionType,
            meeting_url: sessionLink,
            status: 'upcoming',
            batch_topic_id: sessionTopicId || null
          }
        }).unwrap();
      } else {
        await createSession({
          classId,
          data: {
            title: sessionTitle,
            session_date: sessionDate + (sessionTime ? ' ' + sessionTime : ''),
            duration: sessionTime ? sessionTime + ' hours' : null,
            type: sessionType,
            meeting_url: sessionLink,
            status: 'upcoming',
            batch_topic_id: sessionTopicId || null
          }
        }).unwrap();
      }
      setShowSessionModal(false);
      resetSessionForm();
    } catch (err) {
      console.error('Failed to save session:', err);
    }
  };

  const resetSessionForm = () => {
    setEditingSession(null);
    setSessionTitle('');
    setSessionDate('');
    setSessionTime('');
    setSessionType('online_class');
    setSessionLink('');
    setSessionTopicId('');
  };

  const handleEditMaterial = (material: any) => {
    setEditingMaterial(material);
    setMaterialTitle(material.title);
    setMaterialType(material.type || 'document');
    setMaterialUrl(material.url || '');
    setMaterialDescription(material.description || '');
    setMaterialTopicId(material.batch_topic_id || '');
    setShowMaterialModal(true);
  };

  const handleDeleteMaterial = async (material: any) => {
    if (confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus materi ini?' : 'Are you sure you want to delete this material?')) {
      if (!classId) return;
      try {
        await deleteSession({ classId, sessionId: material.id }).unwrap();
      } catch (err) {
        console.error('Failed to delete material:', err);
      }
    }
  };

  const handleSaveMaterial = async () => {
    if (!classId) return;
    try {
      const formData = new FormData();
      formData.append('title', materialTitle);
      formData.append('type', 'material');
      formData.append('description', materialDescription);
      if (materialTopicId) formData.append('batch_topic_id', materialTopicId);
      if (materialType === 'link' || materialType === 'video') {
         formData.append('meeting_url', materialUrl);
      }
      
      if (editingMaterial) {
         formData.append('_method', 'PUT'); // Laravel requirement for multipart PUT
         await updateSession({ classId, sessionId: editingMaterial.id, data: formData }).unwrap();
      } else {
         await createSession({ classId, data: formData }).unwrap();
      }
      setShowMaterialModal(false);
      resetMaterialForm();
    } catch (err) {
      console.error('Failed to save material:', err);
    }
  };

  const resetMaterialForm = () => {
    setEditingMaterial(null);
    setMaterialTitle('');
    setMaterialType('document');
    setMaterialUrl('');
    setMaterialDescription('');
    setMaterialTopicId('');
  };

  const handleSaveAssignment = async () => {
    if (!classId) return;
    try {
      const payload = {
        batch_id: classId,
        title: assignmentTitle,
        description: assignmentDescription,
        max_points: parseInt(assignmentPoints) || 100,
        due_date: assignmentDueDate || null,
        batch_topic_id: assignmentTopicId || null,
        type: assignmentType,
        is_published: true,
        gradable: true
      };

      if (editingAssignment) {
        await updateAssignment({ assignmentId: editingAssignment.id, data: payload }).unwrap();
      } else {
        await createAssignment({ data: payload }).unwrap();
      }
      setShowAssignmentModal(false);
      resetAssignmentForm();
    } catch (err) {
      console.error('Failed to save assignment:', err);
    }
  };

  const resetAssignmentForm = () => {
    setEditingAssignment(null);
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentPoints('100');
    setAssignmentDueDate('');
    setAssignmentTopicId('');
    setAssignmentType('assignment');
  };



  const handleEditTopic = (topic: any) => {
    setEditingTopic(topic);
    setTopicTitle(topic.title);
    setShowTopicModal(true);
  };

  const handleDeleteTopic = async (topic: any) => {
    if (confirm(language === 'id' ? 'Apakah Anda yakin ingin menghapus topik ini?' : 'Are you sure you want to delete this topic?')) {
      if (!classId) return;
      try {
        await deleteTopic({ classId, topicId: topic.id }).unwrap();
      } catch (err) {
        console.error('Failed to delete topic:', err);
      }
    }
  };

  const handleSaveTopic = async () => {
    if (!classId) return;
    try {
      if (editingTopic) {
        await updateTopic({ classId, topicId: editingTopic.id, title: topicTitle }).unwrap();
      } else {
        await createTopic({ classId, title: topicTitle }).unwrap();
      }
      setShowTopicModal(false);
      resetTopicForm();
    } catch (err) {
      console.error('Failed to save topic:', err);
    }
  };

  const resetTopicForm = () => {
    setEditingTopic(null);
    setTopicTitle('');
  };


  const handleViewStudent = (student: Student) => {
    setSelectedStudent(student);
    setShowStudentModal(true);
  };

  const getStudentActions = (student: Student) => [
    {
      label: language === 'id' ? 'Lihat Profil' : 'View Profile',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => handleViewStudent(student),
    },
    {
      label: language === 'id' ? 'Kirim Pesan' : 'Send Message',
      icon: <MessageSquare className="w-4 h-4" />,
      onClick: () => console.log('Message:', student.id),
    },
    {
      label: language === 'id' ? 'Lihat Penilaian' : 'View Grades',
      icon: <BarChart3 className="w-4 h-4" />,
      onClick: () => handleViewStudent(student),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Berikan Tugas Tambahan' : 'Assign Extra Work',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => console.log('Extra work for:', student.id),
    },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (!classData) {
    return (
      <DashboardLayout>
         <div className="flex flex-col items-center justify-center h-[60vh]">
            <p className="text-gray-500">Class not found</p>
             <Button variant="outline" onClick={() => navigate('/instructor/classes')}>
                Back to Classes
             </Button>
         </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-4">
          <Button
            variant="ghost"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/instructor/classes')}
          >
            {language === 'id' ? 'Kembali ke Kelas' : 'Back to Classes'}
          </Button>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 mb-6">
          <div className="flex-1">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200">
                <img
                  src={classData.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'}
                  alt={classData.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
                  <Badge variant={classData.status === 'active' ? 'success' : 'secondary'}>
                    {classData.status === 'active'
                      ? language === 'id'
                        ? 'Aktif'
                        : 'Active'
                      : language === 'id'
                        ? 'Diarsipkan'
                        : 'Archived'}
                  </Badge>
                </div>
                <p className="text-gray-600 mt-1">{classData.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {classData.class_code}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {formatNumber(Number(classData.students_count) || 0)} {language === 'id' ? 'siswa' : 'students'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {getTimeAgo(classData.updated_at || classData.created_at || new Date().toISOString())}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Eye className="w-4 h-4" />}>
              {language === 'id' ? 'Pratinjau Kelas' : 'Preview Class'}
            </Button>
            <Button leftIcon={<Settings className="w-4 h-4" />} onClick={() => setActiveTab('settings')}>
              {language === 'id' ? 'Pengaturan' : 'Settings'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('content')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'content'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'id' ? 'Materi & Jadwal' : 'Content & Schedule'}
              </div>
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'students'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                {language === 'id' ? 'Siswa' : 'Students'}
                <Badge variant="secondary" size="sm">{classData?.students_count || 0}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('grading')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'grading'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                {language === 'id' ? 'Penilaian' : 'Grading'}
                <Badge variant="secondary" size="sm">{classData?.assessment_stats?.assignments_count || 0}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'settings'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                {language === 'id' ? 'Pengaturan' : 'Settings'}
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            {/* Included Courses */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'id' ? 'Kursus Utama' : 'Main Courses'}
                  </h3>
                  <Badge size="sm">{classData.courses?.length || 0}</Badge>
                </div>
              </div>
              
              {classData.courses?.length === 0 ? (
                <Card className="text-center py-8 bg-gray-50 border-dashed">
                  <p className="text-gray-500 text-sm">
                    {language === 'id' ? 'Belum ada kursus yang ditautkan.' : 'No linked courses yet.'}
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(classData.courses || []).map((course: any) => (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={course.thumbnail || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400'}
                          alt={course.title}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {course.title}
                        </h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {course.topics?.length || 0} {language === 'id' ? 'topik' : 'topics'}
                          </span>
                        </div>
                        <Button 
                           size="sm" 
                           variant="outline" 
                           className="w-full" 
                           onClick={() => navigate(`/instructor/courses/${course.id}`)}
                           rightIcon={<ArrowRight className="w-4 h-4" />}
                        >
                          {language === 'id' ? 'Kelola Kursus' : 'Manage Course'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Aktivitas Kelas Dinamis */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {language === 'id' ? 'Aktivitas Kelas' : 'Classwork'}
                  </h3>
                </div>
                
                <Dropdown
                   trigger={
                     <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                       {language === 'id' ? 'Buat' : 'Create'}
                     </Button>
                   }
                   items={[
                     { label: language === 'id' ? 'Topik' : 'Topic', icon: <FolderPlus className="w-4 h-4" />, onClick: () => setShowTopicModal(true) },
                     { label: language === 'id' ? 'Tugas Kelas' : 'Assignment', icon: <FileText className="w-4 h-4" />, onClick: () => { setAssignmentType('assignment'); setShowAssignmentModal(true); } },
                     { label: language === 'id' ? 'Kuis Kelas' : 'Quiz', icon: <CheckCircle className="w-4 h-4" />, onClick: () => { setAssignmentType('quiz'); setShowAssignmentModal(true); } },
                     { label: language === 'id' ? 'Sesi Terjadwal' : 'Session', icon: <Video className="w-4 h-4" />, onClick: () => setShowSessionModal(true) },
                     { label: language === 'id' ? 'Materi Tambahan' : 'Material', icon: <Paperclip className="w-4 h-4" />, onClick: () => setShowMaterialModal(true) },
                   ]}
                   align="right"
                />
              </div>

              {(!classData.classwork_topics || classData.classwork_topics.length === 0) ? (
                <Card className="text-center py-12 bg-gray-50 border-dashed">
                  <Layout className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium mb-1">
                    {language === 'id' ? 'Belum ada aktivitas kelas.' : 'No classwork yet.'}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {language === 'id' ? 'Tambahkan topik, sesi, materi, atau tugas untuk siswa.' : 'Add topics, sessions, materials, or assignments for students.'}
                  </p>
                </Card>
              ) : (
                 <div className="space-y-6">
                   {classData.classwork_topics.map((topic: any) => (
                      <div key={topic.id} className="bg-white rounded-xl border p-5">
                        <div className="flex justify-between items-center border-b pb-3 mb-4">
                           <h4 className="text-xl font-bold text-gray-900">{topic.title}</h4>
                           <Dropdown
                             trigger={
                               <button className="p-2 hover:bg-gray-100 rounded-lg">
                                 <MoreVertical className="w-5 h-5 text-gray-500" />
                               </button>
                             }
                             items={[
                               { label: language === 'id' ? 'Edit Topik' : 'Edit Topic', icon: <Edit3 className="w-4 h-4" />, onClick: () => handleEditTopic(topic) },
                               { label: language === 'id' ? 'Hapus Topik' : 'Delete Topic', icon: <Trash2 className="w-4 h-4" />, onClick: () => handleDeleteTopic(topic) }
                             ]}
                             align="right"
                           />
                        </div>

                        {(!topic.sessions || topic.sessions.length === 0) && (!topic.assignments || topic.assignments.length === 0) ? (
                           <div className="text-center py-6 text-gray-400 text-sm border-2 border-dashed rounded-lg">
                              {language === 'id' ? 'Topik ini masih kosong.' : 'This topic is empty.'}
                           </div>
                        ) : (
                           <div className="space-y-3">
                             {/* Map sessions & materials */}
                             {topic.sessions && topic.sessions.map((session: any) => (
                                <Card key={`session-${session.id}`} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow group">
                                  <div className="flex items-center gap-4">
                                     <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                       session.type === 'online_class' 
                                         ? 'bg-red-100' 
                                         : 'bg-blue-100'
                                     }`}>
                                       {session.type === 'online_class' ? (
                                         <Video className="w-6 h-6 text-red-600" />
                                       ) : (
                                         <FileText className="w-6 h-6 text-blue-600" />
                                       )}
                                     </div>
                                     <div>
                                        <h5 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                           {session.title}
                                        </h5>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
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
                                  <Dropdown
                                    trigger={
                                      <button className="p-2 hover:bg-gray-100 rounded-lg">
                                        <MoreVertical className="w-4 h-4 text-gray-500" />
                                      </button>
                                    }
                                    items={[
                                      { label: language === 'id' ? 'Edit' : 'Edit', icon: <Edit3 className="w-4 h-4" />, onClick: () => {
                                           if(session.type === 'online_class') handleEditSession({...session, batch_topic_id: topic.id});
                                           else handleEditMaterial({...session, batch_topic_id: topic.id});
                                      }},
                                      { label: language === 'id' ? 'Hapus' : 'Delete', icon: <Trash2 className="w-4 h-4" />, onClick: () => {
                                           if(session.type === 'online_class') handleDeleteSession(session);
                                           else handleDeleteMaterial(session);
                                      }}
                                    ]}
                                    align="right"
                                  />
                                </Card>
                             ))}
                             
                             {/* Map assignments here if any */}
                             {topic.assignments && topic.assignments.map((assignment: any) => (
                                 <Card key={`assignment-${assignment.id}`} className="p-4 flex justify-between items-center hover:shadow-md transition-shadow group">
                                     <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                                          assignment.type === 'quiz' 
                                            ? 'bg-purple-100' 
                                            : 'bg-green-100'
                                        }`}>
                                            {assignment.type === 'quiz' ? (
                                              <CheckCircle className="w-6 h-6 text-purple-600" />
                                            ) : (
                                              <FileText className="w-6 h-6 text-green-600" />
                                            )}
                                        </div>
                                        <div>
                                            <h5 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {assignment.title}
                                            </h5>
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                                                {assignment.due_date && (
                                                    <span className="flex items-center gap-1 text-red-500 font-medium">
                                                        <Clock className="w-3 h-3" />
                                                        Due: {new Date(assignment.due_date).toLocaleDateString()}
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
                                     <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                         <Button size="sm" variant="ghost" onClick={() => {
                                           setEditingAssignment(assignment);
                                           setAssignmentTitle(assignment.title);
                                           setAssignmentDescription(assignment.description || '');
                                           setAssignmentPoints(String(assignment.max_points || 100));
                                           setAssignmentDueDate(assignment.due_date ? new Date(assignment.due_date).toISOString().slice(0, 16) : '');
                                           setAssignmentTopicId(assignment.batch_topic_id || '');
                                           setAssignmentType(assignment.type || 'assignment');
                                           setShowAssignmentModal(true);
                                         }}>
                                           <Edit3 className="w-4 h-4" />
                                         </Button>
                                         <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600" onClick={async () => {
                                            if (confirm(language === 'id' ? 'Hapus tugas ini?' : 'Delete this assignment?')) {
                                              await deleteAssignment(assignment.id).unwrap();
                                            }
                                         }}>
                                           <Trash2 className="w-4 h-4" />
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

        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'id' ? 'Daftar Siswa' : 'Student List'}
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder={language === 'id' ? 'Cari siswa...' : 'Search students...'}
                  className="w-64"
                />
                <Button leftIcon={<Download className="w-4 h-4" />} variant="outline">
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>

            {displayStudents.length === 0 ? (
              <Card className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'id' ? 'Belum Ada Siswa' : 'No Students Yet'}
                </h3>
                <p className="text-gray-500">
                  {language === 'id'
                    ? 'Belum ada siswa yang bergabung di kelas ini.'
                    : 'No students have joined this class yet.'}
                </p>
              </Card>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Siswa' : 'Student'}
                        </th>
                        <th className="text-left py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Bergabung' : 'Joined'}
                        </th>
                        <th className="text-left py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Progress' : 'Progress'}
                        </th>
                        <th className="text-left py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Tugas' : 'Assignments'}
                        </th>
                        <th className="text-left py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Nilai' : 'Grade'}
                        </th>
                        <th className="text-right py-4 px-4 font-medium text-gray-600">
                          {language === 'id' ? 'Aksi' : 'Actions'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar src={student.avatar} name={student.name} size="md" />
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-500">{student.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm text-gray-500">
                              {getTimeAgo(student.enrolledAt)}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-24">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-blue-600 h-2 rounded-full"
                                    style={{ width: `${student.progress}%` }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-medium">{student.progress}%</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="text-sm">
                              {student.assignmentsSubmitted}/{student.totalAssignments}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {student.grade !== undefined ? (
                              <span className={`font-medium ${student.grade >= 85 ? 'text-green-600' :
                                student.grade >= 70 ? 'text-blue-600' :
                                  student.grade >= 50 ? 'text-yellow-600' : 'text-red-600'
                                }`}>
                                {student.grade}%
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <Dropdown
                              trigger={
                                <button
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                  aria-label="Student actions"
                                >
                                  <MoreVertical className="w-5 h-5 text-gray-500" />
                                </button>
                              }
                              items={getStudentActions(student)}
                              align="right"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'grading' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'id' ? 'Penilaian' : 'Grading'}
              </h2>
              <div className="flex gap-2">
                <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">{language === 'id' ? 'Semua Tugas' : 'All Assignments'}</option>
                  {(classData?.assignments || []).map((assignment: any) => (
                    <option key={assignment.id} value={assignment.id}>
                      {assignment.title}
                    </option>
                  ))}
                </select>
                <Button leftIcon={<Download className="w-4 h-4" />} variant="outline">
                  {language === 'id' ? 'Ekspor Nilai' : 'Export Grades'}
                </Button>
              </div>
            </div>

            <Card>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{Number(classData?.assessment_stats?.class_average_score || 0).toFixed(1)}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'id' ? 'Rata-rata Kelas' : 'Class Average'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {classData?.assessment_stats?.achieving_students_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'id' ? 'Siswa Berprestasi' : 'High Achievers'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">
                      {classData?.assessment_stats?.needs_attention_count || 0}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'id' ? 'Perlu Perhatian' : 'Needs Attention'}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-medium text-gray-900 mb-4">
                    {language === 'id' ? 'Tugas Belum Dinilai' : 'Pending Assignments'}
                  </h3>
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {language === 'id'
                        ? 'Semua tugas telah dinilai. Tidak ada tugas yang menunggu penilaian.'
                        : 'All assignments have been graded. No pending assignments.'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900">
              {language === 'id' ? 'Pengaturan Kelas' : 'Class Settings'}
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'id' ? 'Informasi Kelas' : 'Class Information'}
                    </CardTitle>
                  </CardHeader>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Nama Kelas' : 'Class Name'}
                      </label>
                      <Input 
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Kode Kelas' : 'Class Code'}
                      </label>
                      <Input 
                         value={classCode}
                         onChange={(e) => setClassCode(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Deskripsi' : 'Description'}
                      </label>
                      <Textarea 
                        value={classDescription}
                        onChange={(e) => setClassDescription(e.target.value)}
                        rows={4} 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Tautkan ke Kursus' : 'Link to Course'}
                      </label>
                      <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">{language === 'id' ? 'Tanpa kursus terkait' : 'No linked course'}</option>
                        {/* Course list should ideally be fetched from API */}
                      </select>
                    </div>
                    <div className="pt-4">
                      <Button 
                        leftIcon={<Save className="w-4 h-4" />}
                        onClick={handleUpdateClass}
                        isLoading={isUpdating}
                        disabled={isUpdating}
                      >
                        {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600">
                      {language === 'id' ? 'Bahaya' : 'Danger Zone'}
                    </CardTitle>
                  </CardHeader>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {language === 'id' ? 'Arsipkan Kelas' : 'Archive Class'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {language === 'id'
                            ? 'Arsipkan kelas ini jika tidak lagi digunakan. Siswa tidak akan dapat mengakses kelas ini.'
                            : 'Archive this class if no longer in use. Students will not be able to access this class.'}
                        </p>
                      </div>
                      <Button 
                        variant="secondary"
                        onClick={async () => {
                            if (classId) {
                                try {
                                    await updateClass({ id: classId, status: 'archived' }).unwrap();
                                } catch (err) {
                                    console.error(err);
                                }
                            }
                        }}
                      >
                        {language === 'id' ? 'Arsipkan' : 'Archive'}
                      </Button>
                    </div>
                    <div className="flex items-start justify-between mt-6 pt-6 border-t border-gray-200">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {language === 'id' ? 'Hapus Kelas' : 'Delete Class'}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {language === 'id'
                            ? 'Hapus kelas ini beserta semua data secara permanen. Tindakan ini tidak dapat dibatalkan.'
                            : 'Permanently delete this class and all its data. This action cannot be undone.'}
                        </p>
                      </div>
                      <Button variant="danger">
                        {language === 'id' ? 'Hapus Kelas' : 'Delete Class'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === 'id' ? 'Akses Kelas' : 'Class Access'}
                    </CardTitle>
                  </CardHeader>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Status' : 'Status'}
                      </label>
                      <select 
                        value={classStatus}
                        onChange={(e) => setClassStatus(e.target.value as any)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isUpdating}
                      >
                        <option value="active">{language === 'id' ? 'Aktif' : 'Active'}</option>
                        <option value="archived">{language === 'id' ? 'Diarsipkan' : 'Archived'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Visibilitas' : 'Visibility'}
                      </label>
                      <select 
                        defaultValue="private"
                        className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="public">{language === 'id' ? 'Publik' : 'Public'}</option>
                        <option value="private">{language === 'id' ? 'Privat' : 'Private'}</option>
                        <option value="hidden">{language === 'id' ? 'Tersembunyi' : 'Hidden'}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Kode Bergabung' : 'Join Code'}
                      </label>
                      <div className="flex gap-2">
                        <Input value={classCode} readOnly />
                        <Button 
                            variant="outline"
                            onClick={() => {
                                if (classCode) {
                                    navigator.clipboard.writeText(classCode);
                                }
                            }}
                        >
                          {language === 'id' ? 'Salin' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Session Modal */}
        <Modal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            resetSessionForm();
          }}
          title={language === 'id' ? 'Tambah Sesi Baru' : 'Add New Session'}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Judul Sesi' : 'Session Title'} *
              </label>
              <Input
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Pengenalan React' : 'e.g., Introduction to React'}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Tanggal' : 'Date'} *
                </label>
                <Input
                  type="date"
                  value={sessionDate}
                  onChange={(e) => setSessionDate(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Waktu' : 'Time'} *
                </label>
                <Input
                  type="time"
                  value={sessionTime}
                  onChange={(e) => setSessionTime(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Tipe Sesi' : 'Session Type'} *
              </label>
              <select
                value={sessionType}
                onChange={(e) => setSessionType(e.target.value as 'online_class' | 'offline_class')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="online_class">{language === 'id' ? 'Kelas Online (Zoom/Meet)' : 'Online Class'}</option>
                <option value="offline_class">{language === 'id' ? 'Kelas Tatap Muka' : 'Offline Class'}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Topik (Opsional)' : 'Topic (Optional)'}
              </label>
              <select
                value={sessionTopicId}
                onChange={(e) => setSessionTopicId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'id' ? 'Tanpa Topik' : 'No Topic'}</option>
                {(classData?.classwork_topics || []).map((topic: any) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {sessionType === 'online_class' ? (language === 'id' ? 'Tautan Rapat (URL)' : 'Meeting Link (URL)') : (language === 'id' ? 'Lokasi / Ruangan' : 'Location / Room')} *
              </label>
              <Input
                value={sessionLink}
                onChange={(e) => setSessionLink(e.target.value)}
                placeholder={sessionType === 'online_class' ? "https://meet.google.com/..." : "Ruang 302, Gedung A"}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSessionModal(false);
                  resetSessionForm();
                }}
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSaveSession}
                disabled={!sessionTitle.trim() || !sessionDate || !sessionTime || !sessionLink.trim()}
              >
                {language === 'id' ? 'Simpan Sesi' : 'Save Session'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Material Modal */}
        <Modal
          isOpen={showMaterialModal}
          onClose={() => {
            setShowMaterialModal(false);
            resetMaterialForm();
          }}
          title={editingMaterial ? (language === 'id' ? 'Edit Materi' : 'Edit Material') : (language === 'id' ? 'Tambah Materi Baru' : 'Add New Material')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Judul Materi' : 'Material Title'} *
              </label>
              <Input
                value={materialTitle}
                onChange={(e) => setMaterialTitle(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Advanced React Patterns Guide.pdf' : 'e.g., Advanced React Patterns Guide.pdf'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Topik (Opsional)' : 'Topic (Optional)'}
              </label>
              <select
                value={materialTopicId}
                onChange={(e) => setMaterialTopicId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{language === 'id' ? 'Tanpa Topik' : 'No Topic'}</option>
                {(classData?.classwork_topics || []).map((topic: any) => (
                  <option key={topic.id} value={topic.id}>{topic.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Jenis Materi' : 'Material Type'} *
              </label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as any)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="document">{language === 'id' ? 'Dokumen' : 'Document'}</option>
                <option value="video">{language === 'id' ? 'Video' : 'Video'}</option>
                <option value="link">{language === 'id' ? 'Tautan' : 'Link'}</option>
                <option value="image">{language === 'id' ? 'Gambar' : 'Image'}</option>
              </select>
            </div>

            {materialType === 'link' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'URL' : 'URL'} *
                </label>
                <Input
                  value={materialUrl}
                  onChange={(e) => setMaterialUrl(e.target.value)}
                  placeholder="https://example.com"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Unggah File' : 'Upload File'}
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    {language === 'id' ? 'Seret dan lepas file di sini, atau klik untuk memilih' : 'Drag and drop files here, or click to select'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'id' ? 'Format yang didukung: PDF, DOC, MP4, JPG, PNG' : 'Supported formats: PDF, DOC, MP4, JPG, PNG'}
                  </p>
                  <Button variant="outline" className="mt-3">
                    {language === 'id' ? 'Pilih File' : 'Choose File'}
                  </Button>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Deskripsi' : 'Description'}
              </label>
              <Textarea
                value={materialDescription}
                onChange={(e) => setMaterialDescription(e.target.value)}
                placeholder={language === 'id' ? 'Deskripsi singkat tentang materi ini...' : 'Brief description about this material...'}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMaterialModal(false);
                  resetMaterialForm();
                }}
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSaveMaterial}
                disabled={!materialTitle.trim()}
              >
                {editingMaterial ? (language === 'id' ? 'Simpan' : 'Save') : (language === 'id' ? 'Tambah' : 'Add')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Student Detail Modal */}
        <Modal
          isOpen={showStudentModal}
          onClose={() => setShowStudentModal(false)}
          title={language === 'id' ? 'Detail Siswa' : 'Student Details'}
          size="lg"
        >
          {selectedStudent && (
            <div className="space-y-6">
              {/* Student Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
                <Avatar src={selectedStudent.avatar} name={selectedStudent.name} size="xl" />
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.name}</h3>
                  <p className="text-gray-500">{selectedStudent.email}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {language === 'id' ? 'Bergabung' : 'Joined'}: {getTimeAgo(selectedStudent.enrolledAt)}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{selectedStudent.progress}%</p>
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Progress' : 'Progress'}</p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStudent.assignmentsSubmitted}/{selectedStudent.totalAssignments}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Tugas Dikumpulkan' : 'Assignments Submitted'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {selectedStudent.grade !== undefined ? `${selectedStudent.grade}%` : '-'}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Nilai Rata-rata' : 'Average Grade'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">
                    {Math.round(selectedStudent.progress / 10)}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Topik Selesai' : 'Topics Completed'}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Partisipasi' : 'Participation'}</p>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h5 className="font-medium text-gray-900 mb-3">
                  {language === 'id' ? 'Aktivitas Terakhir' : 'Recent Activity'}
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Play className="w-4 h-4 text-green-500" />
                    <span>{language === 'id' ? 'Menonton video materi' : 'Watched material video'}: Introduction to React Hooks</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{language === 'id' ? 'Mengunduh dokumen' : 'Downloaded document'}: React Best Practices Guide</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-4 h-4 text-purple-500" />
                    <span>{language === 'id' ? 'Menyelesaikan tugas' : 'Completed assignment'}: React Component Design</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                <Button variant="outline" leftIcon={<MessageSquare className="w-4 h-4" />}>
                  {language === 'id' ? 'Kirim Pesan' : 'Send Message'}
                </Button>
                <Button leftIcon={<BarChart3 className="w-4 h-4" />} onClick={() => setActiveTab('grading')}>
                  {language === 'id' ? 'Lihat Penilaian' : 'View Grades'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>

      {/* Assignment Modal */}
      <Modal
        isOpen={showAssignmentModal}
        onClose={() => {
          setShowAssignmentModal(false);
          resetAssignmentForm();
        }}
        title={editingAssignment ? (language === 'id' ? 'Edit Tugas' : 'Edit Assignment') : (assignmentType === 'quiz' ? (language === 'id' ? 'Buat Kuis' : 'Create Quiz') : (language === 'id' ? 'Buat Tugas' : 'Create Assignment'))}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'id' ? 'Judul' : 'Title'} *
            </label>
            <Input
              value={assignmentTitle}
              onChange={(e) => setAssignmentTitle(e.target.value)}
              placeholder={assignmentType === 'quiz' ? (language === 'id' ? 'Contoh: Kuis Pertemuan 1' : 'e.g., Quiz Meeting 1') : (language === 'id' ? 'Contoh: Implementasi Layout React' : 'e.g., React Layout Implementation')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'id' ? 'Topik' : 'Topic'}
            </label>
            <select
              value={assignmentTopicId}
              onChange={(e) => setAssignmentTopicId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{language === 'id' ? 'Tanpa Topik' : 'No Topic'}</option>
              {(classData?.classwork_topics || []).map((topic: any) => (
                <option key={topic.id} value={topic.id}>{topic.title}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Poin Maksimal' : 'Max Points'}
              </label>
              <Input
                type="number"
                value={assignmentPoints}
                onChange={(e) => setAssignmentPoints(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Tenggat Waktu' : 'Due Date'}
              </label>
              <Input
                type="datetime-local"
                value={assignmentDueDate}
                onChange={(e) => setAssignmentDueDate(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'id' ? 'Instruksi' : 'Instructions'}
            </label>
            <Textarea
              value={assignmentDescription}
              onChange={(e) => setAssignmentDescription(e.target.value)}
              placeholder={language === 'id' ? 'Berikan instruksi detail untuk tugas ini...' : 'Provide detailed instructions for this assignment...'}
              rows={5}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => {
              setShowAssignmentModal(false);
              resetAssignmentForm();
            }}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveAssignment} disabled={!assignmentTitle.trim()}>
              {language === 'id' ? 'Simpan' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Topic Modal */}
      <Modal
        isOpen={showTopicModal}
        onClose={() => {
          setShowTopicModal(false);
          resetTopicForm();
        }}
        title={editingTopic ? (language === 'id' ? 'Edit Topik' : 'Edit Topic') : (language === 'id' ? 'Buat Topik' : 'Create Topic')}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {language === 'id' ? 'Judul Topik' : 'Topic Title'}
            </label>
            <Input
              value={topicTitle}
              onChange={(e) => setTopicTitle(e.target.value)}
              placeholder={language === 'id' ? 'Misal: Minggu 1: Pendahuluan' : 'e.g., Week 1: Introduction'}
            />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => {
              setShowTopicModal(false);
              resetTopicForm();
            }}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveTopic} disabled={!topicTitle.trim()}>
              {language === 'id' ? 'Simpan' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
