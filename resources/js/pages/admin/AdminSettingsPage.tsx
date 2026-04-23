import { useState } from 'react';
import {
  Globe,
  Mail,
  Shield,
  Bell,
  Server,
  Save,
  AlertCircle,
  Brain,
  Cpu,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Input, Select } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { 
  useGetAppSettingsQuery, 
  useUpdateAppSettingsMutation 
} from '@/store/features/admin/adminSettingApiSlice';
import toast from 'react-hot-toast';

type TabType = 'general' | 'email' | 'security' | 'notifications' | 'system' | 'ai';

export function AdminSettingsPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('general');
  const [hasChanges, setHasChanges] = useState(false);

  // General Settings
  const [platformName, setPlatformName] = useState('MOLANG - Higher Learning Management System');
  const [platformTagline, setPlatformTagline] = useState('Empowering Education Through Technology');
  const [defaultLanguage, setDefaultLanguage] = useState('id');
  const [defaultCurrency, setDefaultCurrency] = useState('IDR');
  const [timezone, setTimezone] = useState('Asia/Jakarta');

  // Email Settings
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [emailSenderName, setEmailSenderName] = useState('MOLANG Platform');
  const [emailSenderAddress, setEmailSenderAddress] = useState('noreply@hlms.com');

  // Security Settings
  const [minPasswordLength, setMinPasswordLength] = useState(8);
  const [requireSpecialChars, setRequireSpecialChars] = useState(true);
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState(5);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Notification Settings
  const [notifyNewUser, setNotifyNewUser] = useState(true);
  const [notifyNewCourse, setNotifyNewCourse] = useState(true);
  const [notifyPurchase, setNotifyPurchase] = useState(true);
  const [notifyPayoutRequest, setNotifyPayoutRequest] = useState(true);

  // System Settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System under maintenance. Please check back later.');
  const [debugMode, setDebugMode] = useState(false);

  // AI Settings
  const [aiProvider, setAiProvider] = useState('ollama');
  const [aiModel, setAiModel] = useState('llama3');
  const [aiTemperature, setAiTemperature] = useState(0.7);

  // API Hooks
  const { data: settingsData, isLoading } = useGetAppSettingsQuery();
  const [updateSettings, { isLoading: isSaving }] = useUpdateAppSettingsMutation();

  // Load data from API
  useState(() => {
    if (settingsData?.data?.ai) {
      const ai = settingsData.data.ai.reduce((acc: any, s: any) => ({ ...acc, [s.key]: s.value }), {});
      if (ai.ai_provider) setAiProvider(ai.ai_provider);
      if (ai.ai_model) setAiModel(ai.ai_model);
      if (ai.ai_temperature) setAiTemperature(ai.ai_temperature);
    }
  });

  const handleSave = async () => {
    try {
      const payload = [
        { key: 'ai_provider', value: aiProvider, group: 'ai' },
        { key: 'ai_model', value: aiModel, group: 'ai' },
        { key: 'ai_temperature', value: aiTemperature.toString(), group: 'ai', type: 'integer' },
      ];

      await updateSettings({ settings: payload }).unwrap();
      toast.success(language === 'id' ? 'Pengaturan disimpan' : 'Settings saved');
      setHasChanges(false);
    } catch (err) {
      toast.error('Failed to save settings');
    }
  };

  const handleReset = () => {
    if (confirm(language === 'id' ? 'Reset semua pengaturan ke default?' : 'Reset all settings to default?')) {
      console.log('Resetting to defaults...');
      setHasChanges(false);
    }
  };

  const markAsChanged = () => {
    setHasChanges(true);
  };

  const tabs = [
    { id: 'general' as TabType, label: language === 'id' ? 'Umum' : 'General', icon: Globe },
    { id: 'email' as TabType, label: 'Email', icon: Mail },
    { id: 'security' as TabType, label: language === 'id' ? 'Keamanan' : 'Security', icon: Shield },
    { id: 'notifications' as TabType, label: language === 'id' ? 'Notifikasi' : 'Notifications', icon: Bell },
    { id: 'ai' as TabType, label: 'AI Settings', icon: Brain },
    { id: 'system' as TabType, label: language === 'id' ? 'Sistem' : 'System', icon: Server },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Pengaturan Platform' : 'Platform Settings'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Konfigurasi pengaturan platform dan sistem'
              : 'Configure platform and system settings'}
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Unsaved Changes Alert */}
        {hasChanges && (
          <Card className="mb-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">
                  {language === 'id' ? 'Anda memiliki perubahan yang belum disimpan' : 'You have unsaved changes'}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSave}>
                  <Save className="w-4 h-4 mr-1.5" />
                  {language === 'id' ? 'Simpan' : 'Save'}
                </Button>
                <Button size="sm" variant="outline" onClick={handleReset}>
                  {language === 'id' ? 'Reset' : 'Reset'}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Tab Content */}
        <div className="space-y-6">
          {/* General Settings */}
          {activeTab === 'general' && (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Informasi Platform' : 'Platform Information'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Nama Platform' : 'Platform Name'}
                    </label>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => { setPlatformName(e.target.value); markAsChanged(); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Tagline' : 'Tagline'}
                    </label>
                    <input
                      type="text"
                      value={platformTagline}
                      onChange={(e) => { setPlatformTagline(e.target.value); markAsChanged(); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Bahasa Default' : 'Default Language'}
                      </label>
                      <select
                        value={defaultLanguage}
                        onChange={(e) => { setDefaultLanguage(e.target.value); markAsChanged(); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="id">Bahasa Indonesia</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {language === 'id' ? 'Mata Uang' : 'Currency'}
                      </label>
                      <select
                        value={defaultCurrency}
                        onChange={(e) => { setDefaultCurrency(e.target.value); markAsChanged(); }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="IDR">IDR - Indonesian Rupiah</option>
                        <option value="USD">USD - US Dollar</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Timezone
                    </label>
                    <select
                      value={timezone}
                      onChange={(e) => { setTimezone(e.target.value); markAsChanged(); }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                      <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                      <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                    </select>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Email Settings */}
          {activeTab === 'email' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'id' ? 'Konfigurasi Email' : 'Email Configuration'}
              </h2>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={smtpHost}
                      onChange={(e) => { setSmtpHost(e.target.value); markAsChanged(); }}
                      placeholder="smtp.gmail.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      SMTP Port
                    </label>
                    <input
                      type="text"
                      value={smtpPort}
                      onChange={(e) => { setSmtpPort(e.target.value); markAsChanged(); }}
                      placeholder="587"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'id' ? 'Nama Pengirim' : 'Sender Name'}
                  </label>
                  <input
                    type="text"
                    value={emailSenderName}
                    onChange={(e) => { setEmailSenderName(e.target.value); markAsChanged(); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'id' ? 'Email Pengirim' : 'Sender Email'}
                  </label>
                  <input
                    type="email"
                    value={emailSenderAddress}
                    onChange={(e) => { setEmailSenderAddress(e.target.value); markAsChanged(); }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <Button variant="outline">
                  {language === 'id' ? 'Test Koneksi Email' : 'Test Email Connection'}
                </Button>
              </div>
            </Card>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <>
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Kebijakan Password' : 'Password Policy'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Panjang Minimum' : 'Minimum Length'}
                    </label>
                    <input
                      type="number"
                      value={minPasswordLength}
                      onChange={(e) => { setMinPasswordLength(Number(e.target.value)); markAsChanged(); }}
                      min="6"
                      max="20"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Wajib Karakter Spesial' : 'Require Special Characters'}
                    </label>
                    <button
                      onClick={() => { setRequireSpecialChars(!requireSpecialChars); markAsChanged(); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${requireSpecialChars ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${requireSpecialChars ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Wajib Huruf Besar' : 'Require Uppercase'}
                    </label>
                    <button
                      onClick={() => { setRequireUppercase(!requireUppercase); markAsChanged(); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${requireUppercase ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${requireUppercase ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>
                </div>
              </Card>

              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  {language === 'id' ? 'Keamanan Sesi' : 'Session Security'}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Session Timeout (menit)' : 'Session Timeout (minutes)'}
                    </label>
                    <input
                      type="number"
                      value={sessionTimeout}
                      onChange={(e) => { setSessionTimeout(Number(e.target.value)); markAsChanged(); }}
                      min="5"
                      max="120"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {language === 'id' ? 'Maksimal Percobaan Login' : 'Max Login Attempts'}
                    </label>
                    <input
                      type="number"
                      value={maxLoginAttempts}
                      onChange={(e) => { setMaxLoginAttempts(Number(e.target.value)); markAsChanged(); }}
                      min="3"
                      max="10"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        {language === 'id' ? 'Two-Factor Authentication' : 'Two-Factor Authentication'}
                      </label>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {language === 'id' ? 'Wajibkan 2FA untuk semua admin' : 'Require 2FA for all admins'}
                      </p>
                    </div>
                    <button
                      onClick={() => { setTwoFactorEnabled(!twoFactorEnabled); markAsChanged(); }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFactorEnabled ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`} />
                    </button>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {language === 'id' ? 'Notifikasi Email' : 'Email Notifications'}
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Registrasi User Baru' : 'New User Registration'}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'id' ? 'Notifikasi saat ada user baru mendaftar' : 'Notify when new user registers'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setNotifyNewUser(!notifyNewUser); markAsChanged(); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyNewUser ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyNewUser ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Kursus Baru' : 'New Course'}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'id' ? 'Notifikasi saat ada kursus baru disubmit' : 'Notify when new course is submitted'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setNotifyNewCourse(!notifyNewCourse); markAsChanged(); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyNewCourse ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyNewCourse ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Pembelian' : 'Purchase'}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'id' ? 'Notifikasi saat ada pembelian kursus' : 'Notify when course is purchased'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setNotifyPurchase(!notifyPurchase); markAsChanged(); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyPurchase ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyPurchase ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      {language === 'id' ? 'Request Payout' : 'Payout Request'}
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {language === 'id' ? 'Notifikasi saat instruktur request payout' : 'Notify when instructor requests payout'}
                    </p>
                  </div>
                  <button
                    onClick={() => { setNotifyPayoutRequest(!notifyPayoutRequest); markAsChanged(); }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${notifyPayoutRequest ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifyPayoutRequest ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                  </button>
                </div>
              </div>
            </Card>
          )}

          {/* System Settings */}
          {activeTab === 'system' && (
            <>
              {/* Existing System Mock UI */}
            </>
          )}

          {/* AI Settings */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <Card>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      AI Provider Configuration
                    </h2>
                    <p className="text-sm text-gray-500">
                      Configure the default AI engine for grading and recommendations.
                    </p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      AI Provider
                    </label>
                    <Select
                      value={aiProvider}
                      onChange={(e) => { setAiProvider(e.target.value); markAsChanged(); }}
                      options={[
                        { value: 'ollama', label: 'Ollama (Local/Self-hosted)' },
                        { value: 'gemini', label: 'Google Gemini (Cloud API)' },
                        { value: 'openai', label: 'OpenAI (GPT-4/3.5)' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model Name
                    </label>
                    <Input
                      value={aiModel}
                      onChange={(e) => { setAiModel(e.target.value); markAsChanged(); }}
                      placeholder={aiProvider === 'ollama' ? 'llama3, mistral, etc.' : 'gemini-1.5-flash, gpt-4, etc.'}
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700">
                      Temperature ({aiTemperature})
                    </label>
                    <span className="text-xs text-gray-500">
                      Lower = Focused, Higher = Creative
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiTemperature}
                    onChange={(e) => { setAiTemperature(parseFloat(e.target.value)); markAsChanged(); }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              </Card>

              <Card className="bg-blue-50 border-blue-100">
                <div className="flex gap-3">
                  <Cpu className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Tip Konfigurasi</p>
                    <p>
                      Pastikan API Key untuk provider yang dipilih sudah diset di file <code>.env</code> server. 
                      Untuk Ollama, pastikan service Ollama berjalan di host yang dapat diakses oleh Laravel.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Save Button (sticky at bottom) */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 py-4 -mx-6 px-6">
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={handleReset}>
                {language === 'id' ? 'Reset ke Default' : 'Reset to Default'}
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Simpan Perubahan' : 'Save Changes'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
