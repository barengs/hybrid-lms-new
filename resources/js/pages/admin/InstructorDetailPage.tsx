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
  XCircle,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  useGetInstructorQuery,
  useUpdateInstructorStatusMutation,
  useDeleteInstructorMutation,
  type Instructor as InstructorType
} from '@/store/api/instructorManagementApiSlice';
import { LoadingScreen } from '@/components/ui';


export function InstructorDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  
  // Queries & Mutations
  const { data: instructorData, isLoading, isError } = useGetInstructorQuery(id!);
  const [updateStatus] = useUpdateInstructorStatusMutation();
  const [deleteInstructorMutation] = useDeleteInstructorMutation();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const instructor = instructorData?.data;

  if (isLoading) return <LoadingScreen />;
  
  if (isError || !instructor) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-red-500">{language === 'id' ? 'Gagal memuat data instruktur' : 'Failed to load instructor data'}</p>
          <Link to="/admin/instructors" className="text-blue-500 hover:underline mt-4 block">
            {language === 'id' ? 'Kembali ke Daftar' : 'Back to List'}
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const handleEdit = () => {
    console.log('Edit instructor:', id);
  };

  const handleSuspend = async () => {
    const newStatus = instructor.status === 'active' ? 'suspended' : 'active';
    try {
      await updateStatus({ id: instructor.id, status: newStatus }).unwrap();
      toast.success(language === 'id' ? 'Status diperbarui' : 'Status updated');
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal memperbarui status' : 'Failed to update status');
    }
  };

  const handleApprove = async () => {
    try {
      await updateStatus({ id: instructor.id, status: 'active' }).unwrap();
      toast.success(language === 'id' ? 'Instruktur disetujui' : 'Instructor approved');
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menyetujui instruktur' : 'Failed to approve instructor');
    }
  };

  const handleReject = async () => {
    try {
      await updateStatus({ id: instructor.id, status: 'rejected' }).unwrap();
      toast.success(language === 'id' ? 'Aplikasi ditolak' : 'Application rejected');
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menolak aplikasi' : 'Failed to reject application');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInstructorMutation(instructor.id).unwrap();
      toast.success(language === 'id' ? 'Instruktur dihapus' : 'Instructor deleted');
      setShowDeleteModal(false);
      navigate('/admin/instructors');
    } catch (error) {
      toast.error(language === 'id' ? 'Gagal menghapus instruktur' : 'Failed to delete instructor');
    }
  };

  const getStatusBadge = (status: string) => {
    const config: any = {
      active: { variant: 'success' as const, label: language === 'id' ? 'Aktif' : 'Active', icon: CheckCircle },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu' : 'Pending', icon: Clock },
      suspended: { variant: 'danger' as const, label: language === 'id' ? 'Suspend' : 'Suspended', icon: Ban },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle },
    };
    const { variant, label, icon: Icon } = config[status] || config.suspended;
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
              <Avatar src={instructor.profile?.avatar || ''} name={instructor.name} size="lg" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{instructor.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="primary">{language === 'id' ? 'Instruktur' : 'Instructor'}</Badge>
                  {getStatusBadge(instructor.status)}
                  {instructor.status === 'active' && (
                    <Badge variant="success" size="sm">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      {language === 'id' ? 'Terverifikasi' : 'Verified'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {instructor.status === 'pending' && (
                <>
                  <Button size="sm" onClick={handleApprove} leftIcon={<CheckCircle className="w-4 h-4" />}>
                    {language === 'id' ? 'Setujui' : 'Approve'}
                  </Button>
                  <Button size="sm" variant="danger" onClick={handleReject} leftIcon={<XCircle className="w-4 h-4" />}>
                    {language === 'id' ? 'Tolak' : 'Reject'}
                  </Button>
                </>
              )}
              <Button size="sm" variant="outline" onClick={handleEdit} leftIcon={<Edit className="w-4 h-4" />}>
                {language === 'id' ? 'Edit' : 'Edit'}
              </Button>
              {instructor.status !== 'pending' && (
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
              )}
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
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats?.totalCourses || 0)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Kursus' : 'Courses'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats?.publishedCourses || 0)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Publish' : 'Published'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats?.totalClasses || 0)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Kelas' : 'Classes'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats?.totalStudents || 0)}</p>
              <p className="text-xs text-gray-500">{language === 'id' ? 'Siswa' : 'Students'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{(instructor.stats?.averageRating || 0).toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(instructor.stats?.totalReviews || 0)}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(instructor.stats?.totalRevenue || 0)}</p>
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
                {instructor.profile?.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Telepon' : 'Phone'}</p>
                      <p className="font-medium text-gray-900">{instructor.profile.phone}</p>
                    </div>
                  </div>
                )}
                {instructor.profile?.address && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Lokasi' : 'Location'}</p>
                      <p className="font-medium text-gray-900">{instructor.profile.address}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-gray-500">{language === 'id' ? 'Bergabung' : 'Joined'}</p>
                    <p className="font-medium text-gray-900">
                      {new Date(instructor.created_at).toLocaleDateString('id-ID')} ({getTimeAgo(instructor.created_at)})
                    </p>
                  </div>
                </div>
                {instructor.last_login_at && (
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-gray-500">{language === 'id' ? 'Login Terakhir' : 'Last Login'}</p>
                      <p className="font-medium text-gray-900">{getTimeAgo(instructor.last_login_at)}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bio */}
            {instructor.profile?.bio && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Tentang' : 'About'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm">{instructor.profile.bio}</p>
                </CardContent>
              </Card>
            )}

            {/* Expertise */}
            {instructor.profile?.expertise && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Keahlian' : 'Expertise'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(instructor.profile.expertise) 
                      ? instructor.profile.expertise.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary">{skill}</Badge>
                        ))
                      : <Badge variant="secondary">{instructor.profile.expertise}</Badge>
                    }
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
                  {instructor.courses_data && instructor.courses_data.length > 0 ? (
                    instructor.courses_data.map((course: any) => (
                      <div key={course.id} className="flex gap-4 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                        <div className="w-20 h-20 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                          {course.thumbnail ? (
                            <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
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
                              {formatNumber(course.studentsEnrolled || 0)} {language === 'id' ? 'siswa' : 'students'}
                            </span>
                            {(course.rating || 0) > 0 && (
                              <span className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-500" />
                                {(course.rating || 0).toFixed(1)}
                              </span>
                            )}
                            <span className="font-medium">{formatCurrency(course.price || 0)}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <BookOpen className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>{language === 'id' ? 'Belum ada kursus' : 'No courses yet'}</p>
                    </div>
                  )}
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
                  {instructor.batches_data && instructor.batches_data.length > 0 ? (
                    instructor.batches_data.map((cls: any) => (
                      <div key={cls.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">{cls.name}</h4>
                            <p className="text-xs text-gray-500">{cls.courseTitle}</p>
                          </div>
                          <Badge variant={cls.status === 'active' || cls.status === 'in_progress' ? 'success' : 'secondary'} size="sm">
                            {cls.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {cls.studentsCount} {language === 'id' ? 'siswa' : 'students'}
                          </span>
                          {cls.schedule && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cls.schedule}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>{language === 'id' ? 'Belum ada kelas' : 'No classes yet'}</p>
                    </div>
                  )}
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
                  <span className="font-bold text-gray-900">{formatCurrency(instructor.stats?.totalRevenue || 0)}</span>
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
