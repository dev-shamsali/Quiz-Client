'use client';
import { useEffect, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { getMyReports, getReport, generateReport } from '../../store/slices/reportSlice';
import { fetchSettings } from '../../store/slices/settingsSlice';
import {
  Brain, CheckCircle2, XCircle, ChevronRight, Loader2, Download,
  TrendingUp, Target, Map, Zap, BarChart2, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';

const barColor = (pct) =>
  pct >= 70 ? 'bg-green-700' : pct >= 40 ? 'bg-yellow-600' : 'bg-red-700';

function ScoreRing({ score }) {
  const pct = (score / 10) * 100;
  const circumference = 2 * Math.PI * 40;
  const dash = (pct / 100) * circumference;
  const color = score >= 7 ? '#15803d' : score >= 5 ? '#92400e' : score >= 3 ? '#b45309' : '#b91c1c';
  return (
    <div className="relative w-28 h-28 flex items-center justify-center flex-shrink-0">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
        <motion.circle cx="50" cy="50" r="40" fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.2, ease: 'easeOut' }} />
      </svg>
      <div className="text-center z-10">
        <div className="text-3xl font-black leading-none" style={{ color }}>{score}</div>
        <div className="text-xs text-ink-muted font-bold">/10</div>
      </div>
    </div>
  );
}

function ReportView({ report }) {
  const { analysis } = report;
  const scoreLabel = analysis.score >= 9 ? 'Excellent' : analysis.score >= 7 ? 'Good'
    : analysis.score >= 5 ? 'Average' : analysis.score >= 3 ? 'Below Average' : 'Needs Work';

  return (
    <div id="print-report" className="space-y-5">
      {/* Score Header */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="font-bold flex items-center gap-2"><Brain size={16} /> AI Performance Report</h2>
          <span className="text-xs text-ink-light uppercase tracking-widest">Powered by Gemini AI</span>
        </div>
        <div className="card-body">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            <ScoreRing score={analysis.score} />
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-5xl font-black">{analysis.score}</span>
                <div>
                  <div className="text-sm text-ink-muted font-bold">out of 10</div>
                  <div className="text-xl font-black">{scoreLabel}</div>
                </div>
              </div>
              <div className="h-2 bg-ink/10 w-full mb-3">
                <motion.div className="h-full bg-ink" initial={{ width: 0 }}
                  animate={{ width: `${(analysis.score / 10) * 100}%` }} transition={{ duration: 1 }} />
              </div>
              {analysis.feedback && (
                <p className="text-sm text-ink-muted leading-relaxed border-l-4 border-ink pl-3 italic">
                  {analysis.feedback}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid md:grid-cols-2 gap-4">
        <div className="p-5 border-2 border-green-700 bg-green-50">
          <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2 text-sm">
            <CheckCircle2 size={14} /> Strengths
          </h4>
          {analysis.strengths?.map((s, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-green-700 font-black text-sm mt-0.5 flex-shrink-0">✓</span>
              <p className="text-sm text-green-800 leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
        <div className="p-5 border-2 border-red-700 bg-red-50">
          <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2 text-sm">
            <XCircle size={14} /> Weaknesses
          </h4>
          {analysis.weaknesses?.map((w, i) => (
            <div key={i} className="flex gap-2 mb-2">
              <span className="text-red-700 font-black text-sm mt-0.5 flex-shrink-0">✗</span>
              <p className="text-sm text-red-800 leading-relaxed">{w}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Evaluation */}
      {analysis.overallFeedback && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <TrendingUp size={15} /><h4 className="font-bold">Detailed Evaluation</h4>
          </div>
          <div className="card-body">
            <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">{analysis.overallFeedback}</p>
          </div>
        </div>
      )}

      {/* Category Performance */}
      {analysis.categoryPerformance?.length > 0 && (
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <BarChart2 size={15} /><h4 className="font-bold">Category Performance</h4>
          </div>
          <div className="card-body space-y-4">
            {analysis.categoryPerformance.map((c, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold">{c.category}</span>
                  <span className="text-sm font-black">{c.score}%</span>
                </div>
                <div className="h-2 bg-ink/10 mb-1">
                  <motion.div className={`h-full ${barColor(c.score)}`}
                    initial={{ width: 0 }} animate={{ width: `${c.score}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07 }} />
                </div>
                {c.recommendation && (
                  <p className="text-xs text-ink-muted mt-1">{c.recommendation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Areas to Improve */}
      {analysis.areasToImprove?.length > 0 && (
        <div className="p-5 border border-ink/20">
          <h4 className="font-bold mb-3 flex items-center gap-2 text-sm"><Target size={14} /> Areas to Improve</h4>
          <div className="grid sm:grid-cols-2 gap-2">
            {analysis.areasToImprove.map((a, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="font-black text-ink text-sm mt-0.5 flex-shrink-0">{i + 1}.</span>
                <p className="text-sm text-ink-muted">{a}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Learning Roadmap */}
      <div className="card" style={{ background: '#F5F3E4' }}>
        <div className="card-header flex items-center gap-2">
          <Map size={15} /><h4 className="font-bold">Learning Roadmap</h4>
        </div>
        <div className="card-body space-y-0">
          {analysis.learningRoadmap?.map((step, i) => (
            <div key={i} className="flex gap-4 py-3 border-b border-ink/10 last:border-0">
              <div className="w-8 h-8 bg-ink text-cream flex items-center justify-center font-black text-sm flex-shrink-0">
                {i + 1}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed pt-1">{step}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Next Steps */}
      {analysis.nextSteps?.length > 0 && (
        <div className="p-5 border-2 border-ink" style={{ background: '#F5F3E4' }}>
          <h4 className="font-bold mb-4 flex items-center gap-2 text-sm"><Zap size={14} /> Immediate Next Steps</h4>
          {analysis.nextSteps.map((s, i) => (
            <div key={i} className="flex items-start gap-3 mb-4 last:mb-0">
              <div className="w-6 h-6 bg-ink text-cream flex items-center justify-center font-black text-xs flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ReportsContent() {
  const dispatch = useDispatch();
  const params = useSearchParams();
  const attemptId = params.get('id');
  const { reports, current, loading, generating } = useSelector((s) => s.report);
  const { settings } = useSelector((s) => s.settings);

  useEffect(() => {
    dispatch(fetchSettings());
    dispatch(getMyReports());
    if (attemptId) dispatch(getReport(attemptId));
  }, [attemptId]);

  const handleDownload = () => {
    if (!settings?.reportDownloadAllowed) {
      toast.error('Report download is not yet enabled by the administrator.');
      return;
    }
    window.print();
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 no-print">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Brain size={22} /> AI Reports</h1>
            <p className="text-ink-muted mt-1 text-sm">Gemini AI analysis of your quiz performances</p>
          </div>
          {current && (
            <motion.button whileTap={{ scale: 0.97 }} onClick={handleDownload}
              className={`no-print self-start sm:self-auto ${settings?.reportDownloadAllowed ? 'btn-primary' : 'btn-secondary opacity-60'}`}
              title={!settings?.reportDownloadAllowed ? 'Download not yet enabled by admin' : undefined}>
              <Download size={14} />
              {settings?.reportDownloadAllowed ? 'Download PDF' : 'Download (Locked)'}
            </motion.button>
          )}
        </motion.div>

        {generating && (
          <div className="card card-body text-center py-10 mb-6">
            <Loader2 size={30} className="animate-spin text-ink mx-auto mb-3" />
            <p className="font-bold">Gemini AI is analysing your performance…</p>
            <p className="text-ink-muted text-sm mt-1">Analysing wrong answers and generating personalised insights…</p>
          </div>
        )}

        {current && !generating && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <ReportView report={current} />
          </motion.div>
        )}

        {/* All Reports list */}
        <div className="card no-print">
          <div className="card-header"><h2 className="font-bold">All Reports</h2></div>
          {loading ? (
            <div className="p-8 text-center"><Loader2 size={20} className="animate-spin text-ink-light mx-auto" /></div>
          ) : reports.length === 0 ? (
            <div className="p-14 text-center">
              <Brain size={36} className="text-ink-faint mx-auto mb-3" />
              <p className="text-ink-muted mb-1">No reports yet.</p>
              <p className="text-xs text-ink-faint mb-5">Complete a quiz then generate your AI report from the results page.</p>
              <Link href="/quiz" className="btn-primary inline-block">Take Quiz</Link>
            </div>
          ) : (
            reports.map((r) => (
              <Link key={r._id} href={`/reports?id=${r.attempt?._id}`}
                className="flex items-center justify-between px-6 py-4 border-b border-ink/10 hover:bg-cream-dark transition-colors last:border-0">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold">{r.attempt?.percentage}%</p>
                    <span className="text-xs text-ink-muted">({r.attempt?.grade})</span>
                    {r.attempt?.status === 'abandoned' && (
                      <span className="text-xs text-red-600 flex items-center gap-1 ml-1">
                        <AlertTriangle size={10} /> Violation
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-ink-light">
                    {new Date(r.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-2xl font-black">{r.analysis?.score}</div>
                    <div className="text-xs text-ink-muted font-bold">/10</div>
                  </div>
                  <ChevronRight size={16} className="text-ink-faint" />
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ReportsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-ink border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ReportsContent />
    </Suspense>
  );
}
