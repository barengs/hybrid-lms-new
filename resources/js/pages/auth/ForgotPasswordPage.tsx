import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input } from '@/components/ui';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Cek Email Anda"
        subtitle="Kami telah mengirim instruksi reset password"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-gray-600 mb-6">
            Kami telah mengirim email ke <strong>{email}</strong> dengan instruksi untuk
            mereset password Anda.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Tidak menerima email? Cek folder spam atau{' '}
            <button
              onClick={() => setIsSubmitted(false)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              coba lagi
            </button>
          </p>
          <Link to="/login">
            <Button variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Login
            </Button>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Lupa Password?"
      subtitle="Masukkan email Anda dan kami akan mengirimkan instruksi reset password"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="nama@email.com"
          leftIcon={<Mail className="w-5 h-5" />}
          required
        />

        <Button type="submit" className="w-full" isLoading={isLoading}>
          Kirim Instruksi Reset
        </Button>

        <Link
          to="/login"
          className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </Link>
      </form>
    </AuthLayout>
  );
}
