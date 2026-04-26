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
import { formatNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useGetStudentDashboardQuery, useGetMyLearningQuery } from '@/store/features/student/studentApiSlice';

export function StudentDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetStudentDashboardQuery();
  const { data: allLearningItems = [], isLoading: isLearningLoading } = useGetMyLearningQuery();

  if (isDashboardLoading || isLearningLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const stats = dashboardData?.stats || {
    active_enrollments: 0,
    completed_courses: 0,
    total_points: 0,
    streak: 0
  };

  const deadlines = dashboardData?.upcoming_assignments || [];

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
            <p className="text-2xl font-bold text-gray-900">{stats.active_enrollments}</p>
            <p className="text-sm text-gray-500">Kursus Aktif</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.completed_courses}</p>
            <p className="text-sm text-gray-500">Selesai</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_points || 0)}</p>
            <p className="text-sm text-gray-500">Total Poin</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
            <Flame className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.streak || 0}</p>
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
              {allLearningItems.length === 0 ? (
                <p className="text-center text-gray-500 py-4">Belum ada kursus yang diikuti.</p>
              ) : (
                allLearningItems.slice(0, 3).map((item) => (
                  <Link
                    key={`${item.type}-${item.id}`}
                    to={item.type === 'course' ? `/learn/${item.slug}` : `/student/class/${item.id}`}
                    className="flex gap-4 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={item.thumbnail}
                      alt={item.title}
                      className="w-32 h-20 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{item.instructor || 'Instructor'}</p>
                      <div className="flex items-center gap-3">
                        <Progress value={item.progress || 0} className="flex-1" size="sm" />
                        <span className="text-sm font-medium text-gray-600">{item.progress || 0}%</span>
                      </div>
                    </div>
                    <div 
                      className="self-center w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                      aria-label="Continue"
                    >
                      <Play className="w-4 h-4 ml-0.5" />
                    </div>
                  </Link>
                ))
              )}
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
                          <p className="text-sm text-gray-500">{deadline.batch?.courses?.[0]?.title || 'Course'}</p>
                        </div>
                      </div>
                      <Badge variant="warning">
                        Segera
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

          {/* Achievements Placeholder */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Pencapaian Terbaru</CardTitle>
            </CardHeader>
            <div className="text-center py-4 text-gray-500 text-sm">
              Selesaikan kursus untuk mendapatkan lencana.
            </div>
          </Card>

          {/* Leaderboard Teaser */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <div className="text-center">
              <Trophy className="w-12 h-12 mx-auto mb-3 text-yellow-300" />
              <h3 className="font-bold text-lg mb-1">Leaderboard</h3>
              <p className="text-sm text-indigo-100 mb-4">
                Bersainglah dengan siswa lain dan raih peringkat teratas!
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
