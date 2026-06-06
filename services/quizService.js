import Question from '../models/Question.js';

// ── Section definitions (must mirror frontend SECTION_CONFIG) ─────────────
export const SECTION_CONFIG = [
  { id: 'react-next',  label: 'React.js + Next.js',                  categories: ['React.js', 'Next.js'],                               durationMinutes: 1, questionCount: 6  },
  { id: 'node',        label: 'Node.js',                              categories: ['Node.js'],                                           durationMinutes: 1, questionCount: 5  },
  { id: 'express',     label: 'Express.js',                           categories: ['Express.js'],                                        durationMinutes: 1, questionCount: 4  },
  { id: 'mongodb',     label: 'MongoDB',                              categories: ['MongoDB'],                                           durationMinutes: 1, questionCount: 4  },
  { id: 'auth-ps-dbg', label: 'Auth + Problem Solving + Debugging',  categories: ['Authentication & Security', 'Problem Solving', 'Debugging'], durationMinutes: 1, questionCount: 6 },
];

export const TOTAL_DURATION_MINUTES = SECTION_CONFIG.reduce((s, c) => s + c.durationMinutes, 0); // 180
export const TOTAL_QUESTIONS        = SECTION_CONFIG.reduce((s, c) => s + c.questionCount,   0); // 25

// ── Original difficulty distribution preserved ────────────────────────────
const QUIZ_CONFIG = { easy: 13, moderate: 7, hard: 5 };

// ── Guaranteed minimum Problem Solving questions (kept from original) ──────
const PS_GUARANTEED = 3;

// ── getRandomQuestions ────────────────────────────────────────────────────
// Keeps original difficulty-based fetching logic completely intact.
// New addition: tags each question with _sectionIndex and sorts by section
// so the frontend can enforce strict section-wise locking.
export const getRandomQuestions = async (excludeIds = []) => {
  const buildMatch = (filters, exclude) => {
    const match = { ...filters, isActive: true };
    if (exclude.length > 0) match._id = { $nin: exclude };
    return match;
  };

  let excluded = excludeIds;

  // ── Check availability (original logic) ───────────────────────────────
  const [easyAvail, modAvail, hardAvail, psAvail] = await Promise.all([
    Question.countDocuments(buildMatch({ difficulty: 'easy' }, excluded)),
    Question.countDocuments(buildMatch({ difficulty: 'moderate' }, excluded)),
    Question.countDocuments(buildMatch({ difficulty: 'hard' }, excluded)),
    Question.countDocuments(buildMatch({ category: 'Problem Solving' }, excluded)),
  ]);

  if (
    easyAvail < QUIZ_CONFIG.easy ||
    modAvail  < QUIZ_CONFIG.moderate ||
    hardAvail < QUIZ_CONFIG.hard ||
    psAvail   < PS_GUARANTEED
  ) {
    excluded = [];
  }

  // ── Step 1: Pull guaranteed Problem Solving questions first ───────────
  const psQuestions = await Question.aggregate([
    { $match: buildMatch({ category: 'Problem Solving' }, excluded) },
    { $sample: { size: PS_GUARANTEED } },
    { $project: { correctAnswer: 0, explanation: 0, __v: 0 } },
  ]);

  const psIds = psQuestions.map((q) => q._id);

  // ── Step 2: Count PS questions per difficulty so we don't over-fetch ──
  const psEasyCount = psQuestions.filter((q) => q.difficulty === 'easy').length;
  const psModCount  = psQuestions.filter((q) => q.difficulty === 'moderate').length;
  const psHardCount = psQuestions.filter((q) => q.difficulty === 'hard').length;

  const needEasy = QUIZ_CONFIG.easy     - psEasyCount;
  const needMod  = QUIZ_CONFIG.moderate - psModCount;
  const needHard = QUIZ_CONFIG.hard     - psHardCount;

  // ── Step 3: Fill remaining slots from non-PS questions ────────────────
  const excludeForFill = [...excluded.map(String), ...psIds.map(String)];

  const buildFillMatch = (difficulty) => {
    const match = { difficulty, isActive: true, category: { $ne: 'Problem Solving' } };
    if (excludeForFill.length > 0) match._id = { $nin: excludeForFill };
    return match;
  };

  const [easy, moderate, hard] = await Promise.all([
    needEasy > 0
      ? Question.aggregate([
          { $match: buildFillMatch('easy') },
          { $sample: { size: needEasy } },
          { $project: { correctAnswer: 0, explanation: 0, __v: 0 } },
        ])
      : [],
    needMod > 0
      ? Question.aggregate([
          { $match: buildFillMatch('moderate') },
          { $sample: { size: needMod } },
          { $project: { correctAnswer: 0, explanation: 0, __v: 0 } },
        ])
      : [],
    needHard > 0
      ? Question.aggregate([
          { $match: buildFillMatch('hard') },
          { $sample: { size: needHard } },
          { $project: { correctAnswer: 0, explanation: 0, __v: 0 } },
        ])
      : [],
  ]);

  const allQuestions = [...psQuestions, ...easy, ...moderate, ...hard];

  if (allQuestions.length < 25) {
    throw new Error('Insufficient questions in the database. Please run the seed script.');
  }

  // ── Step 4: Tag each question with its _sectionIndex ─────────────────
  // NEW: frontend uses this to enforce section locking
  const tagged = allQuestions.map((q) => {
    const sIdx = SECTION_CONFIG.findIndex((s) => s.categories.includes(q.category));
    return { ...q, _sectionIndex: sIdx === -1 ? 0 : sIdx };
  });

  // ── Step 5: Sort by section so questions arrive in section order ──────
  // Within each section questions remain in their random order
  tagged.sort((a, b) => a._sectionIndex - b._sectionIndex);

  return tagged;
};

// ── getAnswerMap (unchanged from original) ────────────────────────────────
export const getAnswerMap = async (questionIds) => {
  const questions = await Question.find(
    { _id: { $in: questionIds } },
    { correctAnswer: 1, explanation: 1, difficulty: 1, category: 1 }
  ).lean();

  const map = {};
  questions.forEach((q) => {
    map[q._id.toString()] = {
      correctAnswer: q.correctAnswer,
      explanation:   q.explanation,
      difficulty:    q.difficulty,
      category:      q.category,
    };
  });
  return map;
};

// ── calculateResults (unchanged from original) ────────────────────────────
export const calculateResults = (submittedAnswers, answerMap) => {
  let correctAnswers = 0;
  const breakdown = {
    easy:     { total: 0, correct: 0 },
    moderate: { total: 0, correct: 0 },
    hard:     { total: 0, correct: 0 },
  };
  const categoryMap = {};
  const results     = [];

  submittedAnswers.forEach(({ questionId, selectedAnswer, description, timeSpent }) => {
    const answer = answerMap[questionId.toString()];
    if (!answer) return;

    const isProblemSolving = answer.category === 'Problem Solving';
    const writtenAnswer    = (description || '').trim();

    // Problem Solving: isCorrect always false — teacher reviews manually
    const isCorrect = isProblemSolving
      ? false
      : selectedAnswer === answer.correctAnswer;

    if (isCorrect) correctAnswers++;

    const diff = answer.difficulty;
    breakdown[diff].total++;
    if (isCorrect) breakdown[diff].correct++;

    const cat = answer.category;
    if (!categoryMap[cat]) categoryMap[cat] = { total: 0, correct: 0 };
    categoryMap[cat].total++;
    if (isCorrect) categoryMap[cat].correct++;

    results.push({
      question:       questionId,
      selectedAnswer: isProblemSolving ? null : (selectedAnswer || null),
      description:    isProblemSolving ? writtenAnswer : '',
      correctAnswer:  answer.correctAnswer,
      isCorrect,
      timeSpent:      timeSpent || 0,
      difficulty:     diff,
      category:       cat,
    });
  });

  const categoryBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    total:   data.total,
    correct: data.correct,
  }));

  return { results, correctAnswers, breakdown, categoryBreakdown };
};

// Keep original named export for any other files that import QUIZ_CONFIG
export { QUIZ_CONFIG };