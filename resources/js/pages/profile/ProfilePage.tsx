import { useState } from 'react';
import {
  User,
  Mail,
  Calendar,
  Edit3,
  Trash2,
  Shield,
  BookOpen,
  Award,
  Clock,
  Camera,
  Save,
  AlertTriangle,
  CheckCircle,
  Star,
  Users,
  DollarSign,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Avatar, Input, Modal } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, getTimeAgo } from '@/lib/utils';

// Mock activity history
const mockStudentHistory = [
  { id: '1', type: 'course_enrolled', title: 'Enrolled in React Masterclass', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', type: 'lesson_completed', title: 'Completed: Introduction to Hooks', date: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', type: 'badge_earned', title: 'Earned badge: First Steps', date: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', type: 'quiz_passed', title: 'Passed Quiz: JavaScript Basics (85%)', date: new Date(Date.now() - 345600000).toISOString() },
  { id: '5', type: 'certificate_earned', title: 'Certificate earned: Web Development Fundamentals', date: new Date(Date.now() - 432000000).toISOString() },
];

const mockInstructorHistory = [
  { id: '1', type: 'course_published', title: 'Published: Advanced React Patterns', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', type: 'student_enrolled', title: '15 new students enrolled in your courses', date: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', type: 'review_received', title: 'New 5-star review on React Masterclass', date: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', type: 'payout_received', title: 'Payout received: Rp 2.500.000', date: new Date(Date.now() - 345600000).toISOString() },
  { id: '5', type: 'question_answered', title: 'Answered 5 student questions', date: new Date(Date.now() - 432000000).toISOString() },
];

const mockAdminHistory = [
  { id: '1', type: 'user_verified', title: 'Verified instructor: Budi Pengajar', date: new Date(Date.now() - 86400000).toISOString() },
  { id: '2', type: 'course_approved', title: 'Approved course: Machine Learning Basics', date: new Date(Date.now() - 172800000).toISOString() },
  { id: '3', type: 'payout_processed', title: 'Processed 10 instructor payouts', date: new Date(Date.now() - 259200000).toISOString() },
  { id: '4', type: 'user_suspended', title: 'Suspended user for policy violation', date: new Date(Date.now() - 345600000).toISOString() },
  { id: '5', type: 'settings_updated', title: 'Updated platform commission settings', date: new Date(Date.now() - 432000000).toISOString() },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'settings'>('profile');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const tabs = [
    { id: 'profile', label: language === 'id' ? 'Detail Profil' : 'Profile Details' },
    { id: 'history', label: language === 'id' ? 'Riwayat Aktivitas' : 'Activity History' },
    { id: 'settings', label: language === 'id' ? 'Pengaturan' : 'Settings' },
  ];

  const getHistory = () => {
    switch (user?.role) {
      case 'instructor':
        return mockInstructorHistory;
      case 'admin':
        return mockAdminHistory;
      default:
        return mockStudentHistory;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'instructor':
        return language === 'id' ? 'Instruktur' : 'Instructor';
      default:
        return language === 'id' ? 'Siswa' : 'Student';
    }
  };

  const getRoleBadgeVariant = () => {
    switch (user?.role) {
      case 'admin':
        return 'danger';
      case 'instructor':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'course_enrolled':
      case 'course_published':
      case 'course_approved':
        return <BookOpen className="w-4 h-4" />;
      case 'badge_earned':
      case 'certificate_earned':
        return <Award className="w-4 h-4" />;
      case 'lesson_completed':
      case 'quiz_passed':
        return <CheckCircle className="w-4 h-4" />;
      case 'student_enrolled':
      case 'user_verified':
        return <Users className="w-4 h-4" />;
      case 'review_received':
        return <Star className="w-4 h-4" />;
      case 'payout_received':
      case 'payout_processed':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleSaveProfile = () => {
    // In real app, call API to update profile
    console.log('Saving profile:', editForm);
    setShowEditModal(false);
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText === 'DELETE') {
      // In real app, call API to delete account
      console.log('Deleting account');
      logout();
    }
  };

  // Mock stats based on role
  const studentStats = {
    enrolledCourses: 5,
    completedCourses: 3,
    totalPoints: 1250,
    certificates: 2,
  };

  const instructorStats = {
    totalCourses: 8,
    totalStudents: 1250,
    totalEarnings: 15000000,
    avgRating: 4.8,
  };

  const adminStats = {
    totalUsers: 5420,
    totalCourses: 156,
    pendingVerifications: 12,
    monthlyRevenue: 125000000,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar
                src={user?.avatar}
                name={user?.name || 'User'}
                size="xl"
                className="w-24 h-24"
              />
              <button
                aria-label="Change avatar"
                className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                onClick={() => setShowEditModal(true)}
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <Badge variant={getRoleBadgeVariant() as 'primary' | 'secondary' | 'success' | 'warning' | 'danger'}>
                  {getRoleLabel()}
                </Badge>
                {user?.isVerified && (
                  <Badge variant="success" size="sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {language === 'id' ? 'Terverifikasi' : 'Verified'}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mt-1">{user?.email}</p>
              <p className="text-sm text-gray-500 mt-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                {language === 'id' ? 'Bergabung' : 'Joined'} {user?.createdAt ? getTimeAgo(user.createdAt) : '-'}
              </p>
              {user?.bio && (
                <p className="text-gray-600 mt-3">{user.bio}</p>
              )}
            </div>
            <Button
              variant="outline"
              leftIcon={<Edit3 className="w-4 h-4" />}
              onClick={() => setShowEditModal(true)}
            >
              {language === 'id' ? 'Edit Profil' : 'Edit Profile'}
            </Button>
          </div>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {user?.role === 'student' && (
            <>
              <Card className="text-center p-4">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{studentStats.enrolledCourses}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Kursus Aktif' : 'Active Courses'}</p>
              </Card>
              <Card className="text-center p-4">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{studentStats.completedCourses}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Selesai' : 'Completed'}</p>
              </Card>
              <Card className="text-center p-4">
                <Star className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{studentStats.totalPoints}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Poin' : 'Total Points'}</p>
              </Card>
              <Card className="text-center p-4">
                <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{studentStats.certificates}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Sertifikat' : 'Certificates'}</p>
              </Card>
            </>
          )}
          {user?.role === 'instructor' && (
            <>
              <Card className="text-center p-4">
                <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{instructorStats.totalCourses}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Kursus' : 'Total Courses'}</p>
              </Card>
              <Card className="text-center p-4">
                <Users className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{instructorStats.totalStudents}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Siswa' : 'Total Students'}</p>
              </Card>
              <Card className="text-center p-4">
                <DollarSign className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(instructorStats.totalEarnings)}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Pendapatan' : 'Earnings'}</p>
              </Card>
              <Card className="text-center p-4">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{instructorStats.avgRating}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Rating' : 'Rating'}</p>
              </Card>
            </>
          )}
          {user?.role === 'admin' && (
            <>
              <Card className="text-center p-4">
                <Users className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalUsers}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Pengguna' : 'Total Users'}</p>
              </Card>
              <Card className="text-center p-4">
                <BookOpen className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{adminStats.totalCourses}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Kursus' : 'Total Courses'}</p>
              </Card>
              <Card className="text-center p-4">
                <Shield className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{adminStats.pendingVerifications}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Verifikasi Pending' : 'Pending Verifications'}</p>
              </Card>
              <Card className="text-center p-4">
                <DollarSign className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(adminStats.monthlyRevenue)}</p>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Pendapatan Bulan Ini' : 'Monthly Revenue'}</p>
              </Card>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'history' | 'settings')}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Informasi Profil' : 'Profile Information'}</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {language === 'id' ? 'Nama Lengkap' : 'Full Name'}
                  </label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    {user?.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {user?.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {language === 'id' ? 'Peran' : 'Role'}
                  </label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" />
                    {getRoleLabel()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    {language === 'id' ? 'Tanggal Bergabung' : 'Join Date'}
                  </label>
                  <p className="text-gray-900 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Bio</label>
                <p className="text-gray-900 mt-1">
                  {user?.bio || (language === 'id' ? 'Belum ada bio.' : 'No bio yet.')}
                </p>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'history' && (
          <Card>
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Riwayat Aktivitas' : 'Activity History'}</CardTitle>
            </CardHeader>
            <div className="space-y-4">
              {getHistory().map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900">{activity.title}</p>
                    <p className="text-sm text-gray-500">{getTimeAgo(activity.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-6">
            {/* Edit Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Edit Profil' : 'Edit Profile'}</CardTitle>
              </CardHeader>
              <p className="text-gray-600 mb-4">
                {language === 'id'
                  ? 'Perbarui informasi profil Anda untuk menjaga akun tetap up-to-date.'
                  : 'Update your profile information to keep your account up-to-date.'}
              </p>
              <Button
                leftIcon={<Edit3 className="w-4 h-4" />}
                onClick={() => setShowEditModal(true)}
              >
                {language === 'id' ? 'Edit Profil' : 'Edit Profile'}
              </Button>
            </Card>

            {/* Delete Account Section */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">
                  {language === 'id' ? 'Hapus Akun' : 'Delete Account'}
                </CardTitle>
              </CardHeader>
              <p className="text-gray-600 mb-4">
                {language === 'id'
                  ? 'Setelah akun dihapus, semua data Anda akan dihapus permanen dan tidak dapat dikembalikan.'
                  : 'Once your account is deleted, all of your data will be permanently removed and cannot be recovered.'}
              </p>
              <Button
                variant="danger"
                leftIcon={<Trash2 className="w-4 h-4" />}
                onClick={() => setShowDeleteModal(true)}
              >
                {language === 'id' ? 'Hapus Akun' : 'Delete Account'}
              </Button>
            </Card>
          </div>
        )}

        {/* Edit Profile Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title={language === 'id' ? 'Edit Profil' : 'Edit Profile'}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Avatar
                  src={user?.avatar}
                  name={user?.name || 'User'}
                  size="xl"
                  className="w-24 h-24"
                />
                <button
                  aria-label="Upload photo"
                  className="absolute bottom-0 right-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>
            </div>
            <Input
              label={language === 'id' ? 'Nama Lengkap' : 'Full Name'}
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              leftIcon={<User className="w-5 h-5" />}
            />
            <Input
              label="Email"
              type="email"
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              leftIcon={<Mail className="w-5 h-5" />}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                placeholder={language === 'id' ? 'Ceritakan tentang diri Anda...' : 'Tell us about yourself...'}
                rows={4}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button leftIcon={<Save className="w-4 h-4" />} onClick={handleSaveProfile}>
                {language === 'id' ? 'Simpan' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Delete Account Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title={language === 'id' ? 'Hapus Akun' : 'Delete Account'}
          size="md"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {language === 'id' ? 'Apakah Anda yakin?' : 'Are you sure?'}
            </h3>
            <p className="text-gray-600 mb-6">
              {language === 'id'
                ? 'Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus permanen.'
                : 'This action cannot be undone. All of your data will be permanently deleted.'}
            </p>
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">
                {language === 'id'
                  ? 'Ketik DELETE untuk mengonfirmasi:'
                  : 'Type DELETE to confirm:'}
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
                className="text-center"
              />
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                variant="danger"
                disabled={deleteConfirmText !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                {language === 'id' ? 'Hapus Akun Saya' : 'Delete My Account'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
