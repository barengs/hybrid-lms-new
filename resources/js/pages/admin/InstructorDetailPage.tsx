import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
  BookOpen,
  Users,
  Award,
  DollarSign,
  TrendingUp,
  GraduationCap,
  Star,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';

// Mock data interfaces
interface Course {
  id: string;
  title: string;
  thumbnail: string;
  category: string;
  studentsEnrolled: number;
  rating: number;
  price: number;
  status: 'published' | 'draft';
  createdAt: string;
}

interface Class {
  id: string;
  name: string;
  courseTitle: string;
  studentsCount: number;
  schedule: string;
  status: 'active' | 'completed';
}

interface InstructorDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'instructor';
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  location?: string;
  bio?: string;
  expertise?: string[];
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalClasses: number;
    totalStudents: number;
    totalRevenue: number;
    averageRating: number;
    totalReviews: number;
  };
}

// Mock data
const mockInstructor: InstructorDetail = {
  id: 'inst-1',
  name: 'Siti Nurhaliza',
  email: 'siti.nur@example.com',
  phone: '+62 812-3456-7890',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
  role: 'instructor',
  status: 'active',
  isVerified: true,
  createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
  lastLogin: new Date(Date.now() - 7200000).toISOString(),
  location: 'Jakarta, Indonesia',
  bio: 'Experienced web developer with 8+ years in the industry. Passionate about teaching modern web technologies.',
  expertise: ['React', 'TypeScript', 'Node.js', 'UI/UX Design'],
  stats: {
    totalCourses: 12,
    publishedCourses: 10,
    totalClasses: 24,
    totalStudents: 1542,
    totalRevenue: 45000000,
    averageRating: 4.8,
    totalReviews: 328,
  },
};

const mockCourses: Course[] = [
  {
    id: 'course-1',
    title: 'Advanced React Development',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=300',
    category: 'Web Development',
    studentsEnrolled: 456,
    rating: 4.9,
    price: 299000,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
  },
  {
    id: 'course-2',
    title: 'TypeScript Mastery',
    thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=300',
    category: 'Programming',
    studentsEnrolled: 382,
    rating: 4.7,
    price: 249000,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
  },
  {
    id: 'course-3',
    title: 'UI/UX Design Fundamentals',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=300',
    category: 'Design',
    studentsEnrolled: 287,
    rating: 4.6,
    price: 199000,
    status: 'published',
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
  {
    id: 'course-4',
    title: 'Next.js Full Stack',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300',
    category: 'Web Development',
    studentsEnrolled: 0,
    rating: 0,
    price: 349000,
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

const mockClasses: Class[] = [
  {
    id: 'class-1',
    name: 'React Batch 12',
    courseTitle: 'Advanced React Development',
    studentsCount: 45,
    schedule: 'Mon, Wed, Fri 19:00-21:00',
    status: 'active',
  },
  {
    id: 'class-2',
    name: 'TypeScript Batch 8',
    courseTitle: 'TypeScript Mastery',
    studentsCount: 38,
    schedule: 'Tue, Thu 19:00-21:00',
    status: 'active',
  },
  {
    id: 'class-3',
    name: 'UI/UX Batch 5',
    courseTitle: 'UI/UX Design Fundamentals',
    studentsCount: 32,
    schedule: 'Sat 10:00-14:00',
    status: 'completed',
  },
];

export function InstructorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // In real app, fetch instructor data based on id
  const instructor = mockInstructor;

  const handleEdit = () => {
    console.log('Edit instructor:', id);
  };

  const handleSuspend = () => {
    console.log('Suspend instructor:', id);
  };

  const handleDelete = () => {
    console.log('Delete instructor:', id);
    setShowDeleteModal(false);
    navigate('/admin/instructors');
  };

  const getStatusBadge = (status: InstructorDetail['status']) => {
    const config = {
      active: { variant: 'success' as const, label: language === 'id' ? 'Aktif' : 'Active', icon: CheckCircle },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu' : 'Pending', icon: Clock },
      suspended: { variant: 'danger' as const, label: language === 'id' ? 'Suspend' : 'Suspended', icon: Ban },
    };
    const { variant, label, icon: Icon } = config[status];
    return (
      <Badge variant={variant}>
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/instructors"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali ke Daftar Instruktur' : 'Back to Instructors List'}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar src={instructor.avatar} name={instructor.name} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{instructor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">{language === 'id' ? 'Instruktur' : 'Instructor'}</Badge>
                  {getStatusBadge(instructor.status)}
                  {instructor.isVerified && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {language === 'id' ? 'Terverifikasi' : 'Verified'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleEdit} leftIcon={<Edit className="w-4 h-4" />}>
                {language === 'id' ? 'Edit' : 'Edit'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleSuspend}
                leftIcon={instructor.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              >
                {instructor.status === 'active'
                  ? (language === 'id' ? 'Suspend' : 'Suspend')
                  : (language === 'id' ? 'Aktifkan' : 'Activate')}
              </Button>
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                {language === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats.totalCourses)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Kursus' : 'Courses'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats.publishedCourses)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Publish' : 'Published'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats.totalClasses)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Kelas' : 'Classes'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats.totalStudents)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{instructor.stats.averageRating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats.totalReviews)}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(instructor.stats.totalRevenue)}</p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-2 space-y-6">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Informasi Kontak' : 'Contact Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{instructor.email}</p>
                  </div>
                </div>
                {instructor.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Telepon' : 'Phone'}</p>
                      <p className="font-medium text-gray-900">{instructor.phone}</p>
                    </div>
                  </div>
                )}
                {instructor.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Lokasi' : 'Location'}</p>
                      <p className="font-medium text-gray-900">{instructor.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">{language === 'id' ? 'Bergabung' : 'Joined'}</p>
                    <p className="font-medium text-gray-900">
                      {new Date(instructor.createdAt).toLocaleDateString('id-ID')} ({getTimeAgo(instructor.createdAt)})
                    </p>
                  </div>
                </div>
                {instructor.lastLogin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Login Terakhir' : 'Last Login'}</p>
                      <p className="font-medium text-gray-900">{getTimeAgo(instructor.lastLogin)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            {instructor.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Tentang' : 'About'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">{instructor.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Expertise */}
            {instructor.expertise && instructor.expertise.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Keahlian' : 'Expertise'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {instructor.expertise.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Courses */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Kursus' : 'Courses'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockCourses.map((course) => (
                    <div key={course.id} className="flex gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-24 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-1">
                          <h4 className="font-medium text-gray-900 text-sm">{course.title}</h4>
                          <Badge variant={course.status === 'published' ? 'success' : 'secondary'} size="sm">
                            {course.status === 'published' ? 'Published' : 'Draft'}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">{course.category}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {formatNumber(course.studentsEnrolled)} {language === 'id' ? 'siswa' : 'students'}
                          </span>
                          {course.rating > 0 && (
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {course.rating.toFixed(1)}
                            </span>
                          )}
                          <span className="font-medium">{formatCurrency(course.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Classes */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Kelas' : 'Classes'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockClasses.map((cls) => (
                    <div key={cls.id} className="p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">{cls.name}</h4>
                          <p className="text-xs text-gray-500">{cls.courseTitle}</p>
                        </div>
                        <Badge variant={cls.status === 'active' ? 'success' : 'secondary'} size="sm">
                          {cls.status === 'active' ? (language === 'id' ? 'Aktif' : 'Active') : (language === 'id' ? 'Selesai' : 'Completed')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {cls.studentsCount} {language === 'id' ? 'siswa' : 'students'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cls.schedule}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Quick Info */}
          <div className="space-y-6">
            {/* Performance Summary */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Ringkasan Kinerja' : 'Performance Summary'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Tingkat Penyelesaian' : 'Completion Rate'}</span>
                    <span className="font-medium text-sm">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Kepuasan Siswa' : 'Student Satisfaction'}</span>
                    <span className="font-medium text-sm">96%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Responsif' : 'Response Time'}</span>
                    <span className="font-medium text-sm">{language === 'id' ? '< 2 jam' : '< 2 hours'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Pendapatan' : 'Earnings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'id' ? 'Total' : 'Total'}</span>
                  <span className="font-bold text-gray-900">{formatCurrency(instructor.stats.totalRevenue)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'id' ? 'Bulan Ini' : 'This Month'}</span>
                  <span className="font-medium text-gray-900">{formatCurrency(8500000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{language === 'id' ? 'Pertumbuhan' : 'Growth'}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <TrendingUp className="w-4 h-4" />
                    +12%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Konfirmasi Hapus' : 'Confirm Delete'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Apakah Anda yakin ingin menghapus instruktur ini? Tindakan ini tidak dapat dibatalkan.'
                : 'Are you sure you want to delete this instructor? This action cannot be undone.'}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleDelete}>
                {language === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
