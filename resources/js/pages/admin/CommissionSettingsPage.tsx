import { useState } from 'react';
import {
  Percent,
  DollarSign,
  Save,
  History,
  Calculator,
  AlertCircle,
  Info,
  Settings,
  TrendingUp,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';

// Settings history type
interface SettingChange {
  id: string;
  field: string;
  oldValue: number;
  newValue: number;
  changedBy: string;
  changedAt: string;
  reason: string;
}

// Mock settings history
const mockHistory: SettingChange[] = [
  {
    id: 'ch-1',
    field: 'Platform Commission Rate',
    oldValue: 25,
    newValue: 20,
    changedBy: 'Admin User',
    changedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    reason: 'Promotional period adjustment',
  },
  {
    id: 'ch-2',
    field: 'Minimum Payout',
    oldValue: 50000,
    newValue: 100000,
    changedBy: 'Admin User',
    changedAt: new Date(Date.now() - 86400000 * 14).toISOString(),
    reason: 'Reduce transaction costs',
  },
];

export function CommissionSettingsPage() {
  const { language } = useLanguage();

  // Current settings state
  const [platformCommission, setPlatformCommission] = useState(20); // 20%
  const [minimumPayout, setMinimumPayout] = useState(100000); // Rp 100,000
  const [maximumPayout, setMaximumPayout] = useState(50000000); // Rp 50,000,000
  const [taxWithholding, setTaxWithholding] = useState(5); // 5%

  // Temporary editing state
  const [editingCommission, setEditingCommission] = useState(platformCommission);
  const [editingMinPayout, setEditingMinPayout] = useState(minimumPayout);
  const [editingMaxPayout, setEditingMaxPayout] = useState(maximumPayout);
  const [editingTax, setEditingTax] = useState(taxWithholding);

  // Modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [changeReason, setChangeReason] = useState('');

  // Calculate instructor earnings
  const instructorEarning = 100 - editingCommission;

  // Example calculation
  const exampleSaleAmount = 299000;
  const platformFee = (exampleSaleAmount * editingCommission) / 100;
  const instructorGross = exampleSaleAmount - platformFee;
  const taxAmount = (instructorGross * editingTax) / 100;
  const instructorNet = instructorGross - taxAmount;

  const hasChanges =
    editingCommission !== platformCommission ||
    editingMinPayout !== minimumPayout ||
    editingMaxPayout !== maximumPayout ||
    editingTax !== taxWithholding;

  const handleSave = () => {
    if (!changeReason.trim()) {
      alert(language === 'id' ? 'Mohon masukkan alasan perubahan' : 'Please enter reason for change');
      return;
    }

    // Save changes
    setPlatformCommission(editingCommission);
    setMinimumPayout(editingMinPayout);
    setMaximumPayout(editingMaxPayout);
    setTaxWithholding(editingTax);

    console.log('Saving commission settings:', {
      platformCommission: editingCommission,
      minimumPayout: editingMinPayout,
      maximumPayout: editingMaxPayout,
      taxWithholding: editingTax,
      reason: changeReason,
    });

    setShowConfirmModal(false);
    setChangeReason('');
  };

  const handleCancel = () => {
    setEditingCommission(platformCommission);
    setEditingMinPayout(minimumPayout);
    setEditingMaxPayout(maximumPayout);
    setEditingTax(taxWithholding);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pengaturan Komisi' : 'Commission Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Atur pembagian revenue antara platform dan instruktur'
              : 'Configure revenue sharing between platform and instructors'}
          </p>
        </div>

        {/* Current Settings Overview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Komisi Platform' : 'Platform Fee'}</p>
                <p className="text-xl font-bold text-gray-900">{platformCommission}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Instruktur Dapat' : 'Instructor Earns'}</p>
                <p className="text-xl font-bold text-gray-900">{100 - platformCommission}%</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Min. Payout' : 'Min. Payout'}</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(minimumPayout)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Percent className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Pajak' : 'Tax'}</p>
                <p className="text-xl font-bold text-gray-900">{taxWithholding}%</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Commission Rate */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Percent className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {language === 'id' ? 'Komisi Platform' : 'Platform Commission'}
                  </h2>
                </div>
                <Badge variant="primary">{editingCommission}%</Badge>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-600">{language === 'id' ? 'Komisi Platform' : 'Platform Fee'}</span>
                    <span className="font-semibold text-blue-600">{editingCommission}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={editingCommission}
                    onChange={(e) => setEditingCommission(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0%</span>
                    <span>50%</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{language === 'id' ? 'Instruktur Dapat' : 'Instructor Earns'}</span>
                    <span className="font-semibold text-green-600">{instructorEarning}%</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Payment Thresholds */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'id' ? 'Batas Pembayaran' : 'Payment Thresholds'}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'id' ? 'Minimum Payout' : 'Minimum Payout'}
                  </label>
                  <input
                    type="number"
                    value={editingMinPayout}
                    onChange={(e) => setEditingMinPayout(Number(e.target.value))}
                    step="10000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'id'
                      ? 'Jumlah minimum yang harus dicapai instruktur sebelum dapat request payout'
                      : 'Minimum amount instructor must reach before requesting payout'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'id' ? 'Maximum Payout' : 'Maximum Payout'}
                  </label>
                  <input
                    type="number"
                    value={editingMaxPayout}
                    onChange={(e) => setEditingMaxPayout(Number(e.target.value))}
                    step="100000"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'id'
                      ? 'Jumlah maksimum per satu kali request payout'
                      : 'Maximum amount per single payout request'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Tax Settings */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  {language === 'id' ? 'Pengaturan Pajak' : 'Tax Settings'}
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Potongan Pajak' : 'Tax Withholding'} (%)
                </label>
                <input
                  type="number"
                  value={editingTax}
                  onChange={(e) => setEditingTax(Number(e.target.value))}
                  step="0.5"
                  min="0"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {language === 'id'
                    ? 'Persentase pajak yang dipotong dari earning instruktur'
                    : 'Percentage of tax withheld from instructor earnings'}
                </p>
              </div>
            </Card>

            {/* Action Buttons */}
            {hasChanges && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-900 mb-3">
                      {language === 'id' ? 'Anda memiliki perubahan yang belum disimpan' : 'You have unsaved changes'}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => setShowConfirmModal(true)}>
                        <Save className="w-4 h-4 mr-1.5" />
                        {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
                      </Button>
                      <Button size="sm" variant="outline" onClick={handleCancel}>
                        {language === 'id' ? 'Batal' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Example Calculation & History */}
          <div className="space-y-6">
            {/* Example Calculation */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {language === 'id' ? 'Contoh Perhitungan' : 'Example Calculation'}
                </h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">{language === 'id' ? 'Harga Kursus' : 'Course Price'}</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(exampleSaleAmount)}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'id' ? 'Komisi Platform' : 'Platform Fee'} ({editingCommission}%)</span>
                    <span className="text-red-600">-{formatCurrency(platformFee)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-900">{language === 'id' ? 'Gross Instruktur' : 'Instructor Gross'}</span>
                    <span className="text-gray-900">{formatCurrency(instructorGross)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{language === 'id' ? 'Pajak' : 'Tax'} ({editingTax}%)</span>
                    <span className="text-red-600">-{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex justify-between font-bold">
                      <span className="text-gray-900">{language === 'id' ? 'Net Instruktur' : 'Instructor Net'}</span>
                      <span className="text-green-600">{formatCurrency(instructorNet)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Info Card */}
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex gap-3">
                <Info className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div className="text-sm text-yellow-900">
                  <p className="font-medium mb-1">
                    {language === 'id' ? 'Catatan Penting' : 'Important Notes'}
                  </p>
                  <ul className="space-y-1 text-yellow-800 text-xs">
                    <li>• {language === 'id' ? 'Perubahan berlaku untuk transaksi baru' : 'Changes apply to new transactions'}</li>
                    <li>• {language === 'id' ? 'Transaksi lama tidak terpengaruh' : 'Old transactions are not affected'}</li>
                    <li>• {language === 'id' ? 'Semua perubahan dicatat dalam log' : 'All changes are logged'}</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* History Button */}
            <Button variant="outline" className="w-full" onClick={() => setShowHistoryModal(true)}>
              <History className="w-4 h-4 mr-2" />
              {language === 'id' ? 'Lihat Riwayat Perubahan' : 'View Change History'}
            </Button>
          </div>
        </div>

        {/* Confirm Modal */}
        <Modal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          title={language === 'id' ? 'Konfirmasi Perubahan' : 'Confirm Changes'}
          size="md"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900 font-medium mb-2">
                {language === 'id' ? 'Perubahan yang akan disimpan:' : 'Changes to be saved:'}
              </p>
              <ul className="space-y-1 text-sm text-blue-800">
                {editingCommission !== platformCommission && (
                  <li>• {language === 'id' ? 'Komisi Platform' : 'Platform Commission'}: {platformCommission}% → {editingCommission}%</li>
                )}
                {editingMinPayout !== minimumPayout && (
                  <li>• {language === 'id' ? 'Min. Payout' : 'Min. Payout'}: {formatCurrency(minimumPayout)} → {formatCurrency(editingMinPayout)}</li>
                )}
                {editingMaxPayout !== maximumPayout && (
                  <li>• {language === 'id' ? 'Max. Payout' : 'Max. Payout'}: {formatCurrency(maximumPayout)} → {formatCurrency(editingMaxPayout)}</li>
                )}
                {editingTax !== taxWithholding && (
                  <li>• {language === 'id' ? 'Pajak' : 'Tax'}: {taxWithholding}% → {editingTax}%</li>
                )}
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {language === 'id' ? 'Alasan Perubahan' : 'Reason for Change'} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={changeReason}
                onChange={(e) => setChangeReason(e.target.value)}
                placeholder={language === 'id' ? 'Jelaskan alasan perubahan...' : 'Explain reason for change...'}
                rows={3}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={!changeReason.trim()}>
                {language === 'id' ? 'Simpan' : 'Save'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* History Modal */}
        <Modal
          isOpen={showHistoryModal}
          onClose={() => setShowHistoryModal(false)}
          title={language === 'id' ? 'Riwayat Perubahan' : 'Change History'}
          size="lg"
        >
          <div className="space-y-3">
            {mockHistory.map((change) => (
              <div key={change.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{change.field}</p>
                    <p className="text-sm text-gray-500">{new Date(change.changedAt).toLocaleString('id-ID')}</p>
                  </div>
                  <Badge variant="secondary" size="sm">{change.changedBy}</Badge>
                </div>
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className="text-red-600">{change.field.includes('Payout') ? formatCurrency(change.oldValue) : change.oldValue + '%'}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600">{change.field.includes('Payout') ? formatCurrency(change.newValue) : change.newValue + '%'}</span>
                </div>
                <p className="text-sm text-gray-600 italic">{change.reason}</p>
              </div>
            ))}
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
