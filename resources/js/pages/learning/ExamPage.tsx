import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Flag,
  Award,
  RotateCcw,
  Shield,
  BookOpen,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Progress, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

interface Question {
  id: string;
  text: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
  points: number;
}

interface Exam {
  id: string;
  courseId: string;
  courseTitle: string;
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  totalPoints: number;
  questions: Question[];
  attempts: number;
  maxAttempts: number;
}

type ExamState = 'intro' | 'taking' | 'result';

// Mock exam data
const mockExam: Exam = {
  id: 'exam-1',
  courseId: 'course-1',
  courseTitle: 'React Masterclass: From Zero to Hero',
  title: 'Final Course Exam',
  description: 'This comprehensive exam covers all topics from the React Masterclass course. You must pass this exam to earn your certificate.',
  timeLimit: 60,
  passingScore: 75,
  totalPoints: 100,
  attempts: 0,
  maxAttempts: 3,
  questions: [
    {
      id: 'eq1',
      text: 'What is the Virtual DOM in React?',
      options: [
        { id: 'a', text: 'A direct copy of the real DOM' },
        { id: 'b', text: 'A lightweight JavaScript representation of the real DOM' },
        { id: 'c', text: 'A browser extension for React' },
        { id: 'd', text: 'A CSS framework for React' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq2',
      text: 'Which hook is used to perform side effects in functional components?',
      options: [
        { id: 'a', text: 'useState' },
        { id: 'b', text: 'useContext' },
        { id: 'c', text: 'useEffect' },
        { id: 'd', text: 'useReducer' },
      ],
      correctOptionId: 'c',
      points: 10,
    },
    {
      id: 'eq3',
      text: 'What is the correct way to update state based on the previous state?',
      options: [
        { id: 'a', text: 'setState(state + 1)' },
        { id: 'b', text: 'setState(prevState => prevState + 1)' },
        { id: 'c', text: 'state = state + 1' },
        { id: 'd', text: 'this.state = newState' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq4',
      text: 'What is the purpose of the key prop in React lists?',
      options: [
        { id: 'a', text: 'To style list items' },
        { id: 'b', text: 'To help React identify which items have changed' },
        { id: 'c', text: 'To sort list items' },
        { id: 'd', text: 'To filter list items' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq5',
      text: 'Which of the following is NOT a valid React hook rule?',
      options: [
        { id: 'a', text: 'Only call hooks at the top level' },
        { id: 'b', text: 'Only call hooks from React functions' },
        { id: 'c', text: 'Hooks can be called inside loops' },
        { id: 'd', text: 'Custom hooks should start with "use"' },
      ],
      correctOptionId: 'c',
      points: 10,
    },
    {
      id: 'eq6',
      text: 'What is prop drilling in React?',
      options: [
        { id: 'a', text: 'A way to optimize props' },
        { id: 'b', text: 'Passing props through multiple component levels' },
        { id: 'c', text: 'A debugging technique' },
        { id: 'd', text: 'A testing methodology' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq7',
      text: 'Which pattern is used to share stateful logic between components?',
      options: [
        { id: 'a', text: 'Higher-Order Components or Custom Hooks' },
        { id: 'b', text: 'Inline styles' },
        { id: 'c', text: 'CSS modules' },
        { id: 'd', text: 'SVG components' },
      ],
      correctOptionId: 'a',
      points: 10,
    },
    {
      id: 'eq8',
      text: 'What does useCallback hook return?',
      options: [
        { id: 'a', text: 'A memoized value' },
        { id: 'b', text: 'A memoized callback function' },
        { id: 'c', text: 'A state variable' },
        { id: 'd', text: 'A ref object' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq9',
      text: 'In Redux, what is the only way to change the state?',
      options: [
        { id: 'a', text: 'Directly modifying the state object' },
        { id: 'b', text: 'Dispatching an action' },
        { id: 'c', text: 'Calling a reducer directly' },
        { id: 'd', text: 'Using setState' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
    {
      id: 'eq10',
      text: 'What is the purpose of React.memo()?',
      options: [
        { id: 'a', text: 'To create a memory leak' },
        { id: 'b', text: 'To memoize a component and prevent unnecessary re-renders' },
        { id: 'c', text: 'To store component state' },
        { id: 'd', text: 'To create a new component' },
      ],
      correctOptionId: 'b',
      points: 10,
    },
  ],
};

export function ExamPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  
  const [examState, setExamState] = useState<ExamState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(mockExam.timeLimit * 60);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  // In real app, fetch exam by courseId
  const exam = mockExam;
  console.log('Course ID:', courseId);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examState === 'taking' && timeRemaining > 0) {
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
  }, [examState, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = exam.questions[currentQuestionIndex];

  const handleSelectAnswer = (optionId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const handleToggleFlag = () => {
    setFlaggedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < exam.questions.length - 1) {
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

  const handleSubmit = () => {
    setShowConfirmSubmit(false);
    setExamState('result');
  };

  const handleStartExam = () => {
    setExamState('taking');
    setTimeRemaining(exam.timeLimit * 60);
  };

  // Calculate score
  const calculateScore = () => {
    let points = 0;
    exam.questions.forEach((question) => {
      if (answers[question.id] === question.correctOptionId) {
        points += question.points;
      }
    });
    return points;
  };

  const score = calculateScore();
  const percentage = Math.round((score / exam.totalPoints) * 100);
  const passed = percentage >= exam.passingScore;

  // Intro Screen
  if (examState === 'intro') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Link
            to={`/learn/${courseId}`}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali ke Kursus' : 'Back to Course'}
          </Link>

          <Card className="text-center py-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-10 h-10 text-red-500" />
            </div>
            <Badge variant="danger" size="lg" className="mb-4">
              {language === 'id' ? 'Ujian Akhir' : 'Final Exam'}
            </Badge>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{exam.courseTitle}</h1>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{exam.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-lg mx-auto mb-8">
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{exam.questions.length}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Soal' : 'Questions'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{exam.timeLimit}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Menit' : 'Minutes'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{exam.passingScore}%</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Nilai Lulus' : 'Passing'}</p>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-gray-900">{exam.maxAttempts - exam.attempts}</p>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Percobaan' : 'Attempts'}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">
                    {language === 'id' ? 'Peringatan Penting' : 'Important Notice'}
                  </h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• {language === 'id' ? 'Ujian ini menentukan kelulusan Anda' : 'This exam determines your course completion'}</li>
                    <li>• {language === 'id' ? `Anda memiliki ${exam.maxAttempts} kesempatan untuk lulus` : `You have ${exam.maxAttempts} attempts to pass`}</li>
                    <li>• {language === 'id' ? 'Pastikan koneksi internet stabil' : 'Ensure stable internet connection'}</li>
                    <li>• {language === 'id' ? 'Ujian tidak dapat dijeda setelah dimulai' : 'Exam cannot be paused once started'}</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                to={`/learn/${courseId}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
              >
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Link>
              <Button
                size="lg"
                variant="danger"
                leftIcon={<Shield className="w-5 h-5" />}
                onClick={handleStartExam}
              >
                {language === 'id' ? 'Mulai Ujian' : 'Start Exam'}
              </Button>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Result Screen
  if (examState === 'result') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <Card className="text-center py-8">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${
              passed ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {passed ? (
                <Award className="w-12 h-12 text-green-500" />
              ) : (
                <XCircle className="w-12 h-12 text-red-500" />
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {passed
                ? language === 'id'
                  ? 'Selamat! Anda Lulus!'
                  : 'Congratulations! You Passed!'
                : language === 'id'
                ? 'Maaf, Anda Belum Lulus'
                : 'Sorry, You Did Not Pass'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {passed
                ? language === 'id'
                  ? 'Anda telah berhasil menyelesaikan ujian akhir kursus ini. Sertifikat Anda sudah siap!'
                  : 'You have successfully completed the final exam. Your certificate is ready!'
                : language === 'id'
                ? `Anda memiliki ${exam.maxAttempts - exam.attempts - 1} kesempatan tersisa.`
                : `You have ${exam.maxAttempts - exam.attempts - 1} attempts remaining.`}
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className={`text-6xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {percentage}%
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Skor Anda' : 'Your Score'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-sm mx-auto">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {exam.questions.filter((q) => answers[q.id] === q.correctOptionId).length}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Benar' : 'Correct'}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-red-600">
                    {exam.questions.filter((q) => answers[q.id] && answers[q.id] !== q.correctOptionId).length}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Salah' : 'Wrong'}</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {score}/{exam.totalPoints}
                  </p>
                  <p className="text-xs text-gray-500">{language === 'id' ? 'Poin' : 'Points'}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {passed ? (
                <Link
                  to="/certificates"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-medium bg-green-600 text-white hover:bg-green-700 rounded-lg transition-all"
                >
                  <Award className="w-5 h-5" />
                  {language === 'id' ? 'Lihat Sertifikat' : 'View Certificate'}
                </Link>
              ) : (
                <>
                  <Link
                    to={`/learn/${courseId}`}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
                  >
                    <BookOpen className="w-4 h-4" />
                    {language === 'id' ? 'Pelajari Lagi' : 'Study Again'}
                  </Link>
                  {exam.attempts < exam.maxAttempts - 1 && (
                    <Button
                      variant="danger"
                      leftIcon={<RotateCcw className="w-4 h-4" />}
                      onClick={() => {
                        setExamState('intro');
                        setAnswers({});
                        setFlaggedQuestions(new Set());
                        setCurrentQuestionIndex(0);
                        setTimeRemaining(exam.timeLimit * 60);
                      }}
                    >
                      {language === 'id' ? 'Coba Lagi' : 'Try Again'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Taking Exam Screen
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <Badge variant="danger" size="sm" className="mb-1">
              {language === 'id' ? 'Ujian Akhir' : 'Final Exam'}
            </Badge>
            <h1 className="text-xl font-bold text-gray-900">{exam.courseTitle}</h1>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            timeRemaining <= 300 ? 'bg-red-100 text-red-700 animate-pulse' : 'bg-gray-100 text-gray-700'
          }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold text-lg">{formatTime(timeRemaining)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Area */}
          <div className="lg:col-span-3">
            <Card>
              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">
                    {language === 'id' ? 'Soal' : 'Question'} {currentQuestionIndex + 1} / {exam.questions.length}
                  </span>
                  <Badge variant="secondary" size="sm">
                    {currentQuestion.points} {language === 'id' ? 'poin' : 'points'}
                  </Badge>
                </div>
                <Progress value={((currentQuestionIndex + 1) / exam.questions.length) * 100} size="sm" />
              </div>

              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-lg font-medium text-gray-900">{currentQuestion.text}</h2>
                  <button
                    onClick={handleToggleFlag}
                    className={`p-2 rounded-lg transition-colors ${
                      flaggedQuestions.has(currentQuestion.id)
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'hover:bg-gray-100 text-gray-400'
                    }`}
                    aria-label="Flag question"
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                </div>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(option.id)}
                      className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 text-left transition-all ${
                        answers[currentQuestion.id] === option.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        answers[currentQuestion.id] === option.id
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

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Button
                  variant="outline"
                  disabled={currentQuestionIndex === 0}
                  onClick={handlePrev}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  {language === 'id' ? 'Sebelumnya' : 'Previous'}
                </Button>
                
                {currentQuestionIndex === exam.questions.length - 1 ? (
                  <Button
                    variant="danger"
                    onClick={() => setShowConfirmSubmit(true)}
                  >
                    {language === 'id' ? 'Selesai & Kirim' : 'Finish & Submit'}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    rightIcon={<ChevronRight className="w-4 h-4" />}
                  >
                    {language === 'id' ? 'Berikutnya' : 'Next'}
                  </Button>
                )}
              </div>
            </Card>
          </div>

          {/* Question Navigator */}
          <div className="lg:col-span-1">
            <Card>
              <h3 className="font-semibold text-gray-900 mb-4">
                {language === 'id' ? 'Navigasi Soal' : 'Question Navigator'}
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {exam.questions.map((question, index) => {
                  const isAnswered = !!answers[question.id];
                  const isFlagged = flaggedQuestions.has(question.id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={question.id}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white'
                          : isAnswered
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <Flag className="absolute -top-1 -right-1 w-3 h-3 text-yellow-500" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">{Object.keys(answers).length}</span> / {exam.questions.length}{' '}
                  {language === 'id' ? 'dijawab' : 'answered'}
                </div>
                <Button
                  variant="danger"
                  className="w-full"
                  onClick={() => setShowConfirmSubmit(true)}
                >
                  {language === 'id' ? 'Selesai & Kirim' : 'Finish & Submit'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Confirm Submit Modal */}
        <Modal
          isOpen={showConfirmSubmit}
          onClose={() => setShowConfirmSubmit(false)}
          title={language === 'id' ? 'Konfirmasi Pengiriman' : 'Confirm Submission'}
          size="md"
        >
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              {language === 'id'
                ? 'Apakah Anda yakin ingin mengirim ujian ini? Anda tidak dapat mengubah jawaban setelah dikirim.'
                : 'Are you sure you want to submit this exam? You cannot change your answers after submission.'}
            </p>
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{Object.keys(answers).length}</span> / {exam.questions.length}{' '}
                {language === 'id' ? 'soal dijawab' : 'questions answered'}
              </p>
              {Object.keys(answers).length < exam.questions.length && (
                <p className="text-sm text-yellow-600 mt-1">
                  {language === 'id'
                    ? `${exam.questions.length - Object.keys(answers).length} soal belum dijawab`
                    : `${exam.questions.length - Object.keys(answers).length} questions unanswered`}
                </p>
              )}
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowConfirmSubmit(false)}>
                {language === 'id' ? 'Kembali' : 'Go Back'}
              </Button>
              <Button variant="danger" onClick={handleSubmit}>
                {language === 'id' ? 'Ya, Kirim Ujian' : 'Yes, Submit Exam'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
