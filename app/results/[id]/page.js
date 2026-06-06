'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import { getAttemptById, resetQuiz } from '../../../store/slices/quizSlice';
import { generateReport } from '../../../store/slices/reportSlice';
import { Trophy, CheckCircle2, XCircle, Brain, RotateCcw, ChevronDown, ChevronUp, PenLine } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ResultsPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { selectedAttempt: attempt, loading } = useSelector((s) => s.quiz);
  const { generating, current: report } = useSelector((s) => s.report);
  const [expanded, setExpanded] = useState({});

  useEffect(() => { dispatch(getAttemptById(id)); dispatch(resetQuiz()); }, [id]);

  const handleGenerateReport = () => {
    dispatch(generateReport(id)).then((res) => {
      if (res.error) toast.error(res.payload || 'Report generation failed');
      else toast.success('AI Report generated!');
    });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }
  if (!attempt) return null;

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="card mb-6 overflow-hidden">
          <div className="bg-ink p-6 sm:p-10 text-center">
            <Trophy size={36} className="mx-auto mb-3 sm:mb-4 text-cream/60" />
            <div className="text-5xl sm:text-7xl font-black text-cream mb-2">{attempt.percentage}%</div>
            <div className="text-lg sm:text-xl font-bold text-cream/70">{attempt.grade} Grade</div>
            <p className="text-cream/40 text-sm mt-2">
              {attempt.correctAnswers} of {attempt.totalQuestions} correct · {Math.floor(attempt.timeTaken / 60)}m {attempt.timeTaken % 60}s
            </p>
          </div>
          <div className="card-body">
            <h3 className="font-bold mb-4">Breakdown by Difficulty</h3>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(attempt.breakdown || {}).map(([diff, data]) => (
                <div key={diff} className={`p-4 text-center border-2 ${
                  diff === 'easy' ? 'border-green-700 bg-green-50'
                  : diff === 'moderate' ? 'border-yellow-700 bg-yellow-50'
                  : 'border-red-700 bg-red-50'}`}>
                  <p className="text-2xl font-black">{data.correct}/{data.total}</p>
                  <p className="text-sm font-semibold capitalize mt-1">{diff}</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {data.total ? Math.round((data.correct / data.total) * 100) : 0}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* AI Report */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card mb-6">
          <div className="card-body">
            {!report && !generating && (
              <div className="text-center py-6">
                <Brain size={36} className="text-ink-light mx-auto mb-3" />
                <h3 className="font-bold mb-1">Get Your AI Performance Report</h3>
                <p className="text-sm text-ink-muted mb-5">
                  Score 1–10, expert feedback & personalised learning roadmap — powered by Gemini AI
                </p>
                <motion.button onClick={handleGenerateReport} whileTap={{ scale: 0.97 }} className="btn-primary">
                  <Brain size={15} /> Generate AI Report
                </motion.button>
              </div>
            )}
            {generating && (
              <div className="text-center py-8">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full mx-auto mb-3" />
                <p className="text-ink-muted font-semibold">Gemini AI is analysing your performance…</p>
              </div>
            )}
            {report && (
              <div>
                <h3 className="font-bold text-lg mb-5 flex items-center gap-2"><Brain size={18} /> AI Performance Report</h3>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 border-2 border-ink bg-cream-dark mb-5 gap-3 sm:gap-0">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-ink-light mb-1">Performance Score</p>
                    <div className="h-2 bg-ink/10 w-full sm:w-48 mt-2">
                      <motion.div className="h-full bg-ink" initial={{ width: 0 }}
                        animate={{ width: `${(report.analysis.score / 10) * 100}%` }} transition={{ duration: 1 }} />
                    </div>
                  </div>
                  <span className="text-4xl sm:text-5xl font-black">
                    {report.analysis.score}<span className="text-xl sm:text-2xl text-ink-muted font-normal">/10</span>
                  </span>
                </div>
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="p-4 border border-green-700 bg-green-50">
                    <h4 className="font-bold text-green-900 mb-2 text-sm">
                      <CheckCircle2 size={13} className="inline mr-1" />Strengths
                    </h4>
                    {report.analysis.strengths?.map((s, i) => (
                      <p key={i} className="text-xs text-green-800 mb-1 leading-relaxed">• {s}</p>
                    ))}
                  </div>
                  <div className="p-4 border border-red-700 bg-red-50">
                    <h4 className="font-bold text-red-900 mb-2 text-sm">
                      <XCircle size={13} className="inline mr-1" />Weaknesses
                    </h4>
                    {report.analysis.weaknesses?.map((w, i) => (
                      <p key={i} className="text-xs text-red-800 mb-1 leading-relaxed">• {w}</p>
                    ))}
                  </div>
                </div>
                {report.analysis.feedback && (
                  <div className="p-4 border-2 border-ink bg-cream-dark mb-4">
                    <h4 className="font-bold text-sm mb-2">Evaluator Feedback</h4>
                    <p className="text-xs text-ink-muted leading-relaxed">{report.analysis.feedback}</p>
                  </div>
                )}
                {report.analysis.areasToImprove?.length > 0 && (
                  <div className="p-4 border border-ink/20 mb-4">
                    <h4 className="font-bold text-sm mb-2">Areas to Improve</h4>
                    {report.analysis.areasToImprove.map((a, i) => (
                      <p key={i} className="text-xs text-ink-muted mb-1">• {a}</p>
                    ))}
                  </div>
                )}
                <div className="p-4 border border-ink/20 bg-cream-dark">
                  <h4 className="font-bold text-sm mb-3">📚 Learning Roadmap</h4>
                  <ol className="space-y-1.5">
                    {report.analysis.learningRoadmap?.map((step, i) => (
                      <li key={i} className="text-xs text-ink-muted flex gap-2">
                        <span className="font-black">{i + 1}.</span>{step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Question Review */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card mb-6">
          <div className="card-header"><h3 className="font-bold">Answer Review</h3></div>
          {attempt.questions?.map((q, i) => {
            const isPS          = q.question?.category === 'Problem Solving' || (!q.selectedAnswer && q.description !== undefined);
            const writtenAnswer = (q.description || '').trim();
            const wasAnswered   = isPS ? !!writtenAnswer : !!q.selectedAnswer;

            return (
              <div key={i} className="px-6 py-4 border-b border-ink/10 last:border-0">
                <div className="flex items-start gap-3">

                  {/* Left icon */}
                  <div className={`mt-0.5 flex-shrink-0 ${
                    !wasAnswered ? 'text-gray-400'
                    : q.isCorrect ? 'text-green-700'
                    : 'text-red-700'}`}>
                    {q.isCorrect
                      ? <CheckCircle2 size={17} />
                      : <XCircle size={17} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-ink-light">Q{i + 1}</span>
                      <span className={`badge badge-${q.difficulty}`}>{q.difficulty}</span>
                      {isPS && (
                        <span className="px-1.5 py-0.5 text-xs font-bold border border-purple-700 text-purple-800 bg-purple-50">
                          Problem Solving
                        </span>
                      )}
                    </div>

                    <p className="text-sm font-semibold mb-2">{q.question?.question}</p>
                    {q.question?.codeSnippet && (
                      <pre className="code-block text-xs mb-2">{q.question.codeSnippet}</pre>
                    )}

                    {isPS ? (
                      /* ── Problem Solving ── */
                      <div className="mb-2 space-y-2">

                        {!wasAnswered ? (
                          /* UNANSWERED */
                          <>
                            <span className="px-2 py-0.5 border border-gray-400 text-gray-600 bg-gray-50 text-xs inline-block">
                              Unanswered
                            </span>
                            {q.correctAnswer && (
                              <div className="border border-green-700 bg-green-50 px-3 py-2">
                                <p className="text-xs font-bold text-green-700 mb-1">Correct: {q.correctAnswer}</p>
                              </div>
                            )}
                          </>
                        ) : q.isCorrect ? (
                          /* CORRECT */
                          <div className="border border-green-700 bg-green-50 px-3 py-2">
                            <p className="text-xs font-bold text-green-700 mb-1 flex items-center gap-1">
                              <PenLine size={11} /> Your answer: {writtenAnswer}
                            </p>
                          </div>
                        ) : (
                          /* INCORRECT */
                          <>
                            <div className="border border-red-700 bg-red-50 px-3 py-2">
                              <p className="text-xs font-bold text-red-700 mb-1 flex items-center gap-1">
                                <PenLine size={11} /> Your answer: {writtenAnswer}
                              </p>
                            </div>
                            {q.correctAnswer && (
                              <div className="border border-green-700 bg-green-50 px-3 py-2">
                                <p className="text-xs font-bold text-green-700 mb-1">Correct: {q.correctAnswer}</p>
                              </div>
                            )}
                          </>
                        )}

                      </div>
                    ) : (
                      /* ── MCQ ── */
                      <div className="flex flex-col gap-2 mb-2 items-start max-w-full">
                        {q.selectedAnswer
                          ? <div className={`px-2 py-1 border text-xs max-w-full break-words ${
                              q.isCorrect
                                ? 'border-green-700 text-green-800 bg-green-50'
                                : 'border-red-700 text-red-800 bg-red-50'}`}>
                              Your answer: {q.selectedAnswer}
                            </div>
                          : <div className="px-2 py-1 border border-gray-400 text-gray-600 bg-gray-50 text-xs max-w-full break-words">
                              Unanswered
                            </div>}
                        {!q.isCorrect && (
                          <div className="px-2 py-1 border border-green-700 text-green-800 bg-green-50 text-xs max-w-full break-words">
                            Correct: {q.correctAnswer}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Explanation */}
                    <button
                      onClick={() => setExpanded((p) => ({ ...p, [i]: !p[i] }))}
                      className="text-xs font-bold text-ink-muted hover:text-ink flex items-center gap-1">
                      {expanded[i]
                        ? <><ChevronUp size={11} />Hide</>
                        : <><ChevronDown size={11} />Explanation</>}
                    </button>
                    {expanded[i] && (
                      <p className="text-xs text-ink-muted mt-2 p-3 bg-cream-dark border border-ink/10 leading-relaxed">
                        {q.question?.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>

        <div className="flex gap-4">
          <Link href="/quiz" className="btn-primary flex-1 py-3 text-center">
            <RotateCcw size={13} className="inline mr-2" />Retake Quiz
          </Link>
          <Link href="/dashboard" className="btn-secondary flex-1 py-3 text-center">Dashboard</Link>
        </div>

      </div>
    </DashboardLayout>
  );
}