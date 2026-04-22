import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Pin,
  Send,
  MoreVertical,
  ThumbsUp,
  Flag,
  MessageSquare,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Dropdown } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { mockCourses } from '@/data/mockData';
import { getTimeAgo } from '@/lib/utils';
import type { Discussion } from '@/types';

// Mock discussion data (same as in DiscussionsPage for demo)
const mockDiscussion: Discussion = {
  id: '1',
  courseId: 'course-1',
  userId: 'student-1',
  user: {
    id: 'student-1',
    name: 'Ahmad Siswa',
    email: 'ahmad@example.com',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    isVerified: true,
    createdAt: new Date().toISOString(),
  },
  title: 'Bagaimana cara menggunakan useEffect dengan benar?',
  content: `Saya masih bingung kapan harus menggunakan dependency array di useEffect. 

Berikut adalah kode yang saya coba:

\`\`\`javascript
useEffect(() => {
  fetchData();
}, []);
\`\`\`

Pertanyaan saya:
1. Kapan harus menggunakan array kosong []?
2. Kapan harus memasukkan variabel ke dalam array?
3. Bagaimana menghindari infinite loop?

Mohon penjelasannya. Terima kasih!`,
  replies: [
    {
      id: 'r1',
      discussionId: '1',
      userId: 'instructor-1',
      user: {
        id: 'instructor-1',
        name: 'Budi Pengajar',
        email: 'budi@example.com',
        role: 'instructor',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      content: `Pertanyaan yang bagus! Berikut penjelasannya:

**1. Array kosong []**
Effect hanya berjalan sekali saat komponen mount. Cocok untuk fetch data awal.

**2. Dependency array dengan variabel**
Effect akan berjalan ulang setiap kali variabel di dalam array berubah.

\`\`\`javascript
useEffect(() => {
  fetchUserData(userId);
}, [userId]); // Jalan ulang saat userId berubah
\`\`\`

**3. Menghindari infinite loop**
- Jangan update state yang ada di dependency array tanpa kondisi
- Gunakan useCallback untuk fungsi yang menjadi dependency

Semoga membantu!`,
      isInstructorReply: true,
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'r2',
      discussionId: '1',
      userId: 'student-2',
      user: {
        id: 'student-2',
        name: 'Siti Belajar',
        email: 'siti@example.com',
        role: 'student',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      content: 'Terima kasih penjelasannya Pak Budi! Sangat membantu untuk memahami konsepnya.',
      isInstructorReply: false,
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'r3',
      discussionId: '1',
      userId: 'student-3',
      user: {
        id: 'student-3',
        name: 'Rudi Coder',
        email: 'rudi@example.com',
        role: 'student',
        isVerified: true,
        createdAt: new Date().toISOString(),
      },
      content: 'Tambahan: untuk kasus kompleks bisa gunakan useReducer juga untuk menghindari dependency yang terlalu banyak.',
      isInstructorReply: false,
      createdAt: new Date(Date.now() - 900000).toISOString(),
    },
  ],
  isPinned: true,
  createdAt: new Date(Date.now() - 86400000).toISOString(),
  updatedAt: new Date(Date.now() - 900000).toISOString(),
};

export function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likedDiscussion, setLikedDiscussion] = useState(false);
  const [discussionLikes, setDiscussionLikes] = useState(12); // Mock initial likes
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set());
  const [replyLikes, setReplyLikes] = useState<Record<string, number>>({
    'r1': 8,
    'r2': 3,
    'r3': 5,
  });

  // In real app, fetch discussion by id
  // For demo, using mock data
  console.log('Discussion ID:', id);
  const discussion = mockDiscussion;

  const getCourseTitle = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.title || 'Unknown Course';
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    // In real app, call API to submit reply
    console.log('Submitting reply:', replyContent);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setReplyContent('');
    setIsSubmitting(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmitReply();
    }
  };

  const handleToggleLike = () => {
    setLikedDiscussion(!likedDiscussion);
    setDiscussionLikes(prev => likedDiscussion ? prev - 1 : prev + 1);
  };

  const handleToggleReplyLike = (replyId: string) => {
    const newLiked = new Set(likedReplies);
    if (newLiked.has(replyId)) {
      newLiked.delete(replyId);
      setReplyLikes(prev => ({ ...prev, [replyId]: (prev[replyId] || 0) - 1 }));
    } else {
      newLiked.add(replyId);
      setReplyLikes(prev => ({ ...prev, [replyId]: (prev[replyId] || 0) + 1 }));
    }
    setLikedReplies(newLiked);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 lg:p-6">
        {/* Back Button */}
        <Link
          to="/discussions"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'id' ? 'Kembali ke Forum' : 'Back to Forum'}
        </Link>

        {/* Main Discussion */}
        <Card className="mb-6">
          <div className="flex gap-4">
            <Avatar
              src={discussion.user?.avatar}
              name={discussion.user?.name || 'User'}
              size="lg"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {discussion.isPinned && (
                      <Pin className="w-4 h-4 text-blue-500" />
                    )}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                      {discussion.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {discussion.user?.name}
                    </span>
                    {discussion.user?.role === 'instructor' && (
                      <Badge variant="primary" size="sm">
                        {language === 'id' ? 'Instruktur' : 'Instructor'}
                      </Badge>
                    )}
                    <span className="text-gray-300">•</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getTimeAgo(discussion.createdAt)}
                    </span>
                  </div>
                </div>
                <Dropdown
                  trigger={
                    <button aria-label="More options" className="p-2 hover:bg-gray-100 rounded-lg">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  }
                  items={[
                    {
                      label: language === 'id' ? 'Laporkan' : 'Report',
                      icon: <Flag className="w-4 h-4" />,
                      onClick: () => console.log('Report'),
                    },
                  ]}
                />
              </div>

              <Badge variant="secondary" size="sm" className="mt-3">
                {getCourseTitle(discussion.courseId)}
              </Badge>

              <div className="mt-4 prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {discussion.content}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 text-sm transition-colors ${likedDiscussion ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                    }`}
                >
                  <ThumbsUp className={`w-4 h-4 ${likedDiscussion ? 'fill-current' : ''}`} />
                  <span>{language === 'id' ? 'Suka' : 'Like'}</span>
                  {discussionLikes > 0 && <span>({discussionLikes})</span>}
                </button>
                <div className="flex items-center gap-1.5 text-sm text-gray-500">
                  <MessageSquare className="w-4 h-4" />
                  <span>
                    {discussion.replies.length} {language === 'id' ? 'balasan' : 'replies'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Replies Timeline */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {language === 'id' ? 'Balasan' : 'Replies'} ({discussion.replies.length})
          </h2>

          {/* Timeline Container */}
          <div className="relative">
            {/* Timeline vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

            <div className="space-y-0">
              {discussion.replies.map((reply, index) => {
                const isFirst = index === 0;
                const isLast = index === discussion.replies.length - 1;
                const roundedClasses = isFirst
                  ? 'rounded-t-xl'
                  : isLast
                    ? 'rounded-b-xl'
                    : '';

                return (
                  <div key={reply.id} className="relative flex gap-4 group">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <div className={`w-3 h-3 ${reply.isInstructorReply ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'} rounded-full group-hover:scale-125 transition-transform`} />
                      </div>
                    </div>

                    {/* Reply Card */}
                    <div className="flex-1">
                      <div className={`bg-white dark:bg-gray-800 border ${reply.isInstructorReply ? 'border-l-4 border-l-blue-500' : 'border-gray-200'} dark:border-gray-700 ${roundedClasses} p-4`}>
                        <div className="flex gap-4">
                          <Avatar
                            src={reply.user?.avatar}
                            name={reply.user?.name || 'User'}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-gray-900 dark:text-white">
                                  {reply.user?.name}
                                </span>
                                {reply.isInstructorReply && (
                                  <Badge variant="primary" size="sm">
                                    {language === 'id' ? 'Instruktur' : 'Instructor'}
                                  </Badge>
                                )}
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                  {getTimeAgo(reply.createdAt)}
                                </span>
                              </div>
                              <Dropdown
                                trigger={
                                  <button aria-label="Reply options" className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                                    <MoreVertical className="w-4 h-4 text-gray-400" />
                                  </button>
                                }
                                items={[
                                  {
                                    label: language === 'id' ? 'Laporkan' : 'Report',
                                    icon: <Flag className="w-4 h-4" />,
                                    onClick: () => console.log('Report reply'),
                                  },
                                ]}
                              />
                            </div>
                            <div className="mt-2 whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                              {reply.content}
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <button
                                onClick={() => handleToggleReplyLike(reply.id)}
                                className={`flex items-center gap-1.5 text-sm transition-colors ${likedReplies.has(reply.id) ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                  }`}
                              >
                                <ThumbsUp className={`w-4 h-4 ${likedReplies.has(reply.id) ? 'fill-current' : ''}`} />
                                <span>{language === 'id' ? 'Suka' : 'Like'}</span>
                                {(replyLikes[reply.id] || 0) > 0 && <span>({replyLikes[reply.id]})</span>}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Reply Input */}
        <Card>
          <div className="flex gap-4">
            <Avatar
              src={user?.avatar}
              name={user?.name || 'User'}
              size="md"
            />
            <div className="flex-1">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'id'
                    ? 'Tulis balasan Anda... (Ctrl+Enter untuk kirim)'
                    : 'Write your reply... (Ctrl+Enter to send)'
                }
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-end mt-3">
                <Button
                  onClick={handleSubmitReply}
                  disabled={!replyContent.trim() || isSubmitting}
                  isLoading={isSubmitting}
                  leftIcon={<Send className="w-4 h-4" />}
                >
                  {language === 'id' ? 'Kirim Balasan' : 'Send Reply'}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
