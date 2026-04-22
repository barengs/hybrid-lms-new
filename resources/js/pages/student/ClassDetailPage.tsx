import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  BookOpen,
  FileText,
  Award,
  Video,
  Download,
  Upload,
  AlertCircle,
  Star,
  ArrowRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Badge, Button, Avatar, Tabs } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate, getTimeAgo } from '@/lib/utils';

// Mock data untuk detail kelas
const mockClassDetail = {
  id: 'class-1',
  courseId: 'course-1',
  courseName: 'React Masterclass Professional',
  instructor: {
    id: 'inst-1',
    name: 'Budi Pengajar',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
    email: 'budi@example.com',
  },
  schedule: {
    day: 'Senin & Rabu',
    time: '19:00 - 21:00',
    location: 'Online (Zoom)',
  },
  startDate: '2024-01-15',
  endDate: '2024-03-15',
  progress: 65,
  students: 28,
  maxStudents: 30,
  status: 'ongoing' as const,
  nextSession: '2024-01-24T19:00:00',
  description: 'Kelas intensif React.js dengan pendekatan hybrid learning. Gabungan sesi live terjadwal dengan instruktur, kursus terstruktur, dan materi tambahan untuk pembelajaran yang komprehensif.',

  // Kursus yang di-include dalam kelas (dipilih saat membuat kelas)
  includedCourses: [
    {
      id: 'course-1',
      title: 'Full Stack Web Development dengan Node.js & Express',
      slug: 'full-stack-nodejs-express',
      instructor: 'Budi Pengajar',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
      duration: '40 jam',
      studentsCount: '3.2K',
      rating: 4.7,
      reviewsCount: 890,
      level: 'Menengah',
      lessonsCount: 45,
      progress: 75,
      type: 'class-based' as const,
    },
    {
      id: 'course-2',
      title: 'AWS Cloud Practitioner: Persiapan Sertifikasi',
      slug: 'aws-cloud-practitioner',
      instructor: 'Budi Pengajar',
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400',
      duration: '25 jam',
      studentsCount: '1.8K',
      rating: 4.8,
      reviewsCount: 520,
      level: 'Pemula',
      lessonsCount: 30,
      progress: 45,
      type: 'class-based' as const,
    },
  ],

  // Sesi kelas terjadwal (Class Sessions)
  sessions: [
    {
      id: 'session-1',
      title: 'Kickoff & Introduction to React',
      type: 'live',
      sessionDate: '2024-01-15T19:00:00',
      duration: '2 jam',
      status: 'completed' as const,
      recordingUrl: 'https://zoom.us/rec/123',
      materials: ['Slide Presentasi', 'Starter Code'],
    },
    {
      id: 'session-2',
      title: 'Deep Dive: React Hooks & State Management',
      type: 'live',
      sessionDate: '2024-01-17T19:00:00',
      duration: '2 jam',
      status: 'completed' as const,
      recordingUrl: 'https://zoom.us/rec/124',
      materials: ['Slide Presentasi', 'Exercise Code'],
    },
    {
      id: 'session-3',
      title: 'Building Real-World Applications',
      type: 'live',
      sessionDate: '2024-01-22T19:00:00',
      duration: '2 jam',
      status: 'upcoming' as const,
      recordingUrl: null,
      materials: [],
    },
  ],

  // Materi tambahan yang ditambahkan instruktur
  additionalMaterials: [
    {
      id: 'mat-1',
      title: 'Cheat Sheet: React Hooks Reference',
      type: 'document',
      size: '2.5 MB',
      uploadedAt: '2024-01-15T10:00:00',
    },
    {
      id: 'mat-2',
      title: 'Video Tutorial: Debugging React Applications',
      type: 'video',
      duration: '25 menit',
      uploadedAt: '2024-01-17T10:00:00',
    },
    {
      id: 'mat-3',
      title: 'Sample Project: E-commerce Cart',
      type: 'document',
      size: '5.1 MB',
      uploadedAt: '2024-01-20T10:00:00',
    },
  ],

  assignments: [
    {
      id: 'asg-1',
      title: 'Membuat Component Library',
      description: 'Buat library component reusable dengan React',
      dueDate: '2024-01-25T23:59:00',
      totalPoints: 100,
      submitted: true,
      submittedAt: '2024-01-24T15:30:00',
      grade: 95,
      feedback: 'Pekerjaan yang sangat bagus! Component yang dibuat sudah reusable dan well-documented.',
      status: 'graded' as const,
    },
    {
      id: 'asg-2',
      title: 'Mini Project - Todo App dengan Hooks',
      description: 'Buat aplikasi Todo menggunakan useState, useEffect, dan custom hooks',
      dueDate: '2024-02-01T23:59:00',
      totalPoints: 100,
      submitted: true,
      submittedAt: '2024-01-31T20:00:00',
      grade: 88,
      feedback: 'Bagus! Namun ada beberapa edge cases yang perlu dihandle.',
      status: 'graded' as const,
    },
    {
      id: 'asg-3',
      title: 'State Management dengan Context API',
      description: 'Implementasi global state management menggunakan Context API',
      dueDate: '2024-02-08T23:59:00',
      totalPoints: 100,
      submitted: false,
      status: 'pending' as const,
    },
  ],
};

export function ClassDetailPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'info' | 'materials' | 'assignments' | 'grades'>('info');

  const classData = mockClassDetail;

  // Calculate grades statistics
  const completedAssignments = classData.assignments.filter((a) => a.status === 'graded');
  const averageGrade = completedAssignments.length > 0
    ? completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0) / completedAssignments.length
    : 0;
  const totalPoints = completedAssignments.reduce((sum, a) => sum + (a.grade || 0), 0);
  const maxPoints = completedAssignments.reduce((sum, a) => sum + a.totalPoints, 0);

  return (
    <DashboardLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Link to="/my-classes">
          <Button size="sm" variant="ghost" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            {language === 'id' ? 'Kembali ke Kelas Saya' : 'Back to My Classes'}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {classData.courseName}
              </h1>
              <Badge variant={classData.status === 'ongoing' ? 'success' : 'secondary'} size="sm">
                {classData.status === 'ongoing'
                  ? language === 'id' ? 'Aktif' : 'Active'
                  : language === 'id' ? 'Selesai' : 'Completed'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={classData.instructor.avatar} name={classData.instructor.name} size="sm" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {classData.instructor.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {classData.instructor.email}
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400">{classData.description}</p>
          </div>

          {classData.nextSession && (
            <Card className="lg:w-64">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                {language === 'id' ? 'Sesi Berikutnya' : 'Next Session'}
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {formatDate(classData.nextSession)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                {getTimeAgo(classData.nextSession)}
              </p>
              <Button size="sm" className="w-full">
                {language === 'id' ? 'Gabung Sesi' : 'Join Session'}
              </Button>
            </Card>
          )}
        </div>

        {/* Class Info Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Jadwal' : 'Schedule'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule.day}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Waktu' : 'Time'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule.time}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Lokasi' : 'Location'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.schedule.location}
            </p>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-gray-400" />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Siswa' : 'Students'}
              </p>
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {classData.students}/{classData.maxStudents}
            </p>
          </Card>
        </div>
      </div>

      {/* Progress */}
      {classData.status === 'ongoing' && (
        <Card className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {language === 'id' ? 'Progress Kelas' : 'Class Progress'}
            </p>
            <p className="text-sm font-bold text-blue-600">{classData.progress}%</p>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${classData.progress}%` }}
            />
          </div>
        </Card>
      )}

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'info',
            label: language === 'id' ? 'Tentang Kelas' : 'About Class',
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 'materials',
            label: language === 'id' ? 'Materi' : 'Materials',
            icon: <Video className="w-4 h-4" />,
            badge: classData.includedCourses.length + classData.sessions.length + classData.additionalMaterials.length,
          },
          {
            id: 'assignments',
            label: language === 'id' ? 'Tugas' : 'Assignments',
            icon: <FileText className="w-4 h-4" />,
            badge: classData.assignments.filter((a) => a.status === 'pending').length,
          },
          {
            id: 'grades',
            label: language === 'id' ? 'Nilai' : 'Grades',
            icon: <Award className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'info' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {language === 'id' ? 'Tentang Kelas' : 'About Class'}
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'id' ? 'Deskripsi' : 'Description'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{classData.description}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'id' ? 'Tanggal Mulai' : 'Start Date'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(classData.startDate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'id' ? 'Tanggal Selesai' : 'End Date'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(classData.endDate)}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-6">
            {/* Included Courses */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Kursus' : 'Included Courses'}
                </h3>
                <Badge size="sm">{classData.includedCourses.length}</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {classData.includedCourses.map((course) => (
                  <Card key={course.id} hover className="overflow-hidden">
                    <div className="relative">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute top-2 left-2 flex gap-2">
                        <Badge size="sm">{language === 'id' ? 'Kelas' : 'Class'}</Badge>
                        <Badge size="sm" variant="secondary">{course.level}</Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {course.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          {course.lessonsCount} {language === 'id' ? 'pelajaran' : 'lessons'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          {course.rating}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-600 dark:text-gray-400">
                            {language === 'id' ? 'Progress' : 'Progress'}
                          </span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>

                      <Button size="sm" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                        {language === 'id' ? 'Lanjutkan Belajar' : 'Continue Learning'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Class Sessions */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Sesi Kelas Terjadwal' : 'Scheduled Class Sessions'}
                </h3>
                <Badge size="sm">{classData.sessions.length}</Badge>
              </div>
              <div className="space-y-3">
                {classData.sessions.map((session) => (
                  <Card key={session.id} hover>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${session.status === 'completed'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-blue-100 dark:bg-blue-900/30'
                          }`}>
                          <Calendar className={`w-5 h-5 ${session.status === 'completed'
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-blue-600 dark:text-blue-400'
                            }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {session.title}
                            </h4>
                            <Badge
                              variant={session.status === 'completed' ? 'success' : 'warning'}
                              size="sm"
                            >
                              {session.status === 'completed'
                                ? language === 'id' ? 'Selesai' : 'Completed'
                                : language === 'id' ? 'Akan Datang' : 'Upcoming'}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-2">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(session.sessionDate)}
                            </span>
                            <span>{session.duration}</span>
                          </div>
                          {session.materials.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {session.materials.map((mat, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-300"
                                >
                                  {mat}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {session.recordingUrl && (
                          <Button size="sm" variant="outline" leftIcon={<Video className="w-4 h-4" />}>
                            {language === 'id' ? 'Rekaman' : 'Recording'}
                          </Button>
                        )}
                        {session.status === 'upcoming' && (
                          <Button size="sm">
                            {language === 'id' ? 'Gabung' : 'Join'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Materials */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {language === 'id' ? 'Materi Tambahan' : 'Additional Materials'}
                </h3>
                <Badge size="sm">{classData.additionalMaterials.length}</Badge>
              </div>
              <div className="space-y-3">
                {classData.additionalMaterials.map((material) => (
                  <Card key={material.id} hover>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                          {material.type === 'video' ? (
                            <Video className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          ) : (
                            <FileText className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                            {material.title}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                            {material.duration && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {material.duration}
                              </span>
                            )}
                            {material.size && (
                              <span>{material.size}</span>
                            )}
                            <span>
                              {language === 'id' ? 'Ditambahkan' : 'Added'}{' '}
                              {getTimeAgo(material.uploadedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                        {language === 'id' ? 'Unduh' : 'Download'}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            {classData.assignments.map((assignment) => (
              <Card key={assignment.id} hover>
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {assignment.title}
                      </h4>
                      <Badge
                        variant={
                          assignment.status === 'graded'
                            ? 'success'
                            : assignment.submitted
                              ? 'warning'
                              : 'secondary'
                        }
                        size="sm"
                      >
                        {assignment.status === 'graded'
                          ? language === 'id'
                            ? 'Dinilai'
                            : 'Graded'
                          : assignment.submitted
                            ? language === 'id'
                              ? 'Diserahkan'
                              : 'Submitted'
                            : language === 'id'
                              ? 'Belum Diserahkan'
                              : 'Not Submitted'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {assignment.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">
                          {language === 'id' ? 'Deadline:' : 'Due Date:'}
                        </span>{' '}
                        {formatDate(assignment.dueDate)}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">
                          {language === 'id' ? 'Poin:' : 'Points:'}
                        </span>{' '}
                        {assignment.totalPoints}
                      </span>
                      {assignment.grade !== undefined && (
                        <span className="font-semibold text-blue-600">
                          {language === 'id' ? 'Nilai:' : 'Grade:'} {assignment.grade}/
                          {assignment.totalPoints}
                        </span>
                      )}
                    </div>
                    {assignment.feedback && (
                      <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {language === 'id' ? 'Feedback Instruktur:' : 'Instructor Feedback:'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {assignment.feedback}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!assignment.submitted && (
                      <Button size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                        {language === 'id' ? 'Serahkan Tugas' : 'Submit'}
                      </Button>
                    )}
                    {assignment.submitted && (
                      <Button size="sm" variant="outline">
                        {language === 'id' ? 'Lihat Detail' : 'View Details'}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'grades' && (
          <div className="space-y-6">
            {/* Grades Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Rata-rata Nilai' : 'Average Grade'}
                  </p>
                  <p className="text-3xl font-bold text-blue-600">{averageGrade.toFixed(1)}</p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Total Poin' : 'Total Points'}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {totalPoints}/{maxPoints}
                  </p>
                </div>
              </Card>
              <Card>
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {language === 'id' ? 'Tugas Dinilai' : 'Graded Assignments'}
                  </p>
                  <p className="text-3xl font-bold text-green-600">
                    {completedAssignments.length}/{classData.assignments.length}
                  </p>
                </div>
              </Card>
            </div>

            {/* Grades List */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                {language === 'id' ? 'Rincian Nilai' : 'Grade Details'}
              </h3>
              <div className="space-y-4">
                {classData.assignments
                  .filter((a) => a.status === 'graded')
                  .map((assignment) => (
                    <div
                      key={assignment.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                          {assignment.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {language === 'id' ? 'Diserahkan' : 'Submitted'}{' '}
                          {assignment.submittedAt && formatDate(assignment.submittedAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-600">
                          {assignment.grade}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          / {assignment.totalPoints}
                        </p>
                      </div>
                    </div>
                  ))}
                {completedAssignments.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      {language === 'id'
                        ? 'Belum ada tugas yang dinilai'
                        : 'No graded assignments yet'}
                    </p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
