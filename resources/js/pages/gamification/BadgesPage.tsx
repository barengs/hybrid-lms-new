import { Award, Lock, CheckCircle } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Progress } from '@/components/ui';

export function BadgesPage() {
  // Mock badges data
  const earnedBadges = [
    { id: '1', name: 'First Steps', icon: '🎯', description: 'Menyelesaikan pelajaran pertama', earnedAt: '2024-01-15', points: 10 },
    { id: '2', name: 'Week Warrior', icon: '🔥', description: '7 hari berturut-turut belajar', earnedAt: '2024-02-01', points: 50 },
    { id: '3', name: 'Quiz Master', icon: '🧠', description: 'Mendapat nilai sempurna di 5 quiz', earnedAt: '2024-02-15', points: 100 },
    { id: '4', name: 'Course Completer', icon: '🎓', description: 'Menyelesaikan kursus pertama', earnedAt: '2024-03-01', points: 200 },
  ];

  const availableBadges = [
    { id: '5', name: 'Month Master', icon: '📅', description: '30 hari berturut-turut belajar', progress: 7, total: 30, points: 150 },
    { id: '6', name: 'Social Butterfly', icon: '💬', description: 'Menjawab 10 pertanyaan di forum', progress: 3, total: 10, points: 75 },
    { id: '7', name: 'Speed Learner', icon: '⚡', description: 'Selesaikan kursus dalam 1 minggu', progress: 0, total: 1, points: 100 },
    { id: '8', name: 'Top Rated', icon: '⭐', description: 'Dapat ulasan bintang 5 dari instruktur', progress: 0, total: 1, points: 50 },
    { id: '9', name: 'Multi-tasker', icon: '🎪', description: 'Mendaftar di 5 kursus berbeda', progress: 3, total: 5, points: 75 },
    { id: '10', name: 'Perfect Score', icon: '💯', description: 'Nilai sempurna di tugas akhir', progress: 0, total: 1, points: 150 },
  ];

  const lockedBadges = [
    { id: '11', name: 'Elite Learner', icon: '👑', description: 'Selesaikan 10 kursus', requirement: 'Selesaikan 10 kursus', points: 500 },
    { id: '12', name: 'Legend', icon: '🏆', description: 'Raih 5000 poin', requirement: 'Kumpulkan 5000 poin', points: 1000 },
    { id: '13', name: 'Year Master', icon: '📆', description: '365 hari streak belajar', requirement: 'Jaga streak selama 1 tahun', points: 2000 },
  ];

  const totalPoints = earnedBadges.reduce((sum, badge) => sum + badge.points, 0);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Lencana Saya</h1>
        <p className="text-gray-600">Kumpulkan lencana dengan menyelesaikan berbagai tantangan!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <div className="text-4xl mb-2">🏅</div>
          <p className="text-2xl font-bold text-gray-900">{earnedBadges.length}</p>
          <p className="text-sm text-gray-500">Lencana Diraih</p>
        </Card>
        <Card className="text-center">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-2xl font-bold text-gray-900">{availableBadges.length}</p>
          <p className="text-sm text-gray-500">Sedang Dikerjakan</p>
        </Card>
        <Card className="text-center">
          <div className="text-4xl mb-2">🔒</div>
          <p className="text-2xl font-bold text-gray-900">{lockedBadges.length}</p>
          <p className="text-sm text-gray-500">Terkunci</p>
        </Card>
        <Card className="text-center">
          <div className="text-4xl mb-2">⭐</div>
          <p className="text-2xl font-bold text-gray-900">{totalPoints}</p>
          <p className="text-sm text-gray-500">Poin dari Lencana</p>
        </Card>
      </div>

      {/* Earned Badges */}
      <Card className="mb-8">
        <CardHeader className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-500" />
          <CardTitle>Lencana yang Diraih ({earnedBadges.length})</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {earnedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-gradient-to-br from-yellow-50 to-amber-100 border border-yellow-200 rounded-xl p-4 text-center"
            >
              <div className="text-5xl mb-3">{badge.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{badge.name}</h3>
              <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
              <div className="flex items-center justify-center gap-1 text-xs text-yellow-700">
                <Award className="w-3.5 h-3.5" />
                +{badge.points} poin
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Diraih {new Date(badge.earnedAt).toLocaleDateString('id-ID')}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* In Progress Badges */}
      <Card className="mb-8">
        <CardHeader className="flex items-center gap-2">
          <Award className="w-5 h-5 text-blue-500" />
          <CardTitle>Sedang Dikerjakan ({availableBadges.length})</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {availableBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-white border border-gray-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl">{badge.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{badge.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progres</span>
                      <span>{badge.progress}/{badge.total}</span>
                    </div>
                    <Progress value={(badge.progress / badge.total) * 100} size="sm" />
                  </div>
                  <div className="flex items-center gap-1 text-xs text-blue-600">
                    <Award className="w-3.5 h-3.5" />
                    +{badge.points} poin
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Locked Badges */}
      <Card>
        <CardHeader className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-gray-400" />
          <CardTitle>Lencana Terkunci ({lockedBadges.length})</CardTitle>
        </CardHeader>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {lockedBadges.map((badge) => (
            <div
              key={badge.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 opacity-60"
            >
              <div className="flex items-start gap-3">
                <div className="text-4xl grayscale">{badge.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-700">{badge.name}</h3>
                  <p className="text-xs text-gray-500 mb-2">{badge.description}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Lock className="w-3.5 h-3.5" />
                    {badge.requirement}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <Award className="w-3.5 h-3.5" />
                    +{badge.points} poin
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
