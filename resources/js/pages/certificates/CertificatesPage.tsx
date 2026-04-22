import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  Download,
  Share2,
  Calendar,
  Clock,
  Search,
  Filter,
  ExternalLink,
  CheckCircle,
  BookOpen,
  User,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Button, Badge, Input, Avatar } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseThumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  issuedAt: string;
  credentialId: string;
  grade?: string;
  completionDate: string;
  hoursCompleted: number;
  skills: string[];
}

// Mock certificates data
const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    courseId: 'course-1',
    courseTitle: 'React Masterclass: From Zero to Hero',
    courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400',
    instructorName: 'Budi Santoso',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
    issuedAt: '2024-12-01T10:00:00Z',
    credentialId: 'AJHAR-REACT-2024-001',
    grade: 'A',
    completionDate: '2024-11-30T23:59:59Z',
    hoursCompleted: 42,
    skills: ['React.js', 'Hooks', 'Redux', 'TypeScript'],
  },
  {
    id: 'cert-2',
    courseId: 'course-2',
    courseTitle: 'Web Development Fundamentals',
    courseThumbnail: 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=400',
    instructorName: 'Dewi Lestari',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    issuedAt: '2024-10-15T10:00:00Z',
    credentialId: 'AJHAR-WEBDEV-2024-015',
    grade: 'A-',
    completionDate: '2024-10-14T23:59:59Z',
    hoursCompleted: 36,
    skills: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
  },
  {
    id: 'cert-3',
    courseId: 'course-3',
    courseTitle: 'Python untuk Data Science',
    courseThumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400',
    instructorName: 'Ahmad Fauzi',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
    issuedAt: '2024-09-20T10:00:00Z',
    credentialId: 'AJHAR-PYTHON-2024-042',
    grade: 'B+',
    completionDate: '2024-09-19T23:59:59Z',
    hoursCompleted: 48,
    skills: ['Python', 'Pandas', 'NumPy', 'Data Visualization'],
  },
  {
    id: 'cert-4',
    courseId: 'course-4',
    courseTitle: 'UI/UX Design Essentials',
    courseThumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400',
    instructorName: 'Siti Nurhaliza',
    instructorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
    issuedAt: '2024-08-10T10:00:00Z',
    credentialId: 'AJHAR-UIUX-2024-023',
    grade: 'A',
    completionDate: '2024-08-09T23:59:59Z',
    hoursCompleted: 32,
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
  },
];

export function CertificatesPage() {
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  const filteredCertificates = mockCertificates
    .filter((cert) =>
      cert.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cert.credentialId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const dateA = new Date(a.issuedAt).getTime();
      const dateB = new Date(b.issuedAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = (cert: Certificate) => {
    // In real app, generate and download PDF
    console.log('Downloading certificate:', cert.id);
    alert(language === 'id' ? 'Mengunduh sertifikat...' : 'Downloading certificate...');
  };

  const handleShare = (cert: Certificate) => {
    // In real app, open share dialog or copy link
    const shareUrl = `${window.location.origin}/certificate/verify/${cert.credentialId}`;
    navigator.clipboard.writeText(shareUrl);
    alert(language === 'id' ? 'Link disalin ke clipboard!' : 'Link copied to clipboard!');
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Sertifikat Saya' : 'My Certificates'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Lihat dan kelola semua sertifikat yang telah Anda peroleh.'
              : 'View and manage all the certificates you have earned.'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockCertificates.length}</p>
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Total Sertifikat' : 'Total Certificates'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-lg">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {mockCertificates.reduce((acc, cert) => acc + cert.hoursCompleted, 0)}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Total Jam Belajar' : 'Total Learning Hours'}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(mockCertificates.flatMap((cert) => cert.skills)).size}
                </p>
                <p className="text-sm text-gray-500">
                  {language === 'id' ? 'Skill Diperoleh' : 'Skills Acquired'}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder={language === 'id' ? 'Cari sertifikat...' : 'Search certificates...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-5 h-5" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                aria-label="Sort certificates"
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">{language === 'id' ? 'Terbaru' : 'Newest First'}</option>
                <option value="oldest">{language === 'id' ? 'Terlama' : 'Oldest First'}</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Certificates List */}
        {filteredCertificates.length === 0 ? (
          <Card className="text-center py-12">
            <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {language === 'id' ? 'Tidak Ada Sertifikat' : 'No Certificates'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? language === 'id'
                  ? 'Tidak ada sertifikat yang cocok dengan pencarian Anda.'
                  : 'No certificates match your search.'
                : language === 'id'
                ? 'Selesaikan kursus untuk mendapatkan sertifikat.'
                : 'Complete courses to earn certificates.'}
            </p>
            {!searchQuery && (
              <Link
                to="/courses"
                className="inline-flex items-center justify-center px-4 py-2 text-base font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
              >
                {language === 'id' ? 'Jelajahi Kursus' : 'Browse Courses'}
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredCertificates.map((cert) => (
              <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row">
                  {/* Course Thumbnail */}
                  <div className="md:w-48 h-32 md:h-auto flex-shrink-0">
                    <img
                      src={cert.courseThumbnail}
                      alt={cert.courseTitle}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Certificate Details */}
                  <div className="flex-1 p-4 md:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        {/* Course Title & Badge */}
                        <div className="flex items-start gap-2 mb-2">
                          <Link
                            to={`/certificates/${cert.id}`}
                            className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                          >
                            {cert.courseTitle}
                          </Link>
                          {cert.grade && (
                            <Badge variant="success" size="sm">
                              {language === 'id' ? 'Nilai' : 'Grade'}: {cert.grade}
                            </Badge>
                          )}
                        </div>

                        {/* Instructor */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                          <Avatar src={cert.instructorAvatar} name={cert.instructorName} size="xs" />
                          <span>{cert.instructorName}</span>
                        </div>

                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {language === 'id' ? 'Diterbitkan' : 'Issued'}: {formatDate(cert.issuedAt)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>
                              {cert.hoursCompleted} {language === 'id' ? 'jam' : 'hours'}
                            </span>
                          </div>
                        </div>

                        {/* Credential ID */}
                        <div className="text-xs text-gray-400 mb-3">
                          Credential ID: <span className="font-mono">{cert.credentialId}</span>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2">
                          {cert.skills.map((skill) => (
                            <Badge key={skill} variant="secondary" size="sm">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex sm:flex-col gap-2">
                        <Link
                          to={`/certificates/${cert.id}`}
                          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-sm font-medium border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {language === 'id' ? 'Lihat' : 'View'}
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Download className="w-4 h-4" />}
                          onClick={() => handleDownload(cert)}
                        >
                          {language === 'id' ? 'Unduh' : 'Download'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          leftIcon={<Share2 className="w-4 h-4" />}
                          onClick={() => handleShare(cert)}
                        >
                          {language === 'id' ? 'Bagikan' : 'Share'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Skills Summary */}
        {filteredCertificates.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>{language === 'id' ? 'Ringkasan Skill' : 'Skills Summary'}</CardTitle>
            </CardHeader>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(mockCertificates.flatMap((cert) => cert.skills))).map((skill) => (
                <Badge key={skill} variant="primary" size="md">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
