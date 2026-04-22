import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  User,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Mail,
  RefreshCcw,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, CardContent, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, cn } from '@/lib/utils';

// Transaction interface (same as TransactionsPage)
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
    instructor: string;
  };
  amount: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'e_wallet' | 'virtual_account';
  status: 'completed' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  paymentDetails?: {
    cardNumber?: string;
    bankName?: string;
    accountName?: string;
    transactionRef?: string;
  };
  notes?: string;
  ipAddress?: string;
  userAgent?: string;
}

interface TimelineEvent {
  id: string;
  status: string;
  timestamp: string;
  description: string;
}

// Mock transaction data
const mockTransactionDetail: Transaction = {
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
    instructor: 'Budi Pengajar',
  },
  amount: 299000,
  discount: 0,
  tax: 29900,
  total: 328900,
  paymentMethod: 'credit_card',
  status: 'completed',
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  completedAt: new Date(Date.now() - 7000000).toISOString(),
  paymentDetails: {
    cardNumber: '**** **** **** 1234',
    transactionRef: 'REF-2024-ABC123',
  },
  notes: 'Pembayaran berhasil diproses melalui gateway Midtrans',
  ipAddress: '103.123.45.67',
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
};

const mockTimeline: TimelineEvent[] = [
  {
    id: 'evt-1',
    status: 'created',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    description: 'Transaksi dibuat',
  },
  {
    id: 'evt-2',
    status: 'processing',
    timestamp: new Date(Date.now() - 7100000).toISOString(),
    description: 'Memproses pembayaran',
  },
  {
    id: 'evt-3',
    status: 'completed',
    timestamp: new Date(Date.now() - 7000000).toISOString(),
    description: 'Pembayaran berhasil dikonfirmasi',
  },
];

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // In real app, fetch transaction by ID
  const transaction = mockTransactionDetail;
  const timeline = mockTimeline;

  const handleRefund = () => {
    console.log('Processing refund for transaction:', id);
    setShowRefundModal(false);
  };

  const handleCancel = () => {
    console.log('Canceling transaction:', id);
    setShowCancelModal(false);
  };

  const handleDownloadInvoice = () => {
    console.log('Downloading invoice for transaction:', id);
  };

  const handleContactUser = () => {
    console.log('Opening contact form for user:', transaction.user.id);
  };

  const getStatusConfig = (status: Transaction['status']) => {
    const configs = {
      completed: {
        variant: 'success' as const,
        label: language === 'id' ? 'Selesai' : 'Completed',
        icon: CheckCircle,
        color: 'text-green-600 bg-green-100',
      },
      pending: {
        variant: 'warning' as const,
        label: language === 'id' ? 'Menunggu' : 'Pending',
        icon: Clock,
        color: 'text-yellow-600 bg-yellow-100',
      },
      failed: {
        variant: 'danger' as const,
        label: language === 'id' ? 'Gagal' : 'Failed',
        icon: XCircle,
        color: 'text-red-600 bg-red-100',
      },
      refunded: {
        variant: 'secondary' as const,
        label: language === 'id' ? 'Refund' : 'Refunded',
        icon: RefreshCcw,
        color: 'text-blue-600 bg-blue-100',
      },
      cancelled: {
        variant: 'secondary' as const,
        label: language === 'id' ? 'Dibatalkan' : 'Cancelled',
        icon: AlertCircle,
        color: 'text-gray-600 bg-gray-100',
      },
    };
    return configs[status];
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

  const statusConfig = getStatusConfig(transaction.status);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/admin/transactions')}
            className="mb-4"
          >
            {language === 'id' ? 'Kembali ke Transaksi' : 'Back to Transactions'}
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {language === 'id' ? 'Detail Transaksi' : 'Transaction Details'}
              </h1>
              <p className="text-gray-600 mt-1 font-mono">{transaction.transactionId}</p>
            </div>
            <Badge variant={statusConfig.variant} size="md">
              <StatusIcon className="w-4 h-4 mr-1.5" />
              {statusConfig.label}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Overview */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Informasi Transaksi' : 'Transaction Information'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'ID Transaksi' : 'Transaction ID'}</span>
                    <span className="text-sm font-mono font-medium text-gray-900">{transaction.transactionId}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Tanggal Dibuat' : 'Created Date'}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(transaction.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.createdAt).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {transaction.completedAt && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Tanggal Selesai' : 'Completed Date'}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {new Date(transaction.completedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(transaction.completedAt).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Status' : 'Status'}</span>
                    <Badge variant={statusConfig.variant} size="sm">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusConfig.label}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  {language === 'id' ? 'Detail Pembayaran' : 'Payment Details'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</span>
                    <span className="text-sm font-medium text-gray-900">{getPaymentMethodLabel(transaction.paymentMethod)}</span>
                  </div>
                  {transaction.paymentDetails?.cardNumber && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Nomor Kartu' : 'Card Number'}</span>
                      <span className="text-sm font-mono font-medium text-gray-900">{transaction.paymentDetails.cardNumber}</span>
                    </div>
                  )}
                  {transaction.paymentDetails?.transactionRef && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Referensi' : 'Reference'}</span>
                      <span className="text-sm font-mono font-medium text-gray-900">{transaction.paymentDetails.transactionRef}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Harga Kursus' : 'Course Price'}</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(transaction.amount)}</span>
                  </div>
                  {transaction.discount > 0 && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600">{language === 'id' ? 'Diskon' : 'Discount'}</span>
                      <span className="text-sm font-medium text-green-600">-{formatCurrency(transaction.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{language === 'id' ? 'Pajak' : 'Tax'}</span>
                    <span className="text-sm font-medium text-gray-900">{formatCurrency(transaction.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 bg-gray-50 rounded-lg px-4">
                    <span className="text-base font-semibold text-gray-900">{language === 'id' ? 'Total' : 'Total'}</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(transaction.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {language === 'id' ? 'Riwayat Transaksi' : 'Transaction Timeline'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {timeline.map((event, index) => (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          index === 0 ? 'bg-green-100' : 'bg-gray-100'
                        )}>
                          {index === 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="text-sm font-medium text-gray-900">{event.description}</h4>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(event.timestamp).toLocaleDateString('id-ID')} •{' '}
                          {new Date(event.timestamp).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes & Metadata */}
            {(transaction.notes || transaction.ipAddress) && (
              <Card>
                <CardHeader>
                  <CardTitle>{language === 'id' ? 'Metadata' : 'Metadata'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transaction.notes && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{language === 'id' ? 'Catatan' : 'Notes'}</p>
                        <p className="text-sm text-gray-900">{transaction.notes}</p>
                      </div>
                    )}
                    {transaction.ipAddress && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{language === 'id' ? 'IP Address' : 'IP Address'}</p>
                        <p className="text-sm font-mono text-gray-900">{transaction.ipAddress}</p>
                      </div>
                    )}
                    {transaction.userAgent && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">{language === 'id' ? 'User Agent' : 'User Agent'}</p>
                        <p className="text-xs text-gray-700 break-all">{transaction.userAgent}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'id' ? 'Aksi' : 'Actions'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    leftIcon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadInvoice}
                  >
                    {language === 'id' ? 'Unduh Invoice' : 'Download Invoice'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    leftIcon={<Mail className="w-4 h-4" />}
                    onClick={handleContactUser}
                  >
                    {language === 'id' ? 'Hubungi Pembeli' : 'Contact Buyer'}
                  </Button>
                  {transaction.status === 'completed' && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      leftIcon={<RefreshCcw className="w-4 h-4" />}
                      onClick={() => setShowRefundModal(true)}
                    >
                      {language === 'id' ? 'Proses Refund' : 'Process Refund'}
                    </Button>
                  )}
                  {transaction.status === 'pending' && (
                    <Button
                      size="sm"
                      variant="danger"
                      className="w-full"
                      leftIcon={<XCircle className="w-4 h-4" />}
                      onClick={() => setShowCancelModal(true)}
                    >
                      {language === 'id' ? 'Batalkan Transaksi' : 'Cancel Transaction'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* User Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {language === 'id' ? 'Informasi Pembeli' : 'Buyer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar src={transaction.user.avatar} name={transaction.user.name} size="md" />
                  <div>
                    <h4 className="font-medium text-gray-900">{transaction.user.name}</h4>
                    <p className="text-sm text-gray-500">{transaction.user.email}</p>
                  </div>
                </div>
                <Link to={`/admin/users/${transaction.user.id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    {language === 'id' ? 'Lihat Profil' : 'View Profile'}
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Course Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {language === 'id' ? 'Informasi Kursus' : 'Course Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  {transaction.course.thumbnail && (
                    <img
                      src={transaction.course.thumbnail}
                      alt={transaction.course.title}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h4 className="font-medium text-gray-900 mb-1">{transaction.course.title}</h4>
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Instruktur' : 'Instructor'}: {transaction.course.instructor}</p>
                </div>
                <Link to={`/admin/courses/${transaction.course.id}`}>
                  <Button size="sm" variant="outline" className="w-full">
                    {language === 'id' ? 'Lihat Kursus' : 'View Course'}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Refund Modal */}
        <Modal
          isOpen={showRefundModal}
          onClose={() => setShowRefundModal(false)}
          title={language === 'id' ? 'Konfirmasi Refund' : 'Confirm Refund'}
          size="sm"
        >
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 mb-1">
                    {language === 'id' ? 'Peringatan' : 'Warning'}
                  </p>
                  <p className="text-sm text-yellow-700">
                    {language === 'id'
                      ? 'Tindakan ini akan mengembalikan dana kepada pembeli dan mencabut akses kursus. Tindakan ini tidak dapat dibatalkan.'
                      : 'This action will refund the payment to the buyer and revoke course access. This cannot be undone.'}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowRefundModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleRefund}>
                {language === 'id' ? 'Proses Refund' : 'Process Refund'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Cancel Modal */}
        <Modal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          title={language === 'id' ? 'Konfirmasi Pembatalan' : 'Confirm Cancellation'}
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-gray-700">
              {language === 'id'
                ? 'Apakah Anda yakin ingin membatalkan transaksi ini?'
                : 'Are you sure you want to cancel this transaction?'}
            </p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowCancelModal(false)}>
                {language === 'id' ? 'Tidak' : 'No'}
              </Button>
              <Button size="sm" variant="danger" onClick={handleCancel}>
                {language === 'id' ? 'Ya, Batalkan' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
