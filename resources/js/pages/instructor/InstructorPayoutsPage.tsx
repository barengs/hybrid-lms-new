import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Select, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency, getTimeAgo } from '@/lib/utils';

// Mock payout data
interface Payout {
  id: string;
  amount: number;
  requestDate: string;
  processedDate?: string;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  method: 'bank_transfer' | 'paypal' | 'e_wallet';
  accountInfo: string;
  notes?: string;
}

const mockPayouts: Payout[] = [
  {
    id: 'payout-1',
    amount: 25000000,
    requestDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    processedDate: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    method: 'bank_transfer',
    accountInfo: 'BCA - **** 1234',
  },
  {
    id: 'payout-2',
    amount: 15000000,
    requestDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    status: 'processing',
    method: 'bank_transfer',
    accountInfo: 'BCA - **** 1234',
  },
  {
    id: 'payout-3',
    amount: 18500000,
    requestDate: new Date(Date.now() - 86400000 * 15).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 14).toISOString(),
    status: 'completed',
    method: 'bank_transfer',
    accountInfo: 'BCA - **** 1234',
  },
  {
    id: 'payout-4',
    amount: 5000000,
    requestDate: new Date(Date.now() - 86400000 * 20).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 19).toISOString(),
    status: 'rejected',
    method: 'bank_transfer',
    accountInfo: 'BCA - **** 1234',
    notes: 'Insufficient balance at the time of request',
  },
  {
    id: 'payout-5',
    amount: 12000000,
    requestDate: new Date(Date.now() - 86400000 * 30).toISOString(),
    processedDate: new Date(Date.now() - 86400000 * 28).toISOString(),
    status: 'completed',
    method: 'bank_transfer',
    accountInfo: 'BCA - **** 1234',
  },
];

export function InstructorPayoutsPage() {
  const { language } = useLanguage();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('bank_transfer');

  // Mock available balance
  const availableBalance = 52000000; // From earnings page
  const minimumWithdraw = 100000;
  const pendingAmount = mockPayouts
    .filter(p => p.status === 'pending' || p.status === 'processing')
    .reduce((acc, p) => acc + p.amount, 0);

  // Filter payouts
  const filteredPayouts = useMemo(() => {
    if (statusFilter === 'all') return mockPayouts;
    return mockPayouts.filter(p => p.status === statusFilter);
  }, [statusFilter]);

  // Calculate stats
  const stats = {
    totalWithdrawn: mockPayouts
      .filter(p => p.status === 'completed')
      .reduce((acc, p) => acc + p.amount, 0),
    pendingWithdrawals: mockPayouts.filter(p => p.status === 'pending' || p.status === 'processing').length,
    completedWithdrawals: mockPayouts.filter(p => p.status === 'completed').length,
  };

  const handleWithdrawRequest = () => {
    const amount = parseFloat(withdrawAmount);
    if (amount < minimumWithdraw) {
      alert(`Minimum withdrawal is ${formatCurrency(minimumWithdraw)}`);
      return;
    }
    if (amount > availableBalance) {
      alert('Insufficient balance');
      return;
    }
    // In real app, call API to request withdrawal
    console.log('Withdrawal request:', { amount, method: withdrawMethod });
    setShowWithdrawModal(false);
    setWithdrawAmount('');
  };

  const getStatusBadge = (status: Payout['status']) => {
    const config = {
      pending: { variant: 'warning' as const, icon: Clock, label: language === 'id' ? 'Pending' : 'Pending' },
      processing: { variant: 'primary' as const, icon: AlertCircle, label: language === 'id' ? 'Diproses' : 'Processing' },
      completed: { variant: 'success' as const, icon: CheckCircle, label: language === 'id' ? 'Selesai' : 'Completed' },
      rejected: { variant: 'danger' as const, icon: XCircle, label: language === 'id' ? 'Ditolak' : 'Rejected' },
    };

    const { variant, icon: Icon, label } = config[status];
    return (
      <Badge variant={variant} size="sm">
        <Icon className="w-3 h-3 mr-1" />
        {label}
      </Badge>
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <Link
              to="/instructor/earnings"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {language === 'id' ? 'Kembali ke Pendapatan' : 'Back to Earnings'}
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              {language === 'id' ? 'Penarikan Dana' : 'Payouts'}
            </h1>
            <p className="text-gray-600 mt-1">
              {language === 'id'
                ? 'Kelola penarikan dana dan lihat riwayat pembayaran'
                : 'Manage withdrawals and view payment history'}
            </p>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm mb-1">
                  {language === 'id' ? 'Saldo Tersedia' : 'Available Balance'}
                </p>
                <p className="text-2xl font-bold">{formatCurrency(availableBalance)}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <Button
              onClick={() => setShowWithdrawModal(true)}
              size="sm"
              className="w-full mt-4 bg-white text-green-600 hover:bg-gray-100"
              disabled={availableBalance < minimumWithdraw}
            >
              {language === 'id' ? 'Tarik Dana' : 'Withdraw Funds'}
            </Button>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Menunggu Proses' : 'Pending'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-gray-500">
                  {stats.pendingWithdrawals} {language === 'id' ? 'penarikan' : 'withdrawals'}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Total Ditarik' : 'Total Withdrawn'}
                </p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalWithdrawn)}</p>
                <p className="text-xs text-gray-500">
                  {stats.completedWithdrawals} {language === 'id' ? 'transaksi' : 'transactions'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Info Card */}
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">
                {language === 'id' ? 'Informasi Penarikan' : 'Withdrawal Information'}
              </p>
              <ul className="space-y-1 text-blue-700">
                <li>• {language === 'id' ? 'Minimum penarikan' : 'Minimum withdrawal'}: {formatCurrency(minimumWithdraw)}</li>
                <li>• {language === 'id' ? 'Waktu proses: 1-3 hari kerja' : 'Processing time: 1-3 business days'}</li>
                <li>• {language === 'id' ? 'Biaya admin: Gratis' : 'Admin fee: Free'}</li>
                <li>• {language === 'id' ? 'Penarikan dapat dilakukan kapan saja' : 'Withdrawals can be requested anytime'}</li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Payout History */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{language === 'id' ? 'Riwayat Penarikan' : 'Payout History'}</CardTitle>
            <div className="flex gap-3">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                  { value: 'pending', label: language === 'id' ? 'Pending' : 'Pending' },
                  { value: 'processing', label: language === 'id' ? 'Diproses' : 'Processing' },
                  { value: 'completed', label: language === 'id' ? 'Selesai' : 'Completed' },
                  { value: 'rejected', label: language === 'id' ? 'Ditolak' : 'Rejected' },
                ]}
                className="w-48"
              />
              <Button variant="outline" leftIcon={<Download className="w-4 h-4" />}>
                {language === 'id' ? 'Ekspor' : 'Export'}
              </Button>
            </div>
          </CardHeader>

          {filteredPayouts.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {language === 'id' ? 'Belum ada penarikan' : 'No withdrawals yet'}
              </h3>
              <p className="text-gray-500 mb-4">
                {language === 'id'
                  ? 'Mulai tarik dana yang tersedia'
                  : 'Start withdrawing your available balance'}
              </p>
              <Button onClick={() => setShowWithdrawModal(true)}>
                {language === 'id' ? 'Tarik Dana' : 'Withdraw Funds'}
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-y border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {language === 'id' ? 'Tanggal Request' : 'Request Date'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {language === 'id' ? 'Jumlah' : 'Amount'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {language === 'id' ? 'Metode' : 'Method'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {language === 'id' ? 'Status' : 'Status'}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {language === 'id' ? 'Tanggal Proses' : 'Processed Date'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(payout.requestDate).toLocaleDateString('id-ID')}
                        </div>
                        <div className="text-xs text-gray-500">{getTimeAgo(payout.requestDate)}</div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(payout.amount)}</p>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          {payout.accountInfo}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(payout.status)}
                        {payout.notes && (
                          <p className="text-xs text-gray-500 mt-1">{payout.notes}</p>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {payout.processedDate ? (
                          <>
                            {new Date(payout.processedDate).toLocaleDateString('id-ID')}
                            <div className="text-xs text-gray-500">{getTimeAgo(payout.processedDate)}</div>
                          </>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Withdraw Modal */}
        <Modal
          isOpen={showWithdrawModal}
          onClose={() => setShowWithdrawModal(false)}
          title={language === 'id' ? 'Request Penarikan Dana' : 'Request Withdrawal'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {language === 'id' ? 'Saldo Tersedia' : 'Available Balance'}
                </span>
                <span className="font-semibold text-gray-900">{formatCurrency(availableBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {language === 'id' ? 'Minimum Penarikan' : 'Minimum Withdrawal'}
                </span>
                <span className="text-sm text-gray-900">{formatCurrency(minimumWithdraw)}</span>
              </div>
            </div>

            <Input
              label={language === 'id' ? 'Jumlah Penarikan' : 'Withdrawal Amount'}
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder={formatCurrency(minimumWithdraw)}
              min={minimumWithdraw}
              max={availableBalance}
            />

            <Select
              label={language === 'id' ? 'Metode Penarikan' : 'Withdrawal Method'}
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              options={[
                { value: 'bank_transfer', label: 'Transfer Bank (BCA - **** 1234)' },
                { value: 'paypal', label: 'PayPal' },
                { value: 'e_wallet', label: 'E-Wallet' },
              ]}
            />

            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-900">
              <p className="font-medium mb-1">
                {language === 'id' ? 'Catatan:' : 'Note:'}
              </p>
              <p className="text-blue-700">
                {language === 'id'
                  ? 'Dana akan diproses dalam 1-3 hari kerja setelah request diajukan.'
                  : 'Funds will be processed within 1-3 business days after request is submitted.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowWithdrawModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                onClick={handleWithdrawRequest}
                disabled={!withdrawAmount || parseFloat(withdrawAmount) < minimumWithdraw}
              >
                {language === 'id' ? 'Request Penarikan' : 'Request Withdrawal'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
