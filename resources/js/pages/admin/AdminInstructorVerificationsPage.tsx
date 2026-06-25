import { useState } from 'react';
import { DashboardLayout } from '@/components/layouts';
import { Card, Button, Badge } from '@/components/ui';
import { 
  useGetInstructorApplicationsQuery, 
  useApproveInstructorApplicationMutation,
  useRejectInstructorApplicationMutation 
} from '@/store/features/admin/adminInstructorVerificationApiSlice';
import { Check, X, FileText } from 'lucide-react';

export function AdminInstructorVerificationsPage() {
  const { data: applications, isLoading } = useGetInstructorApplicationsQuery();
  const [approve] = useApproveInstructorApplicationMutation();
  const [reject] = useRejectInstructorApplicationMutation();

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState('');

  if (isLoading) return <DashboardLayout>Loading...</DashboardLayout>;

  const handleApprove = async (id: number) => {
    if (confirm('Apakah Anda yakin ingin menyetujui pendaftaran ini?')) {
      try {
        await approve(id).unwrap();
        alert('Pendaftaran berhasil disetujui.');
      } catch (e) {
        alert('Terjadi kesalahan.');
      }
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedAppId(id);
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (selectedAppId && rejectNotes) {
      try {
        await reject({ id: selectedAppId, notes: rejectNotes }).unwrap();
        alert('Pendaftaran ditolak.');
        setRejectModalOpen(false);
        setRejectNotes('');
        setSelectedAppId(null);
      } catch (e) {
        alert('Terjadi kesalahan.');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifikasi Instruktur</h1>
        <p className="text-gray-600">Kelola pendaftaran instruktur baru</p>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-4 font-medium text-gray-500">Pendaftar</th>
                <th className="py-3 px-4 font-medium text-gray-500">Keahlian</th>
                <th className="py-3 px-4 font-medium text-gray-500">Sertifikat</th>
                <th className="py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="py-3 px-4 font-medium text-gray-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {applications?.map((app: any) => (
                <tr key={app.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{app.user?.name}</p>
                    <p className="text-sm text-gray-500">{app.user?.email}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-sm text-gray-900">{app.expertise}</p>
                    <p className="text-xs text-gray-500">{app.experience} tahun</p>
                  </td>
                  <td className="py-3 px-4">
                    {app.certificate_path && (
                      <a 
                        href={`/storage/${app.certificate_path}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center text-sm text-blue-600 hover:underline"
                      >
                        <FileText className="w-4 h-4 mr-1" /> Lihat Dokumen
                      </a>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={app.status === 'approved' ? 'success' : app.status === 'rejected' ? 'danger' : 'warning'}>
                      {app.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    {app.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleApprove(app.id)} className="bg-green-600 hover:bg-green-700 text-white">
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => openRejectModal(app.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {applications?.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    Tidak ada pendaftaran yang perlu diverifikasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">Tolak Pendaftaran</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Alasan Penolakan</label>
              <textarea 
                value={rejectNotes} 
                onChange={e => setRejectNotes(e.target.value)} 
                className="w-full border rounded-lg p-2"
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setRejectModalOpen(false)}>Batal</Button>
              <Button onClick={handleReject} disabled={!rejectNotes} className="bg-red-600 hover:bg-red-700 text-white">Tolak</Button>
            </div>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
