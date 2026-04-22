import { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  CheckCircle,
  Download,
  ArrowRight,
  BookOpen,
  Calendar,
  CreditCard,
  Mail,
  Home,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Card, Button, Badge } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatCurrency } from '@/lib/utils';
import type { Course } from '@/types';

interface PaymentSuccessState {
  transactionId: string;
  amount: number;
  paymentMethod: string;
  courses: Course[];
}

export function PaymentSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const state = location.state as PaymentSuccessState | null;

  // Redirect if no state
  useEffect(() => {
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) {
    return null;
  }

  const { transactionId, amount, paymentMethod, courses } = state;
  const currentDate = new Date();

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      credit_card: language === 'id' ? 'Kartu Kredit' : 'Credit Card',
      bank_transfer: language === 'id' ? 'Transfer Bank' : 'Bank Transfer',
      e_wallet: 'E-Wallet',
      virtual_account: 'Virtual Account',
    };
    return labels[method] || method;
  };

  const handleDownloadInvoice = () => {
    console.log('Downloading invoice for transaction:', transactionId);
    // TODO: Implement invoice download
  };

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-green-50 to-white min-h-screen py-12">
        <div className="max-w-3xl mx-auto px-4">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4 animate-bounce">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {language === 'id' ? 'Pembayaran Berhasil!' : 'Payment Successful!'}
            </h1>
            <p className="text-gray-600">
              {language === 'id'
                ? 'Terima kasih atas pembelian Anda. Kursus sudah dapat diakses.'
                : 'Thank you for your purchase. Your courses are now accessible.'}
            </p>
          </div>

          {/* Transaction Details */}
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'id' ? 'Detail Transaksi' : 'Transaction Details'}
              </h2>
              <Badge variant="success">
                <CheckCircle className="w-3 h-3 mr-1" />
                {language === 'id' ? 'Selesai' : 'Completed'}
              </Badge>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{language === 'id' ? 'ID Transaksi' : 'Transaction ID'}</p>
                  <p className="font-mono font-medium text-gray-900">{transactionId}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Tanggal Pembayaran' : 'Payment Date'}</p>
                  <p className="font-medium text-gray-900">
                    {currentDate.toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Metode Pembayaran' : 'Payment Method'}</p>
                  <p className="font-medium text-gray-900">{getPaymentMethodLabel(paymentMethod)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-yellow-600">Rp</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">{language === 'id' ? 'Total Pembayaran' : 'Total Amount'}</p>
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(amount)}</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full"
                leftIcon={<Download className="w-4 h-4" />}
                onClick={handleDownloadInvoice}
              >
                {language === 'id' ? 'Unduh Invoice' : 'Download Invoice'}
              </Button>
            </div>
          </Card>

          {/* Purchased Courses */}
          <Card className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'id' ? 'Kursus yang Dibeli' : 'Purchased Courses'}
            </h2>

            <div className="space-y-3">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-24 h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 line-clamp-1">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.instructor?.name}</p>
                  </div>
                  <Link to={`/learn/${course.slug}`}>
                    <Button size="sm">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {language === 'id' ? 'Mulai Belajar' : 'Start Learning'}
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </Card>

          {/* Email Notification */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">
                  {language === 'id' ? 'Konfirmasi Email' : 'Email Confirmation'}
                </p>
                <p className="text-sm text-blue-700">
                  {language === 'id'
                    ? 'Kami telah mengirimkan konfirmasi pembayaran dan detail akses kursus ke email Anda.'
                    : 'We have sent payment confirmation and course access details to your email.'}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid md:grid-cols-3 gap-4">
            <Link to="/my-courses" className="block">
              <Button variant="outline" className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Kursus Saya' : 'My Courses'}
              </Button>
            </Link>

            <Link to="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                {language === 'id' ? 'Dashboard' : 'Dashboard'}
              </Button>
            </Link>

            <Link to="/courses" className="block">
              <Button className="w-full">
                {language === 'id' ? 'Jelajahi Lebih' : 'Explore More'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {language === 'id' ? 'Butuh bantuan? ' : 'Need help? '}
              <a href="#" className="text-blue-600 hover:underline">
                {language === 'id' ? 'Hubungi Tim Support' : 'Contact Support Team'}
              </a>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
