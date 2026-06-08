'use client';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { register, clearError } from '../../../store/slices/authSlice';
import { Loader2, ArrowRight, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '' });
  const [done, setDone] = useState(false);

  useEffect(() => { if (error) { toast.error(error); dispatch(clearError()); } }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(register(form)).then((res) => {
      if (!res.error) {
        setDone(true);
        toast.success('Registration successful! Check your email for credentials.');
      }
    });
  };

  if (done) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="card max-w-md w-full p-12 text-center">
          <div className="w-16 h-16 bg-ink flex items-center justify-center mx-auto mb-6">
            <Mail size={28} className="text-cream" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Check Your Email</h2>
          <p className="text-ink-muted text-sm leading-relaxed mb-8">
            Your login credentials have been sent to <strong>{form.email}</strong>. Use them to sign in.
          </p>
          <Link href="/login" className="btn-primary w-full py-3 text-base block text-center">
            Go to Sign In
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left panel */}
      <motion.div initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between bg-ink w-5/12 p-16">
        <div>
          <Link href="/" className="flex items-center gap-3 mb-20">
            <div className="w-10 h-10 bg-cream flex items-center justify-center font-black text-2xl text-ink">A</div>
            <span className="text-cream text-lg font-bold tracking-widest">ALLIANCE QUIZ AI</span>
          </Link>
          <h1 className="text-cream text-4xl font-bold leading-tight mb-6">Join the<br />Platform.</h1>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Register with your name and email. We will generate secure credentials and send them directly to your inbox.
          </p>
          <div className="space-y-4">
            {['Enter your name and email', 'We generate a secure password', 'Credentials sent to your inbox', 'Sign in and begin your assessment'].map((step, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-7 h-7 border border-white/30 flex items-center justify-center text-white/50 text-xs font-bold flex-shrink-0">{i + 1}</div>
                <span className="text-white/60 text-sm">{step}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/30 text-sm">© 2025 Alliance Quiz AI</p>
      </motion.div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md">
          <Link href="/" className="flex lg:hidden items-center gap-2 mb-10">
            <div className="w-9 h-9 bg-ink flex items-center justify-center font-black text-cream text-lg">A</div>
            <span className="font-bold tracking-widest text-sm">ALLIANCE QUIZ AI</span>
          </Link>

          <h2 className="text-3xl font-bold mb-2">Create Account</h2>
          <p className="text-ink-light mb-10 text-sm">Your password will be emailed to you automatically</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Full Name</label>
              <input type="text" required className="input" placeholder="Your full name"
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                suppressHydrationWarning />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest mb-2">Email Address</label>
              <input type="email" required autoComplete="email" className="input"
                placeholder="you@example.com" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                suppressHydrationWarning />
            </div>

            <div className="p-4 border border-black/20 bg-cream-dark">
              <p className="text-xs text-ink-muted leading-relaxed">
                A secure password will be auto-generated and sent to the email above. Keep it safe — you will need it to sign in.
              </p>
            </div>

            <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary w-full py-3 text-base" suppressHydrationWarning>
              {loading
                ? <><Loader2 size={16} className="animate-spin" /> Creating account…</>
                : <><span>Register & Send Credentials</span><ArrowRight size={16} /></>}
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t-2 border-black/10 text-center">
            <p className="text-sm text-ink-muted">
              Already registered?{' '}
              <Link href="/login" className="font-bold underline hover:no-underline">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
