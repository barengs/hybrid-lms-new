import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  Users,
  UserCheck,
  UserX,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  XCircle,
  Mail,
  Calendar,
  Clock,
  Download,
  Eye,
  Award,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Select, Modal, DataTable } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// Instructor interface
interface Instructor {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'active' | 'suspended' | 'pending';
  isVerified: boolean;
  createdAt: string;
  lastLogin?: string;
  stats: {
    coursesCreated: number;
    totalStudents: number;
    totalRevenue: number;
    rating: number;
  };
}

// Mock instructors data
const mockInstructors: Instructor[] = [
  {
    id: 'inst-1',
    name: 'Siti Nurhaliza',
    email: 'siti.nur@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    lastLogin: new Date(Date.now() - 7200000).toISOString(),
    stats: {
      coursesCreated: 12,
      totalStudents: 1542,
      totalRevenue: 45000000,
      rating: 4.8,
    },
  },
  {
    id: 'inst-2',
    name: 'Dewi Lestari',
    email: 'dewi.lestari@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    status: 'active',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 120).toISOString(),
    lastLogin: new Date(Date.now() - 86400000).toISOString(),
    stats: {
      coursesCreated: 8,
      totalStudents: 980,
      totalRevenue: 28000000,
      rating: 4.6,
    },
  },
  {
    id: 'inst-3',
    name: 'Rudi Hermawan',
    email: 'rudi.h@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rudi',
    status: 'pending',
    isVerified: false,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    stats: {
      coursesCreated: 0,
      totalStudents: 0,
      totalRevenue: 0,
      rating: 0,
    },
  },
  {
    id: 'inst-4',
    name: 'Ani Wijaya',
    email: 'ani.wijaya@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ani',
    status: 'pending',
    isVerified: false,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    stats: {
      coursesCreated: 0,
      totalStudents: 0,
      totalRevenue: 0,
      rating: 0,
    },
  },
  {
    id: 'inst-5',
    name: 'Budi Santoso',
    email: 'budi.s@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiS',
    status: 'suspended',
    isVerified: true,
    createdAt: new Date(Date.now() - 86400000 * 180).toISOString(),
    stats: {
      coursesCreated: 5,
      totalStudents: 320,
      totalRevenue: 12000000,
      rating: 3.9,
    },
  },
];

export function InstructorsManagementPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInstructors, setSelectedInstructors] = useState<Instructor[]>([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processingInstructor, setProcessingInstructor] = useState<Instructor | null>(null);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockInstructors.length;
    const active = mockInstructors.filter(i => i.status === 'active').length;
    const pending = mockInstructors.filter(i => i.status === 'pending').length;
    const suspended = mockInstructors.filter(i => i.status === 'suspended').length;
    const totalCourses = mockInstructors.reduce((sum, i) => sum + i.stats.coursesCreated, 0);
    const totalStudents = mockInstructors.reduce((sum, i) => sum + i.stats.totalStudents, 0);
    const totalRevenue = mockInstructors.reduce((sum, i) => sum + i.stats.totalRevenue, 0);

    return { total, active, pending, suspended, totalCourses, totalStudents, totalRevenue };
  }, []);

  // Filter instructors
  const filteredInstructors = useMemo(() => {
    let instructors = [...mockInstructors];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      instructors = instructors.filter(i =>
        i.name.toLowerCase().includes(query) ||
        i.email.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      instructors = instructors.filter(i => i.status === statusFilter);
    }

    return instructors;
  }, [searchQuery, statusFilter]);

  // Pending instructors
  const pendingInstructors = useMemo(() => {
    return mockInstructors.filter(i => i.status === 'pending');
  }, []);

  // Handlers
  const handleApprove = (instructor: Instructor) => {
    setProcessingInstructor(instructor);
    setShowApproveModal(true);
  };

  const confirmApprove = () => {
    console.log('Approving instructor:', processingInstructor?.id);
    setShowApproveModal(false);
    setProcessingInstructor(null);
  };

  const handleReject = (instructor: Instructor) => {
    setProcessingInstructor(instructor);
    setShowRejectModal(true);
  };

  const confirmReject = () => {
    console.log('Rejecting instructor:', processingInstructor?.id);
    setShowRejectModal(false);
    setProcessingInstructor(null);
  };

  const handleSuspend = (instructorId: string) => {
    console.log('Toggling suspend for instructor:', instructorId);
  };

  const handleDelete = (instructor: Instructor) => {
    setProcessingInstructor(instructor);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log('Deleting instructor:', processingInstructor?.id);
    setShowDeleteModal(false);
    setProcessingInstructor(null);
  };

  const getStatusBadge = (status: Instructor['status']) => {
    const config = {
      active: { variant: 'success' as const, label: language === 'id' ? 'Aktif' : 'Active', icon: CheckCircle },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu' : 'Pending', icon: Clock },
      suspended: { variant: 'danger' as const, label: language === 'id' ? 'Suspend' : 'Suspended', icon: Ban },
    };
    const { variant, label, icon: Icon } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getInstructorActions = (instructor: Instructor): DropdownItem[] => {
    const actions: DropdownItem[] = [
      {
        label: language === 'id' ? 'Lihat Detail' : 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => navigate(`/admin/instructors/${instructor.id}`),
      },
    ];

    if (instructor.status === 'pending') {
      actions.push({
        label: language === 'id' ? 'Setujui' : 'Approve',
        icon: <CheckCircle className="w-4 h-4" />,
        onClick: () => handleApprove(instructor),
      });
      actions.push({
        label: language === 'id' ? 'Tolak' : 'Reject',
        icon: <XCircle className="w-4 h-4" />,
        onClick: () => handleReject(instructor),
      });
    } else {
      actions.push({
        label: language === 'id' ? 'Edit' : 'Edit',
        icon: <Edit className="w-4 h-4" />,
        onClick: () => console.log('Edit instructor:', instructor.id),
      });
      actions.push({
        label: instructor.status === 'active'
          ? (language === 'id' ? 'Suspend' : 'Suspend')
          : (language === 'id' ? 'Aktifkan' : 'Activate'),
        icon: instructor.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />,
        onClick: () => handleSuspend(instructor.id),
      });
    }

    actions.push({ divider: true, label: '' });
    actions.push({
      label: language === 'id' ? 'Hapus' : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      onClick: () => handleDelete(instructor),
      danger: true,
    });

    return actions;
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Instructor>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'name',
        header: language === 'id' ? 'Instruktur' : 'Instructor',
        cell: ({ row }) => {
          const instructor = row.original;
          return (
            <div className="flex items-center gap-3">
              <Avatar src={instructor.avatar} name={instructor.name} size="sm" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">{instructor.name}</p>
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Mail className="w-3 h-3" />
                  {instructor.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'stats.totalRevenue',
        header: language === 'id' ? 'Pendapatan' : 'Revenue',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(row.original.stats.totalRevenue)}
          </div>
        ),
      },
      {
        accessorKey: 'stats.rating',
        header: 'Rating',
        cell: ({ row }) => {
          const rating = row.original.stats.rating;
          return rating > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <Award className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-gray-400 text-sm">-</span>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'createdAt',
        header: language === 'id' ? 'Terdaftar' : 'Registered',
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {new Date(date).toLocaleDateString('id-ID')}
              </div>
              <div className="text-gray-500 dark:text-gray-400">{getTimeAgo(date)}</div>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: language === 'id' ? 'Aksi' : 'Actions',
        cell: ({ row }) => (
          <Dropdown
            trigger={
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            }
            items={getInstructorActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language]
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'id' ? 'Manajemen Instruktur' : 'Instructors Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'id'
              ? 'Kelola semua instruktur platform'
              : 'Manage all platform instructors'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.total)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'Total' : 'Total'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.active)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'Aktif' : 'Active'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.pending)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats.suspended)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{language === 'id' ? 'Suspend' : 'Suspended'}</p>
            </div>
          </Card>
        </div>

        {/* Pending Verifications */}
        {pendingInstructors.length > 0 && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                {language === 'id' ? 'Menunggu Verifikasi' : 'Pending Verification'}
                <Badge variant="warning">{pendingInstructors.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pendingInstructors.map((instructor) => (
                  <div key={instructor.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Avatar src={instructor.avatar} name={instructor.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{instructor.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{instructor.email}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleApprove(instructor)}>
                        {language === 'id' ? 'Setujui' : 'Approve'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleReject(instructor)}>
                        {language === 'id' ? 'Tolak' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bulk Actions */}
        {selectedInstructors.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
                {selectedInstructors.length} {language === 'id' ? 'instruktur dipilih' : 'instructors selected'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  {language === 'id' ? 'Aktifkan' : 'Activate'}
                </Button>
                <Button size="sm" variant="outline">
                  {language === 'id' ? 'Suspend' : 'Suspend'}
                </Button>
                <Button size="sm" variant="danger">
                  {language === 'id' ? 'Hapus' : 'Delete'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Instructors Table */}
        <Card>
          {/* Filters */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari nama atau email...' : 'Search name or email...'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'active', label: language === 'id' ? 'Aktif' : 'Active' },
                    { value: 'pending', label: language === 'id' ? 'Menunggu' : 'Pending' },
                    { value: 'suspended', label: language === 'id' ? 'Suspend' : 'Suspended' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={columns}
            data={filteredInstructors}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={setSelectedInstructors}
          />
        </Card>

        {/* Approve Modal */}
        <Modal
          isOpen={showApproveModal}
          onClose={() => setShowApproveModal(false)}
          title={language === 'id' ? 'Setujui Instruktur' : 'Approve Instructor'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? `Setujui ${processingInstructor?.name} sebagai instruktur?`
                : `Approve ${processingInstructor?.name} as instructor?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowApproveModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" onClick={confirmApprove}>
                {language === 'id' ? 'Setujui' : 'Approve'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Reject Modal */}
        <Modal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          title={language === 'id' ? 'Tolak Instruktur' : 'Reject Instructor'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? `Tolak aplikasi ${processingInstructor?.name}?`
                : `Reject ${processingInstructor?.name}'s application?`}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRejectModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={confirmReject}>
                {language === 'id' ? 'Tolak' : 'Reject'}
              </Button>
            </div>
          </div>
        </Modal>

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
              <Button size="sm" variant="danger" onClick={confirmDelete}>
                {language === 'id' ? 'Hapus' : 'Delete'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
