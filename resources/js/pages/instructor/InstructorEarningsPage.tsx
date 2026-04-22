import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Download,
  Search,
  ArrowUpRight,
  Clock,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Select } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, formatNumber, getTimeAgo } from '@/lib/utils';

// Mock course earnings data
interface CourseEarnings {
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  price: number;
  totalStudents: number;
  totalRevenue: number;
  monthlyRevenue: number;
  growthPercentage: number;
  commission: number;
  netRevenue: number;
}

interface Transaction {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  commission: number;
  netAmount: number;
  status: 'completed' | 'pending' | 'refunded';
  date: string;
}

const mockCourseEarnings: CourseEarnings[] = [
  {
    courseId: 'course-1',
    courseTitle: 'React Masterclass: Dari Pemula hingga Mahir',
    courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=225&fit=crop',
    price: 299000,
    totalStudents: 1245,
    totalRevenue: 372255000,
    monthlyRevenue: 8970000,
    growthPercentage: 15.3,
    commission: 20,
    netRevenue: 297804000,
  },
  {
    courseId: 'course-2',
    courseTitle: 'Full Stack Development dengan MERN',
    courseThumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=400&h=225&fit=crop',
    price: 399000,
    totalStudents: 856,
    totalRevenue: 341544000,
    monthlyRevenue: 7980000,
    growthPercentage: 8.7,
    commission: 20,
    netRevenue: 273235200,
  },
  {
    courseId: 'course-3',
    courseTitle: 'Node.js & Express: Backend Development',
    courseThumbnail: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=400&h=225&fit=crop',
    price: 249000,
    totalStudents: 623,
    totalRevenue: 155127000,
    monthlyRevenue: 2988000,
    growthPercentage: -5.2,
    commission: 20,
    netRevenue: 124101600,
  },
  {
    courseId: 'course-4',
    courseTitle: 'TypeScript Fundamentals',
    courseThumbnail: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?w=400&h=225&fit=crop',
    price: 199000,
    totalStudents: 489,
    totalRevenue: 97311000,
    monthlyRevenue: 1990000,
    growthPercentage: 2.1,
    commission: 20,
    netRevenue: 77848800,
  },
];

const mockTransactions: Transaction[] = [
  {
    id: 'txn-1',
    studentId: 'std-1',
    studentName: 'Ahmad Rizki',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    courseId: 'course-1',
    courseTitle: 'React Masterclass',
    amount: 299000,
    commission: 59800,
    netAmount: 239200,
    status: 'completed',
    date: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'txn-2',
    studentId: 'std-2',
    studentName: 'Siti Nurhaliza',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    courseId: 'course-2',
    courseTitle: 'Full Stack Development',
    amount: 399000,
    commission: 79800,
    netAmount: 319200,
    status: 'completed',
    date: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'txn-3',
    studentId: 'std-3',
    studentName: 'Budi Santoso',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiS',
    courseId: 'course-1',
    courseTitle: 'React Masterclass',
    amount: 299000,
    commission: 59800,
    netAmount: 239200,
    status: 'pending',
    date: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: 'txn-4',
    studentId: 'std-4',
    studentName: 'Dewi Lestari',
    studentAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    courseId: 'course-3',
    courseTitle: 'Node.js & Express',
    amount: 249000,
    commission: 49800,
    netAmount: 199200,
    status: 'completed',
    date: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'txn-5',
    studentId: 'std-5',
    studentName: 'Rudi Hermawan',
    courseId: 'course-4',
    courseTitle: 'TypeScript Fundamentals',
    amount: 199000,
    commission: 39800,
    netAmount: 159200,
    status: 'completed',
    date: new Date(Date.now() - 172800000).toISOString(),
  },
];

export function InstructorEarningsPage() {
  const { language } = useLanguage();
  const [timeRange, setTimeRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'revenue' | 'students' | 'growth'>('revenue');

  // Calculate total stats
  const stats = useMemo(() => {
    const totalRevenue = mockCourseEarnings.reduce((acc, course) => acc + course.netRevenue, 0);
    const monthlyRevenue = mockCourseEarnings.reduce((acc, course) => acc + course.monthlyRevenue, 0);
    const totalStudents = mockCourseEarnings.reduce((acc, course) => acc + course.totalStudents, 0);
    const pendingAmount = mockTransactions
      .filter(t => t.status === 'pending')
      .reduce((acc, t) => acc + t.netAmount, 0);
    const avgRevenuePerStudent = totalRevenue / totalStudents;

    return {
      totalRevenue,
      monthlyRevenue,
      availableForWithdraw: totalRevenue * 0.7, // 70% available
      pendingClearance: pendingAmount,
      totalStudents,
      avgRevenuePerStudent,
    };
  }, []);

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let courses = [...mockCourseEarnings];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(c => c.courseTitle.toLowerCase().includes(query));
    }

    courses.sort((a, b) => {
      switch (sortBy) {
        case 'students':
          return b.totalStudents - a.totalStudents;
        case 'growth':
          return b.growthPercentage - a.growthPercentage;
        case 'revenue':
        default:
          return b.netRevenue - a.netRevenue;
      }
    });

    return courses;
  }, [searchQuery, sortBy]);

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Pendapatan' : 'Earnings'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Monitor pendapatan dan kelola penarikan dana Anda'
                : 'Monitor your earnings and manage withdrawals'}
            </p>
          </div>
          <div className="flex gap-3">
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              options={[
                { value: 'all', label: language === 'id' ? 'Semua Waktu' : 'All Time' },
                { value: '30', label: language === 'id' ? '30 Hari Terakhir' : 'Last 30 Days' },
                { value: '90', label: language === 'id' ? '90 Hari Terakhir' : 'Last 90 Days' },
                { value: '365', label: language === 'id' ? 'Tahun Ini' : 'This Year' },
              ]}
              className="w-48"
            />
            <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
              {language === 'id' ? 'Ekspor' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Total Pendapatan' : 'Total Earnings'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Bulan Ini' : 'This Month'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.monthlyRevenue)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Tersedia Tarik' : 'Available'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.availableForWithdraw)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Pending' : 'Pending'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingClearance)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <h3 className="font-semibold mb-4">{language === 'id' ? 'Ringkasan' : 'Summary'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-green-100">{language === 'id' ? 'Total Siswa' : 'Total Students'}</span>
                <span className="font-bold">{formatNumber(stats.totalStudents)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">{language === 'id' ? 'Rata-rata/Siswa' : 'Avg per Student'}</span>
                <span className="font-bold">{formatCurrency(stats.avgRevenuePerStudent)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-100">{language === 'id' ? 'Total Kursus' : 'Total Courses'}</span>
                <span className="font-bold">{mockCourseEarnings.length}</span>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <h3 className="font-semibold mb-4">{language === 'id' ? 'Penarikan Dana' : 'Withdrawal'}</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-blue-100">{language === 'id' ? 'Saldo Tersedia' : 'Available Balance'}</span>
                <span className="font-bold">{formatCurrency(stats.availableForWithdraw)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-100">{language === 'id' ? 'Minimum Penarikan' : 'Min Withdrawal'}</span>
                <span className="font-bold">{formatCurrency(100000)}</span>
              </div>
            </div>
            <Link to="/instructor/payouts" className="block mt-4">
              <Button size="sm" className="w-full bg-white text-blue-600 hover:bg-gray-100">
                {language === 'id' ? 'Tarik Dana' : 'Withdraw Funds'}
              </Button>
            </Link>
          </Card>
        </div>

        {/* Course Earnings */}
        <Card className="mb-8">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{language === 'id' ? 'Pendapatan per Kursus' : 'Earnings by Course'}</CardTitle>
            <div className="flex gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari kursus...' : 'Search courses...'}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'revenue' | 'students' | 'growth')}
                options={[
                  { value: 'revenue', label: language === 'id' ? 'Pendapatan' : 'Revenue' },
                  { value: 'students', label: language === 'id' ? 'Siswa' : 'Students' },
                  { value: 'growth', label: language === 'id' ? 'Pertumbuhan' : 'Growth' },
                ]}
                className="w-40"
              />
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Kursus' : 'Course'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Harga' : 'Price'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Siswa' : 'Students'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Total Revenue' : 'Total Revenue'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Revenue Bersih' : 'Net Revenue'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Bulan Ini' : 'This Month'}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {language === 'id' ? 'Pertumbuhan' : 'Growth'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCourses.map((course) => (
                  <tr key={course.courseId} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={course.courseThumbnail}
                          alt={course.courseTitle}
                          className="w-16 h-9 object-cover rounded"
                        />
                        <span className="font-medium text-gray-900 text-sm">{course.courseTitle}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatCurrency(course.price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatNumber(course.totalStudents)}
                    </td>
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {formatCurrency(course.totalRevenue)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-green-600">
                      {formatCurrency(course.netRevenue)}
                      <div className="text-xs text-gray-500">
                        ({100 - course.commission}% after commission)
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {formatCurrency(course.monthlyRevenue)}
                    </td>
                    <td className="px-4 py-4">
                      <div className={`flex items-center gap-1 text-sm font-medium ${course.growthPercentage >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {course.growthPercentage >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(course.growthPercentage)}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{language === 'id' ? 'Transaksi Terbaru' : 'Recent Transactions'}</CardTitle>
          </CardHeader>

          <div className="space-y-3">
            {mockTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Avatar
                    src={transaction.studentAvatar}
                    name={transaction.studentName}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{transaction.studentName}</p>
                    <p className="text-sm text-gray-500 truncate">{transaction.courseTitle}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(transaction.netAmount)}</p>
                    <p className="text-xs text-gray-500">{getTimeAgo(transaction.date)}</p>
                  </div>
                  <Badge
                    variant={
                      transaction.status === 'completed'
                        ? 'success'
                        : transaction.status === 'pending'
                          ? 'warning'
                          : 'danger'
                    }
                    size="sm"
                  >
                    {transaction.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {transaction.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {transaction.status === 'refunded' && <XCircle className="w-3 h-3 mr-1" />}
                    {language === 'id'
                      ? transaction.status === 'completed'
                        ? 'Selesai'
                        : transaction.status === 'pending'
                          ? 'Pending'
                          : 'Refund'
                      : transaction.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <Link
              to="/instructor/transactions"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1"
            >
              {language === 'id' ? 'Lihat Semua Transaksi' : 'View All Transactions'}
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
