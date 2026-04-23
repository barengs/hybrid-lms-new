import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { type ColumnDef } from '@tanstack/react-table';
import {
  CreditCard,
  Search,
  MoreVertical,
  Eye,
  Download,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  RefreshCcw,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Select, DataTable } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatNumber, formatCurrency, getTimeAgo, cn } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';
import { 
  useGetAdminTransactionsQuery, 
  useGetAdminTransactionStatsQuery 
} from '@/store/api/transactionManagementApiSlice';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Transaction interface for UI
interface Transaction {
  id: string | number;
  transactionId: string;
  user: {
    id: string | number;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string | number;
    title: string;
    thumbnail?: string;
  };
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export function TransactionsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch real data
  const { data: statsResponse, isLoading: statsLoading } = useGetAdminTransactionStatsQuery();
  const { 
    data: transactionsResponse, 
    isLoading: transactionsLoading,
    isFetching: transactionsFetching 
  } = useGetAdminTransactionsQuery({
    page,
    per_page: pageSize,
    search: searchQuery,
    status: statusFilter === 'completed' ? 'paid' : (statusFilter === 'all' ? undefined : statusFilter),
  });

  const stats = statsResponse?.data;
  const rawTransactions = transactionsResponse?.data?.data || [];
  const meta = transactionsResponse?.data;

  // Map backend data to UI format
  const mappedTransactions = useMemo(() => {
    return rawTransactions.map((order: any) => ({
      id: order.id,
      transactionId: order.order_number,
      user: {
        id: order.user?.id,
        name: order.user?.name || 'N/A',
        email: order.user?.email || 'N/A',
        avatar: order.user?.profile?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.user?.name}`,
      },
      course: {
        id: order.items?.[0]?.course?.id,
        title: order.items?.[0]?.course_title || (order.items?.length > 1 ? `${order.items[0].course_title} (+${order.items.length - 1} lainnya)` : 'N/A'),
        thumbnail: order.items?.[0]?.course?.thumbnail,
      },
      amount: Number(order.subtotal),
      discount: Number(order.discount),
      tax: Number(order.tax),
      total: Number(order.total),
      paymentMethod: order.payments?.[0]?.payment_method || 'other',
      status: order.status === 'paid' ? 'completed' : 
              (order.status === 'expired' ? 'failed' : 
              (['pending', 'failed', 'refunded', 'cancelled'].includes(order.status) ? order.status as any : 'pending')),
      createdAt: order.created_at,
      completedAt: order.paid_at,
    }));
  }, [rawTransactions]);

  const handleViewDetails = (id: string | number) => {
    navigate(`/admin/transactions/${id}`);
  };

  const handleExport = () => {
    console.log('Exporting transactions...');
    // TODO: Implement CSV export
  };

  const getStatusBadge = (status: Transaction['status']) => {
    const config = {
      completed: { variant: 'success' as const, label: language === 'id' ? 'Selesai' : 'Completed', icon: CheckCircle },
      pending: { variant: 'warning' as const, label: language === 'id' ? 'Menunggu' : 'Pending', icon: Clock },
      failed: { variant: 'danger' as const, label: language === 'id' ? 'Gagal' : 'Failed', icon: XCircle },
      refunded: { variant: 'secondary' as const, label: language === 'id' ? 'Refund' : 'Refunded', icon: RefreshCcw },
      cancelled: { variant: 'secondary' as const, label: language === 'id' ? 'Dibatalkan' : 'Cancelled', icon: AlertCircle },
    };
    const { variant, label, icon: Icon } = config[status] || { variant: 'secondary', label: status, icon: AlertCircle };
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: language === 'id' ? 'Kartu Kredit' : 'Credit Card',
      bank_transfer: language === 'id' ? 'Transfer Bank' : 'Bank Transfer',
      e_wallet: language === 'id' ? 'E-Wallet' : 'E-Wallet',
      virtual_account: language === 'id' ? 'Virtual Account' : 'Virtual Account',
      other: language === 'id' ? 'Lainnya' : 'Other',
    };
    return labels[method] || method;
  };

  const getTransactionActions = (transaction: Transaction): DropdownItem[] => {
    const actions: DropdownItem[] = [
      {
        label: language === 'id' ? 'Lihat Detail' : 'View Details',
        icon: <Eye className="w-4 h-4" />,
        onClick: () => handleViewDetails(transaction.id),
      },
      {
        label: language === 'id' ? 'Unduh Invoice' : 'Download Invoice',
        icon: <FileText className="w-4 h-4" />,
        onClick: () => console.log('Download invoice:', transaction.id),
      },
    ];

    if (transaction.status === 'completed') {
      actions.push({ divider: true, label: '' });
      actions.push({
        label: language === 'id' ? 'Proses Refund' : 'Process Refund',
        icon: <RefreshCcw className="w-4 h-4" />,
        onClick: () => console.log('Process refund:', transaction.id),
      });
    }

    if (transaction.status === 'pending') {
      actions.push({ divider: true, label: '' });
      actions.push({
        label: language === 'id' ? 'Batalkan' : 'Cancel',
        icon: <XCircle className="w-4 h-4" />,
        onClick: () => console.log('Cancel transaction:', transaction.id),
        danger: true,
      });
    }

    return actions;
  };

  // Column definitions
  const columns = useMemo<ColumnDef<Transaction>[]>(
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
        accessorKey: 'transactionId',
        header: language === 'id' ? 'ID Transaksi' : 'Transaction ID',
        cell: ({ row }) => (
          <button
            onClick={() => handleViewDetails(row.original.id)}
            className="font-mono text-[10px] text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:underline cursor-pointer"
          >
            {row.original.transactionId}
          </button>
        ),
      },
      {
        accessorKey: 'user.name',
        header: language === 'id' ? 'Pembeli' : 'Buyer',
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex items-center gap-2">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="min-w-0">
                <p className="font-medium text-gray-900 dark:text-white text-xs truncate">{user.name}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'course.title',
        header: language === 'id' ? 'Kursus' : 'Course',
        cell: ({ row }) => (
          <div className="max-w-[180px]">
            <p className="text-xs text-gray-900 dark:text-gray-100 truncate font-medium">
              {row.original.course.title}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: language === 'id' ? 'Total' : 'Total',
        cell: ({ row }) => (
          <div className="text-xs font-semibold text-gray-900 dark:text-white">
            {formatCurrency(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: language === 'id' ? 'Metode' : 'Method',
        cell: ({ row }) => (
          <div className="text-[10px] text-gray-600 dark:text-gray-300">
            {getPaymentMethodLabel(row.original.paymentMethod)}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        accessorKey: 'createdAt',
        header: language === 'id' ? 'Tanggal' : 'Date',
        cell: ({ row }) => {
          const date = row.original.createdAt;
          return (
            <div className="text-[10px] text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {new Date(date).toLocaleDateString('id-ID')}
              </div>
              <div className="text-gray-400">{getTimeAgo(date)}</div>
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
              <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                <MoreVertical className="w-4 h-4 text-gray-400" />
              </button>
            }
            items={getTransactionActions(row.original)}
          />
        ),
        enableSorting: false,
      },
    ],
    [language]
  );

  if (statsLoading || transactionsLoading) return <LoadingScreen />;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'id' ? 'Manajemen Transaksi' : 'Transaction Management'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {language === 'id'
              ? 'Kelola semua transaksi pembayaran platform'
              : 'Manage all platform payment transactions'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Total Transaksi' : 'Total Transactions'}</span>
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatNumber(stats?.total || 0)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <span className="text-green-600 font-medium">{stats?.completed || 0} {language === 'id' ? 'selesai' : 'completed'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Total Pendapatan' : 'Total Revenue'}</span>
              <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.total_revenue || 0)}</p>
            <div className={cn(
              "flex items-center gap-1 mt-1 text-sm",
              (stats?.revenue_growth || 0) >= 0 ? "text-green-600" : "text-red-600"
            )}>
              <TrendingUp className={cn("w-4 h-4", (stats?.revenue_growth || 0) < 0 && "rotate-180")} />
              <span className="font-medium">{stats?.revenue_growth || 0}%</span>
              <span className="text-gray-400 dark:text-gray-500">{language === 'id' ? 'bulan ini' : 'this month'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Pendapatan Bulan Ini' : 'This Month Revenue'}</span>
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.this_month_revenue || 0)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
               <span>{language === 'id' ? 'Target tercapai' : 'Target reached'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Rata-rata Transaksi' : 'Average Transaction'}</span>
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-600" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(stats?.average_transaction || 0)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <span>{language === 'id' ? 'per transaksi' : 'per transaction'}</span>
            </div>
          </Card>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-l-green-500 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-8 h-8 text-green-600 opacity-20" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{language === 'id' ? 'Selesai' : 'Completed'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.completed || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <Clock className="w-8 h-8 text-yellow-600 opacity-20" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.pending || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <XCircle className="w-8 h-8 text-red-600 opacity-20" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{language === 'id' ? 'Gagal' : 'Failed'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.failed || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-8 h-8 text-blue-600 opacity-20" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{language === 'id' ? 'Refund' : 'Refunded'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats?.refunded || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-gray-400 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-8 h-8 text-gray-600 opacity-20" />
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500">{language === 'id' ? 'Dibatalkan' : 'Cancelled'}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{(stats?.total || 0) - (stats?.completed || 0) - (stats?.pending || 0) - (stats?.failed || 0) - (stats?.refunded || 0)}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <Card className="mb-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                {selectedTransactions.length} {language === 'id' ? 'transaksi dipilih' : 'transactions selected'}
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Transactions Table */}
        <Card className="overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={language === 'id' ? 'Cari transaksi, pengguna, atau kursus...' : 'Search transaction, user, or course...'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'completed', label: language === 'id' ? 'Selesai' : 'Completed' },
                    { value: 'pending', label: language === 'id' ? 'Menunggu' : 'Pending' },
                    { value: 'failed', label: language === 'id' ? 'Gagal' : 'Failed' },
                    { value: 'refunded', label: language === 'id' ? 'Refund' : 'Refunded' },
                    { value: 'cancelled', label: language === 'id' ? 'Dibatalkan' : 'Cancelled' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Metode' : 'All Methods' },
                    { value: 'credit_card', label: language === 'id' ? 'Kartu Kredit' : 'Credit Card' },
                    { value: 'bank_transfer', label: language === 'id' ? 'Transfer Bank' : 'Bank Transfer' },
                    { value: 'e_wallet', label: 'E-Wallet' },
                    { value: 'virtual_account', label: 'Virtual Account' },
                  ]}
                  className="w-full sm:w-40"
                />
                <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
                  {language === 'id' ? 'Ekspor' : 'Export'}
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className={cn("transition-opacity", transactionsFetching && "opacity-50")}>
            <DataTable
              columns={columns}
              data={mappedTransactions}
              enableRowSelection={true}
              enablePagination={true}
              pageSize={pageSize}
              onRowSelectionChange={setSelectedTransactions}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
