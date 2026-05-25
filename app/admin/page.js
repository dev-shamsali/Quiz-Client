'use client';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getAnalytics, getRankings } from '../../store/slices/adminSlice';
import { Users, BookOpen, BarChart3, Trophy, TrendingUp, Medal } from 'lucide-react';

const gradeStyle = {
  'A+': 'border-green-800 bg-green-50 text-green-900',
  A: 'border-blue-800 bg-blue-50 text-blue-900',
  B: 'border-yellow-800 bg-yellow-50 text-yellow-900',
  C: 'border-orange-700 bg-orange-50 text-orange-900',
  D: 'border-red-700 bg-red-50 text-red-900',
  F: 'border-gray-500 bg-gray-50 text-gray-700',
};

const rankMedal = ['🥇', '🥈', '🥉'];

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const { analytics, rankings, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(getAnalytics());
    dispatch(getRankings());
  }, []);

  if (loading || !analytics) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  const { overview, recentAttempts, scoreDistribution, topStudents } = analytics;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-ink-muted mt-1">Platform overview and student performance insights</p>
        </motion.div>

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: 'Total Students', value: overview.totalStudents },
            { icon: BarChart3, label: 'Total Attempts', value: overview.totalAttempts },
            { icon: BookOpen, label: 'Active Questions', value: overview.totalQuestions },
            { icon: TrendingUp, label: 'Average Score', value: `${overview.avgScore}%` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card-sm p-5">
              <Icon size={16} className="mb-3 text-ink-light" />
              <div className="text-2xl font-black">{value}</div>
              <div className="text-xs text-ink-light mt-1 uppercase tracking-wider">{label}</div>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Score Distribution */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
            <div className="card-header"><h2 className="font-bold">Score Distribution</h2></div>
            <div className="card-body space-y-4">
              {scoreDistribution.map(({ _id, count }) => {
                const pct = overview.totalAttempts ? Math.round((count / overview.totalAttempts) * 100) : 0;
                return (
                  <div key={_id}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-bold">{_id}</span>
                      <span className="text-ink-muted text-xs">{count} attempt{count !== 1 ? 's' : ''} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-ink/10">
                      <motion.div className="h-full bg-ink" initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Rankings */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card">
            <div className="card-header flex items-center gap-2">
              <Trophy size={15} />
              <h2 className="font-bold">Student Rankings</h2>
            </div>
            <div>
              {(rankings?.length > 0 ? rankings : topStudents)?.slice(0, 10).map((student, i) => (
                <div key={student._id} className="flex items-center gap-4 px-6 py-3 border-b border-ink/5 last:border-0 hover:bg-cream-dark transition-colors">
                  <div className="w-8 text-center">
                    {i < 3
                      ? <span className="text-lg">{rankMedal[i]}</span>
                      : <span className="text-sm font-black text-ink-muted">{i + 1}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{student.name}</p>
                    <p className="text-xs text-ink-faint">{student.totalAttempts} attempt{student.totalAttempts !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-black">{student.averageScore}%</span>
                  </div>
                </div>
              ))}
              {(!rankings?.length && !topStudents?.length) && (
                <div className="p-10 text-center text-ink-faint text-sm">No student data yet</div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Attempts */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <div className="card-header"><h2 className="font-bold">Recent Attempts</h2></div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-cream-dark border-b border-ink/10">
                <tr>
                  {['Student', 'Email', 'Score', 'Grade', 'Date'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-ink-light uppercase tracking-widest px-6 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentAttempts.map((a, i) => (
                  <motion.tr key={a._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.02 * i }}
                    className="border-b border-ink/5 last:border-0 hover:bg-cream-dark transition-colors">
                    <td className="px-6 py-3 text-sm font-semibold">{a.student?.name}</td>
                    <td className="px-6 py-3 text-sm text-ink-muted">{a.student?.email}</td>
                    <td className="px-6 py-3 text-sm font-black">{a.percentage}%</td>
                    <td className="px-6 py-3">
                      <span className={`badge border ${gradeStyle[a.grade] || 'border-gray-400 text-gray-600'}`}>{a.grade}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-ink-faint">
                      {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {recentAttempts.length === 0 && (
              <div className="p-12 text-center text-ink-faint text-sm">No attempts yet</div>
            )}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
