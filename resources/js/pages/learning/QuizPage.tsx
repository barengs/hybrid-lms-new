import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Progress } from '@/components/ui';
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

// Mock quiz data
const mockQuiz: Quiz = {
  id: 'quiz-4-6',
  title: 'Module 4 Quiz: Advanced Hooks',
  description: 'Test your understanding of advanced React hooks including useContext, useReducer, useRef, useMemo, and custom hooks.',
  timeLimit: 15,
  passingScore: 70,
  questions: [
    {
      id: 'q1',
      text: 'What is the primary purpose of the useRef hook?',
      options: [
        { id: 'a', text: 'To manage component state' },
        { id: 'b', text: 'To persist values between renders without causing re-renders' },
        { id: 'c', text: 'To handle side effects' },
        { id: 'd', text: 'To create context providers' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'q2',
      text: 'When should you use useMemo?',
      options: [
        { id: 'a', text: 'For all computations in a component' },
        { id: 'b', text: 'Only for expensive calculations that don\'t need to run on every render' },
        { id: 'c', text: 'To store DOM references' },
        { id: 'd', text: 'To replace useState' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'q3',
      text: 'What does useReducer return?',
      options: [
        { id: 'a', text: 'A single state value' },
        { id: 'b', text: 'An array with state and a dispatch function' },
        { id: 'c', text: 'A function to update state' },
        { id: 'd', text: 'A context provider' },
      ],
      correctOptionId: 'b',
    },
    {
      id: 'q4',
      text: 'What is the correct way to access a ref\'s current value?',
      options: [
        { id: 'a', text: 'ref.value' },
        { id: 'b', text: 'ref()' },
        { id: 'c', text: 'ref.current' },
        { id: 'd', text: 'useRef.current' },
      ],
      correctOptionId: 'c',
    },
    {
      id: 'q5',
      text: 'Which hook is best for sharing state across multiple components without prop drilling?',
      options: [
        { id: 'a', text: 'useState' },
        { id: 'b', text: 'useEffect' },
        { id: 'c', text: 'useContext' },
        { id: 'd', text: 'useRef' },
      ],
      correctOptionId: 'c',
    },
  ],
};

export function QuizPage() {
  const { courseId, quizId } = useParams<{ courseId: string; quizId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [quizState, setQuizState] = useState<QuizState>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(mockQuiz.timeLimit * 60);
  const [showResults, setShowResults] = useState(false);

  // In real app, fetch quiz by id
  const quiz = mockQuiz;
  console.log('Course ID:', courseId, 'Quiz ID:', quizId);

  // Timer
  useEffect(() => {
    let timer: number;
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

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

  const handleSubmit = () => {
    setQuizState('result');
    setShowResults(true);
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

  // Calculate score
  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question) => {
      if (answers[question.id] === question.correctOptionId) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const score = calculateScore();
  const passed = score >= quiz.passingScore;

  // Intro Screen
  if (quizState === 'intro') {
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

            <div className="bg-blue-50 p-4 rounded-lg mb-6 max-w-md mx-auto text-left">
              <h3 className="font-medium text-blue-900 mb-2">
                {language === 'id' ? 'Petunjuk:' : 'Instructions:'}
              </h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• {language === 'id' ? 'Baca setiap soal dengan teliti' : 'Read each question carefully'}</li>
                <li>• {language === 'id' ? 'Pilih satu jawaban untuk setiap soal' : 'Select one answer for each question'}</li>
                <li>• {language === 'id' ? 'Anda dapat menandai soal untuk ditinjau nanti' : 'You can flag questions to review later'}</li>
                <li>• {language === 'id' ? 'Quiz akan otomatis dikirim saat waktu habis' : 'Quiz will auto-submit when time runs out'}</li>
              </ul>
            </div>

            <Button size="lg" onClick={handleStartQuiz}>
              {language === 'id' ? 'Mulai Quiz' : 'Start Quiz'}
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Result Screen
  if (quizState === 'result') {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
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

            <p className="text-gray-600 mb-6">
              {passed
                ? language === 'id'
                  ? 'Anda telah berhasil menyelesaikan quiz ini.'
                  : 'You have successfully completed this quiz.'
                : language === 'id'
                  ? 'Silakan coba lagi untuk meningkatkan skor Anda.'
                  : 'Please try again to improve your score.'}
            </p>

            <div className="flex justify-center gap-8 mb-8">
              <div className="text-center">
                <p className={`text-5xl font-bold ${passed ? 'text-green-600' : 'text-red-600'}`}>
                  {score}%
                </p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Skor Anda' : 'Your Score'}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-bold text-gray-400">{quiz.passingScore}%</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Nilai Lulus' : 'Passing Score'}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6 max-w-md mx-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'id' ? 'Benar' : 'Correct'}:</span>
                  <span className="font-medium text-green-600">
                    {quiz.questions.filter((q) => answers[q.id] === q.correctOptionId).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'id' ? 'Salah' : 'Wrong'}:</span>
                  <span className="font-medium text-red-600">
                    {quiz.questions.filter((q) => answers[q.id] && answers[q.id] !== q.correctOptionId).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'id' ? 'Tidak Dijawab' : 'Unanswered'}:</span>
                  <span className="font-medium text-gray-600">
                    {quiz.questions.filter((q) => !answers[q.id]).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{language === 'id' ? 'Total Soal' : 'Total'}:</span>
                  <span className="font-medium">{quiz.questions.length}</span>
                </div>
              </div>
            </div>

            {/* Answer Review */}
            <div className="text-left mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">
                {language === 'id' ? 'Tinjauan Jawaban' : 'Answer Review'}
              </h3>
              <div className="space-y-4">
                {quiz.questions.map((question, index) => {
                  const userAnswer = answers[question.id];
                  const isCorrect = userAnswer === question.correctOptionId;
                  return (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${isCorrect ? 'bg-green-500' : 'bg-red-500'
                          } text-white text-xs font-medium`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 mb-2">{question.text}</p>
                          <div className="space-y-1 text-sm">
                            <p className="text-gray-600">
                              <span className="font-medium">{language === 'id' ? 'Jawaban Anda:' : 'Your answer:'}</span>{' '}
                              <span className={isCorrect ? 'text-green-600' : 'text-red-600'}>
                                {question.options.find((o) => o.id === userAnswer)?.text || '-'}
                              </span>
                            </p>
                            {!isCorrect && (
                              <p className="text-gray-600">
                                <span className="font-medium">{language === 'id' ? 'Jawaban benar:' : 'Correct answer:'}</span>{' '}
                                <span className="text-green-600">
                                  {question.options.find((o) => o.id === question.correctOptionId)?.text}
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center gap-3">
              {!passed && (
                <Button variant="outline" leftIcon={<RotateCcw className="w-4 h-4" />} onClick={handleRetry}>
                  {language === 'id' ? 'Coba Lagi' : 'Try Again'}
                </Button>
              )}
              <Link
                to={`/learn/${courseId}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
              >
                {language === 'id' ? 'Kembali ke Kursus' : 'Back to Course'}
              </Link>
            </div>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  // Taking Quiz Screen
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${timeRemaining <= 60 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
            <Clock className="w-5 h-5" />
            <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
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
                    {language === 'id' ? 'Soal' : 'Question'} {currentQuestionIndex + 1} / {quiz.questions.length}
                  </span>
                  <span className="text-gray-600">
                    {Object.keys(answers).length} {language === 'id' ? 'dijawab' : 'answered'}
                  </span>
                </div>
                <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} size="sm" />
              </div>

              {/* Question */}
              <div className="mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <h2 className="text-lg font-medium text-gray-900">{currentQuestion.text}</h2>
                  <button
                    onClick={handleToggleFlag}
                    className={`p-2 rounded-lg transition-colors ${flaggedQuestions.has(currentQuestion.id)
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

                {currentQuestionIndex === quiz.questions.length - 1 ? (
                  <Button
                    variant="success"
                    onClick={handleSubmit}
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
                {quiz.questions.map((question, index) => {
                  const isAnswered = !!answers[question.id];
                  const isFlagged = flaggedQuestions.has(question.id);
                  const isCurrent = index === currentQuestionIndex;

                  return (
                    <button
                      key={question.id}
                      onClick={() => handleJumpToQuestion(index)}
                      className={`relative w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all ${isCurrent
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

              <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-100" />
                  <span className="text-gray-600">{language === 'id' ? 'Dijawab' : 'Answered'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100" />
                  <span className="text-gray-600">{language === 'id' ? 'Belum dijawab' : 'Unanswered'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Flag className="w-4 h-4 text-yellow-500" />
                  <span className="text-gray-600">{language === 'id' ? 'Ditandai' : 'Flagged'}</span>
                </div>
              </div>

              <Button
                variant="danger"
                className="w-full mt-4"
                onClick={handleSubmit}
              >
                {language === 'id' ? 'Selesai & Kirim' : 'Finish & Submit'}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
