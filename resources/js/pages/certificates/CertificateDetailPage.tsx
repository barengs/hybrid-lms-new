import { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Award,
  Download,
  Share2,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle,
  ExternalLink,
  Copy,
  Printer,
  Linkedin,
  Twitter,
  Facebook,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface Certificate {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  courseThumbnail: string;
  instructorName: string;
  instructorAvatar?: string;
  instructorTitle?: string;
  issuedAt: string;
  credentialId: string;
  grade?: string;
  completionDate: string;
  hoursCompleted: number;
  skills: string[];
  lessonsCompleted: number;
  totalLessons: number;
  quizzesPassed: number;
  assignmentsCompleted: number;
}

// Mock certificate data
const mockCertificate: Certificate = {
  id: 'cert-1',
  courseId: 'course-1',
  courseTitle: 'React Masterclass: From Zero to Hero',
  courseDescription:
    'Master React.js from the ground up. Learn hooks, state management, and build real-world applications with modern best practices.',
  courseThumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  instructorName: 'Budi Santoso',
  instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
  instructorTitle: 'Senior Software Engineer at Tech Company',
  issuedAt: '2024-12-01T10:00:00Z',
  credentialId: 'AJHAR-REACT-2024-001',
  grade: 'A',
  completionDate: '2024-11-30T23:59:59Z',
  hoursCompleted: 42,
  skills: ['React.js', 'Hooks', 'Redux', 'TypeScript', 'Testing', 'Performance Optimization'],
  lessonsCompleted: 85,
  totalLessons: 85,
  quizzesPassed: 12,
  assignmentsCompleted: 8,
};

export function CertificateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [showShareModal, setShowShareModal] = useState(false);
  const certificateRef = useRef<HTMLDivElement>(null);

  // In real app, fetch certificate by id
  const certificate = mockCertificate;
  console.log('Certificate ID:', id);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDownload = () => {
    // In real app, generate and download PDF
    console.log('Downloading certificate:', certificate.id);
    alert(language === 'id' ? 'Mengunduh sertifikat...' : 'Downloading certificate...');
  };

  const handlePrint = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert(language === 'id' ? 'Disalin ke clipboard!' : 'Copied to clipboard!');
  };

  const verifyUrl = `${window.location.origin}/certificate/verify/${certificate.credentialId}`;
  const shareText = language === 'id'
    ? `Saya telah menyelesaikan kursus "${certificate.courseTitle}" di MOLANG!`
    : `I've completed the "${certificate.courseTitle}" course on MOLANG!`;

  const shareLinks = {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(verifyUrl)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(verifyUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(verifyUrl)}`,
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/certificates"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {language === 'id' ? 'Kembali ke Sertifikat' : 'Back to Certificates'}
        </Link>

        {/* Certificate Preview */}
        <Card className="mb-6 overflow-hidden print:shadow-none" ref={certificateRef}>
          {/* Certificate Header - Decorative */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 border-t-4 border-l-4 border-white" />
              <div className="absolute top-0 right-0 w-32 h-32 border-t-4 border-r-4 border-white" />
              <div className="absolute bottom-0 left-0 w-32 h-32 border-b-4 border-l-4 border-white" />
              <div className="absolute bottom-0 right-0 w-32 h-32 border-b-4 border-r-4 border-white" />
            </div>
            <Award className="w-16 h-16 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">
              {language === 'id' ? 'SERTIFIKAT PENYELESAIAN' : 'CERTIFICATE OF COMPLETION'}
            </h1>
            <p className="text-blue-100">Hybrid Learning Management System</p>
          </div>

          {/* Certificate Body */}
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">
              {language === 'id' ? 'Ini untuk menyatakan bahwa' : 'This is to certify that'}
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{user?.name}</h2>
            <p className="text-gray-500 mb-4">
              {language === 'id'
                ? 'telah berhasil menyelesaikan kursus'
                : 'has successfully completed the course'}
            </p>
            <h3 className="text-2xl font-semibold text-blue-600 mb-6">{certificate.courseTitle}</h3>

            {/* Course Stats */}
            <div className="flex justify-center gap-8 mb-6 text-sm text-gray-600">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{certificate.hoursCompleted}</p>
                <p>{language === 'id' ? 'Jam Belajar' : 'Learning Hours'}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{certificate.lessonsCompleted}</p>
                <p>{language === 'id' ? 'Pelajaran' : 'Lessons'}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900">{certificate.quizzesPassed}</p>
                <p>{language === 'id' ? 'Quiz Lulus' : 'Quizzes Passed'}</p>
              </div>
            </div>

            {/* Grade */}
            {certificate.grade && (
              <div className="mb-6">
                <Badge variant="success" size="md" className="text-lg px-6 py-2">
                  {language === 'id' ? 'Nilai Akhir' : 'Final Grade'}: {certificate.grade}
                </Badge>
              </div>
            )}

            {/* Instructor Signature */}
            <div className="flex justify-center items-center gap-4 pt-6 border-t border-gray-200">
              <Avatar src={certificate.instructorAvatar} name={certificate.instructorName} size="lg" />
              <div className="text-left">
                <p className="font-semibold text-gray-900">{certificate.instructorName}</p>
                <p className="text-sm text-gray-500">{certificate.instructorTitle}</p>
                <p className="text-xs text-gray-400">
                  {language === 'id' ? 'Instruktur Kursus' : 'Course Instructor'}
                </p>
              </div>
            </div>

            {/* Issue Date & Credential */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-center gap-6 text-sm text-gray-500">
              <div className="flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>
                  {language === 'id' ? 'Diterbitkan' : 'Issued'}: {formatDate(certificate.issuedAt)}
                </span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="font-mono">ID: {certificate.credentialId}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 mb-6 print:hidden">
          <Button leftIcon={<Download className="w-4 h-4" />} onClick={handleDownload}>
            {language === 'id' ? 'Unduh PDF' : 'Download PDF'}
          </Button>
          <Button variant="outline" leftIcon={<Printer className="w-4 h-4" />} onClick={handlePrint}>
            {language === 'id' ? 'Cetak' : 'Print'}
          </Button>
          <Button
            variant="outline"
            leftIcon={<Share2 className="w-4 h-4" />}
            onClick={() => setShowShareModal(true)}
          >
            {language === 'id' ? 'Bagikan' : 'Share'}
          </Button>
        </div>

        {/* Certificate Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:hidden">
          {/* Course Info */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'id' ? 'Informasi Kursus' : 'Course Information'}
            </h3>
            <div className="flex gap-4 mb-4">
              <img
                src={certificate.courseThumbnail}
                alt={certificate.courseTitle}
                className="w-20 h-14 object-cover rounded-lg"
              />
              <div>
                <h4 className="font-medium text-gray-900">{certificate.courseTitle}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{certificate.courseDescription}</p>
              </div>
            </div>
            <Link
              to={`/course/${certificate.courseId}`}
              className="inline-flex items-center gap-1 text-blue-600 hover:underline text-sm"
            >
              {language === 'id' ? 'Lihat Detail Kursus' : 'View Course Details'}
              <ExternalLink className="w-3 h-3" />
            </Link>
          </Card>

          {/* Completion Stats */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {language === 'id' ? 'Detail Penyelesaian' : 'Completion Details'}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'id' ? 'Tanggal Selesai' : 'Completion Date'}</span>
                <span className="font-medium">{formatDate(certificate.completionDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'id' ? 'Total Jam' : 'Total Hours'}</span>
                <span className="font-medium">{certificate.hoursCompleted} {language === 'id' ? 'jam' : 'hours'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'id' ? 'Pelajaran Selesai' : 'Lessons Completed'}</span>
                <span className="font-medium">{certificate.lessonsCompleted}/{certificate.totalLessons}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'id' ? 'Quiz Lulus' : 'Quizzes Passed'}</span>
                <span className="font-medium">{certificate.quizzesPassed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{language === 'id' ? 'Tugas Selesai' : 'Assignments Completed'}</span>
                <span className="font-medium">{certificate.assignmentsCompleted}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Skills Acquired */}
        <Card className="mt-6 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'id' ? 'Skill yang Diperoleh' : 'Skills Acquired'}
          </h3>
          <div className="flex flex-wrap gap-2">
            {certificate.skills.map((skill) => (
              <Badge key={skill} variant="primary" size="md">
                <CheckCircle className="w-3 h-3 mr-1" />
                {skill}
              </Badge>
            ))}
          </div>
        </Card>

        {/* Verification */}
        <Card className="mt-6 print:hidden">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {language === 'id' ? 'Verifikasi Sertifikat' : 'Certificate Verification'}
          </h3>
          <p className="text-gray-600 mb-4">
            {language === 'id'
              ? 'Bagikan link di bawah ini untuk memverifikasi keaslian sertifikat ini.'
              : 'Share the link below to verify the authenticity of this certificate.'}
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={verifyUrl}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
            />
            <Button
              variant="outline"
              leftIcon={<Copy className="w-4 h-4" />}
              onClick={() => copyToClipboard(verifyUrl)}
            >
              {language === 'id' ? 'Salin' : 'Copy'}
            </Button>
          </div>
        </Card>

        {/* Share Modal */}
        <Modal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          title={language === 'id' ? 'Bagikan Sertifikat' : 'Share Certificate'}
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              {language === 'id'
                ? 'Bagikan pencapaian Anda ke media sosial:'
                : 'Share your achievement on social media:'}
            </p>
            <div className="flex gap-3">
              <a
                href={shareLinks.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#0077b5] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Linkedin className="w-5 h-5" />
                LinkedIn
              </a>
              <a
                href={shareLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#1da1f2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Twitter className="w-5 h-5" />
                Twitter
              </a>
              <a
                href={shareLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 p-3 bg-[#4267B2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Facebook className="w-5 h-5" />
                Facebook
              </a>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 mb-2">
                {language === 'id' ? 'Atau salin link verifikasi:' : 'Or copy verification link:'}
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={verifyUrl}
                  className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono"
                />
                <Button size="sm" onClick={() => copyToClipboard(verifyUrl)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
