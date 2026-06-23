import { useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Edit,
  Trash2,
  GripVertical,
  Play,
  FileText,
  HelpCircle,
  Clock,
  DollarSign,
  Users,
  BarChart3,
  Settings,
  Image,
  Video,
  ChevronDown,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Input, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import {
  useGetInstructorCourseQuery,
  useGetCategoriesQuery,
  useCreateSectionMutation,
  useUpdateSectionMutation,
  useDeleteSectionMutation,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  useDeleteLessonMutation,
  useCreateQuizMutation,
  useUpdateQuizMutation,
  useSubmitCourseReviewMutation,
  useUpdateCourseMutation,
  useUploadCourseThumbnailMutation,
} from '@/store/features/instructor/instructorApiSlice';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
type Tab = 'overview' | 'curriculum' | 'pricing' | 'students' | 'analytics' | 'settings';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number;
  isFree: boolean;
  quizId?: string;
  quiz?: any;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
  quizzes: any[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  thumbnail: string;
  introVideo?: string;
  category: string;
  level: string;
  price: number;
  discountPrice?: number;
  status: 'draft' | 'pending' | 'pending_review' | 'published' | 'rejected';
  modules: Module[];
  totalStudents: number;
  rating: number;
  totalRatings: number;
  objectives: string[];
  prerequisites: string[];
  statusHistories?: Array<{
    id: number;
    user: { name: string; avatar?: string };
    old_status: string;
    new_status: string;
    feedback?: string;
    created_at: string;
  }>;
}

// Mock data removed

function getYouTubeEmbedUrl(url: string): string {
  if (!url) return '';
  if (url.includes('youtube.com/embed/')) {
    return url;
  }
  
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts.length > 1) {
      const idPart = parts[1].split(/[?#&]/)[0];
      if (idPart && idPart.length === 11) {
        return `https://www.youtube.com/embed/${idPart}`;
      }
    }
  }
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  
  if (url.length === 11) {
    return `https://www.youtube.com/embed/${url}`;
  }
  
  return '';
}

export function CourseManagePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [expandedModules, setExpandedModules] = useState<string[]>(['module-1', 'module-2', 'module-3']);
  const [showAddModuleModal, setShowAddModuleModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<Lesson['type']>('video');
  const [newLessonContent, setNewLessonContent] = useState('');
  const [newLessonDuration, setNewLessonDuration] = useState(0);
  const [newLessonIsPreview, setNewLessonIsPreview] = useState(false);
  const [newLessonVideoUrl, setNewLessonVideoUrl] = useState('');
  const [showQuizBuilderModal, setShowQuizBuilderModal] = useState(false);
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);
  
  // Quiz Builder State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizTimeLimit, setQuizTimeLimit] = useState(15);
  const [quizPassingScore, setQuizPassingScore] = useState(70);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);

  const [createQuiz] = useCreateQuizMutation();
  const [updateQuiz] = useUpdateQuizMutation();
  const [submitCourseReview] = useSubmitCourseReviewMutation();
  const [updateCourse] = useUpdateCourseMutation();
  const [uploadCourseThumbnail] = useUploadCourseThumbnailMutation();
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !courseId) return;

    const formData = new FormData();
    formData.append('thumbnail', file);

    try {
      setIsUploadingThumbnail(true);
      await uploadCourseThumbnail({ id: courseId, body: formData }).unwrap();
      toast.success(language === 'id' ? 'Thumbnail berhasil diperbarui!' : 'Thumbnail updated successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || (language === 'id' ? 'Gagal mengunggah gambar' : 'Failed to upload image'));
    } finally {
      setIsUploadingThumbnail(false);
      if (thumbnailInputRef.current) {
        thumbnailInputRef.current.value = '';
      }
    }
  };

  const [editingSection, setEditingSection] = useState<{ id: string, title: string } | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ id: string, sectionId: string, title: string, type: Lesson['type'] } | null>(null);
  const isInitialized = import.meta.env.DEV ? false : true; // Dummy for placeholder
  const [loadedCourseId, setLoadedCourseId] = useState<string | null>(null);
  const hasInitializedRef = (window as any).hasInitialized || false;

  // Mutations
  const [createSection] = useCreateSectionMutation();
  const [updateSection] = useUpdateSectionMutation();
  const [deleteSection] = useDeleteSectionMutation();
  const [createLesson] = useCreateLessonMutation();
  const [updateLesson] = useUpdateLessonMutation();
  const [deleteLesson] = useDeleteLessonMutation();

  const { data: courseData, isLoading, error } = useGetInstructorCourseQuery(courseId || '', {
    skip: !courseId,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useGetCategoriesQuery();

  const [formData, setFormData] = useState<Partial<CourseData>>({});

  useEffect(() => {
    if (courseData && loadedCourseId !== courseId) {
      console.log('Initializing form with data:', courseData);
      setFormData({
        title: courseData.title || '',
        shortDescription: courseData.subtitle || '',
        description: courseData.description || '',
        category: typeof courseData.category === 'object' ? courseData.category?.slug : String(courseData.category || ''),
        level: courseData.level || 'beginner',
        price: Number(courseData.price || 0),
        discountPrice: courseData.discount_price ? Number(courseData.discount_price) : undefined,
        introVideo: courseData.preview_video || '',
      });
      
      if (courseData.sections && courseData.sections.length > 0) {
        setExpandedModules(courseData.sections.map(s => String(s.id)));
      }
      setLoadedCourseId(courseId || null);
    }
  }, [courseData, courseId, loadedCourseId]);

  // Load quiz data when editing
  useEffect(() => {
    if (showQuizBuilderModal) {
      if (editingQuizId) {
        // Find quiz in standalone quizzes or inside lessons
        let quiz: any = null;
        for (const module of course.modules) {
          quiz = module.quizzes.find(q => q.id === editingQuizId);
          if (quiz) break;
          const lesson = module.lessons.find(l => l.quizId === editingQuizId);
          if (lesson) {
            quiz = lesson.quiz;
            break;
          }
        }

        if (quiz) {
          setQuizTitle(quiz.title);
          setQuizTimeLimit(quiz.timeLimit || quiz.time_limit || 15);
          setQuizPassingScore(quiz.passingScore || quiz.passing_score || 70);
          
          if (quiz.questions && quiz.questions.length > 0) {
            setQuizQuestions(quiz.questions.map((q: any) => ({
              id: q.id,
              question_text: q.question_text,
              points: q.points,
              type: q.type || 'multiple_choice',
              options: (q.options || []).map((o: any) => ({
                id: o.id,
                option_text: o.option_text,
                is_correct: Boolean(o.is_correct)
              }))
            })));
          } else {
            setQuizQuestions([{
              question_text: '',
              points: 10,
              type: 'multiple_choice',
              options: [
                { option_text: '', is_correct: true },
                { option_text: '', is_correct: false }
              ]
            }]);
          }
        }
      } else if (editingLesson) {
        // New quiz for an existing lesson
        setQuizTitle(editingLesson.title);
        setQuizTimeLimit(15);
        setQuizPassingScore(70);
        setQuizQuestions([{
          question_text: '',
          points: 10,
          type: 'multiple_choice',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false }
          ]
        }]);
      } else {
        // Completely new standalone quiz
        setQuizTitle('');
        setQuizTimeLimit(15);
        setQuizPassingScore(70);
        setQuizQuestions([{
          question_text: '',
          points: 10,
          type: 'multiple_choice',
          options: [
            { option_text: '', is_correct: true },
            { option_text: '', is_correct: false }
          ]
        }]);
      }
    }
  }, [editingQuizId, editingLesson, showQuizBuilderModal]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto pb-24 animate-pulse mt-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
             <div className="h-8 bg-gray-200 rounded w-1/3"></div>
             <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-24"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
             </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 mb-6 p-4">
             <div className="flex gap-6 border-b border-gray-100 pb-4">
                <div className="h-6 bg-gray-200 rounded w-24"></div>
                <div className="h-6 bg-gray-200 rounded w-28"></div>
                <div className="h-6 bg-gray-200 rounded w-20"></div>
                <div className="h-6 bg-gray-200 rounded w-24"></div>
             </div>
             <div className="space-y-6 mt-6">
                <div className="space-y-2">
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-10 bg-gray-200 rounded w-full"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                   <div className="h-32 bg-gray-200 rounded w-full"></div>
                </div>
             </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !courseData) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200 text-red-700">
          <p>
            {language === 'id'
              ? 'Gagal memuat data kursus. Silakan coba lagi nanti.'
              : 'Failed to load course data. Please try again later.'}
          </p>
          <Button variant="outline" className="mt-4" onClick={() => navigate('/instructor/courses')}>
             {language === 'id' ? 'Kembali' : 'Go Back'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  // Transform API data to local CourseData format
  const course: CourseData = {
    id: String(courseData.id),
    title: courseData.title,
    slug: courseData.slug,
    description: courseData.description || '',
    shortDescription: courseData.subtitle || '',
    thumbnail: courseData.thumbnail || '',
    introVideo: courseData.preview_video || '',
    category: typeof courseData.category === 'object' ? courseData.category?.slug : String(courseData.category) || '',
    level: courseData.level,
    price: Number(courseData.price),
    discountPrice: courseData.discount_price ? Number(courseData.discount_price) : undefined,
    status: courseData.status,
    statusHistories: courseData.statusHistories || [],
    totalStudents: Number(courseData.total_enrollments),
    rating: Number(courseData.average_rating),
    totalRatings: Number(courseData.total_reviews),
    objectives: courseData.outcomes || [],
    prerequisites: courseData.requirements || [],
    modules: (courseData.sections || []).map((section: any) => ({
      id: String(section.id),
      title: section.title,
      lessons: (section.lessons || []).map((lesson: any) => ({
        id: String(lesson.id),
        title: lesson.title,
        type: lesson.type,
        duration: Number(lesson.duration || 0),
        isFree: lesson.is_preview || !lesson.is_active,
        quiz: lesson.quiz,
        quizId: lesson.quiz ? String(lesson.quiz.id) : undefined,
      })),
      quizzes: (section.quizzes || []).map((quiz: any) => ({
        id: String(quiz.id),
        title: quiz.title,
        questionsCount: quiz.questions_count,
        timeLimit: quiz.time_limit,
        lessonId: quiz.lesson_id ? String(quiz.lesson_id) : undefined,
      }))
    })),
  };


  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: language === 'id' ? 'Ikhtisar' : 'Overview', icon: <Edit className="w-4 h-4" /> },
    { id: 'curriculum', label: language === 'id' ? 'Kurikulum' : 'Curriculum', icon: <FileText className="w-4 h-4" /> },
    { id: 'pricing', label: language === 'id' ? 'Harga' : 'Pricing', icon: <DollarSign className="w-4 h-4" /> },
    { id: 'students', label: language === 'id' ? 'Siswa' : 'Students', icon: <Users className="w-4 h-4" /> },
    { id: 'analytics', label: language === 'id' ? 'Analitik' : 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'settings', label: language === 'id' ? 'Pengaturan' : 'Settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-yellow-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-orange-500" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getTotalLessons = () => course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const getTotalDuration = () =>
    course.modules.reduce((sum, m) => sum + m.lessons.reduce((s, l) => s + l.duration, 0), 0);

  const handleSave = async () => {
    if (!courseId) return;

    // Find category ID based on slug
    const categoryId = categories.find(cat => cat.slug === formData.category)?.id;

    const payload = {
      title: formData.title,
      subtitle: formData.shortDescription,
      description: formData.description,
      category_id: categoryId,
      level: formData.level,
      price: formData.price,
      discount_price: formData.discountPrice,
      preview_video: formData.introVideo,
    };

    try {
      setIsSaving(true);
      await updateCourse({ id: courseId, body: payload }).unwrap();
      toast.success(language === 'id' ? 'Perubahan kursus berhasil disimpan!' : 'Course changes saved successfully!');
    } catch (err: any) {
      toast.error(err?.data?.message || (language === 'id' ? 'Gagal menyimpan perubahan' : 'Failed to save changes'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddModule = async () => {
    if (!newModuleTitle.trim() || !courseId) return;

    try {
      if (editingSection) {
        await updateSection({
          courseId,
          sectionId: editingSection.id,
          title: newModuleTitle
        }).unwrap();
        toast.success(language === 'id' ? 'Modul diperbarui' : 'Module updated');
      } else {
        await createSection({
          courseId,
          title: newModuleTitle
        }).unwrap();
        toast.success(language === 'id' ? 'Modul ditambahkan' : 'Module added');
      }
      setNewModuleTitle('');
      setEditingSection(null);
      setShowAddModuleModal(false);
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal menyimpan modul' : 'Failed to save module');
    }
  };

  const handleSubmitForReview = async () => {
    if (!courseId) return;
    
    // Basic validation before submission
    if (!course.thumbnail) {
      toast.error(language === 'id' ? 'Thumbnail kursus wajib diisi' : 'Course thumbnail is required');
      return;
    }

    if (course.modules.length === 0) {
      toast.error(language === 'id' ? 'Kursus harus memiliki setidaknya satu modul' : 'Course must have at least one module');
      return;
    }

    try {
      setIsSaving(true);
      await submitCourseReview(courseId).unwrap();
      toast.success(language === 'id' ? 'Kursus berhasil diajukan untuk review' : 'Course submitted for review successfully');
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal mengajukan review' : 'Failed to submit for review');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!courseId || !window.confirm(language === 'id' ? 'Hapus modul ini?' : 'Delete this module?')) return;
    try {
      await deleteSection({ courseId, sectionId }).unwrap();
      toast.success(language === 'id' ? 'Modul dihapus' : 'Module deleted');
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal menghapus modul' : 'Failed to delete module');
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim() || !courseId || !selectedModuleId) return;

    const payload = {
      title: newLessonTitle,
      type: newLessonType === 'article' ? 'text' : newLessonType,
      content: newLessonContent,
      video_url: newLessonType === 'video' ? newLessonVideoUrl : undefined,
      duration: newLessonDuration,
      is_preview: newLessonIsPreview,
      is_active: true,
    };

    try {
      if (editingLesson) {
        await updateLesson({
          courseId,
          sectionId: editingLesson.sectionId,
          lessonId: editingLesson.id,
          ...payload
        }).unwrap();
        toast.success(language === 'id' ? 'Materi diperbarui' : 'Lesson updated');
      } else if (selectedModuleId) {
        await createLesson({
          courseId,
          sectionId: selectedModuleId,
          ...payload
        }).unwrap();
        toast.success(language === 'id' ? 'Materi ditambahkan' : 'Lesson added');
      }
      setNewLessonTitle('');
      setNewLessonContent('');
      setNewLessonDuration(0);
      setNewLessonIsPreview(false);
      setNewLessonVideoUrl('');
      setEditingLesson(null);
      setShowAddLessonModal(false);
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal menyimpan materi' : 'Failed to save lesson');
    }
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim() || !courseId || !selectedModuleId) {
      toast.error(language === 'id' ? 'Judul kuis wajib diisi' : 'Quiz title is required');
      return;
    }

    const payload = {
      courseId,
      section_id: selectedModuleId,
      lesson_id: editingLesson?.id || undefined,
      title: quizTitle,
      time_limit: quizTimeLimit,
      passing_score: quizPassingScore,
      questions: quizQuestions,
      is_published: true,
    };

    try {
      if (editingQuizId) {
        await updateQuiz({ id: editingQuizId, ...payload }).unwrap();
        toast.success(language === 'id' ? 'Kuis diperbarui' : 'Quiz updated');
      } else {
        await createQuiz(payload).unwrap();
        toast.success(language === 'id' ? 'Kuis ditambahkan' : 'Quiz added');
      }
      setShowQuizBuilderModal(false);
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal menyimpan kuis' : 'Failed to save quiz');
    }
  };

  const addQuestion = () => {
    setQuizQuestions([...quizQuestions, {
      question_text: '',
      points: 10,
      type: 'multiple_choice',
      options: [
        { option_text: '', is_correct: true },
        { option_text: '', is_correct: false }
      ]
    }]);
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const newQuestions = [...quizQuestions];
    newQuestions[index] = { ...newQuestions[index], [field]: value };
    setQuizQuestions(newQuestions);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const addOption = (qIndex: number) => {
    const newQuestions = [...quizQuestions];
    newQuestions[qIndex].options.push({ option_text: '', is_correct: false });
    setQuizQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, field: string, value: any) => {
    const newQuestions = [...quizQuestions];
    if (field === 'is_correct' && value === true) {
      // Uncheck others for multiple choice
      newQuestions[qIndex].options = newQuestions[qIndex].options.map((o: any, i: number) => ({
        ...o,
        is_correct: i === oIndex
      }));
    } else {
      newQuestions[qIndex].options[oIndex] = { ...newQuestions[qIndex].options[oIndex], [field]: value };
    }
    setQuizQuestions(newQuestions);
  };

  const removeOption = (qIndex: number, oIndex: number) => {
    const newQuestions = [...quizQuestions];
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_: any, i: number) => i !== oIndex);
    setQuizQuestions(newQuestions);
  };

  const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
    if (!courseId || !window.confirm(language === 'id' ? 'Hapus materi ini?' : 'Delete this lesson?')) return;
    try {
      await deleteLesson({ courseId, sectionId, lessonId }).unwrap();
      toast.success(language === 'id' ? 'Materi dihapus' : 'Lesson deleted');
    } catch (err) {
      toast.error(language === 'id' ? 'Gagal menghapus materi' : 'Failed to delete lesson');
    }
  };

  const getStatusBadge = () => {
    let effectiveStatus: string = course.status;
    if (course.status === 'draft' && course.statusHistories && course.statusHistories.length > 0) {
       effectiveStatus = 'revision';
    }

    switch (effectiveStatus) {
      case 'published':
        return <Badge variant="success">{language === 'id' ? 'Dipublikasi' : 'Published'}</Badge>;
      case 'pending':
      case 'pending_review':
        return <Badge variant="warning">{language === 'id' ? 'Menunggu Review' : 'Pending Review'}</Badge>;
      case 'revision':
        return <Badge variant="primary">{language === 'id' ? 'Perlu Revisi' : 'Needs Revision'}</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'rejected':
        return <Badge variant="danger">{language === 'id' ? 'Ditolak' : 'Rejected'}</Badge>;
      default:
        return <Badge variant="secondary">{course.status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/instructor/courses"
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{course.title}</h1>
                {getStatusBadge()}
              </div>
              <p className="text-sm text-gray-500">
                {course.modules.length} {language === 'id' ? 'Modul' : 'Modules'} • {getTotalLessons()}{' '}
                {language === 'id' ? 'Pelajaran' : 'Lessons'} • {formatDuration(getTotalDuration())}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {course.status === 'published' && (
              <Link
                to={`/course/${course.slug}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
              >
                <Eye className="w-4 h-4" />
                {language === 'id' ? 'Lihat Kursus' : 'View Course'}
              </Link>
            )}
            <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSave} isLoading={isSaving}>
              {language === 'id' ? 'Simpan' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Informasi Dasar' : 'Basic Information'}</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <Input
                    label={language === 'id' ? 'Judul Kursus' : 'Course Title'}
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                  <Input
                    label={language === 'id' ? 'Deskripsi Singkat' : 'Short Description'}
                    value={formData.shortDescription || ''}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Deskripsi Lengkap' : 'Full Description'}
                    </label>
                    <div className="bg-white">
                      <ReactQuill
                        theme="snow"
                        value={formData.description || ''}
                        onChange={(val) => setFormData({ ...formData, description: val })}
                        className="mb-12 h-64"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Kategori' : 'Category'}
                      </label>
                      <select
                        value={formData.category || ''}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        disabled={isLoadingCategories}
                      >
                        <option value="">
                          {isLoadingCategories ? 'Loading...' : (language === 'id' ? 'Pilih Kategori' : 'Select Category')}
                        </option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.slug}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Level' : 'Level'}
                      </label>
                      <select
                        value={formData.level || 'beginner'}
                        onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="beginner">{language === 'id' ? 'Pemula' : 'Beginner'}</option>
                        <option value="intermediate">{language === 'id' ? 'Menengah' : 'Intermediate'}</option>
                        <option value="advanced">{language === 'id' ? 'Lanjutan' : 'Advanced'}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Thumbnail & Video */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Media' : 'Media'}</CardTitle>
                </CardHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'id' ? 'Thumbnail Kursus' : 'Course Thumbnail'}
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      ) : (
                        <div className="w-full h-32 bg-gray-100 flex items-center justify-center rounded-lg mb-2 text-gray-400">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                      <button
                        onClick={() => thumbnailInputRef.current?.click()}
                        disabled={isUploadingThumbnail}
                        className="text-sm text-blue-600 hover:underline flex items-center justify-center gap-1 mx-auto"
                      >
                        {isUploadingThumbnail ? (
                          <span>{language === 'id' ? 'Mengunggah...' : 'Uploading...'}</span>
                        ) : (
                          <>
                            <Image className="w-4 h-4" />
                            {language === 'id' ? 'Ganti Gambar' : 'Change Image'}
                          </>
                        )}
                      </button>
                      <input
                        type="file"
                        ref={thumbnailInputRef}
                        onChange={handleThumbnailChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {language === 'id' ? 'Video Perkenalan' : 'Intro Video'}
                    </label>
                    <div className="space-y-3">
                      {getYouTubeEmbedUrl(formData.introVideo || '') ? (
                        <div className="w-full aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                          <iframe
                            src={getYouTubeEmbedUrl(formData.introVideo || '')}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            title="YouTube video player"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-32 bg-gray-50 flex flex-col items-center justify-center rounded-lg text-gray-400 border border-gray-200 border-dashed">
                          <Video className="w-8 h-8 mb-2" />
                          <span className="text-xs text-gray-500">
                            {language === 'id' ? 'Belum ada video / Masukkan Link YouTube' : 'No video / Enter YouTube Link'}
                          </span>
                        </div>
                      )}
                      <Input
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={formData.introVideo || ''}
                        onChange={(e) => setFormData({ ...formData, introVideo: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Objectives & Prerequisites */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Tujuan Pembelajaran' : 'Learning Objectives'}</CardTitle>
                </CardHeader>
                <div className="space-y-2">
                  {course.objectives.map((obj, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <input
                        type="text"
                        value={obj}
                        onChange={() => { }}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button className="p-1 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                    <Plus className="w-4 h-4" />
                    {language === 'id' ? 'Tambah Tujuan' : 'Add Objective'}
                  </button>
                </div>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Course Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Statistik' : 'Statistics'}</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === 'id' ? 'Total Siswa' : 'Total Students'}</span>
                    <span className="font-bold text-gray-900">{course.totalStudents}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rating</span>
                    <span className="font-bold text-gray-900">⭐ {course.rating} ({course.totalRatings})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === 'id' ? 'Total Modul' : 'Total Modules'}</span>
                    <span className="font-bold text-gray-900">{course.modules.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === 'id' ? 'Total Pelajaran' : 'Total Lessons'}</span>
                    <span className="font-bold text-gray-900">{getTotalLessons()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{language === 'id' ? 'Durasi Total' : 'Total Duration'}</span>
                    <span className="font-bold text-gray-900">{formatDuration(getTotalDuration())}</span>
                  </div>
                </div>
              </Card>

              {/* Publish Status */}
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Status Publikasi' : 'Publish Status'}</CardTitle>
                </CardHeader>
                <div className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                    <span className="text-gray-600">{language === 'id' ? 'Status Saat Ini' : 'Current Status'}</span>
                    {getStatusBadge()}
                  </div>
                  {course.status === 'draft' && (
                    <Button 
                      className="w-full" 
                      onClick={handleSubmitForReview}
                      isLoading={isSaving}
                    >
                      {language === 'id' ? 'Ajukan untuk Review' : 'Submit for Review'}
                    </Button>
                  )}
                  {(course.status === 'pending' || course.status === 'pending_review') && (
                    <div className="p-3 bg-yellow-50 text-yellow-700 text-sm rounded-lg border border-yellow-100">
                      {language === 'id' 
                        ? 'Kursus sedang ditinjau oleh admin. Anda tidak dapat mengubah data sampai review selesai.'
                        : 'Course is being reviewed by admin. You cannot modify data until review is complete.'}
                    </div>
                  )}
                  {course.status === 'published' && (
                    <Button variant="outline" className="w-full">
                      {language === 'id' ? 'Buat Draft Baru' : 'Create New Draft'}
                    </Button>
                  )}
                </div>
              </Card>

              {/* Status History */}
              {course.statusHistories && course.statusHistories.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 text-gray-700">
                       <Clock className="w-4 h-4" />
                       {language === 'id' ? 'Riwayat Status' : 'Status History'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {course.statusHistories.map((history, idx) => (
                           <div key={history.id} className={`p-4 flex gap-4 ${idx === 0 ? 'bg-gray-50/50' : 'opacity-70'}`}>
                              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${idx === 0 ? 'bg-blue-500' : 'bg-gray-300'}`} />
                              <div className="flex-1">
                                 <p className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{history.new_status}</p>
                                 <p className="text-[10px] text-gray-500 mt-0.5">{new Date(history.created_at).toLocaleString()}</p>
                                 {history.feedback && (
                                   <div className="mt-2 text-[11px] text-gray-600 bg-white p-2 rounded-lg border border-gray-100 italic">
                                      "{history.feedback}"
                                   </div>
                                 )}
                              </div>
                           </div>
                        ))}
                     </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600">
                {language === 'id'
                  ? 'Kelola modul dan pelajaran kursus Anda.'
                  : 'Manage your course modules and lessons.'}
              </p>
              <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModuleModal(true)}>
                {language === 'id' ? 'Tambah Modul' : 'Add Module'}
              </Button>
            </div>

            {course.modules.map((module, moduleIndex) => {
              const isExpanded = expandedModules.includes(module.id);
              const totalDuration = module.lessons.reduce((sum, l) => sum + l.duration, 0);

              return (
                <Card key={module.id} className="overflow-hidden">
                  {/* Module Header */}
                  <div className="flex items-center gap-3 p-4 bg-gray-50 border-b border-gray-200">
                    <button className="cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {language === 'id' ? 'Modul' : 'Module'} {moduleIndex + 1}: {module.title}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {module.lessons.length} {language === 'id' ? 'pelajaran' : 'lessons'} • {formatDuration(totalDuration)}
                        </p>
                      </div>
                    </button>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedModuleId(module.id);
                          setShowAddLessonModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        aria-label="Add lesson"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => {
                          setEditingSection({ id: module.id, title: module.title });
                          setNewModuleTitle(module.title);
                          setShowAddModuleModal(true);
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSection(module.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Lessons */}
                  {isExpanded && (
                    <div>
                      {module.lessons.map((lesson, lessonIndex) => (
                        <div
                          key={lesson.id}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100"
                        >
                          <button className="cursor-grab text-gray-400 hover:text-gray-600">
                            <GripVertical className="w-4 h-4" />
                          </button>
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                            {getLessonIcon(lesson.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{lesson.title}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span className="capitalize">{lesson.type}</span>
                              <span>•</span>
                              <Clock className="w-3 h-3" />
                              <span>{lesson.duration}m</span>
                              {lesson.quiz && (
                                <>
                                  <span>•</span>
                                  <FileText className="w-3 h-3 text-purple-500" />
                                  <span className="text-purple-600 font-medium">
                                    {lesson.quiz.questions_count || 0} {language === 'id' ? 'Soal' : 'Questions'}
                                  </span>
                                  <span>•</span>
                                  <span className="text-purple-600">
                                    {lesson.quiz.time_limit || 0}m
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {lesson.type === 'quiz' && (
                              <button 
                                onClick={() => {
                                  setEditingQuizId(lesson.quizId || null);
                                  setSelectedModuleId(module.id);
                                  setEditingLesson({ id: lesson.id, sectionId: module.id, title: lesson.title, type: 'quiz' });
                                  setShowQuizBuilderModal(true);
                                }}
                                className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                              >
                                {lesson.quizId ? (language === 'id' ? 'Kelola Soal' : 'Manage Quiz') : (language === 'id' ? 'Buat Soal' : 'Create Questions')}
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setSelectedModuleId(module.id);
                                setEditingLesson({ id: lesson.id, sectionId: module.id, title: lesson.title, type: lesson.type });
                                setNewLessonTitle(lesson.title);
                                setNewLessonType(lesson.type);
                                setShowAddLessonModal(true);
                              }}
                              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteLesson(module.id, lesson.id)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Quizzes (Only standalone quizzes) */}
                      {module.quizzes.filter(q => !q.lessonId).map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 bg-purple-50/10"
                        >
                          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-100 text-purple-600">
                            <HelpCircle className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900">{quiz.title}</p>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <FileText className="w-3 h-3" />
                                {quiz.questionsCount || 0} {language === 'id' ? 'Soal' : 'Questions'}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {quiz.timeLimit || 0}m
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => {
                                setEditingQuizId(quiz.id);
                                setSelectedModuleId(module.id);
                                setShowQuizBuilderModal(true);
                              }}
                              className="px-3 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full hover:bg-purple-200 transition-colors"
                            >
                              {language === 'id' ? 'Kelola Soal' : 'Manage Quiz'}
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      <div className="p-4 bg-gray-50 flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setShowAddLessonModal(true);
                          }}
                          className="flex-1 py-2 px-4 border border-dashed border-gray-300 rounded-lg text-sm text-gray-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          {language === 'id' ? 'Tambah Pelajaran' : 'Add Lesson'}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedModuleId(module.id);
                            setEditingQuizId(null);
                            setShowQuizBuilderModal(true);
                          }}
                          className="flex-1 py-2 px-4 border border-dashed border-purple-300 rounded-lg text-sm text-purple-600 hover:border-purple-500 hover:bg-purple-50 transition-all flex items-center justify-center gap-2"
                        >
                          <HelpCircle className="w-4 h-4" />
                          {language === 'id' ? 'Tambah Kuis' : 'Add Quiz'}
                        </button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}

        {activeTab === 'pricing' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Pengaturan Harga' : 'Pricing Settings'}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Harga Normal' : 'Regular Price'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Harga Diskon (Opsional)' : 'Discount Price (Optional)'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                  <input
                    type="number"
                    value={formData.discountPrice || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, discountPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            {formData.discountPrice && formData.price && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800">
                  {language === 'id' ? 'Diskon:' : 'Discount:'}{' '}
                  <span className="font-bold">
                    {Math.round(((formData.price - formData.discountPrice) / formData.price) * 100)}%
                  </span>{' '}
                  ({formatCurrency(formData.price - formData.discountPrice)}{' '}
                  {language === 'id' ? 'hemat' : 'savings'})
                </p>
              </div>
            )}
          </Card>
        )}

        {activeTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Daftar Siswa' : 'Student List'}</CardTitle>
            </CardHeader>
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{language === 'id' ? 'Fitur ini akan segera hadir.' : 'This feature is coming soon.'}</p>
            </div>
          </Card>
        )}

        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Analitik Kursus' : 'Course Analytics'}</CardTitle>
            </CardHeader>
            <div className="text-center py-12 text-gray-500">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>{language === 'id' ? 'Fitur ini akan segera hadir.' : 'This feature is coming soon.'}</p>
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Pengaturan Kursus' : 'Course Settings'}</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                <h4 className="font-medium text-red-800 mb-2">
                  {language === 'id' ? 'Zona Berbahaya' : 'Danger Zone'}
                </h4>
                <p className="text-sm text-red-600 mb-4">
                  {language === 'id'
                    ? 'Tindakan ini tidak dapat dibatalkan. Harap berhati-hati.'
                    : 'These actions are irreversible. Please be careful.'}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    {language === 'id' ? 'Arsipkan Kursus' : 'Archive Course'}
                  </Button>
                  {course.status === 'draft' && (
                    <Button variant="danger" size="sm">
                      {language === 'id' ? 'Hapus Kursus' : 'Delete Course'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Add Module Modal */}
        <Modal
          isOpen={showAddModuleModal}
          onClose={() => {
            setShowAddModuleModal(false);
            setEditingSection(null);
            setNewModuleTitle('');
          }}
          title={editingSection 
            ? (language === 'id' ? 'Edit Modul' : 'Edit Module')
            : (language === 'id' ? 'Tambah Modul Baru' : 'Add New Module')
          }
          size="md"
        >
          <div className="space-y-4">
            <Input
              label={language === 'id' ? 'Judul Modul' : 'Module Title'}
              value={newModuleTitle}
              onChange={(e) => setNewModuleTitle(e.target.value)}
              placeholder={language === 'id' ? 'Contoh: Pengenalan React' : 'e.g., Introduction to React'}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddModuleModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={handleAddModule}>{language === 'id' ? 'Tambah' : 'Add'}</Button>
            </div>
          </div>
        </Modal>

        {/* Add Lesson Modal */}
        <Modal
          isOpen={showAddLessonModal}
          onClose={() => {
            setShowAddLessonModal(false);
            setEditingLesson(null);
            setNewLessonTitle('');
            setNewLessonType('video');
            setNewLessonContent('');
            setNewLessonDuration(0);
            setNewLessonIsPreview(false);
            setNewLessonVideoUrl('');
          }}
          title={editingLesson
            ? (language === 'id' ? 'Edit Pelajaran' : 'Edit Lesson')
            : (language === 'id' ? 'Tambah Pelajaran Baru' : 'Add New Lesson')
          }
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label={language === 'id' ? 'Judul Pelajaran' : 'Lesson Title'}
              value={newLessonTitle}
              onChange={(e) => setNewLessonTitle(e.target.value)}
              placeholder={language === 'id' ? 'Contoh: Apa itu React?' : 'e.g., What is React?'}
              required
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Tipe Konten' : 'Content Type'}
                </label>
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value as Lesson['type'])}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video">Video</option>
                  <option value="article">{language === 'id' ? 'Artikel (Teks)' : 'Article (Text)'}</option>
                  <option value="quiz">Quiz</option>
                  <option value="assignment">{language === 'id' ? 'Tugas' : 'Assignment'}</option>
                </select>
              </div>
              <div>
                <Input
                  label={language === 'id' ? 'Durasi (Menit)' : 'Duration (Minutes)'}
                  type="number"
                  value={newLessonDuration}
                  onChange={(e) => setNewLessonDuration(Number(e.target.value))}
                  min="0"
                />
              </div>
            </div>

            {newLessonType === 'video' && (
              <Input
                label={language === 'id' ? 'URL Video (YouTube/Vimeo)' : 'Video URL (YouTube/Vimeo)'}
                value={newLessonVideoUrl}
                onChange={(e) => setNewLessonVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                required={newLessonType === 'video'}
              />
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_preview"
                checked={newLessonIsPreview}
                onChange={(e) => setNewLessonIsPreview(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_preview" className="text-sm font-medium text-gray-700">
                {language === 'id' ? 'Tampilkan sebagai pratinjau gratis' : 'Show as free preview'}
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Konten / Deskripsi' : 'Content / Description'}
              </label>
              <div className="bg-white">
                <ReactQuill
                  theme="snow"
                  value={newLessonContent}
                  onChange={setNewLessonContent}
                  className="h-48 mb-12"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowAddLessonModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={handleAddLesson}>{language === 'id' ? 'Simpan' : 'Save'}</Button>
            </div>
          </div>
        </Modal>

        {/* Quiz Builder Modal */}
        <Modal
          isOpen={showQuizBuilderModal}
          onClose={() => setShowQuizBuilderModal(false)}
          title={editingQuizId 
            ? (language === 'id' ? 'Edit Kuis' : 'Edit Quiz')
            : (language === 'id' ? 'Tambah Kuis Baru' : 'Add New Quiz')
          }
          size="xl"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label={language === 'id' ? 'Judul Kuis' : 'Quiz Title'}
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder={language === 'id' ? 'Contoh: Kuis Akhir Modul' : 'e.g., Module Final Quiz'}
                />
              </div>
              <Input
                label={language === 'id' ? 'Batas Waktu (Menit)' : 'Time Limit (Min)'}
                type="number"
                value={quizTimeLimit}
                onChange={(e) => setQuizTimeLimit(Number(e.target.value))}
              />
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-gray-900">
                  {language === 'id' ? 'Daftar Pertanyaan' : 'Questions List'}
                </h4>
                <Button 
                  size="sm" 
                  variant="outline" 
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={addQuestion}
                >
                  {language === 'id' ? 'Tambah Pertanyaan' : 'Add Question'}
                </Button>
              </div>

              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="p-4 border border-gray-200 rounded-xl space-y-4 bg-gray-50/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? `Pertanyaan ${qIndex + 1}` : `Question ${qIndex + 1}`}
                      </label>
                      <textarea
                        value={q.question_text}
                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={2}
                      />
                    </div>
                    <div className="w-24">
                      <Input
                        label="Poin"
                        type="number"
                        value={q.points}
                        onChange={(e) => updateQuestion(qIndex, 'points', Number(e.target.value))}
                        min="0"
                      />
                    </div>
                    <button 
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg mt-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Pilihan Jawaban (Pilih satu yang benar)' : 'Options (Select one as correct)'}
                    </label>
                    {q.options.map((o: any, oIndex: number) => (
                      <div 
                        key={oIndex} 
                        className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
                          o.is_correct ? 'bg-green-50 border border-green-200' : ''
                        }`}
                      >
                        <div className="flex flex-col items-center min-w-[40px]">
                          <input
                            type="radio"
                            name={`correct-${qIndex}`}
                            checked={o.is_correct}
                            onChange={() => updateOption(qIndex, oIndex, 'is_correct', true)}
                            className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                          />
                          {o.is_correct && (
                            <span className="text-[10px] font-bold text-green-600 uppercase mt-0.5">
                              {language === 'id' ? 'Benar' : 'Correct'}
                            </span>
                          )}
                        </div>
                        <input
                          type="text"
                          value={o.option_text}
                          onChange={(e) => updateOption(qIndex, oIndex, 'option_text', e.target.value)}
                          className={`flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            o.is_correct ? 'border-green-300 bg-white' : 'border-gray-300'
                          }`}
                          placeholder={`${language === 'id' ? 'Pilihan' : 'Option'} ${oIndex + 1}`}
                        />
                        {q.options.length > 2 && (
                          <button 
                            onClick={() => removeOption(qIndex, oIndex)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      onClick={() => addOption(qIndex)}
                      className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      {language === 'id' ? 'Tambah Pilihan' : 'Add Option'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-6 mt-6 border-t border-gray-100">
            <Button variant="outline" onClick={() => setShowQuizBuilderModal(false)}>
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button onClick={handleSaveQuiz}>{language === 'id' ? 'Simpan Kuis' : 'Save Quiz'}</Button>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
