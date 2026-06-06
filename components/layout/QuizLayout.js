'use client';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Brain } from 'lucide-react';

export default function QuizLayout({ children, showHeader = true }) {
  const { user } = useSelector((s) => s.auth);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/login');
  }, [user]);

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {showHeader && (
        <header className="bg-ink text-cream px-6 h-16 flex items-center justify-between no-print border-b-2 border-ink flex-shrink-0">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cream flex items-center justify-center font-black text-lg text-ink">A</div>
            <div>
              <div className="text-cream text-xs font-bold tracking-widest">ALLIANCE</div>
              <div className="text-white/40 text-[10px] tracking-widest">QUIZ AI</div>
            </div>
          </Link>
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-cream flex items-center justify-center font-bold text-sm text-ink">
                {user.name?.[0]?.toUpperCase()}
              </div>
              <span className="text-cream text-sm font-semibold">{user.name}</span>
            </div>
          )}
        </header>
      )}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
