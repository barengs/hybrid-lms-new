import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  List,
  Clock,
  Users,
  X,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Button, Card, Badge, Rating, Avatar, Select } from '@/components/ui';
import { mockCourses, mockCategories } from '@/data/mockData';
import { formatCurrency, formatNumber, formatDuration, getCourseLevelLabel } from '@/lib/utils';

export function CourseCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedType = searchParams.get('type') || '';
  const sortBy = searchParams.get('sort') || 'popular';

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearchParams({});
  };

  const activeFiltersCount = [selectedCategory, selectedLevel, selectedType].filter(Boolean).length;

  // Filter and sort courses
  const filteredCourses = useMemo(() => {
    let courses = [...mockCourses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.instructor?.name.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory) {
      const category = mockCategories.find((c) => c.slug === selectedCategory);
      if (category) {
        courses = courses.filter((c) => c.categoryId === category.id);
      }
    }

    // Level filter
    if (selectedLevel) {
      courses = courses.filter((c) => c.level === selectedLevel);
    }

    // Type filter
    if (selectedType) {
      courses = courses.filter((c) => c.type === selectedType);
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        courses.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        courses.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
        break;
      case 'price-high':
        courses.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
        break;
      case 'rating':
        courses.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
      default:
        courses.sort((a, b) => b.totalStudents - a.totalStudents);
    }

    return courses;
  }, [searchQuery, selectedCategory, selectedLevel, selectedType, sortBy]);

  return (
    <MainLayout>
      <div className="bg-gradient-to-b from-blue-50 to-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Jelajahi Kursus
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Temukan kursus yang sesuai dengan minat dan tujuan karir Anda
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => updateFilter('search', e.target.value)}
                placeholder="Cari kursus, instruktur, atau topik..."
                className="w-full pl-12 pr-4 py-3.5 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            <button
              onClick={() => updateFilter('category', '')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                !selectedCategory
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Semua
            </button>
            {mockCategories.slice(0, 6).map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilter('category', category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon} {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600">
              <span className="font-semibold text-gray-900">{filteredCourses.length}</span> kursus
              ditemukan
            </p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <X className="w-4 h-4" />
                Hapus filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Button - Mobile */}
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filter
              {activeFiltersCount > 0 && (
                <Badge variant="primary" size="sm" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>

            {/* Sort */}
            <Select
              value={sortBy}
              onChange={(e) => updateFilter('sort', e.target.value)}
              options={[
                { value: 'popular', label: 'Paling Populer' },
                { value: 'newest', label: 'Terbaru' },
                { value: 'rating', label: 'Rating Tertinggi' },
                { value: 'price-low', label: 'Harga Terendah' },
                { value: 'price-high', label: 'Harga Tertinggi' },
              ]}
              className="w-44"
            />

            {/* View Mode */}
            <div className="hidden sm:flex items-center border border-gray-200 rounded-lg p-1">
              <button
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${
                  viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                aria-label="List view"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded ${
                  viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Level Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tingkat Kesulitan</h3>
                <div className="space-y-2">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level}
                        onChange={() => updateFilter('level', selectedLevel === level ? '' : level)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{getCourseLevelLabel(level)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Type Filter */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Tipe Kursus</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === 'self-paced'}
                      onChange={() => updateFilter('type', selectedType === 'self-paced' ? '' : 'self-paced')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Belajar Mandiri</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="type"
                      checked={selectedType === 'structured'}
                      onChange={() => updateFilter('type', selectedType === 'structured' ? '' : 'structured')}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-sm text-gray-700">Kelas Terstruktur</span>
                  </label>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Kategori</h3>
                <div className="space-y-2">
                  {mockCategories.map((category) => (
                    <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === category.slug}
                        onChange={() => updateFilter('category', selectedCategory === category.slug ? '' : category.slug)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">{category.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{category.coursesCount}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tidak ada kursus ditemukan</h3>
                <p className="text-gray-600 mb-4">
                  Coba ubah filter atau kata kunci pencarian Anda
                </p>
                <Button variant="outline" onClick={clearFilters}>
                  Hapus semua filter
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map((course) => (
                  <Link key={course.id} to={`/course/${course.slug}`}>
                    <Card padding="none" hover className="overflow-hidden h-full">
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant={course.type === 'self-paced' ? 'primary' : 'secondary'}>
                            {course.type === 'self-paced' ? 'Mandiri' : 'Kelas'}
                          </Badge>
                          <Badge>{getCourseLevelLabel(course.level)}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar src={course.instructor?.avatar} name={course.instructor?.name || ''} size="xs" />
                          <span className="text-xs text-gray-500">{course.instructor?.name}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatDuration(course.totalDuration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {formatNumber(course.totalStudents)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Rating value={course.rating} size="sm" showCount count={course.totalRatings} />
                          <div>
                            {course.discountPrice ? (
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(course.discountPrice)}
                                </div>
                                <div className="text-xs text-gray-400 line-through">
                                  {formatCurrency(course.price)}
                                </div>
                              </div>
                            ) : (
                              <div className="font-bold text-gray-900">
                                {formatCurrency(course.price)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCourses.map((course) => (
                  <Link key={course.id} to={`/course/${course.slug}`}>
                    <Card hover className="flex gap-6">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-60 h-36 object-cover rounded-lg flex-shrink-0"
                      />
                      <div className="flex-1 py-2">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={course.type === 'self-paced' ? 'primary' : 'secondary'} size="sm">
                            {course.type === 'self-paced' ? 'Mandiri' : 'Kelas'}
                          </Badge>
                          <Badge size="sm">{getCourseLevelLabel(course.level)}</Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">{course.shortDescription}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Avatar src={course.instructor?.avatar} name={course.instructor?.name || ''} size="xs" />
                          <span>{course.instructor?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Rating value={course.rating} size="sm" showCount count={course.totalRatings} />
                            <span className="text-sm text-gray-500">
                              {formatDuration(course.totalDuration)} • {course.totalLessons} pelajaran
                            </span>
                          </div>
                          <div className="text-right">
                            {course.discountPrice ? (
                              <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">
                                  {formatCurrency(course.discountPrice)}
                                </span>
                                <span className="text-sm text-gray-400 line-through">
                                  {formatCurrency(course.price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
