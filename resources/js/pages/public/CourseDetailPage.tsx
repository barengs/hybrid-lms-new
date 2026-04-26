import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Play,
  Clock,
  Users,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  Check,
  ShoppingCart,
  Heart,
  Share2,
  Globe,
  Calendar,
  Video,
  BookOpen,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Button, Card, Badge, Rating, Avatar, Progress } from '@/components/ui';
import { formatCurrency, formatNumber, formatDuration, getCourseLevelLabel, getCourseTypeLabel } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useGetPublicCourseDetailQuery } from '@/store/features/public/publicApiSlice';

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [expandedModules, setExpandedModules] = useState<number[]>([]);

  const { data: course, isLoading, isError } = useGetPublicCourseDetailQuery(slug || '');

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (isError || !course) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Kursus tidak ditemukan</h1>
          <Link to="/courses">
            <Button>Kembali ke Katalog</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  const toggleModule = (moduleId: number) => {
    setExpandedModules((prev) =>
      prev.includes(moduleId) ? prev.filter((id) => id !== moduleId) : [...prev, moduleId]
    );
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(course);
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    addToCart(course);
    navigate('/cart');
  };

  const syllabus = course.sections || [];
  const totalLessons = course.total_lessons || 0;

  // Mock reviews if not in API
  const reviews = [
    {
      id: '1',
      user: { name: 'Ahmad Rizki', avatar: undefined },
      rating: 5,
      comment: 'Kursus yang sangat bagus! Penjelasannya detail dan mudah dipahami. Sangat recommended untuk pemula.',
      createdAt: '2024-06-15',
    },
  ];

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link to="/courses" className="hover:text-white">Kursus</Link>
                <span>/</span>
                <Link to={`/courses?category=${course.category?.slug}`} className="hover:text-white">
                  {course.category?.name}
                </Link>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.subtitle || course.description?.substring(0, 160) + '...'}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Rating value={course.average_rating} size="md" />
                  <span className="text-yellow-400 font-medium">{course.average_rating || 0}</span>
                  <span className="text-gray-400">({formatNumber(course.total_reviews || 0)} ulasan)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(course.total_enrollments || 0)} siswa
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar src={course.instructor?.avatar || undefined} name={course.instructor?.name || ''} size="md" />
                <div>
                  <p className="text-sm text-gray-400">Dibuat oleh</p>
                  <p className="font-medium">{course.instructor?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Diperbarui {new Date(course.updated_at).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  {course.language || 'Bahasa Indonesia'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What You'll Learn */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Deskripsi Kursus</h2>
              <div className="prose max-w-none text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: course.description }}></div>
              
              {course.outcomes && (
                <>
                  <h3 className="font-bold text-gray-900 mb-4">Yang Akan Anda Pelajari</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {course.outcomes.split('\n').map((outcome: string, index: number) => (
                      <div key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>

            {/* Course Content */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Konten Kursus</h2>
                <span className="text-sm text-gray-500">
                  {syllabus.length} modul • {totalLessons} pelajaran • {formatDuration(course.total_duration || 0)}
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {syllabus.map((module: any, index: number) => (
                  <div key={module.id} className={index > 0 ? 'border-t border-gray-200' : ''}>
                    <button
                      onClick={() => toggleModule(module.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {expandedModules.includes(module.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium text-gray-900">{module.title}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {module.lessons?.length || 0} pelajaran
                      </span>
                    </button>
                    {expandedModules.includes(module.id) && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        {module.lessons?.map((lesson: any) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 pl-12 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                              {lesson.type === 'quiz' && <FileText className="w-4 h-4 text-gray-400" />}
                              {lesson.type === 'assignment' && <BookOpen className="w-4 h-4 text-gray-400" />}
                              <span className="text-sm text-gray-700">{lesson.title}</span>
                              {lesson.is_free && (
                                <Badge variant="success" size="sm">Gratis</Badge>
                              )}
                            </div>
                            <span className="text-xs text-gray-500">{lesson.duration} menit</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>

            {/* Prerequisites */}
            {course.requirements && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prasyarat</h2>
                <ul className="space-y-2">
                  {course.requirements.split('\n').map((req: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                      <span className="text-gray-700">{req}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Instructor */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instruktur</h2>
              <div className="flex items-start gap-4">
                <Avatar src={course.instructor?.avatar || undefined} name={course.instructor?.name || ''} size="xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.instructor?.name}</h3>
                  <p className="text-gray-500 mb-3">{course.instructor?.profile?.headline || 'Expert Instructor'}</p>
                  <p className="text-sm text-gray-700 mb-4">{course.instructor?.profile?.bio || 'No bio available.'}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card className="overflow-hidden">
                {/* Course Preview */}
                <div className="relative -mx-4 -mt-4 mb-4">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                  {course.preview_video && (
                    <button aria-label="Play course preview" className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-gray-900 ml-1" />
                      </div>
                    </button>
                  )}
                </div>

                {/* Price */}
                <div className="mb-4">
                  {course.discount_price ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(course.discount_price)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatCurrency(course.price)}
                      </span>
                      <Badge variant="danger">
                        {Math.round((1 - course.discount_price / course.price) * 100)}% OFF
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">
                      {formatCurrency(course.price)}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="space-y-3 mb-6">
                  {isInCart(course.id) ? (
                    <Link to="/cart" className="block">
                      <Button className="w-full" variant="outline">
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Lihat Keranjang
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button className="w-full" onClick={handleBuyNow}>
                        Beli Sekarang
                      </Button>
                      <Button variant="outline" className="w-full" onClick={handleAddToCart}>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Tambah ke Keranjang
                      </Button>
                    </>
                  )}
                </div>

                {/* Course Includes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Kursus ini mencakup:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-600">
                      <Video className="w-4 h-4" />
                      {formatDuration(course.total_duration || 0)} video
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      {course.total_lessons || 0} pelajaran
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      Akses selamanya
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <Award className="w-4 h-4" />
                      Sertifikat kelulusan
                    </li>
                  </ul>
                </div>

                {/* Course Info */}
                <div className="mt-6 pt-6 border-t border-gray-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tingkat</span>
                    <span className="text-gray-900">{getCourseLevelLabel(course.level)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tipe</span>
                    <span className="text-gray-900">{getCourseTypeLabel(course.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Kategori</span>
                    <span className="text-gray-900">{course.category?.name}</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
