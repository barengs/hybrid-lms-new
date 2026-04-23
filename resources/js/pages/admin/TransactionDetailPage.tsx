import { useState, useMemo } from 'react';
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
import { useGetAdminTransactionDetailQuery } from '@/store/api/transactionManagementApiSlice';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

export function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const { data: response, isLoading, error } = useGetAdminTransactionDetailQuery(id || '');

  const order = response?.data;

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
    if (order?.user?.id) {
        console.log('Opening contact form for user:', order.user.id);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, any> = {
      paid: {
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
      expired: {
        variant: 'danger' as const,
        label: language === 'id' ? 'Kadaluarsa' : 'Expired',
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
    return configs[status] || configs.pending;
  };

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return language === 'id' ? 'Lainnya' : 'Other';
    const labels: Record<string, string> = {
      credit_card: language === 'id' ? 'Kartu Kredit' : 'Credit Card',
      bank_transfer: language === 'id' ? 'Transfer Bank' : 'Bank Transfer',
      e_wallet: language === 'id' ? 'E-Wallet' : 'E-Wallet',
      virtual_account: language === 'id' ? 'Virtual Account' : 'Virtual Account',
    };
    return labels[method] || method;
  };

  const timeline = useMemo(() => {
    if (!order) return [];
    const events = [
      {
        id: 'created',
        status: 'created',
        timestamp: order.created_at,
        description: language === 'id' ? 'Transaksi dibuat' : 'Transaction created',
      }
    ];

    if (order.paid_at) {
        events.unshift({
            id: 'completed',
            status: 'completed',
            timestamp: order.paid_at,
            description: language === 'id' ? 'Pembayaran berhasil dikonfirmasi' : 'Payment confirmed successfully',
        });
    }

    return events;
  }, [order, language]);

  if (isLoading) return <LoadingScreen />;
  if (error || !order) return (
    <DashboardLayout>
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {language === 'id' ? 'Transaksi tidak ditemukan' : 'Transaction not found'}
            </h2>
            <Button onClick={() => navigate('/admin/transactions')} className="mt-4">
                {language === 'id' ? 'Kembali' : 'Back'}
            </Button>
        </div>
    </DashboardLayout>
  );

  const statusConfig = getStatusConfig(order.status);
  const StatusIcon = statusConfig.icon;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {language === 'id' ? 'Detail Transaksi' : 'Transaction Details'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 font-mono">{order.order_number}</p>
            </div>
            <Badge variant={statusConfig.variant} size="lg">
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
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'ID Transaksi' : 'Transaction ID'}</span>
                    <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{order.order_number}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Tanggal Dibuat' : 'Created Date'}</span>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(order.created_at).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('id-ID')}
                      </p>
                    </div>
                  </div>
                  {order.paid_at && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Tanggal Selesai' : 'Completed Date'}</span>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {new Date(order.paid_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.paid_at).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Status' : 'Status'}</span>
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
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{getPaymentMethodLabel(order.payments?.[0]?.payment_method)}</span>
                  </div>
                  {order.payments?.[0]?.transaction_id && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Referensi Gateway' : 'Gateway Ref'}</span>
                      <span className="text-sm font-mono font-medium text-gray-900 dark:text-white">{order.payments[0].transaction_id}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Subtotal' : 'Subtotal'}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Diskon' : 'Discount'}</span>
                      <span className="text-sm font-medium text-green-600">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{language === 'id' ? 'Pajak' : 'Tax'}</span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(order.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-4">
                    <span className="text-base font-semibold text-gray-900 dark:text-white">{language === 'id' ? 'Total' : 'Total'}</span>
                    <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {language === 'id' ? 'Item Pesanan' : 'Order Items'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="p-4 flex gap-4">
                        <img 
                            src={item.course?.thumbnail || `https://picsum.photos/seed/${item.id}/400/300`} 
                            alt={item.course_title} 
                            className="w-20 h-12 object-cover rounded shadow-sm"
                        />
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.course_title}</h4>
                            <p className="text-xs text-gray-500 mt-1">ID: {item.course?.id || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                        </div>
                    </div>
                  ))}
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
                          index === 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'
                        )}>
                          {index === 0 ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                          )}
                        </div>
                        {index < timeline.length - 1 && (
                          <div className="w-0.5 h-12 bg-gray-200 dark:bg-gray-700" />
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{event.description}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(event.timestamp).toLocaleDateString('id-ID')} •{' '}
                          {new Date(event.timestamp).toLocaleTimeString('id-ID')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
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
                  {order.status === 'paid' && (
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
                  {order.status === 'pending' && (
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
                  <Avatar src={order.user?.profile?.avatar} name={order.user?.name} size="md" />
                  <div className="min-w-0">
                    <h4 className="font-medium text-gray-900 dark:text-white truncate">{order.user?.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{order.user?.email}</p>
                  </div>
                </div>
                {order.user?.id && (
                    <Link to={`/admin/users/${order.user.id}`}>
                    <Button size="sm" variant="outline" className="w-full">
                        {language === 'id' ? 'Lihat Profil' : 'View Profile'}
                    </Button>
                    </Link>
                )}
              </CardContent>
            </Card>

            {/* Notes & Backend Info */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {language === 'id' ? 'Catatan' : 'Notes'}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">
                        {order.notes || (language === 'id' ? 'Tidak ada catatan tambahan.' : 'No additional notes.')}
                    </p>
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
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 mb-1">
                    {language === 'id' ? 'Peringatan' : 'Warning'}
                  </p>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
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
            <p className="text-gray-700 dark:text-gray-300">
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
