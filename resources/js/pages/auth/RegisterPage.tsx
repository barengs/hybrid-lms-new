import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, LanguageSwitcher } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';


export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);
  const { register, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t.messages.passwordMismatch);
      return;
    }

    if (!agreed) {
      setError(t.messages.agreeTermsRequired);
      return;
    }

    try {
      await register(name, email, password, confirmPassword);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messages.loginError);
    }
  };

  return (
    <AuthLayout
      title={t.auth.createAccount}
      subtitle={t.auth.registerSubtitle}
    >
      <div className="flex justify-center mb-6">
        <LanguageSwitcher variant="full" />
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        <Input
          label={t.auth.fullName}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={language === 'id' ? 'Masukkan nama lengkap' : 'Enter your full name'}
          leftIcon={<User className="w-5 h-5" />}
          required
        />

        <Input
          label={t.auth.email}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="email@example.com"
          leftIcon={<Mail className="w-5 h-5" />}
          required
        />



        <Input
          label={t.auth.password}
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={language === 'id' ? 'Minimal 8 karakter' : 'Minimum 8 characters'}
          leftIcon={<Lock className="w-5 h-5" />}
          rightIcon={
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          }
          required
        />

        <Input
          label={t.auth.confirmPassword}
          type={showPassword ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder={language === 'id' ? 'Ulangi password' : 'Repeat password'}
          leftIcon={<Lock className="w-5 h-5" />}
          required
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-600">
            {t.auth.agreeTerms}{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">
              {t.auth.termsConditions}
            </Link>{' '}
            {t.common.and}{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">
              {t.auth.privacyPolicy}
            </Link>
          </span>
        </label>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t.nav.register}
        </Button>

        <p className="text-center text-sm text-gray-600">
          {t.auth.hasAccount}{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-700">
            {t.nav.login}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
