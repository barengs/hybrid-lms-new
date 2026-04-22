import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  Search,
  Plus,
  BookOpen,
  Award,
  Bell,
  Video,
  FileText,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Input, Modal, Select } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { formatDate, getTimeAgo } from '@/lib/utils';

import { useGetClassesQuery } from '@/store/features/classes/classesApiSlice';
import { Loader2 } from 'lucide-react';


export function MyClassesPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'ongoing' | 'completed'>('all');
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinClass = async () => {
    if (!classCode.trim()) return;

    setIsJoining(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log('Joining class with code:', classCode);
    alert('Berhasil bergabung ke kelas!');
    setClassCode('');
    setShowJoinModal(false);
    setIsJoining(false);
  };

  const { data: classesData, isLoading, isError } = useGetClassesQuery();
  const classes = classesData?.data || [];

  // Filter classes
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch = cls.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.instructor.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || cls.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: classes.length,
    ongoing: classes.filter((c) => c.status === 'ongoing').length,
    completed: classes.filter((c) => c.status === 'completed').length,
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <p className="text-red-500 font-medium mb-2">Error loading classes</p>
          <Button size="sm" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {language === 'id' ? 'Kelas Saya' : 'My Classes'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {language === 'id'
                ? 'Kelola dan ikuti kelas yang Anda daftar'
                : 'Manage and attend your enrolled classes'}
            </p>
          </div>
          <Button size="sm" onClick={() => setShowJoinModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {language === 'id' ? 'Gabung Kelas' : 'Join Class'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Total Kelas' : 'Total Classes'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.ongoing}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Sedang Berjalan' : 'Ongoing'}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.completed}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {language === 'id' ? 'Selesai' : 'Completed'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Input */}
          <div className="flex-1">
            <Input
              inputSize="sm"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'id' ? 'Cari kelas...' : 'Search classes...'}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Status Filter */}
          <div className="w-full sm:w-56">
            <Select
              selectSize="sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'ongoing' | 'completed')}
              options={[
                { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                { value: 'ongoing', label: language === 'id' ? 'Sedang Berjalan' : 'Ongoing' },
                { value: 'completed', label: language === 'id' ? 'Selesai' : 'Completed' },
              ]}
            />
          </div>
        </div>
      </Card>

      {/* Classes List */}
      <div className="grid gap-4">
        {filteredClasses.length === 0 ? (
          <Card className="text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {language === 'id' ? 'Tidak ada kelas' : 'No classes found'}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              {language === 'id'
                ? 'Anda belum terdaftar di kelas manapun'
                : 'You are not enrolled in any classes'}
            </p>
            <Button size="sm" onClick={() => setShowJoinModal(true)}>
              {language === 'id' ? 'Gabung Kelas' : 'Join a Class'}
            </Button>
          </Card>
        ) : (
          filteredClasses.map((cls) => (
            <Card key={cls.id} hover>
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Left: Class Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          to={`/class/${cls.id}`}
                          className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          {cls.courseName}
                        </Link>
                        <Badge variant={cls.status === 'ongoing' ? 'success' : 'secondary'} size="sm">
                          {cls.status === 'ongoing'
                            ? language === 'id' ? 'Aktif' : 'Active'
                            : language === 'id' ? 'Selesai' : 'Completed'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={cls.instructor.avatar}
                          name={cls.instructor.name}
                          size="xs"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {cls.instructor.name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      <span>{cls.schedule.day}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{cls.schedule.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      <span>{cls.schedule.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{cls.students}/{cls.maxStudents} {language === 'id' ? 'siswa' : 'students'}</span>
                    </div>
                  </div>

                  {/* Progress */}
                  {cls.status === 'ongoing' && (
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">
                          {language === 'id' ? 'Progress' : 'Progress'}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">{cls.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${cls.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {(cls.notifications.newMaterials > 0 ||
                    cls.notifications.newAssignments > 0 ||
                    cls.notifications.upcomingDeadlines > 0) && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {cls.notifications.newMaterials > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                              {cls.notifications.newMaterials}{' '}
                              {language === 'id' ? 'Materi Baru' : 'New Materials'}
                            </span>
                          </div>
                        )}
                        {cls.notifications.newAssignments > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <FileText className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                            <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                              {cls.notifications.newAssignments}{' '}
                              {language === 'id' ? 'Tugas Baru' : 'New Assignments'}
                            </span>
                          </div>
                        )}
                        {cls.notifications.upcomingDeadlines > 0 && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg">
                            <Bell className="w-4 h-4 text-red-600 dark:text-red-400" />
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              {cls.notifications.upcomingDeadlines}{' '}
                              {language === 'id' ? 'Deadline Mendekat' : 'Upcoming Deadlines'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col justify-between lg:w-48">
                  {cls.nextSession && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {language === 'id' ? 'Sesi Berikutnya' : 'Next Session'}
                      </p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(cls.nextSession)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {getTimeAgo(cls.nextSession)}
                      </p>
                    </div>
                  )}
                  <Link to={`/student/class/${cls.id}`} className="mt-auto">
                    <Button size="sm" variant="outline" className="w-full">
                      {language === 'id' ? 'Lihat Detail' : 'View Details'}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Join Class Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title={language === 'id' ? 'Gabung ke Kelas' : 'Join a Class'}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {language === 'id'
              ? 'Masukkan kode kelas yang diberikan oleh instruktur untuk bergabung.'
              : 'Enter the class code provided by your instructor to join.'}
          </p>
          <Input
            inputSize="sm"
            label={language === 'id' ? 'Kode Kelas' : 'Class Code'}
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            placeholder="ABC123"
            className="uppercase"
          />
          <div className="flex gap-3 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowJoinModal(false)}
              className="flex-1"
            >
              {language === 'id' ? 'Batal' : 'Cancel'}
            </Button>
            <Button
              size="sm"
              onClick={handleJoinClass}
              disabled={!classCode.trim() || isJoining}
              isLoading={isJoining}
              className="flex-1"
            >
              {language === 'id' ? 'Gabung' : 'Join'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
}
