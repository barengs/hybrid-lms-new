import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  BarChart3,
  FileText,
  MessageSquare,
  Award,
  DollarSign,
  FolderOpen,
  UserCheck,
  ShieldCheck,
  Layers,
  CreditCard,
  ClipboardList,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context';
import { Avatar, Badge, Dropdown, LanguageSwitcher } from '@/components/ui';
import type { DropdownItem } from '@/components/ui';
import { cn, getTimeAgo } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  title?: string;
  items: NavItem[];
}

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('hlms_sidebar_collapsed');
    return saved === 'true';
  });
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const { t, language } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem('hlms_sidebar_collapsed', String(newValue));
  };

  const studentNavGroups = useMemo((): NavGroup[] => [
    {
      items: [
        { label: t.nav.dashboard, href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: t.nav.myCourses, href: '/my-courses', icon: <BookOpen className="w-5 h-5" /> },
        { label: language === 'id' ? 'Kelas Saya' : 'My Classes', href: '/my-classes', icon: <Users className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Pembelajaran' : 'Learning',
      items: [
        { label: language === 'id' ? 'Tugas' : 'Assignments', href: '/assignments', icon: <ClipboardList className="w-5 h-5" />, badge: 3 },
        { label: language === 'id' ? 'Forum Diskusi' : 'Discussion Forum', href: '/discussions', icon: <MessageSquare className="w-5 h-5" /> },
        { label: t.course.certificate, href: '/certificates', icon: <Award className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Gamifikasi' : 'Gamification',
      items: [
        { label: t.gamification.leaderboard, href: '/leaderboard', icon: <BarChart3 className="w-5 h-5" /> },
        { label: t.gamification.myBadges, href: '/badges', icon: <Award className="w-5 h-5" /> },
      ],
    },
  ], [t, language]);

  const instructorNavGroups = useMemo((): NavGroup[] => [
    {
      items: [
        { label: t.nav.dashboard, href: '/instructor', icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: t.nav.myCourses, href: '/instructor/courses', icon: <BookOpen className="w-5 h-5" /> },
        { label: language === 'id' ? 'Kelas' : 'Classes', href: '/instructor/classes', icon: <FolderOpen className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Manajemen' : 'Management',
      items: [
        { label: language === 'id' ? 'Siswa' : 'Students', href: '/instructor/students', icon: <Users className="w-5 h-5" /> },
        { label: language === 'id' ? 'Penilaian' : 'Grading', href: '/instructor/grading', icon: <FileText className="w-5 h-5" />, badge: 5 },
        { label: language === 'id' ? 'Diskusi' : 'Discussion', href: '/discussions', icon: <MessageSquare className="w-5 h-5" />, badge: 12 },
      ],
    },
    {
      title: language === 'id' ? 'Keuangan' : 'Finance',
      items: [
        { label: language === 'id' ? 'Pendapatan' : 'Earnings', href: '/instructor/earnings', icon: <DollarSign className="w-5 h-5" /> },
        { label: language === 'id' ? 'Penarikan' : 'Payouts', href: '/instructor/payouts', icon: <CreditCard className="w-5 h-5" /> },
      ],
    },
  ], [t, language]);

  const adminNavGroups = useMemo((): NavGroup[] => [
    {
      items: [
        { label: t.nav.dashboard, href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Manajemen' : 'Management',
      items: [
        { label: language === 'id' ? 'Pengguna' : 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
        { label: language === 'id' ? 'Instruktur' : 'Instructors', href: '/admin/instructors', icon: <UserCheck className="w-5 h-5" />, badge: 8 },
        { label: t.course.courses, href: '/admin/courses', icon: <BookOpen className="w-5 h-5" /> },
        { label: t.footer.categories, href: '/admin/categories', icon: <FolderOpen className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Keuangan' : 'Finance',
      items: [
        { label: language === 'id' ? 'Transaksi' : 'Transactions', href: '/admin/transactions', icon: <CreditCard className="w-5 h-5" /> },
        { label: language === 'id' ? 'Pembayaran Instruktur' : 'Instructor Payouts', href: '/admin/payouts', icon: <DollarSign className="w-5 h-5" /> },
        { label: language === 'id' ? 'Pengaturan Komisi' : 'Commission Settings', href: '/admin/commission', icon: <Layers className="w-5 h-5" /> },
      ],
    },
    {
      title: language === 'id' ? 'Platform' : 'Platform',
      items: [
        { label: t.nav.settings, href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
        { label: language === 'id' ? 'Moderasi' : 'Moderation', href: '/admin/moderation', icon: <ShieldCheck className="w-5 h-5" /> },
      ],
    },
  ], [t, language]);

  const navGroups = useMemo((): NavGroup[] => {
    switch (user?.role) {
      case 'admin':
        return adminNavGroups;
      case 'instructor':
        return instructorNavGroups;
      default:
        return studentNavGroups;
    }
  }, [user?.role, adminNavGroups, instructorNavGroups, studentNavGroups]);

  const userMenuItems: DropdownItem[] = [
    {
      label: t.nav.home,
      icon: <BookOpen className="w-4 h-4" />,
      onClick: () => navigate('/'),
    },
    {
      label: t.nav.profile,
      icon: <Users className="w-4 h-4" />,
      onClick: () => navigate('/profile'),
    },
    {
      label: t.nav.settings,
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    { divider: true, label: '' },
    {
      label: t.nav.logout,
      icon: <LogOut className="w-4 h-4" />,
      onClick: () => {
        logout();
        navigate('/');
      },
      danger: true,
    },
  ];

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'admin':
        return 'Administrator';
      case 'instructor':
        return language === 'id' ? 'Instruktur' : 'Instructor';
      default:
        return language === 'id' ? 'Siswa' : 'Student';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-gray-900/50 lg:hidden transition-opacity',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Mobile Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 lg:hidden',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">MOLANG</span>
          </Link>
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-6 overflow-y-auto h-[calc(100vh-4rem)] p-4">
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href} className="relative">
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center rounded-lg text-sm font-medium transition-colors gap-3 px-3 py-2.5',
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                      >
                        <span className={cn(
                          'flex-shrink-0',
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                        )}>
                          {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && item.badge > 0 && (
                          <Badge variant="danger" size="sm">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {/* Language Switcher */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <LanguageSwitcher variant="full" />
          </div>
        </nav>
      </aside>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:block fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="text-lg font-bold text-gray-900 dark:text-white">MOLANG</span>
            )}
          </Link>
          <button
            aria-label="Close sidebar"
            onClick={() => setSidebarOpen(false)}
            className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className={cn(
          'space-y-6 overflow-y-auto h-[calc(100vh-4rem)]',
          sidebarCollapsed ? 'p-2' : 'p-4'
        )}>
          {navGroups.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.title && !sidebarCollapsed && (
                <h3 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  {group.title}
                </h3>
              )}
              {group.title && sidebarCollapsed && (
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
              )}
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <li key={item.href} className="relative">
                      <Link
                        to={item.href}
                        title={sidebarCollapsed ? item.label : undefined}
                        className={cn(
                          'flex items-center rounded-lg text-sm font-medium transition-colors',
                          sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-2.5',
                          isActive
                            ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                        )}
                      >
                        <span className={cn(
                          'flex-shrink-0',
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                        )}>
                          {item.icon}
                        </span>
                        {!sidebarCollapsed && (
                          <>
                            <span className="flex-1">{item.label}</span>
                            {item.badge && item.badge > 0 && (
                              <Badge variant="danger" size="sm">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                      {sidebarCollapsed && item.badge && item.badge > 0 && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
          {/* Language Switcher */}
          {!sidebarCollapsed && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <LanguageSwitcher variant="full" />
            </div>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <div className={cn(
        'transition-all duration-300',
        sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
      )}>
        {/* Header */}
        <header className="sticky top-0 z-30 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-full px-4 lg:px-6">
            {/* Mobile menu button */}
            <button
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            {/* Desktop sidebar toggle */}
            <button
              aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={toggleSidebarCollapse}
              className="hidden lg:flex p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <PanelLeftClose className="w-5 h-5 text-gray-600" />
              )}
            </button>

            {/* Spacer to push profile to the right */}
            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-600" />
                )}
              </button>

              {/* Notifications */}
              <Dropdown
                trigger={
                  <button aria-label="Notifications" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-medium rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                }
                align="right"
                contentClassName="w-80"
              >
                <div className="max-h-96 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-gray-100 bg-white">
                    <h3 className="font-semibold text-gray-900">{t.nav.notifications}</h3>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      {t.messages.noNotifications}
                    </div>
                  ) : (
                    <div>
                      {notifications.slice(0, 5).map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.link) navigate(notification.link);
                          }}
                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0 ${!notification.isRead ? 'bg-blue-50' : ''
                            }`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                          <p className="text-sm text-gray-500 line-clamp-1">{notification.message}</p>
                          <p className="text-xs text-gray-400 mt-1">{getTimeAgo(notification.createdAt)}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Dropdown>

              {/* User Menu */}
              <Dropdown
                trigger={
                  <button className="flex items-center gap-3 p-1.5 hover:bg-gray-100 rounded-lg">
                    <Avatar src={user?.avatar} name={user?.name || 'User'} size="sm" />
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{getRoleLabel()}</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gray-500 hidden sm:block" />
                  </button>
                }
                items={userMenuItems}
              />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
