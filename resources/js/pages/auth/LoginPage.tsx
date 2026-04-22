import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '@/components/layouts';
import { Button, Input, LanguageSwitcher } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Need to unwrap to catch errors here, but we also want the user data
      // However, check AuthContext implementation. login returns void.
      // We rely on the useAuth hook to expose the current user state, 
      // BUT state updates might not be immediate in the same render cycle.
      // Better approach: authContext.login should probably return the user or we check the user in useEffect 
      // or we decode from the logic we know.
      // Since we just updated login in AuthContext, let's see what it returns.
      // It returns Promise<void>. 
      
      // We can fetch the user from the store assuming the dispatch happens synchronously enough or simply
      // trust that we can get the role from the side effect or modifying login to return user.
      // For now, let's assume valid login updates the store.
      
      await login(email, password);
      // We can't access 'user' state immediately here as updated reliable.
      // A common pattern is to let a higher order component redirect (like PublicOnlyRoute which works for /login access)
      // OR navigate cleanly.
      
      // Let's modify the login flow to be simpler:
      // Since PublicOnlyRoute will redirect authenticated users, and we are on /login (PublicOnly),
      // successfully setting the user will trigger PublicOnlyRoute to redirect us!
      // So we technically don't even need to navigate() manually if PublicOnlyRoute does its job.
      // Let's check PublicOnlyRoute logic again.
      // "if (isAuthenticated && user) { Redirect ... }"
      
      // So we can just navigate to '/' or let the route guard handle it. 
      // But to be explicit and faster UX:
      
      // We don't have the user object here easily without modifying AuthContext return type.
      // Let's rely on the router/AuthContext state change to drive the UI.
      // But manually navigating to '/' usually works as a fallback.
      navigate('/'); 
    } catch (err) {
      setError(err instanceof Error ? err.message : t.messages.loginError);
    }
  };

  return (
    <AuthLayout
      title={t.auth.welcomeBack}
      subtitle={t.auth.loginSubtitle}
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
          placeholder={language === 'id' ? 'Masukkan password' : 'Enter password'}
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

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">{t.auth.rememberMe}</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {t.auth.forgotPassword}
          </Link>
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {t.nav.login}
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">{t.common.or}</span>
          </div>
        </div>

        <p className="text-center text-sm text-gray-600">
          {t.auth.noAccount}{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-700">
            {t.nav.register}
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
