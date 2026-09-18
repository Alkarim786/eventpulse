import React, { useState, useEffect, useRef } from 'react';
import {
  GraduationCap,
  Sun,
  Moon,
  Bell,
  CheckCircle2,
  AlertTriangle,
  FileText,
  MessageSquare,
  Sparkles,
  Download,
  Share2,
  ShieldCheck,
  UserCheck,
  Building2,
  X,
  LogOut,
  Calendar,
  LogIn,
} from 'lucide-react';
import { db } from '../services/db';
import { NotificationItem, UserRole } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { AuthSession } from '../services/auth';

interface HeaderNavbarProps {
  activeSession: AuthSession | null;
  currentRoleView?: string;
  onChangeRoleView?: (view: string) => void;
  onLogout: () => void;
  onSelectEvent?: (id: number) => void;
  onOpenLoginPage?: () => void;
}

export const HeaderNavbar: React.FC<HeaderNavbarProps> = ({
  activeSession,
  currentRoleView,
  onChangeRoleView,
  onLogout,
  onSelectEvent,
  onOpenLoginPage,
}) => {
  const [isDark, setIsDark] = useState(true);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldDark = savedTheme ? savedTheme === 'dark' : prefersDark;
    setIsDark(shouldDark);
    if (shouldDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  // Load notifications
  useEffect(() => {
    const notifs = db.getNotifications();
    setNotifications(notifs);
  }, [activeSession, currentRoleView]);

  // Click outside to close notifications
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (item: NotificationItem) => {
    db.markNotificationAsRead(item.id);
    setNotifications([...db.getNotifications()]);
    if (item.link && item.link.includes('event-')) {
      const id = parseInt(item.link.split('event-')[1], 10);
      if (id && onSelectEvent) {
        onSelectEvent(id);
      }
    }
    setShowNotifs(false);
  };

  const markAllRead = () => {
    db.markAllNotificationsAsRead();
    setNotifications([...db.getNotifications()]);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo and Brand Identity */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => {
              if (activeSession && onChangeRoleView) {
                onChangeRoleView('main');
              } else if (onOpenLoginPage) {
                onOpenLoginPage();
              }
            }}
            id="brand-logo-button"
          >
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 via-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-900 via-indigo-700 to-violet-700 dark:from-white dark:via-indigo-100 dark:to-indigo-300 bg-clip-text text-transparent">
                  EVENT &amp; KPI HUB
                </span>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  NAAC / NIRF COMPLIANT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Institutional Event Lifecycle &amp; Academic Rubric Automation
              </p>
            </div>
          </div>

          {/* Contextual Role Navigation - Only shown for the logged-in role */}
          {activeSession && onChangeRoleView && (
            <nav className="hidden md:flex items-center gap-1.5 p-1 bg-slate-100/90 dark:bg-slate-900/90 rounded-xl border border-slate-200/70 dark:border-slate-800/80 shadow-inner">
              {activeSession.role === 'STUDENT' && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('main')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'main'
                        ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Feedback &amp; Surveys</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('events')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'events'
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Campus Event Notices</span>
                  </button>
                </>
              )}

              {activeSession.role === 'STAFF_COORDINATOR' && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('main')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'main'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Staff Studio &amp; Wizard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('events')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'events'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Campus Events Directory</span>
                  </button>
                </>
              )}

              {activeSession.role === 'HEAD_ADMIN' && (
                <>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('main')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'main'
                        ? 'bg-gradient-to-r from-indigo-700 to-violet-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Executive IQAC Dashboard</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeRoleView('events')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      currentRoleView === 'events'
                        ? 'bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>All Events &amp; Circulars</span>
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Action Utilities: User Badge, Logout, PWA, Notifications, Theme */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If Logged In: Show User Profile Badge & Logout Button */}
            {activeSession ? (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                  <img
                    src={
                      activeSession.avatarUrl ||
                      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80'
                    }
                    alt={activeSession.name}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-indigo-500/50"
                  />
                  <div className="hidden sm:block text-left leading-none">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                      {activeSession.name.split(' ')[0]}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-medium">
                      {activeSession.role === 'STUDENT'
                        ? activeSession.identifier
                        : activeSession.role === 'STAFF_COORDINATOR'
                        ? `${activeSession.department} Dept`
                        : 'IQAC Head'}
                    </span>
                  </div>
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      activeSession.role === 'STUDENT'
                        ? 'bg-emerald-500'
                        : activeSession.role === 'STAFF_COORDINATOR'
                        ? 'bg-indigo-500'
                        : 'bg-violet-500 animate-pulse'
                    }`}
                  />
                </div>

                {/* Explicit Switch Role / Log Out Button */}
                <button
                  id="btn-switch-role-logout"
                  onClick={onLogout}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 text-xs font-bold transition shadow-xs cursor-pointer"
                  title="Switch Role or Log Out to Central Login Page"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span className="hidden sm:inline">Switch Role</span>
                </button>
              </div>
            ) : (
              /* If Not Logged In (Guest View) */
              onOpenLoginPage && (
                <button
                  id="btn-nav-login"
                  onClick={onOpenLoginPage}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Select Role / Sign In</span>
                </button>
              )
            )}

            {/* PWA Install Button */}
            {!isInstalled && isInstallable && (
              <button
                id="btn-pwa-install-header"
                onClick={install}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/80 hover:bg-indigo-100 transition shadow-xs"
                title="Install PWA Application"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PWA</span>
              </button>
            )}

            {/* Notification Bell Hub */}
            <div className="relative" ref={notifRef}>
              <button
                id="btn-notification-bell"
                onClick={() => setShowNotifs(!showNotifs)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                aria-label="Campus Notification Hub"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Drawer */}
              {showNotifs && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                        Institutional Alert Hub
                      </span>
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No alerts at this time.
                      </div>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition flex items-start gap-3 ${
                            !item.read ? 'bg-indigo-50/40 dark:bg-indigo-950/20' : ''
                          }`}
                        >
                          <div className="mt-0.5">
                            {item.type === 'circular' && (
                              <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            )}
                            {item.type === 'feedback' && (
                              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            )}
                            {item.type === 'audit' && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                            {item.type === 'deadline' && (
                              <Sparkles className="w-4 h-4 text-violet-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                              {item.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 inline-block">
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {!item.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-1 flex-shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark / Light Theme Switcher */}
            <button
              id="btn-theme-switcher"
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              aria-label="Toggle Theme"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

