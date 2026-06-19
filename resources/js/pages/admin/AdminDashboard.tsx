import { Link } from 'react-router-dom';
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  TrendingDown,
  UserPlus,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Badge, Button, Avatar } from '@/components/ui';
import { formatCurrency, formatNumber } from '@/lib/utils';

import { useGetAdminDashboardQuery } from '@/store/features/admin/adminDashboardApiSlice';
import { DashboardLoadingScreen } from '@/components/ui';

export function AdminDashboard() {
  const { data, isLoading } = useGetAdminDashboardQuery();

  if (isLoading) return <DashboardLoadingScreen />;

  // Real platform stats from API
  const stats = data?.data?.stats || {
    totalUsers: 0,
    newUsersThisMonth: 0,
    totalCourses: 0,
    newCoursesThisMonth: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
    pendingVerifications: 0,
    pendingCourseReviews: 0,
    pendingPayouts: 0,
    totalPayoutAmount: 0,
  };

  // Real recent transactions from API
  const recentTransactions: any[] = data?.data?.recent_transactions || [];

  // Real pending instructor verifications from API
  const pendingVerifications: any[] = data?.data?.pending_verifications || [];

  // Real top courses from API
  const topCourses: any[] = data?.data?.top_courses || [];

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Admin</h1>
        <p className="text-gray-600">Pantau dan kelola platform MOLANG dari sini.</p>
      </div>

      {/* Alert Cards */}
      {(stats.pendingVerifications > 0 || stats.pendingCourseReviews > 0 || stats.pendingPayouts > 0) && (
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {stats.pendingVerifications > 0 && (
            <Link to="/admin/verify-instructors">
              <Card className="flex items-center justify-between bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-yellow-900">{stats.pendingVerifications} instruktur menunggu verifikasi</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-yellow-600" />
              </Card>
            </Link>
          )}
          {stats.pendingCourseReviews > 0 && (
            <Link to="/admin/courses?status=pending">
              <Card className="flex items-center justify-between bg-blue-50 border-blue-200 hover:bg-blue-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-blue-900">{stats.pendingCourseReviews} kursus perlu ditinjau</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-blue-600" />
              </Card>
            </Link>
          )}
          {stats.pendingPayouts > 0 && (
            <Link to="/admin/payouts">
              <Card className="flex items-center justify-between bg-green-50 border-green-200 hover:bg-green-100 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-900">{stats.pendingPayouts} pembayaran menunggu</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-green-600" />
              </Card>
            </Link>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Link to="/admin/users">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Pengguna</span>
              <Users className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+{formatNumber(stats.newUsersThisMonth)}</span>
              <span className="text-gray-400">bulan ini</span>
            </div>
          </Card>
        </Link>

        <Link to="/admin/courses">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Total Kursus</span>
              <BookOpen className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+{stats.newCoursesThisMonth}</span>
              <span className="text-gray-400">bulan ini</span>
            </div>
          </Card>
        </Link>

        <Link to="/admin/transactions">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pendapatan Total</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-400">vs bulan lalu</span>
            </div>
          </Card>
        </Link>

        <Link to="/admin/transactions">
          <Card className="hover:border-blue-300 transition-colors cursor-pointer h-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Pendapatan Bulan Ini</span>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenueThisMonth)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <TrendingDown className="w-4 h-4 text-red-500" />
              <span className="text-red-600">-5%</span>
              <span className="text-gray-400">vs bulan lalu</span>
            </div>
          </Card>
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Transactions */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Transaksi Terbaru</CardTitle>
              <Link to="/admin/transactions" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">Pengguna</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">Kursus</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">Jumlah</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">Status</th>
                    <th className="text-left text-sm font-medium text-gray-500 pb-3">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                      <td className="py-3 text-sm text-gray-900">{tx.user}</td>
                      <td className="py-3 text-sm text-gray-600 max-w-[200px] truncate">{tx.course}</td>
                      <td className="py-3 text-sm font-medium text-gray-900">{formatCurrency(tx.amount)}</td>
                      <td className="py-3">
                        <Badge variant={tx.status === 'completed' ? 'success' : 'warning'} size="sm">
                          {tx.status === 'completed' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Selesai</>
                          ) : (
                            <><Clock className="w-3 h-3 mr-1" /> Pending</>
                          )}
                        </Badge>
                      </td>
                      <td className="py-3 text-sm text-gray-500">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Top Courses */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Kursus Terlaris</CardTitle>
              <Link to="/admin/courses" className="text-sm text-blue-600 hover:text-blue-700">
                Lihat Semua
              </Link>
            </CardHeader>

            <div className="space-y-4">
              {topCourses.map((course, index) => (
                <div key={course.id} className="flex items-center gap-4">
                  <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-bold text-blue-600">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">{formatNumber(course.enrollments)} siswa</p>
                    <p className="text-sm text-gray-500">{formatCurrency(course.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pending Verifications */}
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Verifikasi Instruktur</CardTitle>
              <Link to="/admin/verify-instructors" className="text-sm text-blue-600 hover:text-blue-700">
                Semua
              </Link>
            </CardHeader>

            <div className="space-y-3">
              {pendingVerifications.map((instructor) => (
                <div key={instructor.id} className="flex items-center gap-3">
                  <Avatar src={instructor.avatar} name={instructor.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{instructor.name}</p>
                    <p className="text-xs text-gray-500 truncate">{instructor.email}</p>
                  </div>
                  <Button size="sm" variant="outline">Tinjau</Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Payout Summary */}
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <h3 className="font-semibold mb-4">Pembayaran Menunggu</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-indigo-100">Total Permintaan</span>
                <span className="font-bold">{stats.pendingPayouts}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-indigo-100">Total Amount</span>
                <span className="font-bold">{formatCurrency(stats.totalPayoutAmount)}</span>
              </div>
            </div>
            <Link to="/admin/payouts" className="block mt-4">
              <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-gray-100">
                Proses Pembayaran
              </Button>
            </Link>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Statistik Platform</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tingkat Konversi</span>
                <span className="font-semibold text-gray-900">3.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Rata-rata Order</span>
                <span className="font-semibold text-gray-900">{formatCurrency(450000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Komisi Platform</span>
                <span className="font-semibold text-gray-900">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Tingkat Refund</span>
                <span className="font-semibold text-gray-900">1.5%</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
