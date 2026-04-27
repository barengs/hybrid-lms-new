import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button, Input, Card, Avatar } from '@/components/ui';
import { Lock, LogOut, ArrowRight, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export function LockScreen() {
  const { user, unlock, logout, isLocked } = useAuth();
  const { language } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isLocked || !user) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setIsLoading(true);
    setError('');
    
    try {
      await unlock(password);
    } catch (err: any) {
      setError(
        language === 'id' 
          ? 'Kata sandi salah. Silakan coba lagi.' 
          : 'Incorrect password. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/90 backdrop-blur-md">
      <Card className="w-full max-w-md p-8 animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-6">
            <Avatar 
              src={user.avatar} 
              name={user.name} 
              size="xl" 
              className="ring-4 ring-blue-500/30"
            />
            <div className="absolute -bottom-1 -right-1 p-2 bg-blue-600 rounded-full border-2 border-white dark:border-gray-800">
              <Lock className="w-4 h-4 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {language === 'id' ? 'Layar Terkunci' : 'Screen Locked'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {language === 'id' 
              ? `Sesi ${user.name} sedang istirahat. Masukkan kata sandi untuk melanjutkan.` 
              : `${user.name}'s session is resting. Enter password to continue.`}
          </p>

          <form onSubmit={handleUnlock} className="w-full space-y-4">
            <div className="relative">
              <Input
                type="password"
                placeholder={language === 'id' ? 'Masukkan kata sandi...' : 'Enter password...'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={error}
                autoFocus
                className="pr-12"
              />
              <button
                type="submit"
                disabled={isLoading || !password.trim()}
                className="absolute right-3 top-2.5 p-1.5 text-blue-600 hover:text-blue-700 disabled:text-gray-300 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>

            <div className="flex flex-col gap-3">
              <Button 
                type="submit" 
                className="w-full"
                isLoading={isLoading}
              >
                {language === 'id' ? 'Buka Kunci' : 'Unlock'}
              </Button>
              
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {language === 'id' ? 'Keluar Akun' : 'Sign Out'}
              </button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
}
