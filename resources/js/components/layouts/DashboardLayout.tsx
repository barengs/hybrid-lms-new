import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu as MenuIcon,
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
import { useGetInstructorDashboardQuery } from '@/store/features/instructor/instructorApiSlice';
import { useGetMenusQuery } from '@/store/api/menuApiSlice';
import type { MenuItem } from '@/store/api/menuApiSlice';

// Icon mapper for dynamic menus
const SidebarIcon = ({ name, className }: { name: string | null; className?: string }) => {
  if (!name) return <BookOpen className={className} />;
  const IconComponent = (LucideIcons as any)[name];
  return IconComponent ? <IconComponent className={className} /> : <BookOpen className={className} />;
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  permission?: string;
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

  // Helper to check permission
  const can = (permission?: string) => {
    if (!permission) return true;
    if (user?.role === 'admin' && !user.permissions) return true; // Fallback for old admin without permissions array
    return user?.permissions?.includes(permission);
  };

  // API Stats for Badges
  const { data: dashboardData } = useGetInstructorDashboardQuery(undefined, {
    skip: user?.role !== 'instructor',
    pollingInterval: 30000, // Refresh every 30s
  });

  const toggleSidebarCollapse = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem('hlms_sidebar_collapsed', String(newValue));
  };

  // API for Dynamic Menus
  const { data: menuResponse, isLoading: menuLoading } = useGetMenusQuery();

  const navGroups = useMemo((): NavGroup[] => {
    if (!menuResponse?.data) return [];

    return menuResponse.data.map((group: MenuItem) => ({
      title: language === 'id' ? group.label_id : group.label_en,
      items: (group.children || []).map((item: MenuItem) => ({
        label: language === 'id' ? item.label_id : item.label_en,
        href: item.route || '#',
        permission: item.permission_name || undefined,
        icon: <SidebarIcon name={item.icon} className="w-5 h-5" />,
        badge: item.key === 'instructor_grading' ? (dashboardData?.actions?.pending_grading || 0) : 
               item.key === 'instructor_discussions' ? (dashboardData?.actions?.unanswered_questions || 0) : undefined
      }))
    }));
  }, [menuResponse, language, dashboardData]);

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
              <MenuIcon className="w-6 h-6 text-gray-600" />
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
