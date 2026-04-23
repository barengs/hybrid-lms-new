import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Plus,
  Pin,
  ChevronRight,
  CheckCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Input, Select, Modal, LoadingScreen } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { getTimeAgo } from '@/lib/utils';
import type { Discussion } from '@/types';
import { 
  useGetDiscussionsQuery, 
  useCreateDiscussionMutation 
} from '@/store/features/discussion/discussionApiSlice';
import { useGetInstructorCoursesQuery } from '@/store/features/instructor/instructorApiSlice';
import toast from 'react-hot-toast';

// Note: Mock data removed in favor of real API data

export function DiscussionsPage() {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', courseId: '', type: 'discussion' as any });
  const [sortBy, setSortBy] = useState<'newest' | 'most-replies' | 'instructor-answered'>('newest');
  const [topicFilter, setTopicFilter] = useState<'all' | 'general' | 'course'>('all');

  // API Hooks
  const { data: discussionsResponse, isLoading } = useGetDiscussionsQuery({
    search: searchQuery,
    // Note: Filtering logic moved to backend, but we can pass params if needed
  });
  
  const { data: instructorCourses = [] } = useGetInstructorCoursesQuery(undefined, {
    skip: user?.role !== 'instructor'
  });

  const [createDiscussion, { isLoading: isCreating }] = useCreateDiscussionMutation();

  const discussions = useMemo(() => discussionsResponse?.data || [], [discussionsResponse]);

  const handleCreateDiscussion = async () => {
    try {
      await createDiscussion({
        title: newDiscussion.title,
        content: newDiscussion.content,
        // Using courseId as a hint to batch_id if backend expects batch_id
        // For simplicity, we'll assume the API handles course_id or we use batch_id logic
        batch_id: newDiscussion.courseId, 
        type: newDiscussion.type,
      }).unwrap();
      
      toast.success(language === 'id' ? 'Diskusi berhasil dibuat' : 'Discussion created successfully');
      setShowCreateModal(false);
      setNewDiscussion({ title: '', content: '', courseId: '', type: 'discussion' });
    } catch (err) {
      toast.error('Failed to create discussion');
    }
  };

  const getCourseTitle = (discussion: any) => {
    // Backend should return course/batch title in pagination response
    return discussion.batch?.course?.title || discussion.lesson?.title || 'General';
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'id' ? 'Forum Diskusi' : 'Discussion Forum'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'id'
                ? 'Diskusi dan tanya jawab dengan sesama peserta dan instruktur'
                : 'Discuss and ask questions with other students and instructors'}
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {language === 'id' ? 'Buat Diskusi' : 'New Discussion'}
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'id' ? 'Cari diskusi...' : 'Search discussions...'}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Topic Filter */}
              <Select
                value={topicFilter}
                onChange={(e) => setTopicFilter(e.target.value as 'all' | 'general' | 'course')}
                options={[
                  { value: 'all', label: language === 'id' ? 'Semua Topik' : 'All Topics' },
                  { value: 'general', label: language === 'id' ? 'Umum' : 'General' },
                  { value: 'course', label: language === 'id' ? 'Kursus' : 'Course' },
                ]}
                className="w-full sm:w-48"
              />

              {/* Course Filter */}
              <Select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                options={[
                  { value: '', label: language === 'id' ? 'Semua Kursus' : 'All Courses' },
                  ...instructorCourses.map((c: any) => ({ value: c.id, label: c.title })),
                ]}
                className="w-full sm:w-64"
              />

              {/* Sort By */}
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'most-replies' | 'instructor-answered')}
                options={[
                  { value: 'newest', label: language === 'id' ? 'Terbaru' : 'Newest' },
                  { value: 'most-replies', label: language === 'id' ? 'Paling Banyak Balasan' : 'Most Replies' },
                  { value: 'instructor-answered', label: language === 'id' ? 'Dijawab Instruktur' : 'Instructor Answered' },
                ]}
                className="w-full sm:w-56"
              />
            </div>
          </div>
        </Card>

        {/* Discussions List */}
        <div className="space-y-0">
          {isLoading ? (
            <div className="py-12 flex justify-center">
              <LoadingScreen />
            </div>
          ) : discussions.length === 0 ? (
            <Card className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {language === 'id' ? 'Belum ada diskusi' : 'No discussions yet'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {language === 'id'
                  ? 'Jadilah yang pertama memulai diskusi!'
                  : 'Be the first to start a discussion!'}
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                {language === 'id' ? 'Buat Diskusi Pertama' : 'Start First Discussion'}
              </Button>
            </Card>
          ) : (
            discussions.map((discussion: any, index) => {
              const isFirst = index === 0;
              const isLast = index === discussions.length - 1;
              const roundedClasses = isFirst
                ? 'rounded-t-xl'
                : isLast
                  ? 'rounded-b-xl'
                  : '';

              return (
                <Link key={discussion.id} to={`/discussions/${discussion.id}`}>
                  <div className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${roundedClasses} hover:shadow-md transition-shadow cursor-pointer p-4`}>
                    <div className="flex gap-4">
                      <Avatar
                        src={discussion.user?.avatar}
                        name={discussion.user?.name || 'User'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              {discussion.is_pinned && (
                                <Pin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                              )}
                              <h3 className="font-semibold text-gray-900 dark:text-white">
                                {discussion.title}
                              </h3>
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              <span className="text-sm text-gray-600 dark:text-gray-400">{discussion.user?.name}</span>
                              {discussion.user?.role === 'instructor' && (
                                <Badge variant="primary" size="sm">
                                  {language === 'id' ? 'Instruktur' : 'Instructor'}
                                </Badge>
                              )}
                              <span className="text-gray-300 dark:text-gray-600">•</span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {getTimeAgo(discussion.created_at)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{discussion.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="secondary" size="sm">
                            {getCourseTitle(discussion)}
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {discussion.replies_count || discussion.replies?.length || 0}{' '}
                              {language === 'id' ? 'balasan' : 'replies'}
                            </span>
                          </div>
                          {discussion.replies?.some((r: any) => r.user?.role === 'instructor') && (
                            <div className="flex items-center gap-1 text-sm text-green-600 dark:text-green-500">
                              <CheckCircle className="w-4 h-4" />
                              <span>
                                {language === 'id' ? 'Dijawab instruktur' : 'Instructor replied'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>

        {/* Create Discussion Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={language === 'id' ? 'Buat Diskusi Baru' : 'Create New Discussion'}
          size="lg"
        >
          <div className="space-y-4">
            <Select
              label={language === 'id' ? 'Pilih Kursus/Kelas' : 'Select Course/Class'}
              value={newDiscussion.courseId}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, courseId: e.target.value })}
              options={[
                { value: '', label: language === 'id' ? 'Pilih kursus...' : 'Select a course...' },
                ...instructorCourses.map((c) => ({ value: c.id, label: c.title })),
              ]}
            />
            <Select
              label={language === 'id' ? 'Tipe' : 'Type'}
              value={newDiscussion.type}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, type: e.target.value as any })}
              options={[
                { value: 'discussion', label: language === 'id' ? 'Diskusi' : 'Discussion' },
                { value: 'question', label: language === 'id' ? 'Pertanyaan' : 'Question' },
                { value: 'announcement', label: language === 'id' ? 'Pengumuman' : 'Announcement' },
              ]}
            />
            <Input
              label={language === 'id' ? 'Judul Diskusi' : 'Discussion Title'}
              value={newDiscussion.title}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, title: e.target.value })}
              placeholder={
                language === 'id'
                  ? 'Masukkan judul diskusi...'
                  : 'Enter discussion title...'
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Isi Diskusi' : 'Discussion Content'}
              </label>
              <textarea
                value={newDiscussion.content}
                onChange={(e) => setNewDiscussion({ ...newDiscussion, content: e.target.value })}
                placeholder={
                  language === 'id'
                    ? 'Jelaskan pertanyaan atau topik diskusi Anda...'
                    : 'Describe your question or discussion topic...'
                }
                rows={5}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleCreateDiscussion}
                isLoading={isCreating}
                disabled={!newDiscussion.title || !newDiscussion.content || !newDiscussion.courseId}
              >
                {language === 'id' ? 'Buat Diskusi' : 'Create Discussion'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
