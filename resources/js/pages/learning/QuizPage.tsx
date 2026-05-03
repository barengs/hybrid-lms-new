import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  RotateCcw,
  Menu,
  X,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Progress, Skeleton } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number;
  questions: Question[];
}

type QuizState = 'intro' | 'taking' | 'result';

import { useGetCourseContentQuery, useGetLessonDetailQuery, useMarkLessonCompleteMutation } from '@/store/features/student/studentApiSlice';
import { toast } from 'react-hot-toast';

export function QuizPage() {
  const { slug = '', quizId } = useParams<{ slug: string; quizId: string }>();
  const [searchParams] = useSearchParams();
  const fromClass = searchParams.get('fromClass');
  const numericQuizId = Number(quizId);
  const { language } = useLanguage();
  const navigate = useNavigate();

  // API Queries
  const { data: course, isLoading: isLoadingCourse } = useGetCourseContentQuery(slug, { skip: !slug });
  const { data: remoteQuiz, isLoading: isLoadingQuiz, error } = useGetLessonDetailQuery(
    { slug, lessonId: numericQuizId },
    { skip: !slug || isNaN(numericQuizId) }
  );

  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);

  const [markComplete, { isLoading: isMarkingComplete }] = useMarkLessonCompleteMutation();

  // Parse quiz data from content JSON
  const quiz = useMemo(() => {
    if (!remoteQuiz?.content) return null;
    try {
      return JSON.parse(remoteQuiz.content);
    } catch (e) {
      console.error('Failed to parse quiz JSON', e);
      return null;
    }
  }, [remoteQuiz]);

  const totalQuestions = quiz?.questions?.length || 0;

  useEffect(() => {
    if (quiz && timeRemaining === 0) {
      setTimeRemaining(quiz.timeLimit * 60);
    }
  }, [quiz, timeRemaining]);

  // Timer
  useEffect(() => {
    let timer: any;
    if (quizState === 'taking' && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizState, timeRemaining]);

  const handleSelectAnswer = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    try {
      await markComplete({ slug, lessonId: numericQuizId }).unwrap();
      setQuizState('result');
      setShowResults(true);
    } catch (err) {
      console.error('Failed to submit quiz:', err);
      toast.error(language === 'id' ? 'Gagal menyimpan progres kuis' : 'Failed to save quiz progress');
      setQuizState('result');
      setShowResults(true);
    }
  };

  const handleStartQuiz = () => {
    setQuizState('taking');
    setTimeRemaining(quiz.timeLimit * 60);
  };

  const handleRetry = () => {
    setQuizState('intro');
    setAnswers({});
    setFlaggedQuestions(new Set());
    setCurrentQuestionIndex(0);
    setTimeRemaining(quiz.timeLimit * 60);
    setShowResults(false);
  };

  const handleNextLesson = async () => {
    if (remoteQuiz?.next_lesson_id && course) {
      // Find the next lesson object in the course content to check its type
      let nextLessonObj = null;
      for (const section of course.sections) {
        const found = section.lessons.find(l => l.id === remoteQuiz.next_lesson_id);
        if (found) {
          nextLessonObj = found;
          break;
        }
      }

      if (nextLessonObj?.type === 'quiz') {
        navigate(`/learn/${slug}/quiz/${remoteQuiz.next_lesson_id}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true });
      } else if (nextLessonObj?.type === 'assignment') {
        navigate(`/assignments/${remoteQuiz.next_lesson_id}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true });
      } else {
        navigate(`/learn/${slug}/lesson/${remoteQuiz.next_lesson_id}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true });
      }
    } else {
      // If no next lesson, go back to curriculum
      navigate(`/learn/${slug}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true });
    }
  };

  // Calculate score
  const calculateScore = () => {
    if (!quiz) return 0;
    let correct = 0;
    quiz.questions.forEach((question: Question) => {
      if (answers[question.id] === question.correctOptionId) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const score = calculateScore();
  const passed = quiz ? score >= quiz.passingScore : false;

  if (isLoadingCourse || isLoadingQuiz) {
    return (
      <DashboardLayout>
        <div className="flex h-[calc(100vh-80px)] -m-6">
          <div className="w-80 border-r border-gray-200 bg-white p-4 space-y-4">
             <Skeleton className="h-8 w-3/4" />
             {Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
          <div className="flex-1 p-16 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">{language === 'id' ? 'Memuat kuis...' : 'Loading quiz...'}</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !quiz) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {language === 'id' ? 'Kuis tidak ditemukan' : 'Quiz not found'}
          </h2>
          <Button onClick={() => navigate(`/learn/${slug}`)}>
            {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Curriculum'}
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  const renderContent = () => {
    // Intro Screen
    if (quizState === 'intro') {
      return (
        <div className="max-w-2xl mx-auto p-6">
          <Card className="text-center py-8">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{quiz.description}</p>

            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{quiz.questions.length}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Soal' : 'Questions'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{quiz.timeLimit}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Menit' : 'Minutes'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{quiz.passingScore}%</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Nilai Lulus' : 'Passing'}</p>
              </div>
            </div>

            <Button size="lg" onClick={handleStartQuiz}>
              {language === 'id' ? 'Mulai Quiz' : 'Start Quiz'}
            </Button>
          </Card>
        </div>
      );
    }

    // Result Screen
    if (quizState === 'result') {
      return (
        <div className="max-w-2xl mx-auto p-6">
          <Card className="text-center py-8">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {passed ? (
                <Award className="w-10 h-10 text-green-500" />
              ) : (
                <XCircle className="w-10 h-10 text-red-500" />
              )}
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {passed
                ? language === 'id'
                  ? 'Selamat! Anda Lulus!'
                  : 'Congratulations! You Passed!'
                : language === 'id'
                  ? 'Maaf, Anda Belum Lulus'
                  : 'Sorry, You Did Not Pass'}
            </h1>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {score}%
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Skor Anda' : 'Your Score'}</p>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {!passed && (
                <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={handleRetry}>
                  {language === 'id' ? 'Coba Lagi' : 'Try Again'}
                </Button>
              )}
              {passed ? (
                <Button 
                  onClick={handleNextLesson}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {language === 'id' ? 'Materi Berikutnya' : 'Next Lesson'}
                </Button>
              ) : (
                <button
                  onClick={() => navigate(`/learn/${slug}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true })}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
                >
                  {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Course'}
                </button>
              )}
            </div>
          </Card>
        </div>
      );
    }

    // Taking Quiz Screen
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining <= 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {language === 'id' ? 'Soal' : 'Question'} {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} size="sm" />
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.text}</h2>
                <div className="space-y-3">
                  {currentQuestion.options.map((option: { id: string; text: string }) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${answers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${answers[currentQuestion.id] === option.id
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                        }`}>
                        {answers[currentQuestion.id] === option.id && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <span className="text-gray-700">{option.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrev}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  {language === 'id' ? 'Sebelumnya' : 'Previous'}
                </Button>

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button variant="success" onClick={handleSubmit}>
                    {language === 'id' ? 'Selesai & Kirim' : 'Finish & Submit'}
                  </Button>
                ) : (
                  <Button onClick={handleNext} rightIcon={<ChevronRight className="w-4 h-4" />}>
                    {language === 'id' ? 'Berikutnya' : 'Next'}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                {language === 'id' ? 'Navigasi Soal' : 'Question Navigator'}
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {quiz.questions.map((question: Question, index: number) => {
                  const isAnswered = !!answers[question.id];
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${isCurrent
                        ? 'bg-blue-600 text-white'
                        : isAnswered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  };

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
                      onClick={() => navigate(`/learn/${slug}/lesson/${item.id}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true })}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${item.id === numericQuizId
                        ? 'bg-blue-50 text-blue-700'
                        : 'hover:bg-gray-50 text-gray-700'
                        }`}
                    >
                      <div
                        className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${item.is_completed
                          ? 'bg-green-500 text-white'
                          : item.id === numericQuizId
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
                >
                  <Menu className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => navigate(`/learn/${slug}${fromClass ? `?fromClass=${fromClass}` : ''}`, { replace: true })}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'id' ? 'Kembali ke Kurikulum' : 'Back to Curriculum'}
                </span>
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
