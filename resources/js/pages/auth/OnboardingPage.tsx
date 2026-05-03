import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Loader2, 
  ChevronRight,
  Code,
  Briefcase,
  Palette,
  Target,
  Coins,
  Play,
  Wrench,
  Book,
  MessageSquare,
  RefreshCw,
  TrendingUp,
  Heart,
  Award,
  Zap,
  Activity,
  Cpu,
  Clock,
  Calendar
} from 'lucide-react';
import { Button, Card, Badge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useGetOnboardingQuestionsQuery, useSubmitOnboardingInterestsMutation } from '@/store/features/student/studentApiSlice';
import { useAppDispatch } from '@/store';
import { updateOnboardingStatus } from '@/store/features/auth/authSlice';

// Icon mapping for options
const iconMap: Record<string, any> = {
  Code, Briefcase, Palette, Target, Coins,
  Play, Wrench, Book, MessageSquare,
  RefreshCw, TrendingUp, Heart, Award,
  Zap, Activity, Cpu, Clock, Calendar
};

interface Option {
  value: string;
  label: string;
  icon: string;
}

interface Question {
  id: string;
  question: string;
  options: Option[];
}

interface Recommendation {
  courses: any[];
  reasoning: string;
}

export function OnboardingPage() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const [step, setStep] = useState<'intro' | 'questions' | 'loading' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: questions = [], isLoading: isQuestionsLoading } = useGetOnboardingQuestionsQuery();
  const [submitInterests] = useSubmitOnboardingInterestsMutation();

  if (isQuestionsLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="mt-4 text-slate-600">Memuat pertanyaan...</p>
      </div>
    );
  }

  const handleStart = () => setStep('questions');

  const handleAnswer = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    if (currentQuestionIndex < questions.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
      }, 300);
    } else {
      // Calculate final answers including the last one
      const finalAnswers = { ...answers, [questionId]: value };
      handleSubmit(finalAnswers);
    }
  };

  const handleSubmit = async (finalAnswers: Record<string, string>) => {
    setStep('loading');
    setError(null);
    try {
      const result = await submitInterests({ 
        answers: Object.entries(finalAnswers).map(([id, value]) => ({ id, value })) 
      }).unwrap();
      
      // Update local state so Dashboard doesn't redirect back
      dispatch(updateOnboardingStatus(true));
      
      setRecommendation(result.data);
      setStep('results');
    } catch (err: any) {
      console.error('Failed to submit interests', err);
      setError(err?.data?.message || 'Terjadi kesalahan sistem saat memproses minat Anda.');
      setStep('results'); // Still go to results but will show error
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        {step === 'intro' && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              {language === 'id' ? 'Selamat Datang di Masa Depan Belajarmu!' : 'Welcome to Your Learning Future!'}
            </h1>
            <p className="text-lg text-slate-600 mb-10 leading-relaxed">
              {language === 'id' 
                ? 'Bantu AI kami memahami minatmu agar kami bisa merekomendasikan kursus yang paling cocok untuk kariermu.' 
                : 'Help our AI understand your interests so we can recommend the perfect courses for your career.'}
            </p>
            <Button size="lg" className="px-10 py-6 text-lg rounded-full" onClick={handleStart}>
              {language === 'id' ? 'Mulai Personalisasi' : 'Start Personalization'}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <button 
              onClick={() => navigate('/dashboard')}
              className="block mx-auto mt-6 text-slate-400 hover:text-slate-600 transition-colors text-sm"
            >
              {language === 'id' ? 'Lewati dan masuk ke Dashboard' : 'Skip and go to Dashboard'}
            </button>
          </div>
        )}

        {step === 'questions' && currentQuestion && (
          <div className="animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-8">
              <span className="text-sm font-medium text-blue-600 uppercase tracking-wider">
                {language === 'id' ? 'Langkah' : 'Step'} {currentQuestionIndex + 1} {language === 'id' ? 'dari' : 'of'} {questions.length}
              </span>
              <div className="flex gap-1">
                {questions.map((_, i) => (
                  <div 
                    key={i} 
                    className={`h-1.5 w-8 rounded-full transition-all duration-300 ${i <= currentQuestionIndex ? 'bg-blue-600' : 'bg-slate-200'}`} 
                  />
                ))}
              </div>
            </div>

            <h2 className="text-3xl font-bold text-slate-900 mb-10">
              {currentQuestion.question}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                const Icon = iconMap[option.icon] || Sparkles;
                const isSelected = answers[currentQuestion.id] === option.value;
                
                return (
                  <button
                    key={option.value}
                    onClick={() => handleAnswer(currentQuestion.id, option.value)}
                    className={`
                      group flex items-center gap-4 p-6 rounded-2xl border-2 text-left transition-all duration-200
                      ${isSelected 
                        ? 'border-blue-600 bg-blue-50 ring-4 ring-blue-100' 
                        : 'border-white bg-white hover:border-blue-200 hover:shadow-lg shadow-sm'}
                    `}
                  >
                    <div className={`
                      p-3 rounded-xl transition-colors
                      ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-blue-100 group-hover:text-blue-600'}
                    `}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-lg font-semibold ${isSelected ? 'text-blue-900' : 'text-slate-700'}`}>
                      {option.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 'loading' && (
          <div className="text-center py-20">
            <div className="relative mb-10">
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse" />
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto relative z-10" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4 animate-bounce">
              {language === 'id' ? 'AI sedang menganalisis minatmu...' : 'AI is analyzing your interests...'}
            </h2>
            <p className="text-slate-500">
              {language === 'id' 
                ? 'Kami sedang mencocokkan profilmu dengan ribuan materi belajar dan tren industri saat ini.' 
                : 'We are matching your profile with thousands of learning materials and current industry trends.'}
            </p>
          </div>
        )}

        {step === 'results' && (
          <div className="animate-in fade-in duration-700">
            {error ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Activity className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Oops! Ada kendala sedikit</h2>
                <p className="text-slate-600 mb-8">{error}</p>
                <Button size="lg" onClick={() => navigate('/dashboard')}>
                  Lanjut ke Dashboard
                </Button>
              </div>
            ) : recommendation ? (
              <>
                <div className="text-center mb-10">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-full text-sm font-medium mb-4">
                    <CheckCircle2 className="w-4 h-4" />
                    {language === 'id' ? 'Analisis Selesai' : 'Analysis Complete'}
                  </div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-4">
                    {language === 'id' ? 'Rekomendasi Spesial Untukmu' : 'Special Recommendations For You'}
                  </h2>
                  <p className="text-slate-600 max-w-lg mx-auto italic">
                    "{recommendation.reasoning}"
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 mb-10">
                  {recommendation.courses.map((course, idx) => (
                    <Card 
                      key={course.id} 
                      className="p-5 flex flex-col md:flex-row gap-6 hover:shadow-xl transition-all duration-300 border-none shadow-md group overflow-hidden relative"
                    >
                      <div className="absolute top-0 right-0 p-3">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none">
                          {course.category?.name || 'General'}
                        </Badge>
                      </div>
                      
                      <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0">
                        <img 
                          src={course.thumbnail || '/placeholder-course.png'} 
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      
                      <div className="flex-1 flex flex-col justify-center">
                        <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                          {course.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {course.instructor?.name || 'Instructor'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Activity className="w-4 h-4" />
                            {course.level || 'Beginner'}
                          </div>
                        </div>
                        <Button 
                          onClick={() => navigate(`/course/${course.slug}`)}
                          className="w-fit"
                        >
                          {language === 'id' ? 'Lihat Kursus' : 'View Course'}
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Button size="lg" className="w-full md:w-auto px-12" onClick={() => navigate('/dashboard')}>
                    {language === 'id' ? 'Masuk ke Dashboard' : 'Go to Dashboard'}
                  </Button>
                  <p className="text-slate-400 text-sm">
                    {language === 'id' ? 'Rekomendasi ini akan selalu tersedia di dashboardmu.' : 'These recommendations will always be available on your dashboard.'}
                  </p>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// Simple internal helper since User icon might not be imported from lucide
function User({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" viewBox="0 0 24 24" 
      fill="none" stroke="currentColor" strokeWidth="2" 
      strokeLinecap="round" strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
