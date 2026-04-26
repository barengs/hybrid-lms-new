import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  Grid,
  Clock,
  Users,
  X,
  BookOpen,
} from 'lucide-react';
import { MainLayout } from '@/components/layouts';
import { Button, Card, Badge, Rating, Avatar, Select } from '@/components/ui';
import { formatCurrency, formatNumber, formatDuration, getCourseLevelLabel } from '@/lib/utils';
import { useGetPublicCoursesQuery, useGetPublicCategoriesQuery } from '@/store/features/public/publicApiSlice';

export function CourseCatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Filter states from URL
  const searchQuery = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || '';
  const selectedLevel = searchParams.get('level') || '';
  const selectedType = searchParams.get('type') || '';
  const sortBy = searchParams.get('sort') || 'latest';

  const { data: coursesData, isLoading: isCoursesLoading } = useGetPublicCoursesQuery({
    search: searchQuery,
    category: selectedCategory,
    batch_id: searchParams.get('batch_id') || '',
    level: selectedLevel,
    type: selectedType,
    sort: sortBy,
  });

  const { data: categories = [], isLoading: isCategoriesLoading } = useGetPublicCategoriesQuery();

  // If the API returns a paginated response, we need to extract the data array
  const courses = Array.isArray(coursesData) ? coursesData : (coursesData as any)?.data || [];

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
                defaultValue={searchQuery}
                onBlur={(e) => updateFilter('search', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && updateFilter('search', (e.target as HTMLInputElement).value)}
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
            {categories.slice(0, 8).map((category) => (
              <button
                key={category.id}
                onClick={() => updateFilter('category', category.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.slug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {category.icon || '📚'} {category.name}
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
              <span className="font-semibold text-gray-900">{courses.length}</span> kursus
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
                { value: 'popularity', label: 'Paling Populer' },
                { value: 'latest', label: 'Terbaru' },
                { value: 'rating', label: 'Rating Tertinggi' },
                { value: 'price_low', label: 'Harga Terendah' },
                { value: 'price_high', label: 'Harga Tertinggi' },
              ]}
              className="w-44"
            />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
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
                      checked={selectedType === 'self_paced'}
                      onChange={() => updateFilter('type', selectedType === 'self_paced' ? '' : 'self_paced')}
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
            </div>
          </aside>

          {/* Course Grid */}
          <div className="flex-1">
            {isCoursesLoading ? (
               <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="h-64 animate-pulse bg-gray-100">
                      <div className="h-full w-full" />
                    </Card>
                  ))}
               </div>
            ) : courses.length === 0 ? (
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
            ) : (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map((course: any) => (
                  <Link key={course.id} to={`/course/${course.slug}`}>
                    <Card padding="none" hover className="overflow-hidden h-full">
                      <div className="relative">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-44 object-cover"
                        />
                        <div className="absolute top-3 left-3 flex gap-2">
                          <Badge variant={course.type === 'self_paced' ? 'primary' : 'secondary'}>
                            {course.type === 'self_paced' ? 'Mandiri' : 'Kelas'}
                          </Badge>
                          <Badge>{getCourseLevelLabel(course.level)}</Badge>
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar src={course.instructor?.avatar || undefined} name={course.instructor?.name || ''} size="xs" />
                          <span className="text-xs text-gray-500">{course.instructor?.name}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{course.title}</h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {course.duration ? formatDuration(course.duration) : 'N/A'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" />
                            {formatNumber(course.total_students || 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Rating value={course.average_rating} size="sm" showCount count={course.total_reviews} />
                          <div>
                            {course.discount_price ? (
                              <div className="text-right">
                                <div className="font-bold text-gray-900">
                                  {formatCurrency(course.discount_price)}
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
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
