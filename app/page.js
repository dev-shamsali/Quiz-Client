'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Brain, Shield, Award, Clock, Users } from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 32 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

const features = [
  { icon: Brain, title: 'AI Performance Reports', desc: 'Receive a Gemini AI analysis with score (1–10), detailed feedback, and a personalised learning roadmap after each attempt.' },
  { icon: Shield, title: 'Strict Proctoring', desc: 'Tab switching, window minimisation, or screen exits automatically terminate the quiz to ensure academic integrity.' },
  { icon: BookOpen, title: 'Curated Question Bank', desc: '150 industry-grade MERN Stack questions across easy, moderate, and hard difficulty levels.' },
  { icon: Clock, title: 'Timed Assessment', desc: 'Each quiz is timed. The countdown is always visible so you can manage your pace effectively.' },
  { icon: Award, title: 'Live Rankings', desc: 'Administrators view full leaderboards and student performance analytics at a glance.' },
  { icon: Users, title: 'Admin Control Panel', desc: 'Administrators control quiz scheduling, report downloads, question management, and student oversight.' },
];

export default function HomePage() {
  return (
    <div className="bg-cream min-h-screen">
      {/* Nav */}
      <nav className="bg-ink border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-cream flex items-center justify-center font-black text-lg sm:text-xl text-ink">A</div>
            <span className="text-cream text-sm sm:text-lg font-bold tracking-widest">
              <span className="hidden sm:inline">ALLIANCE QUIZ AI</span>
              <span className="sm:hidden">ALLIANCE</span>
            </span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/login" className="text-cream border-2 border-cream px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-cream hover:text-ink transition-all">
              Sign In
            </Link>
            <Link href="/register" className="bg-cream text-ink border-2 border-cream px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold hover:bg-cream-dark transition-all">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <motion.section initial="hidden" animate="show" variants={stagger}
        className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24 text-center">
        <motion.div variants={fadeUp}
          className="inline-block border-2 border-ink px-5 py-1.5 text-xs font-bold tracking-widest uppercase mb-8">
          Professional Assessment Platform
        </motion.div>
        <motion.h1 variants={fadeUp}
          style={{ fontSize: 'clamp(2.2rem, 5.5vw, 4rem)', lineHeight: 1.1, letterSpacing: -1, marginBottom: 28, fontWeight: 900 }}>
          Assess Your MERN Stack<br />
          <span style={{ borderBottom: '4px solid #000' }}>Mastery</span> — With AI
        </motion.h1>
        <motion.p variants={fadeUp} className="text-ink-muted text-lg leading-relaxed max-w-xl mx-auto mb-12">
          A proctored, AI-powered quiz platform designed for BVoc students. Demonstrate your skills, receive expert feedback, and track your growth.
        </motion.p>
        <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
          <Link href="/register" className="btn-primary btn-lg text-base">Register Now</Link>
          <Link href="/login" className="btn-secondary btn-lg text-base">Sign In</Link>
        </motion.div>
      </motion.section>

      {/* Stats */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
        className="bg-ink border-y-2 border-ink">
        <div className="max-w-3xl mx-auto grid grid-cols-3 divide-x divide-white/10">
          {[['150+', 'Questions'], ['3', 'Difficulty Levels'], ['AI', 'Powered Reports']].map(([val, label]) => (
            <div key={label} className="py-6 sm:py-8 text-center px-2">
              <div className="text-cream text-2xl sm:text-3xl font-black">{val}</div>
              <div className="text-white/40 text-xs uppercase tracking-widest mt-1 leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-16 text-3xl font-bold">
          Everything You Need to Excel
        </motion.h2>
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(({ icon: Icon, title, desc }) => (
            <motion.div key={title} variants={fadeUp}
              whileHover={{ y: -4, boxShadow: '6px 6px 0 #000' }}
              className="card p-8 transition-all duration-200 cursor-default">
              <div className="w-11 h-11 border-2 border-ink flex items-center justify-center mb-5">
                <Icon size={20} />
              </div>
              <h3 className="text-lg font-bold mb-3">{title}</h3>
              <p className="text-ink-muted text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        className="max-w-3xl mx-auto px-4 sm:px-6 mb-12 sm:mb-24">
        <div className="bg-ink p-8 sm:p-16 text-center" style={{ boxShadow: '8px 8px 0 #000' }}>
          <h2 className="text-cream text-3xl font-bold mb-4">Ready to Prove Your Skills?</h2>
          <p className="text-white/50 text-base leading-relaxed mb-10">
            Register now. Your login credentials will be sent directly to your email address.
          </p>
          <Link href="/register"
            className="inline-block bg-cream text-ink border-2 border-cream px-12 py-4 font-bold text-base hover:bg-cream-dark transition-all">
            Create Your Account
          </Link>
        </div>
      </motion.section>

      <footer className="border-t-2 border-ink py-6 text-center text-ink-light text-sm">
        © 2025 Alliance Quiz AI — Professional Assessment Platform
      </footer>
    </div>
  );
}
