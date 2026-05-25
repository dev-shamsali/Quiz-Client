'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  startQuiz, submitQuiz, selectAnswer, nextQuestion, prevQuestion, goToQuestion, tickTimer,
} from '../../store/slices/quizSlice';
import QuizLayout from '../../components/layout/QuizLayout';
import {
  PlayCircle, ChevronLeft, ChevronRight, Clock, Send, AlertTriangle,
  ShieldAlert, Maximize, BookOpen,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function QuizPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { questions, attemptId, currentIndex, answers, loading, submitting, result, timeLeft } = useSelector((s) => s.quiz);
  const timerRef      = useRef(null);
  const submittedRef  = useRef(false);
  const [started, setStarted]                 = useState(false);
  const [confirmSubmit, setConfirmSubmit]     = useState(false);
  const [violation, setViolation]             = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const TOTAL_TIME = 45 * 60;

  useEffect(() => {
    if (result) router.replace(`/results/${result.attemptId}`);
  }, [result]);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const doSubmit = useCallback((isViolation = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    if (timerRef.current) clearInterval(timerRef.current);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    const timeTaken = TOTAL_TIME - timeLeft;
    const answersArray = (questions || []).map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] || null,
      timeSpent: 0,
    }));
    dispatch(submitQuiz({ attemptId, answers: answersArray, timeTaken, violation: isViolation })).then((res) => {
      if (res.error) toast.error(res.payload || 'Submission failed');
    });
  }, [attemptId, answers, questions, timeLeft, dispatch]);

  useEffect(() => {
    if (started && questions.length > 0 && !result) {
      timerRef.current = setInterval(() => dispatch(tickTimer()), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && started && attemptId) {
      toast.error('Time is up! Submitting…', { duration: 4000 });
      doSubmit(false);
    }
  }, [timeLeft]);

  // STRICT ANTI-CHEAT
  useEffect(() => {
    if (!started || !attemptId) return;

    const handleViolation = (reason) => {
      if (submittedRef.current) return;
      setViolationReason(reason);
      setViolation(true);
      toast.error(`Quiz ended: ${reason}`, { duration: 6000 });
      setTimeout(() => doSubmit(true), 800);
    };

    const onVisibilityChange  = () => { if (document.hidden) handleViolation('Tab switch detected'); };
    const onBlur              = () => handleViolation('Window focus lost');
    const onFullscreenChange  = () => { if (!document.fullscreenElement) handleViolation('Fullscreen exited'); };
    const onBeforeUnload      = (e) => { e.preventDefault(); e.returnValue = ''; handleViolation('Browser close attempted'); };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [started, attemptId, doSubmit]);

  const handleStart = () => {
    dispatch(startQuiz()).then((res) => {
      if (!res.error) {
        setStarted(true);
        submittedRef.current = false;
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        toast.error(res.payload || 'Failed to start quiz');
      }
    });
  };

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const answeredCount = Object.keys(answers).length;

  // ── VIOLATION OVERLAY ──────────────────────────────────────────────────────
  if (violation) {
    return (
      <QuizLayout showHeader={false}>
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="card max-w-md w-full p-10 text-center" style={{ borderColor: '#b91c1c' }}>
            <ShieldAlert size={52} className="mx-auto mb-4 text-red-700" />
            <h2 className="text-2xl font-black mb-3 text-red-800">Quiz Terminated</h2>
            <p className="text-red-700 text-sm font-bold mb-3">{violationReason}</p>
            <p className="text-ink-muted text-sm leading-relaxed mb-4">
              Your quiz was automatically submitted. Tab switching, minimising, exiting fullscreen,
              or losing focus are strictly prohibited.
            </p>
            <p className="text-ink-faint text-xs animate-pulse">Submitting your answers…</p>
          </motion.div>
        </div>
      </QuizLayout>
    );
  }

  // ── PRE-START SCREEN ───────────────────────────────────────────────────────
  if (!started) {
    return (
      <QuizLayout>
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto py-8 px-4 text-center">
          <div className="card p-6 sm:p-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-ink flex items-center justify-center mx-auto mb-6 sm:mb-8">
              <PlayCircle size={32} className="text-cream" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-3">Ready to Begin?</h1>
            <p className="text-ink-muted mb-8 leading-relaxed max-w-md mx-auto">
              25 randomised questions — 13 Easy, 7 Moderate, 5 Hard — from 8 MERN Stack categories.
              Every student receives a unique question set.
            </p>
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {[['⏱', '45 Min', 'Time Limit'], ['📝', '25 Q', 'Questions'], ['🔒', 'Strict', 'Proctored']].map(([e, v, l]) => (
                <div key={l} className="card-sm p-3 sm:p-5 text-center">
                  <div className="text-2xl mb-2">{e}</div>
                  <p className="font-black">{v}</p>
                  <p className="text-xs text-ink-light mt-0.5">{l}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-2 border-red-700 bg-red-50 mb-6 text-left">
              <p className="text-xs font-bold text-red-800 uppercase tracking-widest mb-2 flex items-center gap-2">
                <ShieldAlert size={12} /> Strict Proctoring Active
              </p>
              <ul className="text-xs text-red-700 leading-relaxed space-y-1">
                <li>• Quiz runs in <strong>fullscreen</strong> — exiting fullscreen immediately submits the quiz</li>
                <li>• Switching tabs or minimising the window will <strong>auto-submit</strong> your quiz</li>
                <li>• Violations are flagged and included in your AI performance report</li>
                <li>• Closing the browser during the quiz submits it automatically</li>
              </ul>
            </div>

            <div className="p-4 border border-ink/20 bg-cream-dark mb-8 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-ink-light mb-2 flex items-center gap-2">
                <BookOpen size={11} /> Topics Covered
              </p>
              <p className="text-xs text-ink-muted">React.js · Next.js · Node.js · Express.js · MongoDB · Authentication & Security · Problem Solving · Debugging</p>
            </div>

            <motion.button onClick={handleStart} disabled={loading} whileTap={{ scale: 0.97 }}
              className="btn-primary btn-lg px-10 w-full flex items-center justify-center gap-2">
              <Maximize size={16} />
              {loading ? 'Loading questions…' : 'I Understand — Start Quiz'}
            </motion.button>
          </div>
        </motion.div>
      </QuizLayout>
    );
  }

  if (loading) {
    return (
      <QuizLayout>
        <div className="flex items-center justify-center h-64">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-10 h-10 border-4 border-ink border-t-transparent rounded-full" />
        </div>
      </QuizLayout>
    );
  }

  const question = questions[currentIndex];
  if (!question) return null;

  // ── ACTIVE QUIZ ────────────────────────────────────────────────────────────
  return (
    <QuizLayout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <span className="text-sm font-semibold text-ink-muted flex-shrink-0">Q{currentIndex + 1}/{questions.length}</span>
            <span className={`badge badge-${question.difficulty} flex-shrink-0`}>{question.difficulty}</span>
            <span className="badge border-ink/20 bg-cream-dark text-ink-muted hidden sm:inline-flex truncate">{question.category}</span>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 border-2 font-mono font-black text-sm ${
            timeLeft < 300 ? 'border-red-700 bg-red-50 text-red-700' : 'bg-ink border-ink text-cream'
          }`}>
            <Clock size={12} /> {formatTime(timeLeft)}
          </div>
        </div>

        <div className="h-1 bg-ink/10 mb-5">
          <motion.div className="h-full bg-ink"
            animate={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card mb-4">
            <div className="card-body">
              <p className="text-base font-semibold leading-relaxed mb-5">{question.question}</p>
              {question.codeSnippet && <pre className="code-block mb-5 text-xs">{question.codeSnippet}</pre>}
              <div className="space-y-3">
                {question.options.map((opt, i) => {
                  const sel = answers[question._id] === opt;
                  return (
                    <motion.button key={i} whileTap={{ scale: 0.99 }}
                      onClick={() => dispatch(selectAnswer({ questionId: question._id, answer: opt }))}
                      className={`quiz-option ${sel ? 'selected' : ''}`}>
                      <span className={`inline-flex items-center justify-center w-7 h-7 border-2 text-xs font-black mr-3 flex-shrink-0 ${
                        sel ? 'bg-ink text-cream border-ink' : 'border-ink/30 text-ink-muted'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mb-5">
          <button onClick={() => dispatch(prevQuestion())} disabled={currentIndex === 0} className="btn-secondary">
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm text-ink-muted">{answeredCount}/{questions.length} answered</span>
          {currentIndex < questions.length - 1 ? (
            <button onClick={() => dispatch(nextQuestion())} className="btn-primary">
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmSubmit(true)} className="btn-primary">
              <Send size={13} /> Submit
            </motion.button>
          )}
        </div>

        <div className="card p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-light mb-3">Navigator</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, i) => (
              <button key={i} onClick={() => dispatch(goToQuestion(i))}
                className={`w-8 h-8 text-xs font-bold border-2 transition-all ${
                  i === currentIndex ? 'bg-ink text-cream border-ink'
                  : answers[q._id] ? 'bg-cream-dark border-ink'
                  : 'border-ink/20 text-ink-light hover:border-ink'
                }`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {confirmSubmit && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
                className="card max-w-sm w-full p-8 text-center">
                <AlertTriangle size={40} className="mx-auto mb-4" />
                <h3 className="font-bold text-xl mb-2">Submit Quiz?</h3>
                <p className="text-sm text-ink-muted mb-6 leading-relaxed">
                  You have answered {answeredCount} of {questions.length} questions.
                  {answeredCount < questions.length && ` ${questions.length - answeredCount} unanswered will be marked incorrect.`}
                </p>
                <div className="flex gap-3">
                  <button onClick={() => setConfirmSubmit(false)} className="btn-secondary flex-1">Cancel</button>
                  <button onClick={() => { setConfirmSubmit(false); doSubmit(false); }}
                    disabled={submitting} className="btn-primary flex-1">
                    {submitting ? 'Submitting…' : 'Confirm'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </QuizLayout>
  );
}
