import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  Eye,
  EyeOff,
  Users,
  Award,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Button, Card } from '@/components/ui';

export function InstructorRegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    expertise: '',
    experience: '',
    portfolio: '',
    motivation: '',
    photo: null as File | null,
  });

  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validate passwords
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password') {
        if (value.length < 8) {
          setErrors(prev => ({ ...prev, password: 'Password minimal 8 karakter' }));
        } else {
          setErrors(prev => ({ ...prev, password: '' }));
        }
      }

      if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
        const pwd = name === 'password' ? value : formData.password;
        const confirmPwd = name === 'confirmPassword' ? value : formData.confirmPassword;

        if (confirmPwd && pwd !== confirmPwd) {
          setErrors(prev => ({ ...prev, confirmPassword: 'Password tidak cocok' }));
        } else {
          setErrors(prev => ({ ...prev, confirmPassword: '' }));
        }
      }
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('File harus berupa gambar');
        return;
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Ukuran file maksimal 2MB');
        return;
      }

      setFormData({ ...formData, photo: file });

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    if (formData.password.length < 8) {
      setErrors(prev => ({ ...prev, password: 'Password minimal 8 karakter' }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Password tidak cocok' }));
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Instructor registration:', formData);
    alert('Terima kasih! Pendaftaran Anda telah kami terima. Tim kami akan menghubungi Anda segera melalui email.');

    navigate('/');
    setIsSubmitting(false);
  };

  const benefits = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Fleksibilitas Penuh',
      description: 'Buat dan kelola kursus sesuai jadwal Anda sendiri',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Penghasilan Pasif',
      description: 'Dapatkan royalti dari setiap penjualan kursus Anda',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Jangkauan Luas',
      description: 'Akses ke 50,000+ siswa aktif di platform',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-teal-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>

          <div className="max-w-3xl">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4">
              Daftar Sebagai Instruktur
            </h1>
            <p className="text-lg text-green-100">
              Bagikan keahlian Anda dengan ribuan siswa dan dapatkan penghasilan dari ilmu yang Anda miliki.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sidebar - Benefits */}
            <div className="lg:col-span-1">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Mengapa Bergabung?
                </h2>
                <div className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center text-green-600 dark:text-green-400">
                        {benefit.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                          {benefit.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {benefit.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Syarat & Ketentuan:
                  </h3>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Minimal pengalaman 1 tahun di bidangnya</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Mampu membuat materi pembelajaran berkualitas</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Bersedia memberikan support kepada siswa</span>
                    </li>
                  </ul>
                </div>
              </Card>
            </div>

            {/* Form */}
            <div className="lg:col-span-2">
              <Card>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Formulir Pendaftaran
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Photo Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Foto Profil <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                        {photoPreview ? (
                          <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Users className="w-12 h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <input
                          type="file"
                          id="photo"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                          required
                        />
                        <label
                          htmlFor="photo"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Foto
                        </label>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          JPG, PNG atau GIF. Maksimal 2MB.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Nama Lengkap <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Masukkan nama lengkap"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Minimal 8 karakter"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.password && (
                        <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Konfirmasi Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Ulangi password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Nomor Telepon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="08123456789"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Expertise */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bidang Keahlian <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="expertise"
                        value={formData.expertise}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Pilih bidang keahlian</option>
                        <option value="programming">Pemrograman & Pengembangan</option>
                        <option value="design">Desain & Kreativitas</option>
                        <option value="business">Bisnis & Marketing</option>
                        <option value="data">Data Science & AI</option>
                        <option value="language">Bahasa & Komunikasi</option>
                        <option value="other">Lainnya</option>
                      </select>
                    </div>

                    {/* Experience */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Pengalaman Mengajar/Bekerja <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="">Pilih pengalaman</option>
                        <option value="<1">Kurang dari 1 tahun</option>
                        <option value="1-3">1-3 tahun</option>
                        <option value="3-5">3-5 tahun</option>
                        <option value="5+">Lebih dari 5 tahun</option>
                      </select>
                    </div>
                  </div>

                  {/* Portfolio */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Portfolio / LinkedIn / Website
                    </label>
                    <input
                      type="url"
                      name="portfolio"
                      value={formData.portfolio}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="https://example.com"
                    />
                  </div>

                  {/* Motivation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Mengapa Anda ingin menjadi instruktur? <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleInputChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                      placeholder="Ceritakan motivasi Anda untuk menjadi instruktur di MOLANG..."
                    />
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex gap-3 pt-4">
                    <Link to="/" className="flex-1">
                      <button
                        type="button"
                        className="w-full px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        Batal
                      </button>
                    </Link>
                    <button
                      type="submit"
                      disabled={isSubmitting || !!errors.password || !!errors.confirmPassword}
                      className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isSubmitting ? 'Mengirim Pendaftaran...' : 'Kirim Pendaftaran'}
                    </button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
