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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Progress } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article' | 'quiz' | 'assignment';
  duration: number;
  isCompleted: boolean;
  isLocked: boolean;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  lessons: Lesson[];
}

interface EnrolledCourse {
  id: string;
  title: string;
  thumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  progress: number;
  totalDuration: number;
  completedLessons: number;
  totalLessons: number;
  modules: Module[];
  hasFinalExam: boolean;
  finalExamUnlocked: boolean;
  certificateEarned: boolean;
}

// Mock enrolled course data
const mockEnrolledCourse: EnrolledCourse = {
  id: 'course-1',
  title: 'React Masterclass: From Zero to Hero',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  instructorName: 'Budi Santoso',
  instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  progress: 65,
  totalDuration: 2520, // minutes
  completedLessons: 22,
  totalLessons: 34,
  hasFinalExam: true,
  finalExamUnlocked: false,
  certificateEarned: false,
  modules: [
    {
      id: 'module-1',
      title: 'Introduction to React',
      description: 'Learn the basics of React and set up your development environment.',
      lessons: [
        { id: 'lesson-1-1', title: 'What is React?', type: 'video', duration: 15, isCompleted: true, isLocked: false },
        { id: 'lesson-1-2', title: 'Setting Up Development Environment', type: 'video', duration: 20, isCompleted: true, isLocked: false },
        { id: 'lesson-1-3', title: 'Your First React App', type: 'video', duration: 25, isCompleted: true, isLocked: false },
        { id: 'lesson-1-4', title: 'Understanding JSX', type: 'article', duration: 10, isCompleted: true, isLocked: false },
        { id: 'lesson-1-5', title: 'Module 1 Quiz', type: 'quiz', duration: 15, isCompleted: true, isLocked: false },
      ],
    },
    {
      id: 'module-2',
      title: 'Components & Props',
      description: 'Deep dive into React components and props system.',
      lessons: [
        { id: 'lesson-2-1', title: 'Functional Components', type: 'video', duration: 20, isCompleted: true, isLocked: false },
        { id: 'lesson-2-2', title: 'Class Components', type: 'video', duration: 18, isCompleted: true, isLocked: false },
        { id: 'lesson-2-3', title: 'Props and PropTypes', type: 'video', duration: 22, isCompleted: true, isLocked: false },
        { id: 'lesson-2-4', title: 'Component Composition', type: 'article', duration: 12, isCompleted: true, isLocked: false },
        { id: 'lesson-2-5', title: 'Build a Component Library', type: 'assignment', duration: 60, isCompleted: true, isLocked: false },
        { id: 'lesson-2-6', title: 'Module 2 Quiz', type: 'quiz', duration: 20, isCompleted: true, isLocked: false },
      ],
    },
    {
      id: 'module-3',
      title: 'State & Lifecycle',
      description: 'Master state management and component lifecycle.',
      lessons: [
        { id: 'lesson-3-1', title: 'Understanding State', type: 'video', duration: 25, isCompleted: true, isLocked: false },
        { id: 'lesson-3-2', title: 'useState Hook', type: 'video', duration: 20, isCompleted: true, isLocked: false },
        { id: 'lesson-3-3', title: 'useEffect Hook', type: 'video', duration: 22, isCompleted: true, isLocked: false },
        { id: 'lesson-3-4', title: 'Lifecycle Methods', type: 'article', duration: 15, isCompleted: true, isLocked: false },
        { id: 'lesson-3-5', title: 'Module 3 Quiz', type: 'quiz', duration: 15, isCompleted: true, isLocked: false },
      ],
    },
    {
      id: 'module-4',
      title: 'Advanced Hooks',
      description: 'Learn advanced React hooks and custom hooks.',
      lessons: [
        { id: 'lesson-4-1', title: 'useContext Hook', type: 'video', duration: 20, isCompleted: true, isLocked: false },
        { id: 'lesson-4-2', title: 'useReducer Hook', type: 'video', duration: 25, isCompleted: true, isLocked: false },
        { id: 'lesson-4-3', title: 'useRef & useMemo', type: 'video', duration: 22, isCompleted: false, isLocked: false },
        { id: 'lesson-4-4', title: 'Custom Hooks', type: 'video', duration: 30, isCompleted: false, isLocked: false },
        { id: 'lesson-4-5', title: 'Build Custom Hooks', type: 'assignment', duration: 45, isCompleted: false, isLocked: false },
        { id: 'lesson-4-6', title: 'Module 4 Quiz', type: 'quiz', duration: 20, isCompleted: false, isLocked: false },
      ],
    },
    {
      id: 'module-5',
      title: 'State Management with Redux',
      description: 'Learn Redux for complex state management.',
      lessons: [
        { id: 'lesson-5-1', title: 'Introduction to Redux', type: 'video', duration: 25, isCompleted: false, isLocked: true },
        { id: 'lesson-5-2', title: 'Actions & Reducers', type: 'video', duration: 30, isCompleted: false, isLocked: true },
        { id: 'lesson-5-3', title: 'Redux Toolkit', type: 'video', duration: 28, isCompleted: false, isLocked: true },
        { id: 'lesson-5-4', title: 'Async Actions with Thunk', type: 'video', duration: 25, isCompleted: false, isLocked: true },
        { id: 'lesson-5-5', title: 'Redux Project', type: 'assignment', duration: 90, isCompleted: false, isLocked: true },
        { id: 'lesson-5-6', title: 'Module 5 Quiz', type: 'quiz', duration: 25, isCompleted: false, isLocked: true },
      ],
    },
  ],
};

export function CourseLearningPage() {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [expandedModules, setExpandedModules] = useState<string[]>(['module-1', 'module-2', 'module-3', 'module-4']);

  // In real app, fetch course by slug
  const course = mockEnrolledCourse;
  console.log('Course slug:', slug);

  const toggleModule = (moduleId: string) => {
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

  const getLessonIcon = (type: Lesson['type'], isCompleted: boolean, isLocked: boolean) => {
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

  const getLessonTypeLabel = (type: Lesson['type']) => {
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

  const getModuleProgress = (module: Module) => {
    const completed = module.lessons.filter((l) => l.isCompleted).length;
    return Math.round((completed / module.lessons.length) * 100);
  };

  const handleLessonClick = (lesson: Lesson) => {
    if (lesson.isLocked) return;

    if (lesson.type === 'quiz') {
      navigate(`/learn/${course.id}/quiz/${lesson.id}`);
    } else if (lesson.type === 'assignment') {
      navigate(`/assignments/${lesson.id}`);
    } else {
      navigate(`/learn/${course.id}/lesson/${lesson.id}`);
    }
  };

  // Find next lesson to continue
  const nextLesson = useMemo(() => {
    for (const module of course.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.isCompleted && !lesson.isLocked) {
          return { module, lesson };
        }
      }
    }
    return null;
  }, [course.modules]);

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
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="flex-1 py-2">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{course.title}</h1>

              {/* Instructor */}
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                <Avatar src={course.instructorAvatar} name={course.instructorName} size="xs" />
                <span>{course.instructorName}</span>
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
                    {course.completedLessons}/{course.totalLessons} {language === 'id' ? 'Pelajaran' : 'Lessons'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(course.totalDuration)}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 justify-center px-4">
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

            {course.modules.map((module) => {
              const isExpanded = expandedModules.includes(module.id);
              const moduleProgress = getModuleProgress(module);
              const completedCount = module.lessons.filter((l) => l.isCompleted).length;

              return (
                <Card key={module.id} className="overflow-hidden">
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
                          {completedCount}/{module.lessons.length} {language === 'id' ? 'selesai' : 'completed'} • {formatDuration(module.lessons.reduce((acc, l) => acc + l.duration, 0))}
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
                          disabled={lesson.isLocked}
                          className={`w-full flex items-center gap-4 p-4 text-left transition-colors ${lesson.isLocked
                              ? 'opacity-50 cursor-not-allowed bg-gray-50'
                              : 'hover:bg-gray-50 cursor-pointer'
                            } ${index < module.lessons.length - 1 ? 'border-b border-gray-50' : ''}`}
                        >
                          <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100">
                            {getLessonIcon(lesson.type, lesson.isCompleted, lesson.isLocked)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-medium ${lesson.isCompleted ? 'text-gray-500' : 'text-gray-900'}`}>
                              {lesson.title}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                              <span>{getLessonTypeLabel(lesson.type)}</span>
                              <span>•</span>
                              <span>{formatDuration(lesson.duration)}</span>
                            </div>
                          </div>
                          {lesson.isCompleted && (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}

            {/* Final Exam */}
            {course.hasFinalExam && (
              <Card className={`overflow-hidden ${!course.finalExamUnlocked ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100">
                      {course.finalExamUnlocked ? (
                        <Award className="w-5 h-5 text-red-500" />
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {language === 'id' ? 'Ujian Akhir Kursus' : 'Final Course Exam'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {course.finalExamUnlocked
                          ? language === 'id'
                            ? 'Selesaikan untuk mendapatkan sertifikat'
                            : 'Complete to earn your certificate'
                          : language === 'id'
                            ? 'Selesaikan semua materi untuk membuka ujian'
                            : 'Complete all lessons to unlock the exam'}
                      </p>
                    </div>
                  </div>
                  {course.finalExamUnlocked && (
                    <Link
                      to={`/learn/${course.id}/exam`}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-all"
                    >
                      {language === 'id' ? 'Mulai Ujian' : 'Start Exam'}
                    </Link>
                  )}
                </div>
              </Card>
            )}
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
                    <p className="text-xl font-bold text-gray-900">{course.completedLessons}</p>
                    <p className="text-xs text-gray-500">{language === 'id' ? 'Pelajaran Selesai' : 'Lessons Done'}</p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">{course.totalLessons - course.completedLessons}</p>
                    <p className="text-xs text-gray-500">{language === 'id' ? 'Tersisa' : 'Remaining'}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Certificate Card */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Sertifikat' : 'Certificate'}</CardTitle>
              </CardHeader>
              <div className="text-center py-4">
                {course.certificateEarned ? (
                  <>
                    <Award className="w-16 h-16 text-yellow-500 mx-auto mb-3" />
                    <p className="text-gray-600 mb-3">
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
                    <p className="text-gray-500 text-sm">
                      {language === 'id'
                        ? 'Selesaikan semua materi dan ujian akhir untuk mendapatkan sertifikat.'
                        : 'Complete all lessons and final exam to earn your certificate.'}
                    </p>
                  </>
                )}
              </div>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Sumber Daya' : 'Resources'}</CardTitle>
              </CardHeader>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Download className="w-5 h-5 text-blue-500" />
                  <span className="text-sm">{language === 'id' ? 'Materi Tambahan' : 'Supplementary Materials'}</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <FileText className="w-5 h-5 text-purple-500" />
                  <span className="text-sm">{language === 'id' ? 'Catatan Kursus' : 'Course Notes'}</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
