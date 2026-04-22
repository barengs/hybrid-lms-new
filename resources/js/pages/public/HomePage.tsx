import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Users,
  BookOpen,
  Award,
  Play,
  Star,
  CheckCircle,
  Trophy,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Button, Card, Badge, Rating, Avatar } from '@/components/ui';
import { mockCourses, mockCategories } from '@/data/mockData';
import { formatCurrency, formatNumber } from '@/lib/utils';

function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <Badge variant="warning" className="mb-4">
              <Trophy className="w-3.5 h-3.5 mr-1" />
              Platform Pembelajaran #1 di Indonesia
            </Badge>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight mb-6">
              Belajar Tanpa Batas,{' '}
              <span className="text-yellow-400">Raih Masa Depan</span>
            </h1>
            <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-lg">
              Akses ribuan kursus berkualitas dari instruktur terbaik. Metode hybrid learning yang
              fleksibel untuk karir yang lebih baik.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/courses">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  Jelajahi Kursus
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/register">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Daftar Gratis
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8 mt-12">
              <div>
                <div className="text-3xl font-bold">50,000+</div>
                <div className="text-blue-200">Siswa Aktif</div>
              </div>
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-blue-200">Kursus</div>
              </div>
              <div>
                <div className="text-3xl font-bold">100+</div>
                <div className="text-blue-200">Instruktur</div>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="hidden lg:block relative">
            <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=400&fit=crop"
                alt="Students learning"
                className="rounded-xl shadow-2xl"
              />
              {/* Floating cards */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">Kursus Selesai!</div>
                    <div className="text-xs text-gray-500">React Masterclass</div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 bottom-1/4 bg-white rounded-xl p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Award className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">+250 Poin</div>
                    <div className="text-xs text-gray-500">Lencana Diraih</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const featuredCategories = mockCategories.slice(0, 8);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Kategori Populer</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Temukan berbagai kategori kursus sesuai minat dan kebutuhan karir Anda
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featuredCategories.map((category) => (
            <Link
              key={category.id}
              to={`/courses?category=${category.slug}`}
              className="group"
            >
              <Card hover className="text-center py-6">
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{category.coursesCount} kursus</p>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedCoursesSection() {
  const featuredCourses = mockCourses.filter((c) => c.isFeatured).slice(0, 4);

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Kursus Unggulan</h2>
            <p className="text-gray-600">Kursus terbaik yang dipilih oleh tim kami</p>
          </div>
          <Link to="/courses">
            <Button variant="outline">
              Lihat Semua
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredCourses.map((course) => (
            <Link key={course.id} to={`/course/${course.slug}`}>
              <Card padding="none" hover className="overflow-hidden h-full">
                <div className="relative">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge variant={course.type === 'self-paced' ? 'primary' : 'secondary'}>
                      {course.type === 'self-paced' ? 'Mandiri' : 'Kelas'}
                    </Badge>
                  </div>
                  <button aria-label="Preview course" className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors">
                    <Play className="w-4 h-4 text-gray-700" />
                  </button>
                </div>
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar src={course.instructor?.avatar} name={course.instructor?.name || ''} size="xs" />
                    <span className="text-xs text-gray-500">{course.instructor?.name}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <Rating value={course.rating} size="sm" />
                    <span className="text-xs text-gray-500">({formatNumber(course.totalRatings)})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      {course.discountPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">
                            {formatCurrency(course.discountPrice)}
                          </span>
                          <span className="text-sm text-gray-400 line-through">
                            {formatCurrency(course.price)}
                          </span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-900">
                          {formatCurrency(course.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: 'Kursus Berkualitas',
      description: 'Materi pembelajaran disusun oleh instruktur berpengalaman dengan standar industri.',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Pembelajaran Hybrid',
      description: 'Pilih belajar mandiri atau kelas terstruktur dengan bimbingan instruktur.',
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: 'Sertifikat Resmi',
      description: 'Dapatkan sertifikat digital yang diakui industri setelah menyelesaikan kursus.',
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: 'Gamifikasi',
      description: 'Kumpulkan poin, raih lencana, dan bersaing di leaderboard untuk motivasi belajar.',
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Mengapa Memilih MOLANG?</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Platform pembelajaran yang dirancang untuk membantu Anda mencapai tujuan karir
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Andi Pratama',
      role: 'Frontend Developer di Tokopedia',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Andi',
      content: 'Berkat MOLANG, saya berhasil mendapatkan pekerjaan impian sebagai developer. Materinya sangat relevan dengan kebutuhan industri.',
      rating: 5,
    },
    {
      name: 'Sari Dewi',
      role: 'Data Analyst di Gojek',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sari',
      content: 'Kursus data science di sini sangat lengkap. Dari dasar Python sampai machine learning, semuanya dijelaskan dengan baik.',
      rating: 5,
    },
    {
      name: 'Budi Santoso',
      role: 'UI/UX Designer Freelancer',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiS',
      content: 'Fleksibilitas belajar mandiri sangat membantu saya yang bekerja sambil kuliah. Sertifikatnya juga diakui klien.',
      rating: 5,
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Apa Kata Mereka?</h2>
          <p className="text-gray-600">Cerita sukses dari alumni MOLANG</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="relative">
              <div className="absolute -top-4 left-6 text-6xl text-blue-100">"</div>
              <div className="relative">
                <div className="flex items-center gap-1 mb-4">
                  {Array(testimonial.rating).fill(0).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <Avatar src={testimonial.avatar} name={testimonial.name} size="md" />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Siap Memulai Perjalanan Belajar Anda?
        </h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Bergabung dengan 50,000+ siswa yang sudah membuktikan kualitas pembelajaran di MOLANG.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Daftar Sekarang — Gratis
            </Button>
          </Link>
          <Link to="/courses">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Lihat Kursus
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function InstructorCTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-green-600 to-teal-700 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-6">
          <Users className="w-16 h-16 mx-auto text-green-200" />
        </div>
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Bagikan Ilmu Anda, Wujudkan Perubahan!
        </h2>
        <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
          Jadilah bagian dari komunitas instruktur MOLANG. Bantu ribuan siswa mencapai tujuan karir mereka dan dapatkan penghasilan dari keahlian Anda.
        </p>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-green-200" />
            <h3 className="font-semibold mb-1">Fleksibilitas Penuh</h3>
            <p className="text-sm text-green-100">Buat kursus sesuai jadwal Anda</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Award className="w-8 h-8 mx-auto mb-2 text-green-200" />
            <h3 className="font-semibold mb-1">Penghasilan Pasif</h3>
            <p className="text-sm text-green-100">Dapatkan royalti dari setiap kursus</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-green-200" />
            <h3 className="font-semibold mb-1">Jangkauan Luas</h3>
            <p className="text-sm text-green-100">Akses ke 50,000+ siswa aktif</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/instructor/register">
            <Button
              size="lg"
              className="bg-white text-green-600 hover:bg-gray-100"
            >
              Daftar Sebagai Instruktur
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <a href="#instructor-info" className="inline-block">
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Pelajari Lebih Lanjut
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}



export function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedCoursesSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
      <InstructorCTASection />
    </MainLayout>
  );
}
