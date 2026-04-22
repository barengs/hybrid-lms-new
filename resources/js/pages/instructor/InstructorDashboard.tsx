import { Link } from 'react-router-dom';
import {
  BookOpen,
  Users,
  DollarSign,
  TrendingUp,
  MessageSquare,
  FileText,
  Star,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from '@/components/ui';
import { formatCurrency, formatNumber, getTimeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useGetInstructorDashboardQuery } from '@/store/features/instructor/instructorApiSlice';

export function InstructorDashboard() {
  const { user } = useAuth();
  const { data: dashboardData, isLoading, error } = useGetInstructorDashboardQuery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
             <p className="text-gray-500">Memuat data dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !dashboardData) {
     return (
        <DashboardLayout>
           <div className="p-8 text-center bg-red-50 rounded-lg border border-red-200 text-red-700">
              <p>Gagal memuat data dashboard. Silakan coba lagi nanti.</p>
           </div>
        </DashboardLayout>
     );
  }

  const { stats, actions, top_courses, revenue_summary, activities, active_students } = dashboardData;

  // Recent activities mapping
  const recentActivities = activities.map((activity, index) => ({
    id: index.toString(),
    type: activity.type,
    message: activity.message,
    time: getTimeAgo(activity.created_at),
  }));

  // Top students mapping
  const topStudents = active_students.map((student) => ({
    id: student.id.toString(),
    name: student.name,
    avatar: null, // API doesn't provide avatar yet
    course: student.course,
    progress: student.progress,
  }));

  return (
    <DashboardLayout>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Selamat datang, {user?.name?.split(' ')[0]}! 👋
        </h1>
        <p className="text-gray-600">
          Berikut ringkasan performa kursus Anda bulan ini.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.total_courses}</p>
            <p className="text-sm text-gray-500">Total Kursus</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total_students)}</p>
            <p className="text-sm text-gray-500">Total Siswa</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.monthly_revenue)}</p>
            <p className="text-sm text-gray-500">Pendapatan Bulan Ini</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <Star className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats.average_rating}</p>
            <p className="text-sm text-gray-500">Rating Rata-rata</p>
          </div>
        </Card>
      </div>

      {/* Alert Cards */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {actions.unanswered_questions > 0 && (
          <Link to="/discussions">
            <Card className="flex items-center justify-between bg-orange-50 border-orange-200 hover:bg-orange-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-orange-900">{actions.unanswered_questions} pertanyaan menunggu jawaban</p>
                  <p className="text-sm text-orange-700">Klik untuk melihat</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-orange-600" />
            </Card>
          </Link>
        )}
        {actions.pending_grading > 0 && (
          <Link to="/instructor/grading">
            <Card className="flex items-center justify-between bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-blue-900">{actions.pending_grading} tugas perlu dinilai</p>
                  <p className="text-sm text-blue-700">Klik untuk menilai</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-blue-600" />
            </Card>
          </Link>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Performance */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Performa Kursus Terbaik</CardTitle>
              <Link to="/instructor/courses" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </CardHeader>

            <div className="space-y-4">
              {top_courses.length === 0 ? (
                 <p className="text-center text-gray-500 py-4">Belum ada data kursus.</p>
              ) : (
                top_courses.map((course) => (
                  <div
                    key={course.id}
                    className="flex gap-4 p-3 -mx-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                       <BookOpen className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">{course.title}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.total_students} siswa
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {formatCurrency(course.revenue)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">{course.trend}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">trend</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Revenue Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Pendapatan</CardTitle>
            </CardHeader>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="text-center text-gray-500">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>Grafik pendapatan akan ditampilkan di sini</p>
                {/* Future: Implement chart using dashboardData.revenue_chart */}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Earnings Summary */}
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <h3 className="font-semibold mb-4">Ringkasan Pendapatan</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-100">Total Pendapatan</span>
                <span className="font-bold">{formatCurrency(revenue_summary.total_revenue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Bulan Ini</span>
                <span className="font-bold">{formatCurrency(revenue_summary.this_month)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">Tersedia untuk Ditarik</span>
                <span className="font-bold">{formatCurrency(revenue_summary.available_balance)}</span>
              </div>
            </div>
            <Link to="/instructor/payouts" className="block mt-4">
              <Button size="sm" className="w-full bg-white text-green-600 hover:bg-gray-100">
                Tarik Dana
              </Button>
            </Link>
          </Card>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Aktivitas Terbaru</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {recentActivities.length === 0 ? (
                 <p className="text-gray-500 text-sm">Belum ada aktivitas.</p>
              ) : (
                recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${activity.type === 'enrollment' ? 'bg-green-500' :
                      activity.type === 'question' ? 'bg-orange-500' :
                        activity.type === 'submission' ? 'bg-blue-500' : 'bg-yellow-500'
                      }`} />
                    <div>
                      <p className="text-sm text-gray-700">{activity.message}</p>
                      <p className="text-xs text-gray-400">{activity.time}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Top Students */}
          <Card>
            <CardHeader>
              <CardTitle>Siswa Teraktif</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {topStudents.length === 0 ? (
                 <p className="text-gray-500 text-sm">Belum ada siswa aktif.</p>
              ) : (
                topStudents.map((student, index) => (
                  <div key={student.id} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                      {index + 1}
                    </span>
                    <Avatar src={student.avatar || undefined} name={student.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{student.name}</p>
                      <p className="text-xs text-gray-500 truncate">{student.course}</p>
                    </div>
                    <Badge variant="success" size="sm">{student.progress}%</Badge>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
