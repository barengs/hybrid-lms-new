import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import {
  ShieldCheck,
  AlertCircle,
  Flag,
  MessageSquare,
  CheckCircle,
  XCircle,
  Eye,
  Ban,
  AlertTriangle,
  Search,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge, Avatar, Select, DataTable, Modal } from '@/components/ui';
import { useLanguage } from '@/context/LanguageContext';
import { getTimeAgo } from '@/lib/utils';
import type { DropdownItem } from '@/components/ui';
import { Dropdown } from '@/components/ui';

// Types
interface ReportedContent {
  id: string;
  type: 'review' | 'comment';
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  reporter: {
    id: string;
    name: string;
  };
  reason: string;
  reportedAt: string;
  status: 'pending' | 'reviewed' | 'removed';
  courseName?: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  courseName: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'flagged';
}

// Mock Data
const mockReportedContent: ReportedContent[] = [
  {
    id: 'rep-1',
    type: 'review',
    content: 'Ini kursus jelek banget, buang-buang uang aja!',
    author: { id: 'u1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
    reporter: { id: 'u2', name: 'Jane Smith' },
    reason: 'Inappropriate language',
    reportedAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'pending',
    courseName: 'React Masterclass',
  },
  {
    id: 'rep-2',
    type: 'comment',
    content: 'Spam link: visit my-scam-site.com',
    author: { id: 'u3', name: 'Spammer User' },
    reporter: { id: 'u4', name: 'Admin User' },
    reason: 'Spam/Advertisement',
    reportedAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'pending',
    courseName: 'Python Basics',
  },
];

const mockComments: Comment[] = [
  {
    id: 'com-1',
    content: 'Great lesson! Very helpful explanation.',
    author: { id: 'u5', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    courseName: 'JavaScript Fundamentals',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    status: 'approved',
  },
  {
    id: 'com-2',
    content: 'Could you explain this part again?',
    author: { id: 'u6', name: 'Mike Brown' },
    courseName: 'CSS Advanced',
    createdAt: new Date(Date.now() - 43200000).toISOString(),
    status: 'pending',
  },
];

export function ModerationPage() {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'reported' | 'comments'>('reported');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals
  const [showActionModal, setShowActionModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ReportedContent | Comment | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'remove' | 'warn' | 'ban'>('approve');
  const [actionReason, setActionReason] = useState('');

  // Statistics
  const stats = useMemo(() => ({
    pendingReviews: mockReportedContent.filter(r => r.status === 'pending').length,
    reportedContent: mockReportedContent.length,
    pendingComments: mockComments.filter(c => c.status === 'pending').length,
    actionsToday: 15,
  }), []);

  // Filtered data
  const filteredReports = useMemo(() => {
    let data = [...mockReportedContent];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.content.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query) ||
        item.reporter.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    return data;
  }, [searchQuery, statusFilter]);

  const filteredComments = useMemo(() => {
    let data = [...mockComments];

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.content.toLowerCase().includes(query) ||
        item.author.name.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      data = data.filter(item => item.status === statusFilter);
    }

    return data;
  }, [searchQuery, statusFilter]);

  const handleAction = (item: ReportedContent | Comment, action: typeof actionType) => {
    setSelectedItem(item);
    setActionType(action);
    setShowActionModal(true);
  };

  const confirmAction = () => {
    console.log('Moderation action:', {
      itemId: selectedItem?.id,
      action: actionType,
      reason: actionReason,
    });
    setShowActionModal(false);
    setActionReason('');
  };

  // Reported content columns
  const reportedColumns = useMemo<ColumnDef<ReportedContent>[]>(
    () => [
      {
        accessorKey: 'type',
        header: language === 'id' ? 'Tipe' : 'Type',
        cell: ({ row }) => (
          <Badge variant={row.original.type === 'review' ? 'primary' : 'secondary'} size="sm">
            {row.original.type === 'review' ? (language === 'id' ? 'Review' : 'Review') : (language === 'id' ? 'Komentar' : 'Comment')}
          </Badge>
        ),
      },
      {
        accessorKey: 'content',
        header: language === 'id' ? 'Konten' : 'Content',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-sm text-gray-900 line-clamp-2">{row.original.content}</p>
            {row.original.courseName && (
              <p className="text-xs text-gray-500 mt-1">{row.original.courseName}</p>
            )}
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'author',
        header: language === 'id' ? 'Penulis' : 'Author',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar src={row.original.author.avatar} name={row.original.author.name} size="sm" />
            <span className="text-sm text-gray-900">{row.original.author.name}</span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'reason',
        header: language === 'id' ? 'Alasan Laporan' : 'Report Reason',
        cell: ({ row }) => (
          <div>
            <p className="text-sm text-gray-900">{row.original.reason}</p>
            <p className="text-xs text-gray-500">{language === 'id' ? 'oleh' : 'by'} {row.original.reporter.name}</p>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'reportedAt',
        header: language === 'id' ? 'Dilaporkan' : 'Reported',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{getTimeAgo(row.original.reportedAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const config = {
            pending: { variant: 'warning' as const, label: language === 'id' ? 'Pending' : 'Pending' },
            reviewed: { variant: 'secondary' as const, label: language === 'id' ? 'Direview' : 'Reviewed' },
            removed: { variant: 'danger' as const, label: language === 'id' ? 'Dihapus' : 'Removed' },
          };
          const statusConfig = config[row.original.status];
          return <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: language === 'id' ? 'Aksi' : 'Actions',
        cell: ({ row }) => {
          const items: DropdownItem[] = [
            {
              label: language === 'id' ? 'Lihat Detail' : 'View Details',
              icon: <Eye className="w-4 h-4" />,
              onClick: () => console.log('View', row.original.id),
            },
          ];

          if (row.original.status === 'pending') {
            items.push(
              {
                label: language === 'id' ? 'Approve (Tolak Laporan)' : 'Approve (Dismiss Report)',
                icon: <CheckCircle className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'approve'),
              },
              {
                label: language === 'id' ? 'Hapus Konten' : 'Remove Content',
                icon: <XCircle className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'remove'),
              },
              {
                label: language === 'id' ? 'Beri Peringatan' : 'Warn User',
                icon: <AlertTriangle className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'warn'),
              },
              {
                label: language === 'id' ? 'Ban User' : 'Ban User',
                icon: <Ban className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'ban'),
              }
            );
          }

          return (
            <Dropdown
              trigger={
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              }
              items={items}
            />
          );
        },
        enableSorting: false,
      },
    ],
    [language]
  );

  // Comments columns
  const commentsColumns = useMemo<ColumnDef<Comment>[]>(
    () => [
      {
        accessorKey: 'content',
        header: language === 'id' ? 'Komentar' : 'Comment',
        cell: ({ row }) => (
          <div className="max-w-md">
            <p className="text-sm text-gray-900 line-clamp-2">{row.original.content}</p>
            <p className="text-xs text-gray-500 mt-1">{row.original.courseName}</p>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'author',
        header: language === 'id' ? 'Penulis' : 'Author',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar src={row.original.author.avatar} name={row.original.author.name} size="sm" />
            <span className="text-sm text-gray-900">{row.original.author.name}</span>
          </div>
        ),
        enableSorting: false,
      },
      {
        accessorKey: 'createdAt',
        header: language === 'id' ? 'Dibuat' : 'Created',
        cell: ({ row }) => (
          <span className="text-sm text-gray-600">{getTimeAgo(row.original.createdAt)}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const config = {
            pending: { variant: 'warning' as const, label: language === 'id' ? 'Pending' : 'Pending' },
            approved: { variant: 'success' as const, label: language === 'id' ? 'Disetujui' : 'Approved' },
            flagged: { variant: 'danger' as const, label: language === 'id' ? 'Ditandai' : 'Flagged' },
          };
          const statusConfig = config[row.original.status];
          return <Badge variant={statusConfig.variant} size="sm">{statusConfig.label}</Badge>;
        },
      },
      {
        id: 'actions',
        header: language === 'id' ? 'Aksi' : 'Actions',
        cell: ({ row }) => {
          const items: DropdownItem[] = [];

          if (row.original.status === 'pending') {
            items.push(
              {
                label: language === 'id' ? 'Approve' : 'Approve',
                icon: <CheckCircle className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'approve'),
              },
              {
                label: language === 'id' ? 'Hapus' : 'Delete',
                icon: <XCircle className="w-4 h-4" />,
                onClick: () => handleAction(row.original, 'remove'),
              }
            );
          } else if (row.original.status === 'approved') {
            items.push({
              label: language === 'id' ? 'Hapus' : 'Delete',
              icon: <XCircle className="w-4 h-4" />,
              onClick: () => handleAction(row.original, 'remove'),
            });
          }

          return items.length > 0 ? (
            <Dropdown
              trigger={
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
              }
              items={items}
            />
          ) : null;
        },
        enableSorting: false,
      },
    ],
    [language]
  );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {language === 'id' ? 'Moderasi Konten' : 'Content Moderation'}
          </h1>
          <p className="text-gray-600 mt-1">
            {language === 'id'
              ? 'Review dan kelola konten yang dilaporkan'
              : 'Review and manage reported content'}
          </p>
        </div>

        {/* Statistics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Pending Review' : 'Pending Reviews'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingReviews}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Konten Dilaporkan' : 'Reported Content'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.reportedContent}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Komentar Pending' : 'Pending Comments'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.pendingComments}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{language === 'id' ? 'Aksi Hari Ini' : 'Actions Today'}</p>
                <p className="text-xl font-bold text-gray-900">{stats.actionsToday}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('reported')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'reported'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <Flag className="w-4 h-4 inline mr-2" />
              {language === 'id' ? 'Konten Dilaporkan' : 'Reported Content'}
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'comments'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <MessageSquare className="w-4 h-4 inline mr-2" />
              {language === 'id' ? 'Semua Komentar' : 'All Comments'}
            </button>
          </nav>
        </div>

        {/* Content Table */}
        <Card>
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeTab === 'reported'
                  ? (language === 'id' ? 'Konten Dilaporkan' : 'Reported Content')
                  : (language === 'id' ? 'Semua Komentar' : 'All Comments')}
              </h2>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1 sm:min-w-[250px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'id' ? 'Cari konten...' : 'Search content...'}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Status Filter */}
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  options={[
                    { value: 'all', label: language === 'id' ? 'Semua Status' : 'All Status' },
                    { value: 'pending', label: language === 'id' ? 'Pending' : 'Pending' },
                    ...(activeTab === 'reported'
                      ? [
                        { value: 'reviewed', label: language === 'id' ? 'Direview' : 'Reviewed' },
                        { value: 'removed', label: language === 'id' ? 'Dihapus' : 'Removed' },
                      ]
                      : [
                        { value: 'approved', label: language === 'id' ? 'Disetujui' : 'Approved' },
                        { value: 'flagged', label: language === 'id' ? 'Ditandai' : 'Flagged' },
                      ]),
                  ]}
                  className="w-full sm:w-40"
                />
              </div>
            </div>
          </div>

          {/* DataTable */}
          {activeTab === 'reported' ? (
            <DataTable
              columns={reportedColumns}
              data={filteredReports}
              enablePagination={true}
              pageSize={10}
            />
          ) : (
            <DataTable
              columns={commentsColumns}
              data={filteredComments}
              enablePagination={true}
              pageSize={10}
            />
          )}
        </Card>

        {/* Action Modal */}
        <Modal
          isOpen={showActionModal}
          onClose={() => setShowActionModal(false)}
          title={
            actionType === 'approve' ? (language === 'id' ? 'Approve Konten' : 'Approve Content') :
              actionType === 'remove' ? (language === 'id' ? 'Hapus Konten' : 'Remove Content') :
                actionType === 'warn' ? (language === 'id' ? 'Beri Peringatan' : 'Warn User') :
                  (language === 'id' ? 'Ban User' : 'Ban User')
          }
          size="md"
        >
          <div className="space-y-4">
            <div className={`p-4 rounded-lg border ${actionType === 'approve' ? 'bg-green-50 border-green-200' :
              actionType === 'warn' ? 'bg-yellow-50 border-yellow-200' :
                'bg-red-50 border-red-200'
              }`}>
              <p className={`text-sm font-medium ${actionType === 'approve' ? 'text-green-900' :
                actionType === 'warn' ? 'text-yellow-900' :
                  'text-red-900'
                }`}>
                {actionType === 'approve' && (language === 'id'
                  ? 'Anda akan menyetujui konten ini dan menolak laporan.'
                  : 'You are about to approve this content and dismiss the report.')}
                {actionType === 'remove' && (language === 'id'
                  ? 'Anda akan menghapus konten ini secara permanen.'
                  : 'You are about to permanently remove this content.')}
                {actionType === 'warn' && (language === 'id'
                  ? 'Anda akan memberi peringatan kepada user.'
                  : 'You are about to warn this user.')}
                {actionType === 'ban' && (language === 'id'
                  ? 'Anda akan mem-ban user ini dari platform.'
                  : 'You are about to ban this user from the platform.')}
              </p>
            </div>

            {actionType !== 'approve' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {language === 'id' ? 'Alasan' : 'Reason'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={language === 'id' ? 'Masukkan alasan...' : 'Enter reason...'}
                  rows={3}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowActionModal(false)}>
                {language === 'id' ? 'Batal' : 'Cancel'}
              </Button>
              <Button
                variant={actionType === 'approve' ? 'primary' : 'danger'}
                onClick={confirmAction}
                disabled={actionType !== 'approve' && !actionReason.trim()}
              >
                {language === 'id' ? 'Konfirmasi' : 'Confirm'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
}
