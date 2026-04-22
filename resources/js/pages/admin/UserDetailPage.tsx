import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Shield,
  Edit,
  Ban,
  CheckCircle,
  Trash2,
  BookOpen,
  Award,
  Activity,
  Users,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, getTimeAgo } from '@/lib/utils';

// Mock user detail data
interface UserDetail {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'instructor' | 'admin';
  status: 'active' | 'suspended';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  location?: string;
  bio?: string;
  stats: {
    coursesEnrolled?: number;
    coursesCompleted?: number;
    coursesCreated?: number;
    totalStudents?: number;
    certificates?: number;
    points?: number;
  };
}

interface Activity {
  id: string;
  type: 'login' | 'course_enroll' | 'course_complete' | 'certificate';
  description: string;
  timestamp: string;
}

const mockUserDetail: UserDetail = {
  id: 'user-1',
  name: 'Ahmad Rizki',
  email: 'ahmad.rizki@example.com',
  phone: '+62 812-3456-7890',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
  role: 'student',
  status: 'active',
  isVerified: true,
  createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
  lastLogin: new Date(Date.now() - 3600000).toISOString(),
  location: 'Jakarta, Indonesia',
  bio: 'Passionate learner interested in web development and design.',
  stats: {
    coursesEnrolled: 8,
    coursesCompleted: 5,
    certificates: 5,
    points: 1250,
  },
};

const mockActivities: Activity[] = [
  {
    id: 'act-1',
    type: 'login',
    description: 'Logged in to the platform',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'act-2',
    type: 'course_complete',
    description: 'Completed course "Advanced React Development"',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'act-3',
    type: 'certificate',
    description: 'Earned certificate for "React Fundamentals"',
    timestamp: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'act-4',
    type: 'course_enroll',
    description: 'Enrolled in "TypeScript Mastery"',
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // In real app, fetch user data based on id
  const user = mockUserDetail;

  const handleEdit = () => {
    // Navigate to edit or open modal in future
    console.log('Edit user:', id);
  };

  const handleSuspend = () => {
    console.log('Suspend user:', id);
  };

  const handleDelete = () => {
    console.log('Delete user:', id);
    setShowDeleteModal(false);
    navigate('/admin/users');
  };

  const getRoleBadge = (role: UserDetail['role']) => {
    const config = {
      student: { variant: 'secondary' as const, label: language === 'id' ? 'Siswa' : 'Student' },
      instructor: { variant: 'primary' as const, label: language === 'id' ? 'Instruktur' : 'Instructor' },
      admin: { variant: 'danger' as const, label: 'Admin' },
    };
    const { variant, label } = config[role];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getStatusBadge = (status: UserDetail['status']) => {
    return status === 'active' ? (
      <Badge variant="success">
        <CheckCircle className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Aktif' : 'Active'}
      </Badge>
    ) : (
      <Badge variant="warning">
        <Ban className="w-3 h-3 mr-1" />
        {language === 'id' ? 'Suspend' : 'Suspended'}
      </Badge>
    );
  };

  const getActivityIcon = (type: Activity['type']) => {
    const icons = {
      login: <Activity className="w-4 h-4 text-blue-500" />,
      course_enroll: <BookOpen className="w-4 h-4 text-purple-500" />,
      course_complete: <CheckCircle className="w-4 h-4 text-green-500" />,
      certificate: <Award className="w-4 h-4 text-yellow-500" />,
    };
    return icons[type];
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'id' ? 'Kembali ke Daftar Pengguna' : 'Back to Users List'}
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              <Avatar src={user.avatar} name={user.name} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getRoleBadge(user.role)}
                  {getStatusBadge(user.status)}
                  {user.isVerified && (
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
                leftIcon={user.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
              >
                {user.status === 'active'
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

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left Column - User Info */}
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
                    <p className="text-gray-500">{language === 'id' ? 'Email' : 'Email'}</p>
                    <p className="font-medium text-gray-900">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Telepon' : 'Phone'}</p>
                      <p className="font-medium text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                {user.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Lokasi' : 'Location'}</p>
                      <p className="font-medium text-gray-900">{user.location}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">{language === 'id' ? 'Terdaftar' : 'Registered'}</p>
                    <p className="font-medium text-gray-900">
                      {new Date(user.createdAt).toLocaleDateString('id-ID')} ({getTimeAgo(user.createdAt)})
                    </p>
                  </div>
                </div>
                {user.lastLogin && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Login Terakhir' : 'Last Login'}</p>
                      <p className="font-medium text-gray-900">
                        {new Date(user.lastLogin).toLocaleDateString('id-ID')} ({getTimeAgo(user.lastLogin)})
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            {user.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Tentang' : 'About'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">{user.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Aktivitas Terbaru' : 'Recent Activity'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        {index < mockActivities.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{getTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Stats */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Statistik' : 'Statistics'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.role === 'student' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {language === 'id' ? 'Kursus Diambil' : 'Courses Enrolled'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(user.stats.coursesEnrolled || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-600">
                          {language === 'id' ? 'Kursus Selesai' : 'Courses Completed'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(user.stats.coursesCompleted || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {language === 'id' ? 'Sertifikat' : 'Certificates'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(user.stats.certificates || 0)}
                      </span>
                    </div>
                  </>
                )}
                {user.role === 'instructor' && (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500" />
                        <span className="text-sm text-gray-600">
                          {language === 'id' ? 'Kursus Dibuat' : 'Courses Created'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(user.stats.coursesCreated || 0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-sm text-gray-600">
                          {language === 'id' ? 'Total Siswa' : 'Total Students'}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {formatNumber(user.stats.totalStudents || 0)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Aksi Cepat' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  {language === 'id' ? 'Kirim Email' : 'Send Email'}
                </Button>
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  {language === 'id' ? 'Reset Password' : 'Reset Password'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Konfirmasi Hapus' : 'Confirm Delete'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Apakah Anda yakin ingin menghapus pengguna ini? Tindakan ini tidak dapat dibatalkan.'
                : 'Are you sure you want to delete this user? This action cannot be undone.'}
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
