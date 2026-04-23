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
import { Card, Button, Badge, Avatar, Dropdown, LoadingScreen } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { getTimeAgo } from '@/lib/utils';
import type { Discussion } from '@/types';
import { 
  useGetDiscussionDetailQuery, 
  useCreateDiscussionMutation 
} from '@/store/features/discussion/discussionApiSlice';
import toast from 'react-hot-toast';

// Mock data removed

export function DiscussionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [replyContent, setReplyContent] = useState('');
  const [likedDiscussion, setLikedDiscussion] = useState(false);
  const [discussionLikes, setDiscussionLikes] = useState(0); 

  // API Hooks
  const { data: discussionResponse, isLoading } = useGetDiscussionDetailQuery(id || '');
  const [createReply, { isLoading: isSubmitting }] = useCreateDiscussionMutation();

  const discussion = discussionResponse?.data;

  const getCourseTitle = (discussion: any) => {
    return discussion?.batch?.course?.title || discussion?.lesson?.title || 'General';
  };

  const handleSubmitReply = async () => {
    if (!replyContent.trim() || !id) return;

    try {
      await createReply({
        content: replyContent,
        parent_id: id,
        type: 'discussion', // Default
      }).unwrap();

      setReplyContent('');
      toast.success(language === 'id' ? 'Balasan dikirim' : 'Reply sent');
    } catch (err) {
      toast.error('Failed to send reply');
    }
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

        {isLoading && !discussion ? (
          <div className="py-20 flex justify-center">
            <LoadingScreen />
          </div>
        ) : !discussion ? (
          <Card className="text-center py-12">
            <ArrowLeft className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'id' ? 'Diskusi tidak ditemukan' : 'Discussion not found'}
            </h3>
            <Link to="/discussions">
              <Button variant="outline">
                {language === 'id' ? 'Kembali' : 'Back'}
              </Button>
            </Link>
          </Card>
        ) : (
          <>
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
                        {discussion.is_pinned && (
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
                          {getTimeAgo(discussion.created_at)}
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
                    {getCourseTitle(discussion)}
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
                        {discussion.replies_count || discussion.replies?.length || 0} {language === 'id' ? 'balasan' : 'replies'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Replies Timeline */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'id' ? 'Balasan' : 'Replies'} ({discussion.replies?.length || 0})
              </h2>

              {/* Timeline Container */}
              <div className="relative">
                {/* Timeline vertical line */}
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                <div className="space-y-0">
                  {discussion.replies?.map((reply: any, index: number) => {
                    const isFirst = index === 0;
                    const isLast = index === discussion.replies.length - 1;
                    const roundedClasses = isFirst
                      ? 'rounded-t-xl'
                      : isLast
                        ? 'rounded-b-xl'
                        : '';
                    const isInstructor = reply.user?.role === 'instructor';

                    return (
                      <div key={reply.id} className="relative flex gap-4 group">
                        {/* Timeline dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                            <div className={`w-3 h-3 ${isInstructor ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-600'} rounded-full group-hover:scale-125 transition-transform`} />
                          </div>
                        </div>

                        {/* Reply Card */}
                        <div className="flex-1">
                          <div className={`bg-white dark:bg-gray-800 border ${isInstructor ? 'border-l-4 border-l-blue-500' : 'border-gray-200'} dark:border-gray-700 ${roundedClasses} p-4`}>
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
                                    {isInstructor && (
                                      <Badge variant="primary" size="sm">
                                        {language === 'id' ? 'Instruktur' : 'Instructor'}
                                      </Badge>
                                    )}
                                    <span className="text-sm text-gray-500 dark:text-gray-400">
                                      {getTimeAgo(reply.created_at)}
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
                                    onClick={() => {}}
                                    className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{language === 'id' ? 'Suka' : 'Like'}</span>
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
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
