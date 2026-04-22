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
import { mockCourses, mockCategories } from '@/data/mockData';
import { formatCurrency, formatNumber, formatDuration, getCourseLevelLabel, getCourseTypeLabel } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';

export function CourseDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  const course = mockCourses.find((c) => c.slug === slug);

  if (!course) {
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

  const category = mockCategories.find((c) => c.id === course.categoryId);

  const toggleModule = (moduleId: string) => {
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

  // Mock syllabus if empty
  const syllabus = course.syllabus.length > 0 ? course.syllabus : [
    {
      id: 'm1',
      title: 'Pengenalan',
      order: 1,
      lessons: [
        { id: 'l1', title: 'Selamat Datang di Kursus', type: 'video' as const, duration: 5, order: 1, isFree: true },
        { id: 'l2', title: 'Apa yang Akan Dipelajari', type: 'video' as const, duration: 10, order: 2, isFree: true },
        { id: 'l3', title: 'Setup Environment', type: 'video' as const, duration: 15, order: 3, isFree: false },
      ],
    },
    {
      id: 'm2',
      title: 'Dasar-Dasar',
      order: 2,
      lessons: [
        { id: 'l4', title: 'Konsep Fundamental', type: 'video' as const, duration: 20, order: 1, isFree: false },
        { id: 'l5', title: 'Praktik Pertama', type: 'video' as const, duration: 25, order: 2, isFree: false },
        { id: 'l6', title: 'Quiz: Dasar-Dasar', type: 'quiz' as const, duration: 10, order: 3, isFree: false },
      ],
    },
    {
      id: 'm3',
      title: 'Intermediate',
      order: 3,
      lessons: [
        { id: 'l7', title: 'Fitur Lanjutan', type: 'video' as const, duration: 30, order: 1, isFree: false },
        { id: 'l8', title: 'Best Practices', type: 'video' as const, duration: 25, order: 2, isFree: false },
        { id: 'l9', title: 'Tugas Praktik', type: 'assignment' as const, duration: 60, order: 3, isFree: false },
      ],
    },
    {
      id: 'm4',
      title: 'Project Akhir',
      order: 4,
      lessons: [
        { id: 'l10', title: 'Panduan Project', type: 'video' as const, duration: 15, order: 1, isFree: false },
        { id: 'l11', title: 'Pengerjaan Project', type: 'assignment' as const, duration: 120, order: 2, isFree: false },
        { id: 'l12', title: 'Penutup & Sertifikat', type: 'video' as const, duration: 5, order: 3, isFree: false },
      ],
    },
  ];

  const totalLessons = syllabus.reduce((acc, mod) => acc + mod.lessons.length, 0);

  // Mock reviews
  const reviews = [
    {
      id: '1',
      user: { name: 'Ahmad Rizki', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad' },
      rating: 5,
      comment: 'Kursus yang sangat bagus! Penjelasannya detail dan mudah dipahami. Sangat recommended untuk pemula.',
      createdAt: '2024-06-15',
    },
    {
      id: '2',
      user: { name: 'Siti Nurhaliza', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti' },
      rating: 4,
      comment: 'Materi lengkap dan instrukturnya responsif dalam menjawab pertanyaan di forum.',
      createdAt: '2024-06-10',
    },
    {
      id: '3',
      user: { name: 'Budi Hartono', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiH' },
      rating: 5,
      comment: 'Project-project yang diberikan sangat membantu untuk memahami konsep. Worth the money!',
      createdAt: '2024-06-05',
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
                <Link to={`/courses?category=${category?.slug}`} className="hover:text-white">
                  {category?.name}
                </Link>
              </nav>

              <h1 className="text-3xl lg:text-4xl font-bold mb-4">{course.title}</h1>
              <p className="text-lg text-gray-300 mb-6">{course.shortDescription}</p>

              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Rating value={course.rating} size="md" />
                  <span className="text-yellow-400 font-medium">{course.rating}</span>
                  <span className="text-gray-400">({formatNumber(course.totalRatings)} ulasan)</span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {formatNumber(course.totalStudents)} siswa
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <Avatar src={course.instructor?.avatar} name={course.instructor?.name || ''} size="md" />
                <div>
                  <p className="text-sm text-gray-400">Dibuat oleh</p>
                  <p className="font-medium">{course.instructor?.name}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Diperbarui {new Date(course.updatedAt).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Bahasa Indonesia
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
              <h2 className="text-xl font-bold text-gray-900 mb-4">Yang Akan Anda Pelajari</h2>
              <div className="grid md:grid-cols-2 gap-3">
                {course.objectives.map((objective, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{objective}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Course Content */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Konten Kursus</h2>
                <span className="text-sm text-gray-500">
                  {syllabus.length} modul • {totalLessons} pelajaran • {formatDuration(course.totalDuration)}
                </span>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                {syllabus.map((module, index) => (
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
                        {module.lessons.length} pelajaran
                      </span>
                    </button>
                    {expandedModules.includes(module.id) && (
                      <div className="bg-gray-50 border-t border-gray-200">
                        {module.lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="flex items-center justify-between px-4 py-3 pl-12 border-b border-gray-100 last:border-0"
                          >
                            <div className="flex items-center gap-3">
                              {lesson.type === 'video' && <Video className="w-4 h-4 text-gray-400" />}
                              {lesson.type === 'quiz' && <FileText className="w-4 h-4 text-gray-400" />}
                              {lesson.type === 'assignment' && <BookOpen className="w-4 h-4 text-gray-400" />}
                              <span className="text-sm text-gray-700">{lesson.title}</span>
                              {lesson.isFree && (
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
            {course.prerequisites.length > 0 && (
              <Card>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Prasyarat</h2>
                <ul className="space-y-2">
                  {course.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2" />
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {/* Instructor */}
            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Instruktur</h2>
              <div className="flex items-start gap-4">
                <Avatar src={course.instructor?.avatar} name={course.instructor?.name || ''} size="xl" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{course.instructor?.name}</h3>
                  <p className="text-gray-500 mb-3">{course.instructor?.bio}</p>
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Rating value={course.instructor?.rating || 0} size="sm" />
                      {course.instructor?.rating} Rating
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {formatNumber(course.instructor?.totalStudents || 0)} Siswa
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4" />
                      {course.instructor?.courses?.length || 0} Kursus
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Reviews */}
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Ulasan Siswa</h2>
                <Button variant="outline" size="sm">Lihat Semua</Button>
              </div>

              <div className="flex items-center gap-8 mb-6 pb-6 border-b border-gray-200">
                <div className="text-center">
                  <div className="text-5xl font-bold text-gray-900">{course.rating}</div>
                  <Rating value={course.rating} size="lg" showValue={false} />
                  <div className="text-sm text-gray-500 mt-1">{formatNumber(course.totalRatings)} ulasan</div>
                </div>
                <div className="flex-1 space-y-2">
                  {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-3">{star}</span>
                      <Progress value={star === 5 ? 70 : star === 4 ? 20 : star === 3 ? 7 : 3} className="flex-1" size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <Avatar src={review.user.avatar} name={review.user.name} size="md" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-900">{review.user.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('id-ID')}
                          </span>
                        </div>
                        <Rating value={review.rating} size="sm" showValue={false} className="mb-2" />
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
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
                  <button aria-label="Play course preview" className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors group">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 text-gray-900 ml-1" />
                    </div>
                  </button>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {course.discountPrice ? (
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(course.discountPrice)}
                      </span>
                      <span className="text-lg text-gray-400 line-through">
                        {formatCurrency(course.price)}
                      </span>
                      <Badge variant="danger">
                        {Math.round((1 - course.discountPrice / course.price) * 100)}% OFF
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

                {/* Share & Wishlist */}
                <div className="flex items-center justify-center gap-4 mb-6 pb-6 border-b border-gray-200">
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <Heart className="w-5 h-5" />
                    <span className="text-sm">Wishlist</span>
                  </button>
                  <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                    <Share2 className="w-5 h-5" />
                    <span className="text-sm">Bagikan</span>
                  </button>
                </div>

                {/* Course Includes */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Kursus ini mencakup:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2 text-gray-600">
                      <Video className="w-4 h-4" />
                      {formatDuration(course.totalDuration)} video
                    </li>
                    <li className="flex items-center gap-2 text-gray-600">
                      <FileText className="w-4 h-4" />
                      {course.totalLessons} pelajaran
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
                    <span className="text-gray-900">{category?.name}</span>
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
