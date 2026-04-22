import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">MOLANG</span>
          </Link>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
          </div>

          {/* Form Content */}
          <div className="bg-white py-8 px-4 shadow-xl rounded-2xl sm:px-10 border border-gray-100">
            {children}
          </div>
        </div>
      </div>

      {/* Right Side - Image/Illustration */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden justify-center items-center">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center items-center px-12 text-white">
          <div className="max-w-md text-center">
            <h2 className="text-3xl font-bold mb-4">
              Belajar Kapan Saja, Di Mana Saja
            </h2>
            <p className="text-blue-100 text-lg">
              Akses ribuan kursus berkualitas dari instruktur terbaik. Tingkatkan kemampuan
              Anda dengan metode pembelajaran hybrid yang fleksibel.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div>
                <div className="text-4xl font-bold">50K+</div>
                <div className="text-sm text-blue-200">Siswa Aktif</div>
              </div>
              <div>
                <div className="text-4xl font-bold">500+</div>
                <div className="text-sm text-blue-200">Kursus</div>
              </div>
              <div>
                <div className="text-4xl font-bold">100+</div>
                <div className="text-sm text-blue-200">Instruktur</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
