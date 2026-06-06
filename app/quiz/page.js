'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
  startQuiz, submitQuiz, selectAnswer, nextQuestion, prevQuestion,
  goToQuestion, goToSection, tickTimer, tickSectionTimer, advanceSection,
  SECTION_CONFIG, TOTAL_DURATION,
} from '../../store/slices/quizSlice';
import QuizLayout from '../../components/layout/QuizLayout';
import {
  PlayCircle, ChevronLeft, ChevronRight, Clock, Send, AlertTriangle,
  ShieldAlert, Maximize, PenLine, Lock,
} from 'lucide-react';
import toast from 'react-hot-toast';

const logActivity = async (event, reason = '', meta = {}, attemptId = null) => {
  try {
    const sessionId = Cookies.get('sessionId');
    await axios.post('/api/activity-logs', { event, reason, meta, attemptId, sessionId });
  } catch { }
};

const KEY_COMBO_MAP = {
  'Alt+Tab':     'Alt+Tab — switched to another window',
  'Meta+Tab':    'Windows+Tab — opened task view',
  'Meta+d':      'Windows+D — minimised to desktop',
  'Meta+m':      'Windows+M — minimised all windows',
  'Meta+Escape': 'Windows+Esc — exited fullscreen',
  'Alt+F4':      'Alt+F4 — attempted to close window',
  'Escape':      'Escape key — exited fullscreen',
  'F11':         'F11 — toggled fullscreen',
};

const formatTime = (s) => {
  if (s >= 3600) {
    const h   = Math.floor(s / 3600);
    const m   = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
};

const SECTION_COLORS = [
  { bg: 'bg-blue-50',   border: 'border-blue-700',   text: 'text-blue-800',   dot: 'bg-blue-600',   light: 'bg-blue-100'   },
  { bg: 'bg-green-50',  border: 'border-green-700',  text: 'text-green-800',  dot: 'bg-green-600',  light: 'bg-green-100'  },
  { bg: 'bg-yellow-50', border: 'border-yellow-700', text: 'text-yellow-800', dot: 'bg-yellow-500', light: 'bg-yellow-100' },
  { bg: 'bg-orange-50', border: 'border-orange-700', text: 'text-orange-800', dot: 'bg-orange-500', light: 'bg-orange-100' },
  { bg: 'bg-purple-50', border: 'border-purple-700', text: 'text-purple-800', dot: 'bg-purple-600',  light: 'bg-purple-100' },
];

const toIdString = (id) => {
  if (!id) return '';
  if (typeof id === 'string') return id;
  if (typeof id === 'object' && id.$oid) return id.$oid;
  return String(id);
};

export default function QuizPage() {
  const dispatch = useDispatch();
  const router   = useRouter();

  const {
    questions, attemptId, currentIndex, answers,
    loading, submitting, result,
    timeLeft, currentSectionIndex, sectionTimeLeft,
    unlockedUpTo, sectionStartIndices,
  } = useSelector((s) => s.quiz);

  const timerRef        = useRef(null);
  const sectionTimerRef = useRef(null);
  const submittedRef    = useRef(false);
  const attemptIdRef    = useRef(null);
  const descriptionsRef = useRef({});
  const advancingRef    = useRef(false);

  const [started, setStarted]                 = useState(false);
  const [confirmSubmit, setConfirmSubmit]     = useState(false);
  const [violation, setViolation]             = useState(false);
  const [violationReason, setViolationReason] = useState('');
  const [descriptions, setDescriptions]       = useState({});
  const [unlockBanner, setUnlockBanner]       = useState(null);

  // Keep refs in sync immediately — this is the stale-closure fix
  useEffect(() => { descriptionsRef.current = descriptions; }, [descriptions]);
  useEffect(() => { attemptIdRef.current = attemptId; }, [attemptId]);

  useEffect(() => {
    if (result) router.replace(`/results/${result.attemptId}`);
  }, [result]);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    clearInterval(sectionTimerRef.current);
  }, []);

  // ── Submit — reads descriptions from ref, NOT from closure ───────────────
  const doSubmit = useCallback((isViolation = false) => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);
    clearInterval(sectionTimerRef.current);
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});

    // FIXED: use TOTAL_DURATION from slice (correctly computed from durationMinutes)
    const timeTaken = TOTAL_DURATION - timeLeft;

    // Always read from ref — stale closure fix
    const latestDescriptions = descriptionsRef.current;

    const answersArray = (questions || []).map((q) => {
      const qId = toIdString(q._id);
      const isPS = q.category === 'Problem Solving';
      const desc = latestDescriptions[qId] || '';

      console.log(`Q ${qId} | category: ${q.category} | isPS: ${isPS} | desc: "${desc}"`);

      return {
        questionId:     qId,
        selectedAnswer: isPS ? null : (answers[q._id] || answers[qId] || null),
        timeSpent:      0,
        description:    isPS ? desc : '',
      };
    });

    const psAnswers = answersArray.filter((_, i) => {
      const cat = (questions[i] || {}).category;
      const t = (questions[i] || {}).type;
      return cat === 'Problem Solving' || t === 'problem-solving';
    });
    console.log('=== FINAL SUBMIT DEBUG ===');
    console.log('descriptions at submit:', JSON.stringify(latestDescriptions));
    console.log('PS answers:', JSON.stringify(psAnswers, null, 2));
    console.log('==========================');

    dispatch(submitQuiz({ attemptId, answers: answersArray, timeTaken, violation: isViolation }))
      .then((res) => {
        if (res.error) {
          toast.error(res.payload || 'Submission failed');
        } else {
          logActivity(
            isViolation ? 'quiz_abandoned' : 'quiz_completed',
            isViolation ? 'Auto-submitted due to violation' : 'Student submitted quiz',
            { timeTaken, answeredCount: Object.keys(answers).length },
            attemptIdRef.current,
          );
        }
      });
  }, [attemptId, answers, questions, timeLeft, dispatch]);

  useEffect(() => {
    if (started && questions.length > 0 && !result) {
      timerRef.current        = setInterval(() => dispatch(tickTimer()),        1000);
      sectionTimerRef.current = setInterval(() => dispatch(tickSectionTimer()), 1000);
    }
    return () => {
      clearInterval(timerRef.current);
      clearInterval(sectionTimerRef.current);
    };
  }, [started, questions.length]);

  useEffect(() => {
    if (timeLeft === 0 && started && attemptId) {
      toast.error('Time is up! Submitting…', { duration: 4000 });
      logActivity('quiz_abandoned', 'Time expired', { timeLeft: 0 }, attemptIdRef.current);
      doSubmit(false);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!started || !attemptId) return;

    if (sectionTimeLeft === 0) {
      if (advancingRef.current) return;
      advancingRef.current = true;

      if (currentSectionIndex < SECTION_CONFIG.length - 1) {
        dispatch(advanceSection());
        const next = SECTION_CONFIG[currentSectionIndex + 1];
        setUnlockBanner(next.label);
        toast(`🔓 "${SECTION_CONFIG[currentSectionIndex].label}" ended — "${next.label}" is now open!`, {
          duration: 5000, icon: '🔔',
        });
        setTimeout(() => setUnlockBanner(null), 4000);
      } else {
        toast.error('All sections complete. Submitting…', { duration: 4000 });
        doSubmit(false);
      }
    } else {
      advancingRef.current = false;
    }
  }, [sectionTimeLeft, started, attemptId, currentSectionIndex, dispatch, doSubmit]);

  useEffect(() => {
    if (!started || !attemptId) return;
    let lastKeyCombo = '';

    const onKeyDown = (e) => {
      const parts = [];
      if (e.ctrlKey)  parts.push('Control');
      if (e.altKey)   parts.push('Alt');
      if (e.metaKey)  parts.push('Meta');
      if (e.shiftKey) parts.push('Shift');
      const key = e.key === ' ' ? 'Space' : e.key;
      if (!['Control', 'Alt', 'Meta', 'Shift'].includes(key)) parts.push(key);
      lastKeyCombo = parts.join('+');
    };

    const handleViolation = (event, fallbackReason) => {
      if (submittedRef.current) return;
      const keyReason   = KEY_COMBO_MAP[lastKeyCombo] || (lastKeyCombo ? `Key combo: ${lastKeyCombo}` : '');
      const finalReason = keyReason || fallbackReason;
      setViolationReason(finalReason);
      setViolation(true);
      toast.error(`Quiz ended: ${finalReason}`, { duration: 6000 });
      logActivity(event, finalReason, { keyCombo: lastKeyCombo, questionIndex: currentIndex, timeLeft }, attemptIdRef.current);
      setTimeout(() => doSubmit(true), 800);
    };

    const onVisibilityChange = () => { if (document.hidden) handleViolation('tab_switch', 'Tab switch detected'); };
    const onBlur             = () => handleViolation('window_blur', 'Window focus lost');
    const onFullscreenChange = () => { if (!document.fullscreenElement) handleViolation('fullscreen_exit', 'Fullscreen exited'); };
    const onBeforeUnload     = (e) => { e.preventDefault(); e.returnValue = ''; handleViolation('browser_close_attempt', 'Browser close attempted'); };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreenChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [started, attemptId, doSubmit, currentIndex, timeLeft]);

  const handleStart = () => {
    dispatch(startQuiz()).then((res) => {
      if (!res.error) {
        setStarted(true);
        submittedRef.current = false;
        document.documentElement.requestFullscreen().catch(() => {});
        logActivity('quiz_started', 'Student started quiz', {}, res.payload?.attemptId);
      } else {
        toast.error(res.payload || 'Failed to start quiz');
      }
    });
  };

  // Update ref immediately inside setter — no stale reads ever
  const handleDescriptionChange = useCallback((questionId, val) => {
    const id = toIdString(questionId);
    if (val.length <= 1000) {
      setDescriptions((prev) => {
        const next = { ...prev, [id]: val };
        descriptionsRef.current = next;   // sync ref immediately
        return next;
      });
    }
  }, []);

  const answeredCount = (questions || []).filter((q) => {
    const qId = toIdString(q._id);
    return (q.category === 'Problem Solving')
      ? !!(descriptions[qId] || '').trim()
      : !!answers[q._id];
  }).length;

  const currentSection      = SECTION_CONFIG[currentSectionIndex] || SECTION_CONFIG[0];
  const currentSectionColor = SECTION_COLORS[currentSectionIndex] || SECTION_COLORS[0];

  const sectionQuestions = questions.filter((q) => q._sectionIndex === currentSectionIndex);
  const sectionAnswered  = sectionQuestions.filter((q) => {
    const qId = toIdString(q._id);
    return (q.category === 'Problem Solving')
      ? !!(descriptions[qId] || '').trim()
      : !!answers[q._id];
  }).length;

  const isLastInSection = (() => {
    const nextQ = questions[currentIndex + 1];
    return !nextQ || nextQ._sectionIndex !== currentSectionIndex;
  })();

  const isLastQuestion = currentIndex === questions.length - 1;

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
            <p className="text-ink-muted mb-6 leading-relaxed max-w-md mx-auto">
              25 randomised questions across 5 timed sections — 3 hours total.
              Each section unlocks only when the previous timer expires.
            </p>

            <div className="mb-6 text-left border border-ink/10 divide-y divide-ink/10">
              {SECTION_CONFIG.map((sec, i) => {
                const col = SECTION_COLORS[i];
                return (
                  <div key={sec.id} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />
                    <span className="text-sm font-semibold flex-1">{sec.label}</span>
                    <span className="text-xs text-ink-muted font-mono">{sec.durationMinutes} min</span>
                    {i === 0
                      ? <span className={`text-xs font-bold px-2 py-0.5 border ${col.border} ${col.bg} ${col.text}`}>Starts first</span>
                      : <Lock size={12} className="text-ink-faint" />}
                  </div>
                );
              })}
              <div className="flex items-center gap-3 px-4 py-3 bg-ink/5">
                <span className="w-2 h-2 rounded-full flex-shrink-0 bg-ink" />
                <span className="text-sm font-bold flex-1">Total</span>
                <span className="text-xs font-mono font-bold">
                  {SECTION_CONFIG.reduce((s, c) => s + c.durationMinutes, 0)} min (3 hrs)
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8">
              {[['⏱', '3 Hours', 'Total Time'], ['📝', '25 Q', 'Questions'], ['🔒', 'Strict', 'Proctored']].map(([e, v, l]) => (
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
                <li>• Each section is <strong>time-locked</strong> — next section opens only when timer expires</li>
                <li>• Once a section's timer expires, it is locked and you <strong>cannot go back</strong></li>
                <li>• Quiz runs in <strong>fullscreen</strong> — exiting fullscreen immediately submits</li>
                <li>• Switching tabs or minimising will <strong>auto-submit</strong> your quiz</li>
                <li>• Violations are flagged and included in your AI performance report</li>
              </ul>
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

  const isProblemSolving = question.category === 'Problem Solving';
  const questionId       = toIdString(question._id);

  return (
    <QuizLayout>
      <div className="max-w-3xl mx-auto px-4 py-4">

        <AnimatePresence>
          {unlockBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
              className="mb-3 px-4 py-3 bg-ink text-cream text-sm font-bold flex items-center gap-2">
              🔓 Now unlocked: {unlockBanner}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm font-semibold text-ink-muted flex-shrink-0">
              Q{currentIndex + 1}/{questions.length}
            </span>
            <span className={`badge badge-${question.difficulty} flex-shrink-0`}>{question.difficulty}</span>
            <span className="badge border-ink/20 bg-cream-dark text-ink-muted hidden sm:inline-flex truncate">
              {question.category}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono font-bold text-xs
              ${sectionTimeLeft < 120
                ? 'border-red-700 bg-red-50 text-red-700'
                : `${currentSectionColor.border} ${currentSectionColor.bg} ${currentSectionColor.text}`}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${currentSectionColor.dot}`} />
              {formatTime(sectionTimeLeft)}
              <span className="hidden sm:inline font-normal opacity-70 ml-0.5">section</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 border-2 font-mono font-black text-sm
              ${timeLeft < 300 ? 'border-red-700 bg-red-50 text-red-700' : 'bg-ink border-ink text-cream'}`}>
              <Clock size={12} /> {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between px-4 py-2 border-2 mb-3
          ${currentSectionColor.border} ${currentSectionColor.bg}`}>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${currentSectionColor.dot}`} />
            <span className={`text-xs font-bold uppercase tracking-widest ${currentSectionColor.text}`}>
              Section {currentSectionIndex + 1}/5 — {currentSection.label}
            </span>
          </div>
          <span className={`text-xs ${currentSectionColor.text} opacity-70`}>
            {sectionAnswered}/{sectionQuestions.length} answered
          </span>
        </div>

        <div className="h-1.5 bg-ink/10 mb-4 flex rounded-full overflow-hidden">
          {SECTION_CONFIG.map((sec, i) => {
            const secQs    = questions.filter((q) => q._sectionIndex === i);
            const widthPct = secQs.length > 0 ? (secQs.length / questions.length) * 100 : 0;
            const isUnlocked = i <= unlockedUpTo;
            const isActive   = i === currentSectionIndex;
            const col        = SECTION_COLORS[i];
            const secAns = secQs.filter((q) => {
              const id = toIdString(q._id);
              return (q.category === 'Problem Solving')
                ? !!(descriptions[id] || '').trim()
                : !!answers[q._id];
            }).length;
            const fillPct = isActive && secQs.length > 0
              ? (secAns / secQs.length) * 100
              : i < currentSectionIndex ? 100 : 0;
            return (
              <div key={sec.id} style={{ width: `${widthPct}%` }} className="relative h-full">
                <div className={`h-full w-full ${isUnlocked ? col.light : 'bg-ink/5'}`} />
                {isUnlocked && (
                  <motion.div className={`absolute top-0 left-0 h-full ${col.dot}`}
                    animate={{ width: `${fillPct}%` }} transition={{ duration: 0.4 }} />
                )}
              </div>
            );
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={currentIndex}
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            className="card mb-4">
            <div className="card-body">
              <p className="text-base font-semibold leading-relaxed mb-5">{question.question}</p>
              {question.codeSnippet && <pre className="code-block mb-5 text-xs">{question.codeSnippet}</pre>}

              {isProblemSolving ? (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }} className="flex flex-col">
                  <div className="flex items-center gap-2 px-3 py-2 bg-ink/5 border border-ink/15 mb-3">
                    <PenLine size={13} className="text-ink-muted flex-shrink-0" />
                    <span className="text-xs font-bold uppercase tracking-widest text-ink-muted">Written Answer</span>
                    <span className="ml-auto text-xs text-ink-faint">
                      {(descriptions[questionId] || '').length} / 1000 chars
                    </span>
                  </div>
                  <textarea
                    value={descriptions[questionId] || ''}
                    onChange={(e) => handleDescriptionChange(questionId, e.target.value)}
                    placeholder="Write your solution here — explain your approach, walk through the logic, mention relevant code or concepts…"
                    rows={10}
                    className="w-full resize-none border-2 border-ink/20 bg-cream-dark p-4 text-sm text-ink
                      leading-relaxed placeholder:text-ink-faint focus:outline-none focus:border-ink
                      transition-colors rounded-none font-mono"
                  />
                  <p className="text-xs text-ink-faint mt-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    Your written answer will be reviewed by the teacher in their AI report.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  {question.options.map((opt, i) => {
                    const sel = answers[question._id] === opt;
                    return (
                      <motion.button key={i} whileTap={{ scale: 0.99 }}
                        onClick={() => dispatch(selectAnswer({ questionId: question._id, answer: opt }))}
                        className={`quiz-option ${sel ? 'selected' : ''}`}>
                        <span className={`inline-flex items-center justify-center w-7 h-7 border-2 text-xs font-black mr-3 flex-shrink-0
                          ${sel ? 'bg-ink text-cream border-ink' : 'border-ink/30 text-ink-muted'}`}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mb-4">
          <button onClick={() => dispatch(prevQuestion())} disabled={currentIndex === 0} className="btn-secondary">
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="text-sm text-ink-muted">{answeredCount}/{questions.length} answered</span>
          {isLastQuestion ? (
            <motion.button whileTap={{ scale: 0.97 }} onClick={() => setConfirmSubmit(true)} className="btn-primary">
              <Send size={13} /> Submit
            </motion.button>
          ) : isLastInSection && currentSectionIndex === unlockedUpTo ? (
            <button disabled className="btn-secondary opacity-50 cursor-not-allowed flex items-center gap-2">
              <Lock size={12} /> {formatTime(sectionTimeLeft)} left
            </button>
          ) : (
            <button onClick={() => dispatch(nextQuestion())} className="btn-primary">
              Next <ChevronRight size={14} />
            </button>
          )}
        </div>

        <div className="card p-4">
          <p className="text-xs font-bold uppercase tracking-widest text-ink-light mb-3">Navigator</p>
          <div className="flex flex-wrap gap-1.5 mb-4">
            {SECTION_CONFIG.map((sec, i) => {
              const col    = SECTION_COLORS[i];
              const locked = i !== currentSectionIndex;
              const isActive = i === currentSectionIndex;
              return (
                <button key={sec.id}
                  onClick={() => !locked && dispatch(goToSection(i))}
                  disabled={locked}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 border-2 text-xs font-bold transition-all
                    ${locked
                      ? 'border-ink/10 bg-cream-dark text-ink-faint cursor-not-allowed'
                      : isActive
                        ? `${col.border} ${col.bg} ${col.text}`
                        : 'border-ink/20 text-ink-muted hover:border-ink'}`}>
                  {locked ? <Lock size={10} /> : <span className={`w-1.5 h-1.5 rounded-full ${col.dot}`} />}
                  <span className="hidden sm:inline">{sec.label.split(' + ')[0]}</span>
                  <span className="sm:hidden">S{i + 1}</span>
                  {locked && <span className="font-mono text-ink-faint">{formatTime(sec.durationMinutes * 60)}</span>}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-1.5">
            {questions.map((q, i) => {
              const secIdx      = q._sectionIndex ?? 0;
              const col         = SECTION_COLORS[secIdx];
              const locked      = secIdx !== currentSectionIndex;
              const qIdStr      = toIdString(q._id);
              const isPS        = q.category === 'Problem Solving';
              const done        = isPS
                ? !!(descriptions[qIdStr] || '').trim()
                : !!answers[q._id];
              const prevSecIdx  = i > 0 ? (questions[i - 1]._sectionIndex ?? 0) : -1;
              const showDivider = i > 0 && secIdx !== prevSecIdx;
              return (
                <div key={i} className="flex items-center gap-1.5">
                  {showDivider && <span className="w-px h-6 bg-ink/20 mx-0.5" />}
                  <button
                    onClick={() => !locked && dispatch(goToQuestion(i))}
                    disabled={locked}
                    title={locked ? `Locked — wait for ${SECTION_CONFIG[secIdx].label} timer` : `Q${i + 1} — ${q.category}`}
                    className={`w-8 h-8 text-xs font-bold border-2 transition-all
                      ${locked
                        ? 'border-ink/10 bg-cream-dark text-ink-faint cursor-not-allowed'
                        : i === currentIndex
                          ? 'bg-ink text-cream border-ink'
                          : done
                            ? `${col.bg} ${col.border} ${col.text}`
                            : 'border-ink/20 text-ink-light hover:border-ink'}`}>
                    {locked ? <Lock size={9} className="mx-auto" /> : i + 1}
                  </button>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-ink/10">
            {SECTION_CONFIG.map((sec, i) => {
              const col    = SECTION_COLORS[i];
              const locked = i !== currentSectionIndex;
              return (
                <div key={sec.id} className="flex items-center gap-1.5">
                  {locked ? <Lock size={10} className="text-ink-faint" /> : <span className={`w-2 h-2 rounded-full ${col.dot}`} />}
                  <span className={`text-xs ${locked ? 'text-ink-faint' : 'text-ink-muted'}`}>
                    {sec.label.split(' + ')[0]}
                  </span>
                </div>
              );
            })}
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
                <p className="text-sm text-ink-muted mb-4 leading-relaxed">
                  You have answered {answeredCount} of {questions.length} questions.
                  {answeredCount < questions.length &&
                    ` ${questions.length - answeredCount} unanswered will be marked incorrect.`}
                </p>
                <div className="text-left mb-6 space-y-1.5">
                  {SECTION_CONFIG.map((sec, i) => {
                    const col    = SECTION_COLORS[i];
                    const secQs  = questions.filter((q) => q._sectionIndex === i);
                    const secAns = secQs.filter((q) => {
                      const id = toIdString(q._id);
                      return (q.category === 'Problem Solving')
                        ? !!(descriptions[id] || '').trim()
                        : !!answers[q._id];
                    }).length;
                    const locked = i > unlockedUpTo;
                    return (
                      <div key={sec.id} className="flex items-center gap-2 text-xs">
                        {locked
                          ? <Lock size={10} className="text-ink-faint flex-shrink-0" />
                          : <span className={`w-2 h-2 rounded-full flex-shrink-0 ${col.dot}`} />}
                        <span className={`flex-1 ${locked ? 'text-ink-faint' : 'text-ink-muted'}`}>{sec.label}</span>
                        <span className={`font-bold ${secAns === secQs.length ? 'text-green-700' : 'text-ink'}`}>
                          {secAns}/{secQs.length}
                        </span>
                      </div>
                    );
                  })}
                </div>
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