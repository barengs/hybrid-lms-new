import { useState } from 'react';
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
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'article';
  duration: number;
  content: string;
  videoUrl?: string;
  attachments: { name: string; url: string; size: string }[];
  isCompleted: boolean;
}

interface LessonNav {
  id: string;
  title: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

// Mock lesson data
const mockLesson: Lesson = {
  id: 'lesson-4-3',
  title: 'useRef & useMemo',
  type: 'video',
  duration: 22,
  videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  content: `
## useRef Hook

The useRef Hook allows you to persist values between renders. It can be used to store a mutable value that does not cause a re-render when updated.

### Common Use Cases:

1. **Accessing DOM Elements**
   - Getting a reference to an input element for focusing
   - Measuring element dimensions
   - Scrolling to specific positions

2. **Storing Mutable Values**
   - Keeping track of previous values
   - Storing interval/timeout IDs
   - Any value that shouldn't trigger re-renders

### Example:

\`\`\`jsx
import { useRef, useEffect } from 'react';

function TextInputWithFocusButton() {
  const inputEl = useRef(null);

  const onButtonClick = () => {
    inputEl.current.focus();
  };

  return (
    <>
      <input ref={inputEl} type="text" />
      <button onClick={onButtonClick}>Focus the input</button>
    </>
  );
}
\`\`\`

## useMemo Hook

useMemo is a React Hook that lets you cache the result of a calculation between re-renders.

### When to Use:

- Expensive calculations that don't need to run on every render
- Referential equality for objects/arrays passed to child components
- Optimizing performance in complex applications

### Example:

\`\`\`jsx
import { useMemo } from 'react';

function ExpensiveComponent({ list, filter }) {
  const filteredList = useMemo(() => {
    return list.filter(item => item.includes(filter));
  }, [list, filter]);

  return (
    <ul>
      {filteredList.map(item => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}
\`\`\`

## Key Differences

| Feature | useRef | useMemo |
|---------|--------|---------|
| Purpose | Store mutable reference | Cache computed value |
| Re-render | Does NOT trigger | Does NOT trigger |
| Dependencies | None | Array of dependencies |
| Return | { current: value } | Cached value |

## Best Practices

1. Don't overuse useMemo - only use for expensive calculations
2. useRef is perfect for DOM references and timers
3. Both hooks help with performance optimization
4. Always include all dependencies in useMemo's dependency array
  `,
  attachments: [
    { name: 'useRef-examples.zip', url: '#', size: '1.2 MB' },
    { name: 'useMemo-cheatsheet.pdf', url: '#', size: '245 KB' },
  ],
  isCompleted: false,
};

const mockLessonNav: LessonNav[] = [
  { id: 'lesson-4-1', title: 'useContext Hook', isCompleted: true, isCurrent: false },
  { id: 'lesson-4-2', title: 'useReducer Hook', isCompleted: true, isCurrent: false },
  { id: 'lesson-4-3', title: 'useRef & useMemo', isCompleted: false, isCurrent: true },
  { id: 'lesson-4-4', title: 'Custom Hooks', isCompleted: false, isCurrent: false },
  { id: 'lesson-4-5', title: 'Build Custom Hooks', isCompleted: false, isCurrent: false },
  { id: 'lesson-4-6', title: 'Module 4 Quiz', isCompleted: false, isCurrent: false },
];

export function LessonPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [showSidebar, setShowSidebar] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(mockLesson.isCompleted);

  // In real app, fetch lesson by id
  const lesson = mockLesson;
  const lessonNav = mockLessonNav;
  console.log('Course ID:', courseId, 'Lesson ID:', lessonId);

  const currentIndex = lessonNav.findIndex((l) => l.isCurrent);
  const prevLesson = currentIndex > 0 ? lessonNav[currentIndex - 1] : null;
  const nextLesson = currentIndex < lessonNav.length - 1 ? lessonNav[currentIndex + 1] : null;

  const handleMarkComplete = () => {
    setIsCompleted(true);
    // In real app, call API to mark complete
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      if (nextLesson.title.includes('Quiz')) {
        navigate(`/learn/${courseId}/quiz/${nextLesson.id}`);
      } else {
        navigate(`/learn/${courseId}/lesson/${nextLesson.id}`);
      }
    }
  };

  const handlePrevLesson = () => {
    if (prevLesson) {
      if (prevLesson.title.includes('Quiz')) {
        navigate(`/learn/${courseId}/quiz/${prevLesson.id}`);
      } else {
        navigate(`/learn/${courseId}/lesson/${prevLesson.id}`);
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-80px)] -m-6">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-80 border-r border-gray-200 bg-white flex-shrink-0 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                {language === 'id' ? 'Daftar Materi' : 'Lesson List'}
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
              {lessonNav.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => {
                    if (item.title.includes('Quiz')) {
                      navigate(`/learn/${courseId}/quiz/${item.id}`);
                    } else {
                      navigate(`/learn/${courseId}/lesson/${item.id}`);
                    }
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${item.isCurrent
                    ? 'bg-blue-50 text-blue-700'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div
                    className={`flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium ${item.isCompleted
                      ? 'bg-green-500 text-white'
                      : item.isCurrent
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                      }`}
                  >
                    {item.isCompleted ? <CheckCircle className="w-4 h-4" /> : index + 1}
                  </div>
                  <span className="text-sm truncate">{item.title}</span>
                </button>
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
                to={`/learn/${courseId}`}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {language === 'id' ? 'Kembali ke Kursus' : 'Back to Course'}
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!prevLesson}
                onClick={handlePrevLesson}
                leftIcon={<ChevronLeft className="w-4 h-4" />}
              >
                <span className="hidden sm:inline">{language === 'id' ? 'Sebelumnya' : 'Previous'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!nextLesson}
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
                    {lesson.type === 'video' ? 'Video' : language === 'id' ? 'Artikel' : 'Article'}
                  </Badge>
                  <span>•</span>
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
              </div>

              {/* Video Player */}
              {lesson.type === 'video' && lesson.videoUrl && (
                <Card className="mb-6 overflow-hidden">
                  <div className="aspect-video bg-black">
                    <iframe
                      src={lesson.videoUrl}
                      title={lesson.title}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </Card>
              )}

              {/* Content */}
              <Card className="mb-6">
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                    {lesson.content}
                  </pre>
                </div>
              </Card>

              {/* Attachments */}
              {lesson.attachments.length > 0 && (
                <Card className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-4">
                    {language === 'id' ? 'Lampiran' : 'Attachments'}
                  </h3>
                  <div className="space-y-2">
                    {lesson.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-blue-500" />
                          <div>
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">{file.size}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                          {language === 'id' ? 'Unduh' : 'Download'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <Badge variant="success" size="md">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      {language === 'id' ? 'Selesai' : 'Completed'}
                    </Badge>
                  ) : (
                    <Button
                      variant="success"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={handleMarkComplete}
                    >
                      {language === 'id' ? 'Tandai Selesai' : 'Mark as Complete'}
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {prevLesson && (
                    <Button
                      variant="outline"
                      leftIcon={<ArrowLeft className="w-4 h-4" />}
                      onClick={handlePrevLesson}
                    >
                      {language === 'id' ? 'Sebelumnya' : 'Previous'}
                    </Button>
                  )}
                  {nextLesson && (
                    <Button
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                      onClick={handleNextLesson}
                    >
                      {language === 'id' ? 'Berikutnya' : 'Next'}
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
