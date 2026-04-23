import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  FileText,
  Download,
  Clock,
  X,
  Menu,
  AlertCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Skeleton } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { 
  useGetCourseContentQuery, 
  useGetLessonDetailQuery, 
  useMarkLessonCompleteMutation 
} from '@/store/features/student/studentApiSlice';

export function LessonPage() {
  const { slug = '', lessonId } = useParams<{ slug: string; lessonId: string }>();
  const numericLessonId = Number(lessonId);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);

  // Queries & Mutations
  const { data: course, isLoading: isLoadingCourse } = useGetCourseContentQuery(slug, { skip: !slug });
  
  const queryParams = useMemo(() => ({ slug, lessonId: numericLessonId }), [slug, numericLessonId]);
  
  const { data: lesson, isLoading: isLoadingLesson, error, isFetching } = useGetLessonDetailQuery(
    queryParams,
    { skip: !slug || isNaN(numericLessonId) || numericLessonId <= 0 }
  );

  console.log('DEBUG LessonPage:', { 
    slug, 
    lessonId, 
    numericLessonId, 
    hasLesson: !!lesson, 
    isLoadingLesson, 
    isFetching,
    error 
  });
  const [markComplete, { isLoading: isMarkingComplete }] = useMarkLessonCompleteMutation();

  const handleMarkComplete = async () => {
    if (!slug || !numericLessonId) return;
    try {
      await markComplete({ slug, lessonId: numericLessonId }).unwrap();
    } catch (err) {
      console.error('Failed to mark lesson as complete:', err);
    }
  };

  const handleNextLesson = async () => {
    // Auto mark complete when going to next
    if (!lesson?.is_completed) {
      await handleMarkComplete();
    }
    
    if (lesson?.next_lesson_id && course) {
      // Find the next lesson object in the course content to check its type
      let nextLessonObj = null;
      for (const section of course.sections) {
        const found = section.lessons.find(l => l.id === lesson.next_lesson_id);
        if (found) {
          nextLessonObj = found;
          break;
        }
      }

      if (nextLessonObj?.type === 'quiz') {
        navigate(`/learn/${slug}/quiz/${lesson.next_lesson_id}`);
      } else if (nextLessonObj?.type === 'assignment') {
        navigate(`/assignments/${lesson.next_lesson_id}`);
      } else {
        navigate(`/learn/${slug}/lesson/${lesson.next_lesson_id}`);
      }
    } else {
      // If no next lesson, go back to curriculum
      navigate(`/learn/${slug}`);
    }
  };

  const handlePrevLesson = () => {
    if (lesson?.prev_lesson_id) {
      navigate(`/learn/${slug}/lesson/${lesson.prev_lesson_id}`);
    }
  };

  if (isLoadingCourse || isLoadingLesson) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-80px)] -m-6">
          <div className="w-80 border-r border-gray-200 bg-white p-4 space-y-4">
             <Skeleton className="h-8 w-3/4" />
             {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
          <div className="flex-1 p-6 space-y-6">
             <Skeleton className="h-12 w-full" />
             <Skeleton className="h-[400px] w-full" />
             <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !lesson) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto text-center py-16">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'id' ? 'Materi tidak ditemukan' : 'Lesson not found'}
          </h2>
          <Button onClick={() => navigate(`/learn/${slug}`)}>
            {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Curriculum'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] -m-6">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <h3 className="font-semibold text-gray-900 truncate">
                {course?.title || (language === 'id' ? 'Daftar Materi' : 'Lesson List')}
              </h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label="Close sidebar"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-2">
              {course?.sections.map((section) => (
                <div key={section.id} className="mb-4">
                  <h4 className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h4>
                  {section.lessons.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => navigate(`/learn/${slug}/lesson/${item.id}`)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${item.id === numericLessonId
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${item.is_completed
                          ? 'bg-green-500 text-white'
                          : item.id === numericLessonId
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                          }`}
                      >
                        {item.is_completed ? <CheckCircle className="w-4 h-4" /> : ''}
                      </div>
                      <span className="text-sm truncate">{item.title}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                  aria-label="Show sidebar"
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <Link
                to={`/learn/${slug}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Curriculum'}
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!lesson.prev_lesson_id}
                onClick={handlePrevLesson}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">{language === 'id' ? 'Sebelumnya' : 'Previous'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!lesson.next_lesson_id}
                onClick={handleNextLesson}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">{language === 'id' ? 'Berikutnya' : 'Next'}</span>
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto bg-gray-50">
            <div className="max-w-4xl mx-auto p-6">
              {/* Lesson Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                  <Badge variant="secondary" size="sm">
                    {lesson.type.toUpperCase()}
                  </Badge>
                  {lesson.duration > 0 && (
                    <>
                      <span>•</span>
                      <Clock className="w-4 h-4" />
                      <span>{lesson.duration} min</span>
                    </>
                  )}
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              </div>

              {/* Video Player */}
              {lesson.type === 'video' && lesson.video_url && (
                <Card className="mb-6 overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe
                      src={lesson.video_url.includes('youtube.com/embed') ? lesson.video_url : `https://www.youtube.com/embed/${lesson.video_url}`}
                      title={lesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Card>
              )}

              {/* Content */}
              {lesson.content && (
                <Card className="mb-6">
                  <div className="prose prose-sm max-w-none">
                    <div className="text-sm text-gray-700 leading-relaxed dangerously-html" dangerouslySetInnerHTML={{ __html: lesson.content }}>
                    </div>
                  </div>
                </Card>
              )}

              {/* Attachments */}
              {lesson.attachments && lesson.attachments.length > 0 && (
                <Card className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {language === 'id' ? 'Lampiran' : 'Attachments'}
                  </h3>
                  <div className="space-y-2">
                    {lesson.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">{file.file_name}</p>
                            <p className="text-xs text-gray-500">{(file.file_size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <a href={`${import.meta.env.VITE_URL_API_IMAGE}/${file.file_path}`} target="_blank" rel="noreferrer">
                          <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                            {language === 'id' ? 'Unduh' : 'Download'}
                          </Button>
                        </a>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200 mb-8">
                <div className="flex items-center gap-3">
                  {lesson.next_lesson_id ? (
                    <Button
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={handleNextLesson}
                      isLoading={isMarkingComplete}
                    >
                      {language === 'id' ? 'Berikutnya' : 'Next'}
                    </Button>
                  ) : !lesson.is_completed ? (
                    <Button
                      variant="success"
                      onClick={handleMarkComplete}
                      isLoading={isMarkingComplete}
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                    >
                      {language === 'id' ? 'Selesaikan Materi' : 'Finish Lesson'}
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => navigate(`/learn/${slug}`)}
                    >
                      {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Curriculum'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
