import { useMemo, useState } from 'react';
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
import { formatNumber, formatCurrency, getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// Transaction interface
interface Transaction {
  id: string;
  transactionId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  course: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet' | 'virtual_account';
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

// Mock transactions data
const mockTransactions: Transaction[] = [
  {
    id: 'tx-1',
    transactionId: 'TRX-2024-001234',
    user: {
      id: 'user-1',
      name: 'Ahmad Rizki',
      email: 'ahmad.rizki@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    },
    course: {
      id: 'course-1',
      title: 'React Masterclass - From Zero to Hero',
      thumbnail: 'https://picsum.photos/seed/react/400/300',
    },
    amount: 299000,
    discount: 0,
    tax: 29900,
    total: 328900,
    paymentMethod: 'credit_card',
    status: 'completed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    completedAt: new Date(Date.now() - 7000000).toISOString(),
  },
  {
    id: 'tx-2',
    transactionId: 'TRX-2024-001235',
    user: {
      id: 'user-2',
      name: 'Siti Nurhaliza',
      email: 'siti.nur@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    },
    course: {
      id: 'course-2',
      title: 'Full Stack Web Development Bootcamp',
      thumbnail: 'https://picsum.photos/seed/fullstack/400/300',
    },
    amount: 499000,
    discount: 50000,
    tax: 44900,
    total: 493900,
    paymentMethod: 'bank_transfer',
    status: 'completed',
    createdAt: new Date(Date.now() - 10800000).toISOString(),
    completedAt: new Date(Date.now() - 10600000).toISOString(),
  },
  {
    id: 'tx-3',
    transactionId: 'TRX-2024-001236',
    user: {
      id: 'user-3',
      name: 'Budi Hartono',
      email: 'budi.h@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    },
    course: {
      id: 'course-3',
      title: 'Python Data Science & Machine Learning',
      thumbnail: 'https://picsum.photos/seed/python/400/300',
    },
    amount: 349000,
    discount: 0,
    tax: 34900,
    total: 383900,
    paymentMethod: 'e_wallet',
    status: 'pending',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: 'tx-4',
    transactionId: 'TRX-2024-001237',
    user: {
      id: 'user-4',
      name: 'Dewi Sartika',
      email: 'dewi.s@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi',
    },
    course: {
      id: 'course-4',
      title: 'UI/UX Design Fundamentals',
      thumbnail: 'https://picsum.photos/seed/uiux/400/300',
    },
    amount: 249000,
    discount: 0,
    tax: 24900,
    total: 273900,
    paymentMethod: 'virtual_account',
    status: 'completed',
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    completedAt: new Date(Date.now() - 17800000).toISOString(),
  },
  {
    id: 'tx-5',
    transactionId: 'TRX-2024-001238',
    user: {
      id: 'user-5',
      name: 'Andi Prasetyo',
      email: 'andi.p@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
    },
    course: {
      id: 'course-5',
      title: 'Digital Marketing Mastery',
      thumbnail: 'https://picsum.photos/seed/marketing/400/300',
    },
    amount: 199000,
    discount: 0,
    tax: 19900,
    total: 218900,
    paymentMethod: 'credit_card',
    status: 'failed',
    createdAt: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: 'tx-6',
    transactionId: 'TRX-2024-001239',
    user: {
      id: 'user-6',
      name: 'Rina Wulandari',
      email: 'rina.w@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rina',
    },
    course: {
      id: 'course-6',
      title: 'Mobile App Development with Flutter',
      thumbnail: 'https://picsum.photos/seed/flutter/400/300',
    },
    amount: 399000,
    discount: 40000,
    tax: 35900,
    total: 394900,
    paymentMethod: 'e_wallet',
    status: 'refunded',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
  },
  {
    id: 'tx-7',
    transactionId: 'TRX-2024-001240',
    user: {
      id: 'user-7',
      name: 'Joko Widodo',
      email: 'joko.w@example.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joko',
    },
    course: {
      id: 'course-7',
      title: 'Advanced JavaScript & TypeScript',
      thumbnail: 'https://picsum.photos/seed/javascript/400/300',
    },
    amount: 299000,
    discount: 0,
    tax: 29900,
    total: 328900,
    paymentMethod: 'bank_transfer',
    status: 'cancelled',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export function TransactionsPage() {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [selectedTransactions, setSelectedTransactions] = useState<Transaction[]>([]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = mockTransactions.length;
    const completed = mockTransactions.filter(t => t.status === 'completed').length;
    const pending = mockTransactions.filter(t => t.status === 'pending').length;
    const failed = mockTransactions.filter(t => t.status === 'failed').length;
    const refunded = mockTransactions.filter(t => t.status === 'refunded').length;

    const totalRevenue = mockTransactions
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.total, 0);

    const thisMonthRevenue = mockTransactions
      .filter(t => {
        const txDate = new Date(t.createdAt);
        const now = new Date();
        return t.status === 'completed' &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.total, 0);

    const averageTransaction = completed > 0 ? totalRevenue / completed : 0;

    return { total, completed, pending, failed, refunded, totalRevenue, thisMonthRevenue, averageTransaction };
  }, []);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let transactions = [...mockTransactions];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter(t =>
        t.transactionId.toLowerCase().includes(query) ||
        t.user.name.toLowerCase().includes(query) ||
        t.user.email.toLowerCase().includes(query) ||
        t.course.title.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      transactions = transactions.filter(t => t.status === statusFilter);
    }

    // Payment method filter
    if (paymentMethodFilter !== 'all') {
      transactions = transactions.filter(t => t.paymentMethod === paymentMethodFilter);
    }

    return transactions;
  }, [searchQuery, statusFilter, paymentMethodFilter]);

  // Handlers
  const handleViewDetails = (transactionId: string) => {
    navigate(`/admin/transactions/${transactionId}`);
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
    const { variant, label, icon: Icon } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPaymentMethodLabel = (method: Transaction['paymentMethod']) => {
    const labels = {
      credit_card: language === 'id' ? 'Kartu Kredit' : 'Credit Card',
      bank_transfer: language === 'id' ? 'Transfer Bank' : 'Bank Transfer',
      e_wallet: language === 'id' ? 'E-Wallet' : 'E-Wallet',
      virtual_account: language === 'id' ? 'Virtual Account' : 'Virtual Account',
    };
    return labels[method];
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
            onClick={() => navigate(`/admin/transactions/${row.original.id}`)}
            className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
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
            <div className="flex items-center gap-3">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div>
                <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'course.title',
        header: language === 'id' ? 'Kursus' : 'Course',
        cell: ({ row }) => (
          <div className="max-w-[250px]">
            <p className="font-medium text-gray-900 text-sm truncate">
              {row.original.course.title}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'total',
        header: language === 'id' ? 'Total' : 'Total',
        cell: ({ row }) => (
          <div className="text-sm font-semibold text-gray-900">
            {formatCurrency(row.original.total)}
          </div>
        ),
      },
      {
        accessorKey: 'paymentMethod',
        header: language === 'id' ? 'Metode' : 'Method',
        cell: ({ row }) => (
          <div className="text-xs text-gray-600">
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
            <div className="text-xs text-gray-700">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-gray-400" />
                {new Date(date).toLocaleDateString('id-ID')}
              </div>
              <div className="text-gray-500">{getTimeAgo(date)}</div>
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
            items={getTransactionActions(row.original)}
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
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Manajemen Transaksi' : 'Transaction Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Kelola semua transaksi pembayaran platform'
              : 'Manage all platform payment transactions'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Total Transaksi' : 'Total Transactions'}</span>
              <ShoppingCart className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.total)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <span className="text-green-600">{stats.completed} {language === 'id' ? 'selesai' : 'completed'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Total Pendapatan' : 'Total Revenue'}</span>
              <DollarSign className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600">+15%</span>
              <span className="text-gray-400">{language === 'id' ? 'bulan ini' : 'this month'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Pendapatan Bulan Ini' : 'This Month Revenue'}</span>
              <CreditCard className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.thisMonthRevenue)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <span className="text-gray-600">{formatNumber(stats.completed)} {language === 'id' ? 'transaksi' : 'transactions'}</span>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">{language === 'id' ? 'Rata-rata Transaksi' : 'Average Transaction'}</span>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.averageTransaction)}</p>
            <div className="flex items-center gap-1 mt-1 text-sm">
              <span className="text-gray-600">{language === 'id' ? 'per transaksi' : 'per transaction'}</span>
            </div>
          </Card>
        </div>

        {/* Status Summary */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card className="border-l-4 border-l-green-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Selesai' : 'Completed'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Menunggu' : 'Pending'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Gagal' : 'Failed'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.failed}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <div className="flex items-center gap-2">
              <RefreshCcw className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Refund' : 'Refunded'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.refunded}</p>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-gray-500">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-xs text-gray-500">{language === 'id' ? 'Dibatalkan' : 'Cancelled'}</p>
                <p className="text-xl font-bold text-gray-900">{mockTransactions.filter(t => t.status === 'cancelled').length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        {selectedTransactions.length > 0 && (
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-blue-900">
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
                  placeholder={language === 'id' ? 'Cari transaksi, pengguna, atau kursus...' : 'Search transaction, user, or course...'}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:flex-shrink-0">
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
          <DataTable
            columns={columns}
            data={filteredTransactions}
            enableRowSelection={true}
            enablePagination={true}
            pageSize={10}
            onRowSelectionChange={setSelectedTransactions}
          />
        </Card>
      </div>
    </DashboardLayout>
  );
}
