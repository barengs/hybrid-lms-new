import {
  BookOpen,
  Clock,
  Award,
  Play,
  Plus,
  ChevronRight,
  Trophy,
  Target,
  Flame,
  Sparkles,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Progress, Button } from '@/components/ui';
import { formatNumber, formatDate } from '@/lib/utils';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useGetStudentDashboardQuery, useGetMyLearningQuery, useGetRecommendationsQuery } from '@/store/features/student/studentApiSlice';
import { useEffect } from 'react';

export function StudentDashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role === 'student' && !user.profile?.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [user, navigate]);
  
  const { data: dashboardData, isLoading: isDashboardLoading } = useGetStudentDashboardQuery();
  const { data: learningData, isLoading: isLearningLoading } = useGetMyLearningQuery();
  const { data: recommendations = [], isLoading: recommendationsLoading } = useGetRecommendationsQuery();

  const allLearningItems = learningData?.all || [];
  const myCourses = learningData?.courses || [];
  const myClasses = [...(learningData?.batches || []), ...(learningData?.classes || [])].sort((a, b) => {
    const timeA = a.enrolled_at ? new Date(a.enrolled_at).getTime() : 0;
    const timeB = b.enrolled_at ? new Date(b.enrolled_at).getTime() : 0;
    return timeB - timeA;
  });

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Selamat datang kembali, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-gray-600">
              Lanjutkan perjalanan belajar Anda dan raih lebih banyak prestasi.
            </p>
          </div>
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

      {/* Join Class Quick Action */}
      <Card className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white border-none overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-white/10 skew-x-12 translate-x-1/2" />
        <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center border border-white/30">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">Punya Kode Kelas?</h2>
              <p className="text-blue-100">Masukkan kode untuk mengakses materi khusus kelas Anda.</p>
            </div>
          </div>
          <Link to="/student/classes?join=true">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 border-none font-bold px-8 shadow-lg transition-all hover:scale-105 active:scale-95">
              Ambil Kelas
            </Button>
          </Link>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Kursus Mandiri</h2>
              <Link to="/my-courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Semua
              </Link>
            </div>
            {myCourses.length === 0 ? (
              <Card className="text-center py-6 border-dashed">
                <p className="text-gray-500">Belum ada kursus mandiri yang diikuti.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myCourses.slice(0, 2).map((item) => (
                  <Card key={`course-${item.id}`} hover className="p-4">
                    <Link
                      to={`/learn/${item.slug}`}
                      className="flex gap-4"
                    >
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.title}</h3>
                        <div className="flex items-center gap-3">
                          <Progress value={item.progress || 0} className="flex-1" size="sm" />
                          <span className="text-xs font-medium text-gray-600">{item.progress || 0}%</span>
                        </div>
                      </div>
                      <div className="self-center">
                        <Button size="sm" variant="ghost" className="rounded-full w-8 h-8 p-0">
                           <Play className="w-4 h-4 ml-0.5 text-blue-600" />
                        </Button>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Enrolled Classes & Batches */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Kelas & Pelatihan</h2>
              <Link to="/my-classes" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Semua
              </Link>
            </div>
            {myClasses.length === 0 ? (
              <Card className="text-center py-6 border-dashed">
                <p className="text-gray-500">Belum ada kelas yang diikuti.</p>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myClasses.slice(0, 2).map((item) => (
                  <Card key={`${item.type}-${item.id}`} hover className="p-4">
                    <Link
                      to={`/student/class/${item.id}`}
                      className="flex gap-4"
                    >
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="w-24 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-16 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0 border border-blue-100">
                          {item.type === 'batch' ? <Users className="w-8 h-8 text-blue-600" /> : <BookOpen className="w-8 h-8 text-blue-600" />}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 truncate">{item.title}</h3>
                          <Badge variant="outline" size="sm" className="text-[10px] uppercase">
                            {item.type}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500">{item.instructor || 'Instructor'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">Daftar pada: {formatDate(item.enrolled_at)}</p>
                      </div>
                      <div className="self-center">
                        <ChevronRight className="w-5 h-5 text-gray-300" />
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommendations */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                Rekomendasi Untukmu
              </h2>
              <Link to="/courses" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                Lihat Katalog
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              {recommendationsLoading ? (
                Array(2).fill(0).map((_, i) => (
                  <div key={i} className="h-48 bg-gray-100 animate-pulse rounded-2xl" />
                ))
              ) : recommendations.length === 0 ? (
                <div className="sm:col-span-2 text-center py-8 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                  <p className="text-gray-500">Belum ada rekomendasi baru untukmu.</p>
                </div>
              ) : (
                recommendations.map((course) => (
                  <Card key={course.id} className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative h-32 overflow-hidden">
                      <img 
                        src={course.thumbnail} 
                        alt={course.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-white/90 backdrop-blur text-blue-600 border-none text-[10px] px-2">
                          {course.category?.name || 'General'}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-bold text-gray-900 text-sm mb-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-[11px] text-gray-500 mb-2">{course.instructor?.name || 'Instructor'}</p>
                      <div className="flex items-center justify-between mt-auto">
                        <span className="text-xs font-bold text-blue-600">
                          {course.discount_price ? `Rp${formatNumber(course.discount_price)}` : (course.price == 0 ? 'Gratis' : `Rp${formatNumber(course.price)}`)}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 text-[11px] text-blue-600 hover:bg-blue-50 px-2"
                          onClick={() => navigate(`/course/${course.slug}`)}
                        >
                          Detail
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

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
