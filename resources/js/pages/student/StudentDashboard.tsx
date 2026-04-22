import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  Award,
  Play,
  ChevronRight,
  Trophy,
  Target,
  Flame,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Progress, Button } from '@/components/ui';
import { mockCourses } from '@/data/mockData';
import { formatNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useMemo, useState } from 'react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  
  // Capture initial timestamp on mount to avoid impure Date.now() calls during render
  const [initialTimestamp] = useState(() => Date.now());

  // Mock enrolled courses with useMemo
  const enrolledCourses = useMemo(() => {
    return mockCourses.slice(0, 3).map((course, index) => ({
      ...course,
      progress: [65, 30, 10][index],
      lastAccessed: new Date(initialTimestamp - index * 86400000).toISOString(),
    }));
  }, [initialTimestamp]);

  // Mock stats
  const stats = {
    coursesInProgress: 3,
    coursesCompleted: 5,
    totalPoints: 1250,
    currentStreak: 7,
    hoursLearned: 48,
    certificatesEarned: 4,
  };

  // Mock upcoming deadlines
  const deadlines = useMemo(() => {
    return [
      {
        id: '1',
        title: 'Tugas: Membuat Komponen React',
        course: 'React Masterclass',
        dueDate: new Date(initialTimestamp + 2 * 86400000).toISOString(),
        daysLeft: 2,
      },
      {
        id: '2',
        title: 'Quiz: JavaScript Fundamentals',
        course: 'Full Stack Development',
        dueDate: new Date(initialTimestamp + 5 * 86400000).toISOString(),
        daysLeft: 5,
      },
    ];
  }, [initialTimestamp]);

  // Mock achievements
  const recentAchievements = useMemo(() => {
    return [
      { id: '1', name: 'First Steps', icon: '🎯', description: 'Menyelesaikan pelajaran pertama', earnedAt: new Date(initialTimestamp - 86400000).toISOString() },
      { id: '2', name: 'Week Warrior', icon: '🔥', description: '7 hari berturut-turut belajar', earnedAt: new Date(initialTimestamp - 172800000).toISOString() },
    ];
  }, [initialTimestamp]);

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat datang kembali, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Lanjutkan perjalanan belajar Anda dan raih lebih banyak prestasi.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.coursesInProgress}</p>
            <p className="text-sm text-gray-500">Kursus Aktif</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.coursesCompleted}</p>
            <p className="text-sm text-gray-500">Selesai</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalPoints)}</p>
            <p className="text-sm text-gray-500">Total Poin</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.currentStreak}</p>
            <p className="text-sm text-gray-500">Hari Streak</p>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Continue Learning */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Lanjutkan Belajar</CardTitle>
              <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </CardHeader>

            <div className="space-y-4">
              {enrolledCourses.map((course) => (
                <Link
                  key={course.id}
                  to={`/learn/${course.slug}`}
                  className="flex gap-4 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 mb-1 truncate">{course.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{course.instructor?.name}</p>
                    <div className="flex items-center gap-3">
                      <Progress value={course.progress} className="flex-1" size="sm" />
                      <span className="text-sm font-medium text-gray-600">{course.progress}%</span>
                    </div>
                  </div>
                  <button 
                    className="self-center w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                    aria-label="Play course"
                  >
                    <Play className="w-4 h-4 ml-0.5" />
                  </button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Upcoming Deadlines */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Tenggat Waktu</CardTitle>
              <Link to="/assignments" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </CardHeader>

            {deadlines.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada tenggat waktu yang mendekat</p>
              </div>
            ) : (
              <div className="space-y-3">
                {deadlines.map((deadline) => {
                  return (
                    <div
                      key={deadline.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{deadline.title}</p>
                          <p className="text-sm text-gray-500">{deadline.course}</p>
                        </div>
                      </div>
                      <Badge variant={deadline.daysLeft <= 2 ? 'danger' : 'warning'}>
                        {deadline.daysLeft} hari lagi
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notifications */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Notifikasi</CardTitle>
              <Link to="/notifications" className="text-sm text-blue-600 hover:text-blue-700">
                Semua
              </Link>
            </CardHeader>

            {notifications.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">
                Tidak ada notifikasi baru
              </p>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 3).map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-lg text-sm ${
                      notif.isRead ? 'bg-gray-50' : 'bg-blue-50'
                    }`}
                  >
                    <p className="font-medium text-gray-900">{notif.title}</p>
                    <p className="text-gray-500 line-clamp-1">{notif.message}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Achievements */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Pencapaian Terbaru</CardTitle>
              <Link to="/badges" className="text-sm text-blue-600 hover:text-blue-700">
                Semua
              </Link>
            </CardHeader>

            <div className="space-y-3">
              {recentAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg"
                >
                  <div className="text-3xl">{achievement.icon}</div>
                  <div>
                    <p className="font-medium text-gray-900">{achievement.name}</p>
                    <p className="text-xs text-gray-500">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/badges" className="block mt-4">
              <Button variant="outline" className="w-full" size="sm">
                Lihat Semua Lencana
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </Card>

          {/* Learning Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Belajar</CardTitle>
            </CardHeader>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Jam Belajar</span>
                <span className="font-semibold text-gray-900">{stats.hoursLearned} jam</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sertifikat</span>
                <span className="font-semibold text-gray-900">{stats.certificatesEarned}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Streak Terpanjang</span>
                <span className="font-semibold text-gray-900">14 hari</span>
              </div>
            </div>
          </Card>

          {/* Leaderboard Teaser */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
              <h3 className="font-bold text-lg mb-1">Peringkat #42</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Anda 150 poin lagi ke peringkat #40!
              </p>
              <Link to="/leaderboard">
                <Button size="sm" className="bg-white text-indigo-600 hover:bg-gray-100">
                  Lihat Leaderboard
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
