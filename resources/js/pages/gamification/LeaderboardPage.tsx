import { Trophy, Medal, Award, Crown, Flame, Target, Star, Zap } from 'lucide-react';
import { DashboardLayout } from '@/components/layouts';
import { Card, CardHeader, CardTitle, Avatar, Badge } from '@/components/ui';
import { formatNumber } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';

export function LeaderboardPage() {
  const { user } = useAuth();

  // Mock leaderboard data
  const leaderboard = [
    { rank: 1, name: 'Ahmad Rizki', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad', points: 5420, badges: 15, streak: 45 },
    { rank: 2, name: 'Siti Nurhaliza', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti', points: 4850, badges: 12, streak: 32 },
    { rank: 3, name: 'Budi Hartono', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=BudiH', points: 4200, badges: 14, streak: 28 },
    { rank: 4, name: 'Dewi Sartika', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi', points: 3890, badges: 10, streak: 21 },
    { rank: 5, name: 'Rudi Setiawan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rudi', points: 3650, badges: 11, streak: 19 },
    { rank: 6, name: 'Ani Wijaya', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ani', points: 3420, badges: 9, streak: 15 },
    { rank: 7, name: 'Joko Susilo', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joko', points: 3100, badges: 8, streak: 12 },
    { rank: 8, name: 'Maya Putri', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya', points: 2890, badges: 7, streak: 10 },
    { rank: 9, name: 'Dedi Kurniawan', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dedi', points: 2650, badges: 6, streak: 8 },
    { rank: 10, name: 'Lisa Permata', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', points: 2400, badges: 5, streak: 7 },
  ];

  // Current user stats
  const myStats = {
    rank: 42,
    points: 1250,
    badges: 4,
    streak: 7,
    pointsToNextRank: 150,
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 2:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
      case 3:
        return 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200';
      default:
        return 'bg-white';
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Lihat peringkat Anda dan bersaing dengan siswa lainnya!</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Leaderboard */}
        <div className="lg:col-span-2">
          {/* Top 3 Podium */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* 2nd Place */}
            <div className="pt-8">
              <Card className="text-center bg-gradient-to-b from-gray-50 to-gray-100 border-gray-200">
                <div className="relative inline-block mb-3">
                  <Avatar src={leaderboard[1].avatar} name={leaderboard[1].name} size="xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    2
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{leaderboard[1].name}</h3>
                <p className="text-lg font-bold text-gray-600">{formatNumber(leaderboard[1].points)} pts</p>
                <Medal className="w-8 h-8 text-gray-400 mx-auto mt-2" />
              </Card>
            </div>

            {/* 1st Place */}
            <div>
              <Card className="text-center bg-gradient-to-b from-yellow-50 to-amber-100 border-yellow-300">
                <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
                <div className="relative inline-block mb-3">
                  <Avatar src={leaderboard[0].avatar} name={leaderboard[0].name} size="xl" className="ring-4 ring-yellow-400" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    1
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{leaderboard[0].name}</h3>
                <p className="text-xl font-bold text-yellow-600">{formatNumber(leaderboard[0].points)} pts</p>
              </Card>
            </div>

            {/* 3rd Place */}
            <div className="pt-12">
              <Card className="text-center bg-gradient-to-b from-amber-50 to-orange-100 border-amber-200">
                <div className="relative inline-block mb-3">
                  <Avatar src={leaderboard[2].avatar} name={leaderboard[2].name} size="xl" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                    3
                  </div>
                </div>
                <h3 className="font-semibold text-gray-900">{leaderboard[2].name}</h3>
                <p className="text-lg font-bold text-amber-600">{formatNumber(leaderboard[2].points)} pts</p>
                <Medal className="w-8 h-8 text-amber-600 mx-auto mt-2" />
              </Card>
            </div>
          </div>

          {/* Full Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle>Peringkat Lengkap</CardTitle>
            </CardHeader>
            <div className="space-y-2">
              {leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${getRankBg(entry.rank)}`}
                >
                  <div className="w-8 text-center">
                    {getRankIcon(entry.rank) || (
                      <span className="text-lg font-bold text-gray-400">{entry.rank}</span>
                    )}
                  </div>
                  <Avatar src={entry.avatar} name={entry.name} size="md" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{entry.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        {entry.badges} lencana
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-orange-500" />
                        {entry.streak} hari
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatNumber(entry.points)}</p>
                    <p className="text-xs text-gray-500">poin</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* My Rank */}
          <Card className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
            <h3 className="font-semibold mb-4">Peringkat Anda</h3>
            <div className="flex items-center gap-4 mb-4">
              <Avatar src={user?.avatar} name={user?.name || 'User'} size="lg" />
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-3xl font-bold">#{myStats.rank}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-2xl font-bold">{formatNumber(myStats.points)}</p>
                <p className="text-xs text-blue-100">Poin</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-2xl font-bold">{myStats.badges}</p>
                <p className="text-xs text-blue-100">Lencana</p>
              </div>
              <div className="bg-white/20 rounded-lg p-2">
                <p className="text-2xl font-bold">{myStats.streak}</p>
                <p className="text-xs text-blue-100">Streak</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm text-blue-100">
                <Zap className="w-4 h-4 inline mr-1" />
                {myStats.pointsToNextRank} poin lagi ke peringkat #{myStats.rank - 1}
              </p>
            </div>
          </Card>

          {/* How to Earn Points */}
          <Card>
            <CardHeader>
              <CardTitle>Cara Mendapat Poin</CardTitle>
            </CardHeader>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Selesaikan Pelajaran</p>
                  <p className="text-xs text-gray-500">+10 poin per pelajaran</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Selesaikan Kursus</p>
                  <p className="text-xs text-gray-500">+100 poin per kursus</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Dapatkan Nilai Quiz A</p>
                  <p className="text-xs text-gray-500">+25 poin per quiz</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Jaga Streak Harian</p>
                  <p className="text-xs text-gray-500">+5 poin per hari</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
