import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { formatCurrency, getTimeAgo, formatNumber, cn } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import {
  useGetAdminPayoutsQuery,
  useGetAdminPayoutStatsQuery,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
} from '@/store/api/payoutManagementApiSlice';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { toast } from 'react-hot-toast';

// Payout interface for UI
interface InstructorPayout {
  id: number;
  payoutId: string;
  instructor: {
    id: number;
    name: string;
    email: string;
    avatar?: string;
  };
  amount: number;
  requestDate: string;
  processedDate?: string;
  status: 'pending' | 'completed' | 'rejected' | 'processing';
  method: string;
  accountInfo: string;
  notes?: string;
  adminNotes?: string;
}

export function AdminPayoutsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPayoutIds, setSelectedPayoutIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState<InstructorPayout | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Fetch real data
  const { data: statsResponse, isLoading: statsLoading } = useGetAdminPayoutStatsQuery();
  const { data: payoutsResponse, isLoading: payoutsLoading, isFetching: payoutsFetching } = useGetAdminPayoutsQuery({
    page,
    per_page: pageSize,
    search: searchQuery,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const [approvePayout, { isLoading: isApproving }] = useApprovePayoutMutation();
  const [rejectPayout, { isLoading: isRejecting }] = useRejectPayoutMutation();

  const stats = statsResponse?.data;
  const rawPayouts = payoutsResponse?.data?.data || [];
  const meta = payoutsResponse?.data;

  // Map backend data to UI format
  const mappedPayouts: InstructorPayout[] = useMemo(() => {
    return rawPayouts.map((p: any) => ({
      id: p.id,
      payoutId: `PO-${p.id.toString().padStart(5, '0')}`,
      instructor: {
        id: p.instructor?.id,
        name: p.instructor?.name || 'N/A',
        email: p.instructor?.email || 'N/A',
        avatar: p.instructor?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.instructor?.name}`,
      },
      amount: Number(p.amount),
      requestDate: p.created_at,
      processedDate: p.processed_at,
      status: p.status,
      method: p.method,
      accountInfo: p.account_info,
      notes: p.notes,
    }));
  }, [rawPayouts]);

  const pendingPayouts = mappedPayouts.filter((p: InstructorPayout) => p.status === 'pending');

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

  const confirmApproval = async () => {
    if (!selectedPayout) return;
    try {
      await approvePayout({ id: selectedPayout.id, notes: adminNotes }).unwrap();
      toast.success(language === 'id' ? 'Payout berhasil disetujui' : 'Payout approved successfully');
      setShowApprovalModal(false);
      setAdminNotes('');
      setSelectedPayout(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to approve payout');
    }
  };

  const confirmRejection = async () => {
    if (!selectedPayout) return;
    try {
      await rejectPayout({ id: selectedPayout.id, reason: rejectionReason }).unwrap();
      toast.success(language === 'id' ? 'Payout berhasil ditolak' : 'Payout rejected successfully');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedPayout(null);
    } catch (error: any) {
      toast.error(error?.data?.message || 'Failed to reject payout');
    }
  };

  const handleBulkApprove = () => {
    console.log('Bulk approving payouts:', selectedPayoutIds);
    // TODO: Implement bulk approval in API
  };

  const getStatusConfig = (status: InstructorPayout['status']) => {
    const configs = {
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Pending' : 'Pending', icon: Clock },
      processing: { variant: 'primary' as const, label: language === 'id' ? 'Diproses' : 'Processing', icon: AlertCircle },
      completed: { variant: 'success' as const, label: language === 'id' ? 'Selesai' : 'Completed', icon: CheckCircle },
      rejected: { variant: 'danger' as const, label: language === 'id' ? 'Ditolak' : 'Rejected', icon: XCircle },
    };
    return configs[status] || configs.pending;
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
            }}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={(e) => {
              row.toggleSelected(e.target.checked);
            }}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'payoutId',
        header: language === 'id' ? 'ID Payout' : 'Payout ID',
        cell: ({ row }) => (
          <span className="font-mono text-xs font-medium text-gray-600 dark:text-gray-400">{row.original.payoutId}</span>
        ),
      },
      {
        accessorKey: 'instructor',
        header: language === 'id' ? 'Instruktur' : 'Instructor',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar src={row.original.instructor.avatar} name={row.original.instructor.name} size="sm" />
            <div className="min-w-0">
              <p className="font-medium text-gray-900 dark:text-white text-xs truncate">{row.original.instructor.name}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{row.original.instructor.email}</p>
            </div>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'amount',
        header: language === 'id' ? 'Jumlah' : 'Amount',
        cell: ({ row }) => (
          <span className="font-semibold text-gray-900 dark:text-white text-xs">{formatCurrency(row.original.amount)}</span>
        ),
      },
      {
        accessorKey: 'requestDate',
        header: language === 'id' ? 'Tanggal Request' : 'Request Date',
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1 text-[10px] text-gray-900 dark:text-gray-300">
              <Calendar className="w-3 h-3 text-gray-400" />
              {new Date(row.original.requestDate).toLocaleDateString('id-ID')}
            </div>
            <div className="text-[9px] text-gray-400">{getTimeAgo(row.original.requestDate)}</div>
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

          items.push({
            label: language === 'id' ? 'Lihat Profil Instruktur' : 'Instructor Profile',
            icon: <UserCheck className="w-4 h-4" />,
            onClick: () => navigate(`/admin/instructors/${row.original.instructor.id}`),
          });

          return (
            <Dropdown
              trigger={
                <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
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

  if (statsLoading || payoutsLoading) return <LoadingScreen />;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'id' ? 'Pembayaran Instruktur' : 'Instructor Payouts'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'id'
              ? 'Kelola dan proses pembayaran untuk instruktur'
              : 'Manage and process instructor payments'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Total Payout' : 'Total Payouts'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.total_payouts || 0)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Pending' : 'Pending'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.pending_amount || 0)}</p>
                <p className="text-[10px] text-gray-400">{stats?.pending_count || 0} {language === 'id' ? 'permintaan' : 'requests'}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Bulan Ini' : 'This Month'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.this_month_payouts || 0)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Rata-rata' : 'Average'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.average_payout || 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Pending Requests */}
        {pendingPayouts.length > 0 && (
          <Card className="mb-8 border-l-4 border-l-orange-500 bg-orange-50/10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'id' ? 'Permintaan Menunggu' : 'Pending Requests'}
              </h2>
              <Badge variant="warning" size="md">{pendingPayouts.length}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingPayouts.map((payout: InstructorPayout) => (
                <div key={payout.id} className="p-4 bg-white dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-xl shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={payout.instructor.avatar} name={payout.instructor.name} size="md" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{payout.instructor.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{payout.instructor.email}</p>
                      </div>
                    </div>
                    <Badge variant="warning" size="sm" className="flex-shrink-0">
                        <Clock className="w-3 h-3 mr-1" />
                        {getTimeAgo(payout.requestDate)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{language === 'id' ? 'Jumlah' : 'Amount'}</span>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{formatCurrency(payout.amount)}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">{language === 'id' ? 'Rekening' : 'Account'}</span>
                      <p className="text-gray-900 dark:text-white text-xs truncate">{payout.accountInfo}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleApprove(payout)} className="flex-1 rounded-lg">
                      <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                      Approve
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleReject(payout)} className="flex-1 rounded-lg">
                      <XCircle className="w-3.5 h-3.5 mr-1.5" />
                      Reject
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewDetails(payout)} className="rounded-lg">
                      <Eye className="w-4 h-4 text-gray-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Payouts Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {language === 'id' ? 'Semua Riwayat Payout' : 'All Payout History'}
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'pending', label: language === 'id' ? 'Pending' : 'Pending' },
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

          {/* Table */}
          <div className={cn("transition-opacity", payoutsFetching && "opacity-50")}>
            <DataTable
              columns={columns}
              data={mappedPayouts}
              enableRowSelection={true}
              enablePagination={true}
              pageSize={pageSize}
              onRowSelectionChange={(selected) => setSelectedPayoutIds(selected.map((p: any) => p.id))}
            />
          </div>
        </Card>

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => !isApproving && setShowApprovalModal(false)}
          title={language === 'id' ? 'Konfirmasi Persetujuan' : 'Confirm Approval'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <p className="text-sm text-green-900 dark:text-green-100 leading-relaxed">
                {language === 'id'
                  ? `Anda akan menyetujui pembayaran sebesar ${formatCurrency(selectedPayout?.amount || 0)} untuk ${selectedPayout?.instructor.name}`
                  : `You are about to approve payout of ${formatCurrency(selectedPayout?.amount || 0)} for ${selectedPayout?.instructor.name}`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {language === 'id' ? 'Catatan Admin (opsional)' : 'Admin Notes (optional)'}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={language === 'id' ? 'Tambahkan referensi transfer atau catatan...' : 'Add transfer reference or notes...'}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowApprovalModal(false)} disabled={isApproving}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={confirmApproval} isLoading={isApproving}>
                {language === 'id' ? 'Setujui Pembayaran' : 'Approve Payout'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Rejection Modal */}
        <Modal
          isOpen={showRejectionModal}
          onClose={() => !isRejecting && setShowRejectionModal(false)}
          title={language === 'id' ? 'Tolak Permintaan' : 'Reject Request'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-sm text-red-900 dark:text-red-100 leading-relaxed">
                {language === 'id'
                  ? `Anda akan menolak permintaan pembayaran sebesar ${formatCurrency(selectedPayout?.amount || 0)} dari ${selectedPayout?.instructor.name}`
                  : `You are about to reject request of ${formatCurrency(selectedPayout?.amount || 0)} from ${selectedPayout?.instructor.name}`}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {language === 'id' ? 'Alasan Penolakan' : 'Rejection Reason'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder={language === 'id' ? 'Jelaskan alasan penolakan...' : 'Explain reason for rejection...'}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowRejectionModal(false)} disabled={isRejecting}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button variant="danger" onClick={confirmRejection} disabled={!rejectionReason.trim() || isRejecting} isLoading={isRejecting}>
                {language === 'id' ? 'Tolak Permintaan' : 'Reject Payout'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Detail Modal */}
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={language === 'id' ? 'Rincian Penarikan' : 'Withdrawal Details'}
          size="lg"
        >
          {selectedPayout && (
            <div className="space-y-6 py-2">
              {/* Instructor Info */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {language === 'id' ? 'Informasi Instruktur' : 'Instructor Information'}
                </h3>
                <div className="flex items-center gap-4">
                  <Avatar src={selectedPayout.instructor.avatar} name={selectedPayout.instructor.name} size="lg" />
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 dark:text-white text-base truncate">{selectedPayout.instructor.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{selectedPayout.instructor.email}</p>
                  </div>
                </div>
              </div>

              {/* Payout Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                   <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {language === 'id' ? 'Informasi Penarikan' : 'Payout Info'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center group">
                      <span className="text-sm text-gray-500">{language === 'id' ? 'ID Transaksi' : 'Transaction ID'}:</span>
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">{selectedPayout.payoutId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{language === 'id' ? 'Status' : 'Status'}:</span>
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
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{language === 'id' ? 'Tanggal Request' : 'Requested At'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white">{new Date(selectedPayout.requestDate).toLocaleString('id-ID')}</span>
                    </div>
                    {selectedPayout.processedDate && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">{language === 'id' ? 'Tanggal Proses' : 'Processed At'}:</span>
                            <span className="text-sm text-gray-900 dark:text-white">{new Date(selectedPayout.processedDate).toLocaleString('id-ID')}</span>
                        </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {language === 'id' ? 'Rincian Pembayaran' : 'Payment Details'}
                  </h3>
                   <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{language === 'id' ? 'Metode' : 'Method'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white uppercase font-medium">{selectedPayout.method.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">{language === 'id' ? 'Informasi Akun' : 'Account Info'}:</span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium">{selectedPayout.accountInfo}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">{language === 'id' ? 'Jumlah Bersih' : 'Net Amount'}:</span>
                      <span className="text-lg font-bold text-blue-900 dark:text-blue-100">{formatCurrency(selectedPayout.amount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPayout.notes && (
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <h3 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    {language === 'id' ? 'Catatan / Alasan' : 'Notes / Reason'}
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 italic leading-relaxed">
                    "{selectedPayout.notes}"
                  </p>
                </div>
              )}
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
}
