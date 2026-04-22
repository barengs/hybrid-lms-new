import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Search,
  Download,
  MoreVertical,
  Eye,
  UserCheck,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Select, DataTable, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// Payout interface
interface InstructorPayout {
  id: string;
  payoutId: string;
  instructor: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  requestDate: string;
  processedDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  method: 'bank_transfer' | 'paypal' | 'e_wallet';
  accountInfo: string;
  notes?: string;
  adminNotes?: string;
}

// Mock data
const mockPayouts: InstructorPayout[] = [
  {
    id: 'po-1',
    payoutId: 'PO-2024-001',
    instructor: {
      id: 'inst-1',
      name: 'Budi Santoso',
      email: 'budi@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    },
    amount: 25000000,
    requestDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    status: 'pending',
    method: 'bank_transfer',
    accountInfo: 'BCA - 1234567890',
  },
  {
    id: 'po-2',
    payoutId: 'PO-2024-002',
    instructor: {
      id: 'inst-2',
      name: 'Siti Nurhaliza',
      email: 'siti@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    },
    amount: 15000000,
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    status: 'pending',
    method: 'bank_transfer',
    accountInfo: 'Mandiri - 9876543210',
  },
  {
    id: 'po-3',
    payoutId: 'PO-2024-003',
    instructor: {
      id: 'inst-3',
      name: 'Ahmad Rizki',
      email: 'ahmad@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    },
    amount: 18500000,
    requestDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    status: 'processing',
    method: 'bank_transfer',
    accountInfo: 'BNI - 5555666677',
  },
  {
    id: 'po-4',
    payoutId: 'PO-2024-004',
    instructor: {
      id: 'inst-4',
      name: 'Dewi Sartika',
      email: 'dewi@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    },
    amount: 32000000,
    requestDate: new Date(Date.now() - 86400000 * 10).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 9).toISOString(),
    status: 'completed',
    method: 'bank_transfer',
    accountInfo: 'BCA - 1111222233',
  },
  {
    id: 'po-5',
    payoutId: 'PO-2024-005',
    instructor: {
      id: 'inst-5',
      name: 'Eko Prasetyo',
      email: 'eko@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eko',
    },
    amount: 12000000,
    requestDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    status: 'completed',
    method: 'bank_transfer',
    accountInfo: 'BRI - 9999888877',
  },
  {
    id: 'po-6',
    payoutId: 'PO-2024-006',
    instructor: {
      id: 'inst-6',
      name: 'Rina Wijaya',
      email: 'rina@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina',
    },
    amount: 8500000,
    requestDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 19).toISOString(),
    status: 'rejected',
    method: 'bank_transfer',
    accountInfo: 'BCA - 4444555566',
    notes: 'Insufficient balance verification',
  },
];

export function AdminPayoutsPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<InstructorPayout | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Filter and search
  const filteredPayouts = useMemo(() => {
    let payouts = [...mockPayouts];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      payouts = payouts.filter(
        p =>
          p.instructor.name.toLowerCase().includes(query) ||
          p.instructor.email.toLowerCase().includes(query) ||
          p.payoutId.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      payouts = payouts.filter(p => p.status === statusFilter);
    }

    return payouts;
  }, [searchQuery, statusFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return {
      totalPayouts: mockPayouts
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
      pendingCount: mockPayouts.filter(p => p.status === 'pending').length,
      pendingAmount: mockPayouts
        .filter(p => p.status === 'pending')
        .reduce((sum, p) => sum + p.amount, 0),
      thisMonthPayouts: mockPayouts
        .filter(p => p.status === 'completed' && new Date(p.processedDate!) >= startOfMonth)
        .reduce((sum, p) => sum + p.amount, 0),
      averagePayout: mockPayouts.length > 0
        ? mockPayouts.reduce((sum, p) => sum + p.amount, 0) / mockPayouts.length
        : 0,
    };
  }, []);

  const pendingPayouts = mockPayouts.filter(p => p.status === 'pending');

  const handleApprove = (payout: InstructorPayout) => {
    setSelectedPayout(payout);
    setShowApprovalModal(true);
  };

  const handleReject = (payout: InstructorPayout) => {
    setSelectedPayout(payout);
    setShowRejectionModal(true);
  };

  const handleViewDetails = (payout: InstructorPayout) => {
    setSelectedPayout(payout);
    setShowDetailModal(true);
  };

  const confirmApproval = () => {
    console.log('Approving payout:', selectedPayout?.id, 'Notes:', adminNotes);
    setShowApprovalModal(false);
    setAdminNotes('');
    setSelectedPayout(null);
  };

  const confirmRejection = () => {
    console.log('Rejecting payout:', selectedPayout?.id, 'Reason:', rejectionReason);
    setShowRejectionModal(false);
    setRejectionReason('');
    setSelectedPayout(null);
  };

  const handleBulkApprove = () => {
    console.log('Bulk approving payouts:', selectedPayouts);
    setSelectedPayouts([]);
  };

  const getStatusConfig = (status: InstructorPayout['status']) => {
    const configs = {
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Pending' : 'Pending', icon: Clock },
      processing: { variant: 'primary' as const, label: language === 'id' ? 'Diproses' : 'Processing', icon: AlertCircle },
      completed: { variant: 'success' as const, label: language === 'id' ? 'Selesai' : 'Completed', icon: CheckCircle },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle },
    };
    return configs[status];
  };

  // Table columns
  const columns = useMemo<ColumnDef<InstructorPayout>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(e) => {
              table.toggleAllPageRowsSelected(e.target.checked);
              if (e.target.checked) {
                setSelectedPayouts(filteredPayouts.map(p => p.id));
              } else {
                setSelectedPayouts([]);
              }
            }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={selectedPayouts.includes(row.original.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedPayouts([...selectedPayouts, row.original.id]);
              } else {
                setSelectedPayouts(selectedPayouts.filter(id => id !== row.original.id));
              }
            }}
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'payoutId',
        header: language === 'id' ? 'ID Payout' : 'Payout ID',
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium text-gray-900">{row.original.payoutId}</span>
        ),
      },
      {
        accessorKey: 'instructor',
        header: language === 'id' ? 'Instruktur' : 'Instructor',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.original.instructor.avatar} name={row.original.instructor.name} size="sm" />
            <div>
              <p className="font-medium text-gray-900">{row.original.instructor.name}</p>
              <p className="text-sm text-gray-500">{row.original.instructor.email}</p>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'amount',
        header: language === 'id' ? 'Jumlah' : 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: 'requestDate',
        header: language === 'id' ? 'Tanggal Request' : 'Request Date',
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1.5 text-sm text-gray-900">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {new Date(row.original.requestDate).toLocaleDateString('id-ID')}
            </div>
            <div className="text-xs text-gray-500">{getTimeAgo(row.original.requestDate)}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: language === 'id' ? 'Status' : 'Status',
        cell: ({ row }) => {
          const config = getStatusConfig(row.original.status);
          const Icon = config.icon;
          return (
            <Badge variant={config.variant} size="sm">
              <Icon className="w-3 h-3 mr-1" />
              {config.label}
            </Badge>
          );
        },
      },
      {
        id: 'actions',
        header: language === 'id' ? 'Aksi' : 'Actions',
        cell: ({ row }) => {
          const items: DropdownItem[] = [
            {
              label: language === 'id' ? 'Lihat Detail' : 'View Details',
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleViewDetails(row.original),
            },
          ];

          if (row.original.status === 'pending') {
            items.push(
              {
                label: language === 'id' ? 'Approve' : 'Approve',
                icon: <CheckCircle className="w-4 h-4" />,
                onClick: () => handleApprove(row.original),
              },
              {
                label: language === 'id' ? 'Reject' : 'Reject',
                icon: <XCircle className="w-4 h-4" />,
                onClick: () => handleReject(row.original),
              }
            );
          }

          if (row.original.status === 'completed') {
            items.push({
              label: language === 'id' ? 'Unduh Receipt' : 'Download Receipt',
              icon: <Download className="w-4 h-4" />,
              onClick: () => console.log('Download receipt:', row.original.id),
            });
          }

          items.push({
            label: language === 'id' ? 'Lihat Profil Instruktur' : 'View Instructor Profile',
            icon: <UserCheck className="w-4 h-4" />,
            onClick: () => console.log('View instructor:', row.original.instructor.id),
          });

          return (
            <Dropdown
              trigger={
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical className="w-4 h-4 text-gray-400" />
                </button>
              }
              items={items}
            />
          );
        },
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
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pembayaran Instruktur' : 'Instructor Payouts'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Kelola dan proses pembayaran untuk instruktur'
              : 'Manage and process instructor payments'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Total Payout' : 'Total Payouts'}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalPayouts)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Pending' : 'Pending'}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.pendingAmount)}</p>
                <p className="text-xs text-gray-500">{stats.pendingCount} requests</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Bulan Ini' : 'This Month'}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.thisMonthPayouts)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Rata-rata' : 'Average'}</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.averagePayout)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingPayouts.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'id' ? 'Request Pending' : 'Pending Requests'}
              </h2>
              <Badge variant="warning">{pendingPayouts.length}</Badge>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar src={payout.instructor.avatar} name={payout.instructor.name} size="md" />
                      <div>
                        <p className="font-medium text-gray-900">{payout.instructor.name}</p>
                        <p className="text-sm text-gray-500">{payout.instructor.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Jumlah' : 'Amount'}:</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(payout.amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Rekening' : 'Account'}:</span>
                      <span className="text-gray-900">{payout.accountInfo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Request' : 'Requested'}:</span>
                      <span className="text-gray-900">{getTimeAgo(payout.requestDate)}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(payout)} className="flex-1">
                      <CheckCircle className="w-4 h-4 mr-1.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(payout)} className="flex-1">
                      <XCircle className="w-4 h-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(payout)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Payouts Table */}
        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'id' ? 'Semua Payout' : 'All Payouts'}
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'id' ? 'Cari instruktur atau ID...' : 'Search instructor or ID...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'pending', label: language === 'id' ? 'Pending' : 'Pending' },
                    { value: 'processing', label: language === 'id' ? 'Processing' : 'Processing' },
                    { value: 'completed', label: language === 'id' ? 'Completed' : 'Completed' },
                    { value: 'rejected', label: language === 'id' ? 'Rejected' : 'Rejected' },
                  ]}
                  className="w-full sm:w-40"
                />

                {/* Export */}
                <Button size="sm" variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedPayouts.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
              <span className="text-sm text-blue-900">
                {selectedPayouts.length} {language === 'id' ? 'payout dipilih' : 'payouts selected'}
              </span>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleBulkApprove}>
                  {language === 'id' ? 'Approve Semua' : 'Approve All'}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setSelectedPayouts([])}>
                  {language === 'id' ? 'Batal' : 'Cancel'}
                </Button>
              </div>
            </div>
          )}

          {/* DataTable */}
          <DataTable
            columns={columns}
            data={filteredPayouts}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={(selected) => setSelectedPayouts(selected.map((p: InstructorPayout) => p.id))}
          />
        </Card>

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={language === 'id' ? 'Konfirmasi Approval' : 'Confirm Approval'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                {language === 'id'
                  ? `Anda akan menyetujui payout sebesar ${formatCurrency(selectedPayout?.amount || 0)} untuk ${selectedPayout?.instructor.name}`
                  : `You are about to approve payout of ${formatCurrency(selectedPayout?.amount || 0)} for ${selectedPayout?.instructor.name}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Catatan Admin (opsional)' : 'Admin Notes (optional)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={language === 'id' ? 'Tambahkan catatan...' : 'Add notes...'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={confirmApproval}>
                {language === 'id' ? 'Approve Payout' : 'Approve Payout'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectionModal}
          onClose={() => setShowRejectionModal(false)}
          title={language === 'id' ? 'Reject Payout' : 'Reject Payout'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-900">
                {language === 'id'
                  ? `Anda akan menolak payout sebesar ${formatCurrency(selectedPayout?.amount || 0)} dari ${selectedPayout?.instructor.name}`
                  : `You are about to reject payout of ${formatCurrency(selectedPayout?.amount || 0)} from ${selectedPayout?.instructor.name}`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Alasan Penolakan' : 'Rejection Reason'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'id' ? 'Masukkan alasan...' : 'Enter reason...'}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowRejectionModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button variant="danger" onClick={confirmRejection} disabled={!rejectionReason.trim()}>
                {language === 'id' ? 'Reject Payout' : 'Reject Payout'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={language === 'id' ? 'Detail Payout' : 'Payout Details'}
          size="lg"
        >
          {selectedPayout && (
            <div className="space-y-6">
              {/* Instructor Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {language === 'id' ? 'Informasi Instruktur' : 'Instructor Information'}
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar src={selectedPayout.instructor.avatar} name={selectedPayout.instructor.name} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">{selectedPayout.instructor.name}</p>
                    <p className="text-sm text-gray-500">{selectedPayout.instructor.email}</p>
                  </div>
                </div>
              </div>

              {/* Payout Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-3">
                  {language === 'id' ? 'Detail Payout' : 'Payout Details'}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'ID Payout' : 'Payout ID'}:</span>
                    <span className="font-mono font-medium">{selectedPayout.payoutId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Jumlah' : 'Amount'}:</span>
                    <span className="font-semibold">{formatCurrency(selectedPayout.amount)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Metode' : 'Method'}:</span>
                    <span>{selectedPayout.accountInfo}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Status' : 'Status'}:</span>
                    <div>
                      {(() => {
                        const config = getStatusConfig(selectedPayout.status);
                        const Icon = config.icon;
                        return (
                          <Badge variant={config.variant} size="sm">
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        );
                      })()}
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{language === 'id' ? 'Tanggal Request' : 'Request Date'}:</span>
                    <span>{new Date(selectedPayout.requestDate).toLocaleString('id-ID')}</span>
                  </div>
                  {selectedPayout.processedDate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Tanggal Proses' : 'Processed Date'}:</span>
                      <span>{new Date(selectedPayout.processedDate).toLocaleString('id-ID')}</span>
                    </div>
                  )}
                  {selectedPayout.notes && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">{language === 'id' ? 'Catatan' : 'Notes'}:</span>
                      <span>{selectedPayout.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
