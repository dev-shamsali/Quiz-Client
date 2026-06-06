'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAttempts } from '../../store/slices/quizSlice';
import { History, Brain, Eye, ChevronLeft, ChevronRight, Trophy, Loader2 } from 'lucide-react';

const gradeStyle = {
  'A+': 'border-green-800 bg-green-50 text-green-900',
  A: 'border-blue-800 bg-blue-50 text-blue-900',
  B: 'border-yellow-800 bg-yellow-50 text-yellow-900',
  C: 'border-orange-700 bg-orange-50 text-orange-900',
  D: 'border-red-700 bg-red-50 text-red-900',
  F: 'border-gray-500 bg-gray-50 text-gray-700',
};

export default function HistoryPage() {
  const dispatch = useDispatch();
  const { attempts, pagination, loading } = useSelector((s) => s.quiz);

  useEffect(() => { dispatch(getAttempts()); }, []);

  const loadPage = (page) => dispatch(getAttempts({ page, limit: 10 }));

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><History size={24} /> My Attempts</h1>
          <p className="text-ink-muted mt-1">{pagination?.total ?? 0} total attempt{(pagination?.total ?? 0) !== 1 ? 's' : ''}</p>
        </motion.div>

        {loading && (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-ink-light" />
          </div>
        )}

        {!loading && attempts.length === 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-12 sm:p-16 text-center">
            <Trophy size={40} className="text-ink-faint mx-auto mb-4" />
            <h2 className="font-bold text-lg mb-1">No attempts yet</h2>
            <p className="text-ink-muted text-sm mb-6">Take your first quiz to see your history here</p>
            <Link href="/quiz" className="btn-primary inline-block">Start Quiz</Link>
          </motion.div>
        )}

        {attempts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card overflow-hidden">

            {/* Mobile card layout */}
            <div className="sm:hidden divide-y divide-ink/10">
              {attempts.map((attempt, i) => (
                <motion.div key={attempt._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * i }}
                  className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold">
                      {new Date(attempt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`badge border ${gradeStyle[attempt.grade] || 'border-gray-400 text-gray-600'}`}>{attempt.grade}</span>
                      <span className="font-black text-lg">{attempt.percentage}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-ink-muted mb-2">
                    {attempt.correctAnswers}/{attempt.totalQuestions || 25} correct · {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                  </p>
                  <div className="flex gap-1.5 text-xs mb-3 flex-wrap">
                    <span className="px-2 py-0.5 border border-green-700 bg-green-50 text-green-800">E:{attempt.breakdown?.easy?.correct}/{attempt.breakdown?.easy?.total}</span>
                    <span className="px-2 py-0.5 border border-yellow-700 bg-yellow-50 text-yellow-800">M:{attempt.breakdown?.moderate?.correct}/{attempt.breakdown?.moderate?.total}</span>
                    <span className="px-2 py-0.5 border border-red-700 bg-red-50 text-red-800">H:{attempt.breakdown?.hard?.correct}/{attempt.breakdown?.hard?.total}</span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/results/${attempt._id}`}
                      className="flex items-center gap-1.5 px-3 py-1.5 border border-ink/20 hover:border-ink hover:bg-cream-dark text-xs font-semibold transition-colors">
                      <Eye size={12} /> Results
                    </Link>
                    {attempt.reportGenerated && (
                      <Link href={`/reports?id=${attempt._id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-ink/20 hover:border-ink hover:bg-cream-dark text-xs font-semibold transition-colors">
                        <Brain size={12} /> AI Report
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-cream-dark border-b border-ink/10">
                  <tr>
                    {['Date', 'Score', 'Grade', 'Time', 'Breakdown', 'Actions'].map((h) => (
                      <th key={h} className="text-left text-xs font-bold text-ink-light uppercase tracking-widest px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((attempt, i) => (
                    <motion.tr key={attempt._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.03 * i }}
                      className="border-b border-ink/5 last:border-0 hover:bg-cream-dark transition-colors">
                      <td className="px-5 py-4 text-sm font-semibold">
                        {new Date(attempt.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-black text-lg">{attempt.percentage}%</span>
                        <span className="text-ink-faint text-xs ml-1">({attempt.correctAnswers}/{attempt.totalQuestions || 25})</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`badge border ${gradeStyle[attempt.grade] || 'border-gray-400 text-gray-600'}`}>{attempt.grade}</span>
                      </td>
                      <td className="px-5 py-4 text-sm text-ink-muted">
                        {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-1.5 text-xs flex-wrap">
                          <span className="px-2 py-0.5 border border-green-700 bg-green-50 text-green-800">
                            E:{attempt.breakdown?.easy?.correct}/{attempt.breakdown?.easy?.total}
                          </span>
                          <span className="px-2 py-0.5 border border-yellow-700 bg-yellow-50 text-yellow-800 text-xs">
                            M:{attempt.breakdown?.moderate?.correct}/{attempt.breakdown?.moderate?.total}
                          </span>
                          <span className="px-2 py-0.5 border border-red-700 bg-red-50 text-red-800 text-xs">
                            H:{attempt.breakdown?.hard?.correct}/{attempt.breakdown?.hard?.total}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/results/${attempt._id}`}
                            className="p-2 border border-ink/20 hover:border-ink hover:bg-cream-dark transition-colors" title="View Results">
                            <Eye size={14} />
                          </Link>
                          {attempt.reportGenerated && (
                            <Link href={`/reports?id=${attempt._id}`}
                              className="p-2 border border-ink/20 hover:border-ink hover:bg-cream-dark transition-colors" title="AI Report">
                              <Brain size={14} />
                            </Link>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-t border-ink/10">
                <p className="text-sm text-ink-muted">Page {pagination.page} of {pagination.pages}</p>
                <div className="flex gap-2">
                  <button onClick={() => loadPage(pagination.page - 1)} disabled={pagination.page === 1}
                    className="btn-secondary disabled:opacity-40">
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button onClick={() => loadPage(pagination.page + 1)} disabled={pagination.page === pagination.pages}
                    className="btn-secondary disabled:opacity-40">
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
