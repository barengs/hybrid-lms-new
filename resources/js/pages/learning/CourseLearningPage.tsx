import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  FileText,
  HelpCircle,
  CheckCircle,
  Lock,
  Clock,
  ChevronDown,
  ChevronRight,
  Award,
  BookOpen,
  ArrowLeft,
  Download,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Progress, Skeleton } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { useGetCourseContentQuery } from '@/store/features/student/studentApiSlice';

interface LearningLesson {
  id: number;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number;
  is_completed: boolean;
  is_locked: boolean;
  sort_order: number;
}

interface LearningSection {
  id: number;
  title: string;
  sort_order: number;
  lessons: LearningLesson[];
}

export function CourseLearningPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  const { data: course, isLoading, error } = useGetCourseContentQuery(slug, {
    skip: !slug
  });

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getLessonIcon = (type: LearningLesson['type'], isCompleted: boolean, isLocked: boolean) => {
    if (isLocked) return <Lock className="w-4 h-4 text-gray-400" />;
    if (isCompleted) return <CheckCircle className="w-4 h-4 text-green-500" />;

    switch (type) {
      case 'video':
        return <Play className="w-4 h-4 text-blue-500" />;
      case 'article':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'quiz':
        return <HelpCircle className="w-4 h-4 text-yellow-500" />;
      case 'assignment':
        return <FileText className="w-4 h-4 text-orange-500" />;
      default:
        return <Play className="w-4 h-4 text-gray-500" />;
    }
  };

  const getLessonTypeLabel = (type: LearningLesson['type']) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'article':
        return language === 'id' ? 'Artikel' : 'Article';
      case 'quiz':
        return 'Quiz';
      case 'assignment':
        return language === 'id' ? 'Tugas' : 'Assignment';
      default:
        return type;
    }
  };

  const getModuleProgress = (module: LearningSection) => {
    const completed = module.lessons.filter((l) => l.is_completed).length;
    if (module.lessons.length === 0) return 0;
    return Math.round((completed / module.lessons.length) * 100);
  };

  const handleLessonClick = (lesson: LearningLesson) => {
    console.log('DEBUG: Lesson Clicked', lesson);
    if (lesson.is_locked) {
      console.warn('DEBUG: Lesson is locked');
      return;
    }

    let url = '';
    if (lesson.type === 'quiz') {
      url = `/learn/${slug}/quiz/${lesson.id}`;
    } else if (lesson.type === 'assignment') {
      url = `/assignments/${lesson.id}`;
    } else {
      url = `/learn/${slug}/lesson/${lesson.id}`;
    }

    console.log('DEBUG: Navigating to', url);
    navigate(url);
  };

  // Find next lesson to continue
  const nextLesson = useMemo(() => {
    if (!course) return null;
    for (const module of course.sections) {
      for (const lesson of module.lessons) {
        if (!lesson.is_completed && !lesson.is_locked) {
          return { module, lesson };
        }
      }
    }
    return null;
  }, [course]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64 h- rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
              <Skeleton className="h-20 rounded-xl" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 rounded-xl" />
              <Skeleton className="h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="max-w-6xl mx-auto text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'id' ? 'Gagal memuat konten' : 'Failed to load content'}
          </h2>
          <p className="text-gray-600 mb-6">
            {language === 'id' ? 'Silakan coba lagi nanti atau hubungi bantuan.' : 'Please try again later or contact support.'}
          </p>
          <Link to="/my-courses">
            <Button>
              {language === 'id' ? 'Kembali ke Kursus Saya' : 'Back to My Courses'}
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link
          to="/my-courses"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'id' ? 'Kembali ke Kursus Saya' : 'Back to My Courses'}
        </Link>

        {/* Course Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Thumbnail */}
            <div className="md:w-72 h-40 flex-shrink-0">
              <img
                src={`${import.meta.env.VITE_URL_API_IMAGE}/${course.thumbnail}`}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="flex-1 py-2 px-4 md:px-0">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>

              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Avatar src={course.instructor_avatar} name={course.instructor_name} size="xs" />
                <span>{course.instructor_name}</span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">
                    {language === 'id' ? 'Progres Pembelajaran' : 'Learning Progress'}
                  </span>
                  <span className="font-medium text-gray-900">{course.progress}%</span>
                </div>
                <Progress value={course.progress} size="md" />
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>
                    {course.completed_lessons}/{course.total_lessons} {language === 'id' ? 'Pelajaran' : 'Lessons'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 justify-center px-4 mb-4 md:mb-0">
              {nextLesson && (
                <Button
                  leftIcon={<Play className="w-4 h-4" />}
                  onClick={() => handleLessonClick(nextLesson.lesson)}
                >
                  {language === 'id' ? 'Lanjutkan Belajar' : 'Continue Learning'}
                </Button>
              )}
              <Link
                to={`/discussions?course=${course.id}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                {language === 'id' ? 'Forum Diskusi' : 'Discussion Forum'}
              </Link>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Syllabus */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {language === 'id' ? 'Materi Kursus' : 'Course Content'}
            </h2>

            {course.sections.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              const moduleProgress = getModuleProgress(module);
              const completedCount = module.lessons.filter((l) => l.is_completed).length;

              return (
                <Card key={module.id} padding="none" className="overflow-hidden">
                  {/* Module Header */}
                  <button
                    onClick={() => toggleModule(module.id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-left">
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-500">
                          {completedCount}/{module.lessons.length} {language === 'id' ? 'selesai' : 'completed'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {moduleProgress === 100 ? (
                        <Badge variant="success" size="sm">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          {language === 'id' ? 'Selesai' : 'Completed'}
                        </Badge>
                      ) : (
                        <span className="text-sm font-medium text-gray-600">{moduleProgress}%</span>
                      )}
                    </div>
                  </button>

                  {/* Lessons */}
                  {isExpanded && (
                    <div className="border-t border-gray-100">
                      {module.lessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          disabled={lesson.is_locked}
                          className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${lesson.is_locked
                               ? 'opacity-50 cursor-not-allowed bg-gray-50'
                               : 'hover:bg-gray-50 cursor-pointer'
                            } ${index < module.lessons.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                            {getLessonIcon(lesson.type, lesson.is_completed, lesson.is_locked)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${lesson.is_completed ? 'text-gray-500' : 'text-gray-900'}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{getLessonTypeLabel(lesson.type)}</span>
                              {lesson.duration > 0 && (
                                <>
                                  <span>•</span>
                                  <span>{formatDuration(lesson.duration)}</span>
                                </>
                              )}
                            </div>
                          </div>
                          {lesson.is_completed && (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress Card */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Progres Anda' : 'Your Progress'}</CardTitle>
              </CardHeader>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-4xl font-bold text-blue-600">{course.progress}%</p>
                  <p className="text-sm text-gray-600">
                    {language === 'id' ? 'Selesai' : 'Complete'}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{course.completed_lessons}</p>
                    <p className="text-xs text-gray-500">{language === 'id' ? 'Pelajaran Selesai' : 'Lessons Done'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{course.total_lessons - course.completed_lessons}</p>
                    <p className="text-xs text-gray-500">{language === 'id' ? 'Tersisa' : 'Remaining'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Certificate Card placeholder */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Sertifikat' : 'Certificate'}</CardTitle>
              </CardHeader>
              <div className="text-center py-4">
                {course.progress === 100 ? (
                  <>
                    <Award className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3 text-sm">
                      {language === 'id' ? 'Selamat! Anda telah menyelesaikan kursus ini.' : 'Congratulations! You have completed this course.'}
                    </p>
                    <Link
                      to="/certificates"
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
                    >
                      <Download className="w-4 h-4" />
                      {language === 'id' ? 'Lihat Sertifikat' : 'View Certificate'}
                    </Link>
                  </>
                ) : (
                  <>
                    <Award className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-xs">
                      {language === 'id'
                        ? 'Selesaikan semua materi untuk mendapatkan sertifikat.'
                        : 'Complete all lessons to earn your certificate.'}
                    </p>
                  </>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
