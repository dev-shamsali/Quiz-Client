'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { logout, getMe } from '../../store/slices/authSlice';
import {
  LayoutDashboard, PlayCircle, History, Brain, LogOut,
  Shield, BookOpen, Users, BarChart3, Settings, Menu, X, ScrollText,
} from 'lucide-react';
import toast from 'react-hot-toast';

const studentNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/quiz', icon: PlayCircle, label: 'Take Quiz' },
  { href: '/history', icon: History, label: 'My Attempts' },
  { href: '/reports', icon: Brain, label: 'AI Reports' },
];

const adminNav = [
  { href: '/admin', icon: BarChart3, label: 'Analytics' },
  { href: '/admin/settings', icon: Settings, label: 'Quiz Control' },
  { href: '/admin/questions', icon: BookOpen, label: 'Questions' },
  { href: '/admin/students', icon: Users, label: 'Students' },
  { href: '/admin/logs', icon: ScrollText, label: 'Logs' },
];

export default function DashboardLayout({ children }) {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, initializing } = useSelector((s) => s.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
  if (isAuthenticated && !user) dispatch(getMe());
}, []);
  useEffect(() => { if (!initializing && !isAuthenticated) router.replace('/login'); }, [initializing, isAuthenticated]);
  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    await dispatch(logout());
    toast.success('Signed out successfully');
    router.push('/');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full" />
      </div>
    );
  }

  const nav = user?.role === 'admin' ? adminNav : studentNav;

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-ink h-14 flex items-center px-4 justify-between border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-cream flex items-center justify-center font-black text-lg text-ink">A</div>
          <span className="text-cream text-sm font-bold tracking-widest">ALLIANCE</span>
        </Link>
        <button onClick={() => setSidebarOpen((o) => !o)} className="text-cream p-1.5 -mr-1">
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 bg-ink flex flex-col z-50 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-cream flex items-center justify-center font-black text-xl text-ink">A</div>
            <div>
              <div className="text-cream text-sm font-bold tracking-widest">ALLIANCE</div>
              <div className="text-white/30 text-xs tracking-widest">QUIZ AI</div>
            </div>
          </Link>
        </div>

        {user?.role === 'admin' && (
          <div className="mx-4 mt-4 flex items-center gap-2 px-3 py-2 border border-white/20">
            <Shield size={11} className="text-yellow-400" />
            <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">Administrator</span>
          </div>
        )}

        <nav className="flex-1 p-4 mt-2 space-y-0.5">
          {nav.map(({ href, icon: Icon, label }) => {
            const isActive = pathname === href || (href !== '/dashboard' && href !== '/admin' && pathname.startsWith(href));
            return (
              <Link key={href} href={href} className={`sidebar-link ${isActive ? 'active' : ''}`}>
                <Icon size={15} />{label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 bg-cream flex items-center justify-center font-bold text-sm text-ink flex-shrink-0">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-white/30 text-xs capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut size={14} />Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 min-h-screen pt-14 lg:pt-0">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="p-4 sm:p-6 lg:p-8">
          {children}
        </motion.div>
      </main>
    </div>
  );
}