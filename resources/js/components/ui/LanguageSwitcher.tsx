import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'icon' | 'full' | 'dropdown';
  className?: string;
}

export function LanguageSwitcher({ variant = 'full', className }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  if (variant === 'icon') {
    return (
      <button
        onClick={() => setLanguage(language === 'id' ? 'en' : 'id')}
        className={cn(
          'p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-1',
          className
        )}
        title={language === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
      >
        <Globe className="w-5 h-5 text-gray-600" />
        <span className="text-xs font-medium text-gray-600 uppercase">{language}</span>
      </button>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className={cn('relative inline-block', className)}>
        <select
          aria-label="Select language"
          value={language}
          onChange={(e) => setLanguage(e.target.value as 'id' | 'en')}
          className="appearance-none bg-transparent border border-gray-300 rounded-lg px-3 py-1.5 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="id">🇮🇩 Indonesia</option>
          <option value="en">🇬🇧 English</option>
        </select>
        <Globe className="w-4 h-4 text-gray-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }

  // Full variant - toggle buttons
  return (
    <div className={cn('flex items-center gap-1 bg-gray-100 rounded-lg p-1', className)}>
      <button
        onClick={() => setLanguage('id')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          language === 'id'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        🇮🇩 ID
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={cn(
          'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
          language === 'en'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        )}
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
