'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { fetchSettings } from '../../store/slices/settingsSlice';
import { getAttempts } from '../../store/slices/quizSlice';
import { PlayCircle, Clock, BookOpen, Award, Target, Calendar, CheckCircle, XCircle, ChevronDown } from 'lucide-react';

const SYLLABUS = [
  {
    category: 'React.js',
    color: 'border-blue-700 bg-blue-50 text-blue-900',
    dot: 'bg-blue-700',
    topics: ['JSX & Virtual DOM', 'Hooks (useState, useEffect, useRef, useMemo, useCallback)', 'Component Lifecycle', 'Props & State Management', 'Context API', 'React Router', 'Performance Optimisation', 'Error Boundaries', 'Code Splitting & Lazy Loading'],
  },
  {
    category: 'Next.js',
    color: 'border-gray-700 bg-gray-50 text-gray-900',
    dot: 'bg-gray-700',
    topics: ['App Router & Pages Router', 'Server & Client Components', 'Static Generation (SSG)', 'Server-Side Rendering (SSR)', 'Incremental Static Regeneration (ISR)', 'API Routes', 'Middleware & Edge Functions', 'Image Optimisation', 'Metadata & SEO'],
  },
  {
    category: 'Node.js',
    color: 'border-green-700 bg-green-50 text-green-900',
    dot: 'bg-green-700',
    topics: ['Event Loop & Non-blocking I/O', 'Modules (CommonJS & ESM)', 'File System (fs module)', 'Streams & Buffers', 'Async/Await & Promises', 'Child Processes & Worker Threads', 'Cluster & Scaling', 'npm & package.json', 'Environment Variables'],
  },
  {
    category: 'Express.js',
    color: 'border-yellow-700 bg-yellow-50 text-yellow-900',
    dot: 'bg-yellow-700',
    topics: ['Routing & Route Parameters', 'Middleware Pipeline', 'Request & Response Handling', 'Error Handling Middleware', 'REST API Design', 'CORS Configuration', 'API Versioning', 'Rate Limiting', 'Request Validation'],
  },
  {
    category: 'MongoDB',
    color: 'border-emerald-700 bg-emerald-50 text-emerald-900',
    dot: 'bg-emerald-700',
    topics: ['CRUD Operations', 'Mongoose Schemas & Models', 'Aggregation Pipeline', 'Indexing & Performance', 'Schema Design Patterns', 'Relationships & Populate', 'Transactions', 'Replica Sets', 'Atlas & Cloud Deployment'],
  },
  {
    category: 'Authentication & Security',
    color: 'border-red-700 bg-red-50 text-red-900',
    dot: 'bg-red-700',
    topics: ['JWT (Access & Refresh Tokens)', 'bcrypt Password Hashing', 'OAuth 2.0 & PKCE', 'Cookie Security (httpOnly, SameSite)', 'RBAC (Role-Based Access Control)', 'CSRF & XSS Prevention', 'NoSQL Injection Protection', 'Rate Limiting', 'HTTPS & Secure Headers'],
  },
  {
    category: 'Problem Solving',
    color: 'border-purple-700 bg-purple-50 text-purple-900',
    dot: 'bg-purple-700',
    topics: ['Array & Object Manipulation', 'Recursion & Memoization', 'Closures & Scope', 'Prototype Chain', 'Event Delegation', 'Debounce & Throttle', 'Sorting & Searching Algorithms', 'Data Structures (Linked List, Tree)', 'Time & Space Complexity'],
  },
  {
    category: 'Debugging',
    color: 'border-orange-700 bg-orange-50 text-orange-900',
    dot: 'bg-orange-700',
    topics: ['React Error Boundaries & Hydration Issues', 'Node.js Memory Leak Detection', 'Express Hanging Requests', 'MongoDB Slow Query Analysis', 'CORS Troubleshooting', 'JWT & Auth Debugging', 'Browser DevTools', 'Network & API Debugging', 'Race Conditions & Async Bugs'],
  },
];

const gradeStyle = {
  'A+': 'border-green-800 bg-green-50 text-green-900',
  A: 'border-blue-800 bg-blue-50 text-blue-900',
  B: 'border-yellow-800 bg-yellow-50 text-yellow-900',
  C: 'border-orange-700 bg-orange-50 text-orange-900',
  D: 'border-red-700 bg-red-50 text-red-900',
  F: 'border-gray-500 bg-gray-50 text-gray-700',
};

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const { attempts, loading } = useSelector((s) => s.quiz);
  const { settings } = useSelector((s) => s.settings);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(getAttempts({ limit: 5 }));
  }, []);

  const [expanded, setExpanded] = useState(null);
  const quizDateTime = settings?.quizDateTime ? new Date(settings.quizDateTime) : null;
  const quizOpen = settings?.quizAllowed;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Good day, {user?.name?.split(' ')[0]}.</h1>
          <p className="text-ink-muted mt-1">Here is your assessment overview.</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
          {[
            { icon: Target, label: 'Total Attempts', value: user?.totalAttempts ?? 0 },
            { icon: Award, label: 'Average Score', value: `${user?.averageScore ?? 0}%` },
            { icon: Clock, label: 'Last Attempt', value: attempts[0] ? new Date(attempts[0].createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-sm p-3 sm:p-5">
              <Icon size={14} className="mb-2 sm:mb-3 text-ink-light" />
              <div className="text-lg sm:text-2xl font-black">{value}</div>
              <div className="text-xs text-ink-light mt-1 uppercase tracking-wider leading-tight">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Quiz status row */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="card p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Calendar size={15} className="text-ink-light flex-shrink-0" />
            <div>
              <p className="text-xs text-ink-light uppercase tracking-widest mb-0.5">Quiz Schedule</p>
              {quizDateTime ? (
                <p className="font-bold text-sm">{quizDateTime.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} · {quizDateTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</p>
              ) : (
                <p className="text-sm text-ink-faint italic">No date scheduled yet</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 sm:flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold uppercase tracking-widest ${quizOpen ? 'border-green-700 bg-green-50 text-green-800' : 'border-black/20 bg-cream-dark text-ink-light'}`}>
              {quizOpen ? <CheckCircle size={11} /> : <XCircle size={11} />}
              {quizOpen ? 'Open' : 'Closed'}
            </div>
            {settings?.quizDuration && (
              <span className="text-xs text-ink-muted border border-ink/20 px-2 py-1">{settings.quizDuration} min</span>
            )}
            {quizOpen ? (
              <Link href="/quiz" className="btn-primary py-2 px-5 text-sm">Start Quiz</Link>
            ) : (
              <button disabled className="btn-secondary py-2 px-5 text-sm opacity-50 cursor-not-allowed">Awaiting Admin</button>
            )}
          </div>
        </motion.div>

        {/* Syllabus — categories with expandable topics */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="card mb-8">
          <div className="card-header flex items-center gap-2 flex-wrap">
            <BookOpen size={15} />
            <h2 className="font-bold">{settings?.syllabusTitle || 'Assessment Syllabus'}</h2>
            <span className="ml-auto text-xs text-ink-muted font-normal hidden sm:inline">25 Questions · MERN Stack · 8 Categories</span>
          </div>
          {settings?.syllabusContent && (
            <div className="px-6 pt-4 pb-2 text-sm text-ink-muted leading-relaxed border-b border-ink/10 whitespace-pre-line">
              {settings.syllabusContent}
            </div>
          )}
          <div className="divide-y divide-ink/10">
            {SYLLABUS.map((item, idx) => (
              <div key={item.category}>
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full flex items-center gap-3 px-6 py-4 hover:bg-cream-dark transition-colors text-left">
                  <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${item.dot}`} />
                  <span className="font-bold text-sm flex-1">{item.category}</span>
                  <span className="text-xs text-ink-muted mr-2">{item.topics.length} topics</span>
                  <ChevronDown size={14} className={`text-ink-light transition-transform duration-200 ${expanded === idx ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {expanded === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden">
                      <div className="px-6 pb-4 pt-1">
                        <div className={`border rounded-none p-4 ${item.color}`}>
                          <div className="flex flex-wrap gap-2">
                            {item.topics.map((topic) => (
                              <span key={topic} className={`text-xs font-semibold px-2.5 py-1 border ${item.color}`}>
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
          <div className="px-6 py-3 border-t border-ink/10 bg-cream-dark">
            <p className="text-xs text-ink-muted">
              Distribution: <strong>13 Easy</strong> · <strong>7 Moderate</strong> · <strong>5 Hard</strong> — Questions are randomised and unique per student
            </p>
          </div>
        </motion.div>

        {/* Recent attempts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="font-bold">Recent Attempts</h2>
            <Link href="/history" className="text-xs font-bold underline hover:no-underline">View all</Link>
          </div>
          {loading && <div className="p-10 text-center text-ink-light text-sm">Loading…</div>}
          {!loading && attempts.length === 0 && (
            <div className="p-12 text-center">
              <PlayCircle size={36} className="text-ink-faint mx-auto mb-3" />
              <p className="text-ink-muted font-semibold">No attempts yet</p>
              <p className="text-ink-faint text-xs mt-1">Complete a quiz to see your results</p>
            </div>
          )}
          {attempts.map((a) => (
            <Link key={a._id} href={`/results/${a._id}`}
              className="flex items-center justify-between px-6 py-4 border-b border-black/5 hover:bg-cream-dark transition-colors last:border-0">
              <div>
                <p className="text-sm font-semibold">{a.correctAnswers}/{a.totalQuestions} correct</p>
                <p className="text-xs text-ink-light mt-0.5">
                  {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · '}{Math.floor(a.timeTaken / 60)}m {a.timeTaken % 60}s
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge border ${gradeStyle[a.grade] || 'border-gray-400 text-gray-600'}`}>{a.grade}</span>
                <span className="text-xl font-black">{a.percentage}%</span>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
