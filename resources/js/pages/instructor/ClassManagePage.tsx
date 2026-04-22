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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Dropdown, Modal, Avatar, Textarea } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';

type Tab = 'topics' | 'materials' | 'students' | 'grading' | 'settings';

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
  id: string;
  name: string;
  email: string;
  avatar?: string;
  enrolledAt: string;
  lastActiveAt: string;
  progress: number;
  grade?: number;
  assignmentsSubmitted: number;
  totalAssignments: number;
}

// Mock data
const mockClass = {
  id: 'class-1',
  name: 'React Advanced 2024 - Batch A',
  code: 'RA2024A',
  description: 'Kelas intensif React untuk developer yang sudah paham dasar React.',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
  course: {
    id: 'course-1',
    title: 'React Masterclass: From Zero to Hero',
  },
  status: 'active' as const,
  studentsCount: 32,
  topicsCount: 12,
  materialsCount: 45,
  assignmentsCount: 8,
  averageGrade: 85,
  createdAt: '2024-09-01T10:00:00Z',
  updatedAt: '2024-12-16T14:30:00Z',
  lastActivityAt: '2024-12-16T14:30:00Z',
};



const mockStudents: Student[] = [
  // Keep mock students for now as the API response example had "students": "string", which implies it might not represent the list yet
  // Once the API provides a proper list of students in the class details, we should map that too.
  {
    id: 'student-1',
    name: 'Ahmad Rizki',
    email: 'ahmad.rizki@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    enrolledAt: '2024-09-01T10:00:00Z',
    lastActiveAt: '2024-12-16T14:30:00Z',
    progress: 95,
    grade: 92,
    assignmentsSubmitted: 8,
    totalAssignments: 8,
  },
  {
    id: 'student-2',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    enrolledAt: '2024-09-02T10:00:00Z',
    lastActiveAt: '2024-12-15T09:00:00Z',
    progress: 88,
    grade: 85,
    assignmentsSubmitted: 7,
    totalAssignments: 8,
  },
  {
    id: 'student-3',
    name: 'Budi Hartono',
    email: 'budi.hartono@email.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiH',
    enrolledAt: '2024-09-03T10:00:00Z',
    lastActiveAt: '2024-12-14T16:00:00Z',
    progress: 75,
    grade: 78,
    assignmentsSubmitted: 6,
    totalAssignments: 8,
  },
];

import { 
  useGetClassQuery,
  useUpdateClassMutation
} from '@/store/features/classes/classesApiSlice';
import { Loader2 } from 'lucide-react';


export function ClassManagePage() {
  const { classId } = useParams<{ classId: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // API Hooks
  const { data: classDataResponse, isLoading } = useGetClassQuery(classId || '', { skip: !classId });
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();
  
  const classData = classDataResponse?.data;

  // Use derived state for topics and materials to avoid conflict between API data and local state for now
  // Ideally we should sync these. For this refactor we prioritize displaying API data.
  const topicsData = classData?.courses?.flatMap(course => course.topics) || [];
  // Ensure we have unique IDs if multiple courses have topics with same IDs (unlikely in real DB but good safety)
  // Or just map them directly if structure matches.
  
  // We need to map the API Topic structure to the UI Topic interface if they differ.
  // API Topic: { id, title, materials_count, materials: [], description? }
  // UI Topic: { id, title, description, order, createdAt, updatedAt }
  // The API response doesn't seem to have order/createdAt/updatedAt in Topic yet.
  
  const displayTopics: Topic[] = topicsData.map((t: any, index: number) => ({
    id: String(t.id),
    title: t.title,
    description: t.description || '',
    order: index + 1,
    createdAt: new Date().toISOString(), // Placeholder
    updatedAt: new Date().toISOString(), // Placeholder
  }));

  const displayMaterials: Material[] = topicsData.flatMap((t: any) => 
    (t.materials || []).map((m: any) => ({
      id: String(m.id),
      title: m.title,
      type: m.type as any,
      url: m.url,
      fileName: m.file_name,
      fileSize: m.file_size,
      description: '', 
      topicId: String(t.id),
      createdAt: new Date().toISOString(), // Placeholder
      updatedAt: new Date().toISOString(), // Placeholder
    }))
  );

  
  const [activeTab, setActiveTab] = useState<Tab>('topics');
  const [expandedTopics, setExpandedTopics] = useState<string[]>(['topic-1']);
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Form states
  const [className, setClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [classStatus, setClassStatus] = useState<'active' | 'archived'>('active');

  // Topics form
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  
  // Materials form
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialType, setMaterialType] = useState<'document' | 'video' | 'link' | 'image'>('document');
  const [materialUrl, setMaterialUrl] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  
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



  const toggleTopic = (topicId: string) => {
    setExpandedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const getMaterialIcon = (type: Material['type']) => {
    switch (type) {
      case 'document': return <File className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'link': return <LinkIcon className="w-4 h-4" />;
      case 'image': return <Image className="w-4 h-4" />;
      default: return <Paperclip className="w-4 h-4" />;
    }
  };

  const getMaterialTypeName = (type: Material['type']) => {
    switch (type) {
      case 'document': return language === 'id' ? 'Dokumen' : 'Document';
      case 'video': return language === 'id' ? 'Video' : 'Video';
      case 'link': return language === 'id' ? 'Tautan' : 'Link';
      case 'image': return language === 'id' ? 'Gambar' : 'Image';
      default: return language === 'id' ? 'Lampiran' : 'Attachment';
    }
  };

  const handleSaveTopic = () => {
    if (editingTopic) {
      // Update existing topic
      console.log('Update topic:', { id: editingTopic.id, title: topicTitle, description: topicDescription });
    } else {
      // Create new topic
      console.log('Create topic:', { title: topicTitle, description: topicDescription });
    }
    setShowTopicModal(false);
    resetTopicForm();
  };

  const handleSaveMaterial = () => {
    if (editingMaterial) {
      // Update existing material
      console.log('Update material:', {
        id: editingMaterial.id,
        title: materialTitle,
        type: materialType,
        url: materialUrl,
        description: materialDescription
      });
    } else {
      // Create new material
      console.log('Create material:', {
        title: materialTitle,
        type: materialType,
        url: materialUrl,
        description: materialDescription,
        topicId: selectedTopicId
      });
    }
    setShowMaterialModal(false);
    resetMaterialForm();
  };

  const resetTopicForm = () => {
    setTopicTitle('');
    setTopicDescription('');
    setEditingTopic(null);
  };

  const resetMaterialForm = () => {
    setMaterialTitle('');
    setMaterialType('document');
    setMaterialUrl('');
    setMaterialDescription('');
    setEditingMaterial(null);
    setSelectedTopicId(null);
  };

  const getTopicActions = (topic: Topic) => [
    {
      label: language === 'id' ? 'Edit Topik' : 'Edit Topic',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: () => {
        setEditingTopic(topic);
        setTopicTitle(topic.title);
        setTopicDescription(topic.description);
        setShowTopicModal(true);
      },
    },
    {
      label: language === 'id' ? 'Tambah Materi' : 'Add Material',
      icon: <Plus className="w-4 h-4" />,
      onClick: () => {
        setSelectedTopicId(topic.id);
        setShowMaterialModal(true);
      },
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => console.log('Delete topic:', topic.id),
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

  const getMaterialActions = (material: Material) => [
    {
      label: language === 'id' ? 'Edit Materi' : 'Edit Material',
      icon: <Edit3 className="w-4 h-4" />,
      onClick: () => {
        setEditingMaterial(material);
        setMaterialTitle(material.title);
        setMaterialType(material.type);
        setMaterialUrl(material.url || '');
        setMaterialDescription(material.description);
        setShowMaterialModal(true);
      },
    },
    {
      label: language === 'id' ? 'Lihat' : 'View',
      icon: <Eye className="w-4 h-4" />,
      onClick: () => window.open(material.url, '_blank'),
    },
    {
      label: language === 'id' ? 'Unduh' : 'Download',
      icon: <Download className="w-4 h-4" />,
      onClick: () => console.log('Download:', material.id),
    },
    { divider: true, label: '' },
    {
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => console.log('Delete material:', material.id),
      className: 'text-red-600 hover:bg-red-50',
    },
  ];

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
                    {getTimeAgo(classData.updated_at || '')}
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
              onClick={() => setActiveTab('topics')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'topics'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                {language === 'id' ? 'Topik' : 'Topics'}
                <Badge variant="secondary" size="sm">{displayTopics.length}</Badge>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('materials')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'materials'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                {language === 'id' ? 'Materi' : 'Materials'}
                <Badge variant="secondary" size="sm">{displayMaterials.length}</Badge>
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
        {activeTab === 'topics' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'id' ? 'Topik Pembelajaran' : 'Learning Topics'}
              </h2>
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowTopicModal(true)}>
                {language === 'id' ? 'Tambah Topik' : 'Add Topic'}
              </Button>
            </div>

            {displayTopics.length === 0 ? (
              <Card className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'id' ? 'Belum Ada Topik' : 'No Topics Yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === 'id'
                    ? 'Buat topik pertama Anda untuk memulai struktur pembelajaran.'
                    : 'Create your first topic to start structuring your learning content.'}
                </p>
                <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowTopicModal(true)}>
                  {language === 'id' ? 'Tambah Topik' : 'Add Topic'}
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                {displayTopics.map((topic) => {
                  const topicMaterials = displayMaterials.filter(m => m.topicId === topic.id);

                  return (
                    <Card key={topic.id}>
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleTopic(topic.id)}
                                className="mt-1 p-1 hover:bg-gray-100 rounded"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 text-gray-500 transition-transform ${expandedTopics.includes(topic.id) ? 'rotate-180' : ''
                                    }`}
                                />
                              </button>
                              <div>
                                <h3 className="font-medium text-gray-900">{topic.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{topic.description}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {topicMaterials.length} {language === 'id' ? 'materi' : 'materials'}
                            </span>
                            <Dropdown
                              trigger={
                                <button className="p-2 hover:bg-gray-100 rounded-lg">
                                  <MoreVertical className="w-4 h-4 text-gray-500" />
                                </button>
                              }
                              items={getTopicActions(topic)}
                              align="right"
                            />
                          </div>
                        </div>

                        {expandedTopics.includes(topic.id) && (
                          <div className="mt-4 pl-7 border-l-2 border-gray-200">
                            {topicMaterials.length === 0 ? (
                              <div className="text-center py-4">
                                <p className="text-gray-500 text-sm">
                                  {language === 'id' ? 'Belum ada materi untuk topik ini.' : 'No materials for this topic yet.'}
                                </p>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="mt-2"
                                  onClick={() => {
                                    setSelectedTopicId(topic.id);
                                    setShowMaterialModal(true);
                                  }}
                                >
                                  {language === 'id' ? 'Tambah Materi' : 'Add Material'}
                                </Button>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {topicMaterials.map((material) => (
                                  <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                      <div className="p-2 bg-white rounded-lg">
                                        {getMaterialIcon(material.type)}
                                      </div>
                                      <div>
                                        <p className="font-medium text-gray-900">{material.title}</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                          <span>{getMaterialTypeName(material.type)}</span>
                                          {material.fileSize && <span>• {material.fileSize}</span>}
                                          <span>• {getTimeAgo(material.createdAt)}</span>
                                        </div>
                                        {material.description && (
                                          <p className="text-xs text-gray-600 mt-1">{material.description}</p>
                                        )}
                                      </div>
                                    </div>
                                    <Dropdown
                                      trigger={
                                        <button className="p-2 hover:bg-gray-200 rounded-lg">
                                          <MoreVertical className="w-4 h-4 text-gray-500" />
                                        </button>
                                      }
                                      items={getMaterialActions(material)}
                                      align="right"
                                    />
                                  </div>
                                ))}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  leftIcon={<Plus className="w-4 h-4" />}
                                  onClick={() => {
                                    setSelectedTopicId(topic.id);
                                    setShowMaterialModal(true);
                                  }}
                                >
                                  {language === 'id' ? 'Tambah Materi' : 'Add Material'}
                                </Button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'id' ? 'Semua Materi' : 'All Materials'}
              </h2>
              <Button leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowMaterialModal(true)}>
                {language === 'id' ? 'Unggah Materi' : 'Upload Material'}
              </Button>
            </div>

            {displayMaterials.length === 0 ? (
              <Card className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'id' ? 'Belum Ada Materi' : 'No Materials Yet'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {language === 'id'
                    ? 'Unggah materi pertama Anda untuk membantu siswa belajar.'
                    : 'Upload your first material to help students learn.'}
                </p>
                <Button leftIcon={<Upload className="w-4 h-4" />} onClick={() => setShowMaterialModal(true)}>
                  {language === 'id' ? 'Unggah Materi' : 'Upload Material'}
                </Button>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayMaterials.map((material) => (
                  <Card key={material.id} className="hover:shadow-md transition-shadow">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          {getMaterialIcon(material.type)}
                        </div>
                        <Dropdown
                          trigger={
                            <button className="p-2 hover:bg-gray-100 rounded-lg">
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          }
                          items={getMaterialActions(material)}
                          align="right"
                        />
                      </div>
                      <h3 className="font-medium text-gray-900 mt-3 line-clamp-2">{material.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <span className="px-2 py-1 bg-gray-100 rounded">
                          {getMaterialTypeName(material.type)}
                        </span>
                        {material.fileSize && <span>{material.fileSize}</span>}
                      </div>
                      {material.description && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{material.description}</p>
                      )}
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>{getTimeAgo(material.createdAt)}</span>
                        <span>
                          {displayTopics.find(t => t.id === material.topicId)?.title || 'Unassigned'}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
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

            {mockStudents.length === 0 ? (
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
                      {mockStudents.map((student) => (
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
                  <option>{language === 'id' ? 'Semua Tugas' : 'All Assignments'}</option>
                  <option>Assignment 1: React Components</option>
                  <option>Assignment 2: State Management</option>
                  <option>Assignment 3: Performance Optimization</option>
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
                    <p className="text-3xl font-bold text-blue-600">{mockClass.averageGrade}%</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'id' ? 'Rata-rata Kelas' : 'Class Average'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">
                      {mockStudents.filter(s => s.grade !== undefined && s.grade >= 85).length}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'id' ? 'Siswa Berprestasi' : 'High Achievers'}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <p className="text-3xl font-bold text-yellow-600">
                      {mockStudents.filter(s => s.grade !== undefined && s.grade < 70).length}
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
                      <select className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="public">{language === 'id' ? 'Publik' : 'Public'}</option>
                        <option value="private" selected>{language === 'id' ? 'Privat' : 'Private'}</option>
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

        {/* Topic Modal */}
        <Modal
          isOpen={showTopicModal}
          onClose={() => {
            setShowTopicModal(false);
            resetTopicForm();
          }}
          title={editingTopic ? (language === 'id' ? 'Edit Topik' : 'Edit Topic') : (language === 'id' ? 'Tambah Topik Baru' : 'Add New Topic')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Judul Topik' : 'Topic Title'} *
              </label>
              <Input
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                placeholder={language === 'id' ? 'Contoh: Introduction to Advanced React Patterns' : 'e.g., Introduction to Advanced React Patterns'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Deskripsi' : 'Description'}
              </label>
              <Textarea
                value={topicDescription}
                onChange={(e) => setTopicDescription(e.target.value)}
                placeholder={language === 'id' ? 'Deskripsi singkat tentang topik ini...' : 'Brief description about this topic...'}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowTopicModal(false);
                  resetTopicForm();
                }}
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleSaveTopic}
                disabled={!topicTitle.trim()}
              >
                {editingTopic ? (language === 'id' ? 'Simpan' : 'Save') : (language === 'id' ? 'Tambah' : 'Add')}
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

            {!editingMaterial && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Topik' : 'Topic'} *
                </label>
                <select
                  value={selectedTopicId || ''}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{language === 'id' ? 'Pilih topik...' : 'Select topic...'}</option>
                  {displayTopics.map(topic => (
                    <option key={topic.id} value={topic.id}>{topic.title}</option>
                  ))}
                </select>
              </div>
            )}

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
                disabled={!materialTitle.trim() || (!editingMaterial && !selectedTopicId)}
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
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {language === 'id' ? 'Terakhir aktif' : 'Last active'}: {getTimeAgo(selectedStudent.lastActiveAt)}
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
    </DashboardLayout>
  );
}
