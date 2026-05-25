'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { login, clearError } from '../../../store/slices/authSlice';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);

  useEffect(() => { if (isAuthenticated) router.replace('/dashboard'); }, [isAuthenticated]);
  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(login(form)).then((res) => {
      if (!res.error) {
        toast.success(`Welcome, ${res.payload.user.name}`);
        router.push(res.payload.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    });
  };

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel — decorative */}
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between bg-ink w-5/12 p-16">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-cream flex items-center justify-center font-black text-2xl text-ink">A</div>
            <span className="text-cream text-lg font-bold tracking-widest">ALLIANCE QUIZ AI</span>
          </Link>
          <h1 className="text-cream text-4xl font-bold leading-tight mb-6">Welcome<br />Back.</h1>
          <p className="text-white/50 text-base leading-relaxed">
            Sign in with the credentials that were sent to your email upon registration.
          </p>
        </div>
        <p className="text-white/30 text-sm">© 2025 Alliance Quiz AI</p>
      </motion.div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-ink flex items-center justify-center font-black text-cream text-lg">A</div>
            <span className="font-bold tracking-widest text-sm">ALLIANCE QUIZ AI</span>
          </Link>

          <h2 className="text-3xl font-bold mb-2">Sign In</h2>
          <p className="text-ink-light mb-10 text-sm">Enter your registered email and password</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" required autoComplete="email" className="input"
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} required autoComplete="current-password"
                  className="input pr-12" placeholder="Your password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-light hover:text-ink">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3 text-base mt-2">
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Signing in…</>
                : <><span>Sign In</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-sm text-ink-muted">
              Not registered?{' '}
              <Link href="/register" className="font-bold underline hover:no-underline">Create an account</Link>
            </p>
          </div>
          <div className="mt-5 p-4 border border-black/20 bg-cream-dark text-center">
            <p className="text-xs text-ink-light"><strong>Admin demo:</strong> admin@devquiz.com / Admin@123</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
