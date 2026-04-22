import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Grid, List, Play, Clock, Award, Filter } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Badge, Progress, Button, Select } from '@/components/ui';
import { mockCourses } from '@/data/mockData';
import { formatDuration, getCourseLevelLabel } from '@/lib/utils';

export function MyCoursesPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock enrolled courses with progress
  const enrolledCourses = mockCourses.map((course, index) => ({
    ...course,
    progress: [100, 65, 30, 10, 0, 80][index % 6],
    lastAccessed: new Date(Date.now() - index * 86400000 * 2).toISOString(),
    completedAt: index === 0 ? new Date(Date.now() - 604800000).toISOString() : undefined,
  }));

  const filteredCourses = enrolledCourses.filter((course) => {
    if (searchQuery && !course.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    switch (filter) {
      case 'in-progress':
        return course.progress > 0 && course.progress < 100;
      case 'completed':
        return course.progress === 100;
      case 'not-started':
        return course.progress === 0;
      default:
        return true;
    }
  });

  const stats = {
    total: enrolledCourses.length,
    inProgress: enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100).length,
    completed: enrolledCourses.filter((c) => c.progress === 100).length,
    notStarted: enrolledCourses.filter((c) => c.progress === 0).length,
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Kursus Saya</h1>
        <p className="text-gray-600">
          Kelola dan lanjutkan kursus yang sedang Anda ikuti
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={() => setFilter('all')}
          className={`p-4 rounded-xl border-2 transition-colors text-left ${
            filter === 'all'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Semua Kursus</p>
        </button>
        <button
          onClick={() => setFilter('in-progress')}
          className={`p-4 rounded-xl border-2 transition-colors text-left ${
            filter === 'in-progress'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
          <p className="text-sm text-gray-500">Sedang Berjalan</p>
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`p-4 rounded-xl border-2 transition-colors text-left ${
            filter === 'completed'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          <p className="text-sm text-gray-500">Selesai</p>
        </button>
        <button
          onClick={() => setFilter('not-started')}
          className={`p-4 rounded-xl border-2 transition-colors text-left ${
            filter === 'not-started'
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <p className="text-2xl font-bold text-gray-400">{stats.notStarted}</p>
          <p className="text-sm text-gray-500">Belum Dimulai</p>
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kursus..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: 'all', label: 'Semua Kursus' },
              { value: 'in-progress', label: 'Sedang Berjalan' },
              { value: 'completed', label: 'Selesai' },
              { value: 'not-started', label: 'Belum Dimulai' },
            ]}
            className="w-44"
          />

          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${
                viewMode === 'grid' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${
                viewMode === 'list' ? 'bg-gray-100 text-blue-600' : 'text-gray-400'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <Card className="text-center py-12">
          <Filter className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Tidak ada kursus ditemukan
          </h3>
          <p className="text-gray-500 mb-4">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <Link to="/courses">
            <Button>Jelajahi Kursus</Button>
          </Link>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <Card key={course.id} padding="none" className="overflow-hidden">
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-40 object-cover"
                />
                {course.progress === 100 && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="success">
                      <Award className="w-3 h-3 mr-1" />
                      Selesai
                    </Badge>
                  </div>
                )}
                <Link
                  to={`/learn/${course.slug}`}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-900 ml-1" />
                  </div>
                </Link>
              </div>
              <div className="p-4">
                <Badge size="sm" className="mb-2">
                  {getCourseLevelLabel(course.level)}
                </Badge>
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{course.instructor?.name}</p>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progres</span>
                    <span className="font-medium text-gray-900">{course.progress}%</span>
                  </div>
                  <Progress
                    value={course.progress}
                    color={course.progress === 100 ? 'green' : 'blue'}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {formatDuration(course.totalDuration)}
                  </span>
                  <Link to={`/learn/${course.slug}`}>
                    <Button size="sm">
                      {course.progress === 0
                        ? 'Mulai'
                        : course.progress === 100
                        ? 'Ulang'
                        : 'Lanjutkan'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="flex gap-6">
              <div className="relative w-48 flex-shrink-0">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-28 object-cover rounded-lg"
                />
                {course.progress === 100 && (
                  <div className="absolute top-2 left-2">
                    <Badge variant="success" size="sm">
                      <Award className="w-3 h-3 mr-1" />
                      Selesai
                    </Badge>
                  </div>
                )}
              </div>
              <div className="flex-1 py-1">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge size="sm" className="mb-1">
                      {getCourseLevelLabel(course.level)}
                    </Badge>
                    <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-500">{course.instructor?.name}</p>
                  </div>
                  <Link to={`/learn/${course.slug}`}>
                    <Button size="sm">
                      {course.progress === 0
                        ? 'Mulai'
                        : course.progress === 100
                        ? 'Ulang'
                        : 'Lanjutkan'}
                    </Button>
                  </Link>
                </div>
                <div className="mt-3">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-sm text-gray-500">
                      {formatDuration(course.totalDuration)} • {course.totalLessons} pelajaran
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {course.progress}% selesai
                    </span>
                  </div>
                  <Progress
                    value={course.progress}
                    color={course.progress === 100 ? 'green' : 'blue'}
                    size="sm"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
