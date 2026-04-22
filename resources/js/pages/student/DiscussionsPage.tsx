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
import { Card, Button, Badge, Avatar, Input, Select, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { mockCourses } from '@/data/mockData';
import { getTimeAgo } from '@/lib/utils';
import type { Discussion } from '@/types';

// Mock discussions data
const mockDiscussions: Discussion[] = [
  {
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
    content: 'Saya masih bingung kapan harus menggunakan dependency array di useEffect. Mohon penjelasannya.',
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
        content: 'Dependency array digunakan untuk menentukan kapan effect harus dijalankan ulang. Jika kosong [], effect hanya berjalan sekali saat mount.',
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
        content: 'Terima kasih penjelasannya, sangat membantu!',
        isInstructorReply: false,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ],
    isPinned: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '2',
    courseId: 'course-1',
    userId: 'student-2',
    user: {
      id: 'student-2',
      name: 'Siti Belajar',
      email: 'siti@example.com',
      role: 'student',
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
    title: 'Error: Cannot read property of undefined',
    content: 'Saya mendapat error ini saat mencoba akses data dari API. Kode saya: `const name = user.profile.name`. Bagaimana cara mengatasinya?',
    replies: [
      {
        id: 'r3',
        discussionId: '2',
        userId: 'student-3',
        user: {
          id: 'student-3',
          name: 'Rudi Coder',
          email: 'rudi@example.com',
          role: 'student',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        content: 'Coba gunakan optional chaining: `user?.profile?.name`',
        isInstructorReply: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
    ],
    isPinned: false,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    courseId: 'course-2',
    userId: 'student-3',
    user: {
      id: 'student-3',
      name: 'Rudi Coder',
      email: 'rudi@example.com',
      role: 'student',
      isVerified: true,
      createdAt: new Date().toISOString(),
    },
    title: 'Best practice untuk struktur folder React',
    content: 'Untuk project besar, bagaimana cara terbaik mengorganisasi folder dan file di React?',
    replies: [],
    isPinned: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date(Date.now() - 259200000).toISOString(),
  },
  {
    id: '4',
    courseId: 'course-1',
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
    title: '[Pengumuman] Update Materi Minggu Ini',
    content: 'Halo semua! Materi tentang React Hooks sudah diupdate. Silakan review dan ajukan pertanyaan jika ada.',
    replies: [
      {
        id: 'r4',
        discussionId: '4',
        userId: 'student-1',
        user: {
          id: 'student-1',
          name: 'Ahmad Siswa',
          email: 'ahmad@example.com',
          role: 'student',
          isVerified: true,
          createdAt: new Date().toISOString(),
        },
        content: 'Terima kasih Pak! Akan segera saya pelajari.',
        isInstructorReply: false,
        createdAt: new Date(Date.now() - 43200000).toISOString(),
      },
    ],
    isPinned: true,
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
  },
];

export function DiscussionsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({ title: '', content: '', courseId: '' });
  const [sortBy, setSortBy] = useState<'newest' | 'most-replies' | 'instructor-answered'>('newest');
  const [topicFilter, setTopicFilter] = useState<'all' | 'general' | 'course'>('all');

  // Get enrolled courses for filter
  const enrolledCourses = mockCourses.slice(0, 4);

  // Filter and sort discussions
  const filteredDiscussions = useMemo(() => {
    let discussions = [...mockDiscussions];

    // Topic filter
    if (topicFilter === 'general') {
      // General topics would be those without a specific course or marked as general
      discussions = discussions.filter((d) => !d.courseId || d.title.includes('[Pengumuman]'));
    } else if (topicFilter === 'course') {
      discussions = discussions.filter((d) => d.courseId && !d.title.includes('[Pengumuman]'));
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      discussions = discussions.filter(
        (d) =>
          d.title.toLowerCase().includes(query) ||
          d.content.toLowerCase().includes(query) ||
          d.user?.name.toLowerCase().includes(query)
      );
    }

    // Course filter
    if (selectedCourse) {
      discussions = discussions.filter((d) => d.courseId === selectedCourse);
    }

    // Sort: pinned first, then by selected sort option
    discussions.sort((a, b) => {
      // Always show pinned first
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;

      // Then sort by selected option
      switch (sortBy) {
        case 'most-replies':
          return b.replies.length - a.replies.length;
        case 'instructor-answered':
          const aHasInstructor = a.replies.some((r) => r.isInstructorReply) ? 1 : 0;
          const bHasInstructor = b.replies.some((r) => r.isInstructorReply) ? 1 : 0;
          if (bHasInstructor !== aHasInstructor) return bHasInstructor - aHasInstructor;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'newest':
        default:
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
    });

    return discussions;
  }, [searchQuery, selectedCourse, sortBy, topicFilter]);

  const handleCreateDiscussion = () => {
    // In real app, this would call an API
    console.log('Creating discussion:', newDiscussion);
    setShowCreateModal(false);
    setNewDiscussion({ title: '', content: '', courseId: '' });
  };

  const getCourseTitle = (courseId: string) => {
    const course = mockCourses.find((c) => c.id === courseId);
    return course?.title || 'Unknown Course';
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
                  ...enrolledCourses.map((c) => ({ value: c.id, label: c.title })),
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
          {filteredDiscussions.length === 0 ? (
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
            filteredDiscussions.map((discussion, index) => {
              const isFirst = index === 0;
              const isLast = index === filteredDiscussions.length - 1;
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
                              {discussion.isPinned && (
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
                                {getTimeAgo(discussion.createdAt)}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        </div>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">{discussion.content}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <Badge variant="secondary" size="sm">
                            {getCourseTitle(discussion.courseId).slice(0, 30)}...
                          </Badge>
                          <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {discussion.replies.length}{' '}
                              {language === 'id' ? 'balasan' : 'replies'}
                            </span>
                          </div>
                          {discussion.replies.some((r) => r.isInstructorReply) && (
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
              label={language === 'id' ? 'Pilih Kursus' : 'Select Course'}
              value={newDiscussion.courseId}
              onChange={(e) => setNewDiscussion({ ...newDiscussion, courseId: e.target.value })}
              options={[
                { value: '', label: language === 'id' ? 'Pilih kursus...' : 'Select a course...' },
                ...enrolledCourses.map((c) => ({ value: c.id, label: c.title })),
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
