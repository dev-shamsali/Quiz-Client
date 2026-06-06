import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Section definitions — use durationMinutes everywhere ──────────────────
export const SECTION_CONFIG = [
  { id: 'react-next',  label: 'React.js + Next.js',                  categories: ['React.js', 'Next.js'],                               durationMinutes: 30 },
  { id: 'node',        label: 'Node.js',                              categories: ['Node.js'],                                           durationMinutes: 30 },
  { id: 'express',     label: 'Express.js',                           categories: ['Express.js'],                                        durationMinutes: 30 },
  { id: 'mongodb',     label: 'MongoDB',                              categories: ['MongoDB'],                                           durationMinutes: 30 },
  { id: 'auth-ps-dbg', label: 'Auth + Problem Solving + Debugging',  categories: ['Authentication & Security', 'Problem Solving', 'Debugging'], durationMinutes: 60 },
];

// Total = 180 min = 10800 seconds (3 hrs)
export const TOTAL_DURATION = SECTION_CONFIG.reduce((s, c) => s + c.durationMinutes * 60, 0);

// ── Async thunks ───────────────────────────────────────────────────────────
export const startQuiz = createAsyncThunk('quiz/start', async (_, { rejectWithValue }) => {
  try {
    const res = await api.post('/quiz/start');
    return res;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to start quiz');
  }
});

export const submitQuiz = createAsyncThunk(
  'quiz/submit',
  async ({ attemptId, answers, timeTaken, violation }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/quiz/submit/${attemptId}`, { answers, timeTaken, violation });
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Submission failed');
    }
  }
);

export const getAttempts = createAsyncThunk(
  'quiz/getAttempts',
  async ({ page = 1, limit = 5 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get(`/quiz/attempts?page=${page}&limit=${limit}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attempts');
    }
  }
);

export const getAttemptById = createAsyncThunk(
  'quiz/getAttemptById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/quiz/attempts/${id}`);
      return res;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch attempt');
    }
  }
);

// ── Initial state ──────────────────────────────────────────────────────────
const initialState = {
  questions:    [],
  attemptId:    null,
  currentIndex: 0,
  answers:      {},

  currentSectionIndex: 0,
  unlockedUpTo:        0,
  sectionTimeLeft:     SECTION_CONFIG[0].durationMinutes * 60,
  sectionStartIndices: [],

  timeLeft: TOTAL_DURATION,

  loading:    false,
  submitting: false,
  result:     null,
  error:      null,

  attempts:           [],
  attemptsPagination: null,
  selectedAttempt:    null,
};

const computeSectionStartIndices = (questions) => {
  return SECTION_CONFIG.map((_, sIdx) => {
    const first = questions.findIndex((q) => q._sectionIndex === sIdx);
    return first === -1 ? 0 : first;
  });
};

// ── Slice ──────────────────────────────────────────────────────────────────
const quizSlice = createSlice({
  name: 'quiz',
  initialState,
  reducers: {

    selectAnswer(state, { payload: { questionId, answer } }) {
      state.answers[questionId] = answer;
    },

    nextQuestion(state) {
      const next = state.currentIndex + 1;
      if (next >= state.questions.length) return;
      const nextQ = state.questions[next];
      if (nextQ._sectionIndex > state.unlockedUpTo) return;
      state.currentIndex = next;
      state.currentSectionIndex = nextQ._sectionIndex;
    },

    prevQuestion(state) {
      if (state.currentIndex > 0) {
        const prev = state.currentIndex - 1;
        const prevQ = state.questions[prev];
        if (prevQ._sectionIndex > state.unlockedUpTo) return;
        state.currentIndex = prev;
        state.currentSectionIndex = prevQ._sectionIndex;
      }
    },

    goToQuestion(state, { payload: index }) {
      if (index < 0 || index >= state.questions.length) return;
      const q = state.questions[index];
      if (q._sectionIndex > state.unlockedUpTo) return;
      state.currentIndex = index;
      state.currentSectionIndex = q._sectionIndex;
    },

    goToSection(state, { payload: sectionIndex }) {
      if (sectionIndex > state.unlockedUpTo) return;
      const firstIdx = state.sectionStartIndices[sectionIndex];
      if (firstIdx === undefined) return;
      state.currentIndex        = firstIdx;
      state.currentSectionIndex = sectionIndex;
    },

    tickTimer(state) {
      if (state.timeLeft > 0) state.timeLeft -= 1;
    },

    tickSectionTimer(state) {
      if (state.sectionTimeLeft > 0) state.sectionTimeLeft -= 1;
    },

    advanceSection(state) {
      const next = state.currentSectionIndex + 1;
      if (next >= SECTION_CONFIG.length) return;
      state.unlockedUpTo        = next;
      state.currentSectionIndex = next;
      // KEY FIX: use durationMinutes * 60, not duration
      state.sectionTimeLeft     = SECTION_CONFIG[next].durationMinutes * 60;
      const firstIdx = state.sectionStartIndices[next];
      if (firstIdx !== undefined) state.currentIndex = firstIdx;
    },

    resetQuiz: () => ({ ...initialState }),
  },

  extraReducers: (builder) => {
    builder
      .addCase(startQuiz.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(startQuiz.fulfilled, (state, { payload }) => {
        state.loading    = false;
        state.questions  = payload.questions || [];
        state.attemptId  = payload.attemptId;
        state.currentIndex = 0;
        state.answers    = {};

        state.sectionStartIndices = computeSectionStartIndices(state.questions);

        state.currentSectionIndex = 0;
        state.unlockedUpTo        = 0;
        // KEY FIX: use durationMinutes * 60
        state.sectionTimeLeft     = SECTION_CONFIG[0].durationMinutes * 60;

        state.timeLeft = payload.timeLeftSeconds ?? TOTAL_DURATION;
      })
      .addCase(startQuiz.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      });

    builder
      .addCase(submitQuiz.pending,   (state) => { state.submitting = true; })
      .addCase(submitQuiz.fulfilled, (state, { payload }) => {
        state.submitting = false;
        state.result     = payload;
      })
      .addCase(submitQuiz.rejected,  (state, { payload }) => {
        state.submitting = false;
        state.error      = payload;
      });

    builder
      .addCase(getAttempts.pending,   (state) => { state.loading = true; })
      .addCase(getAttempts.fulfilled, (state, { payload }) => {
        state.loading            = false;
        state.attempts           = payload.attempts   || [];
        state.attemptsPagination = payload.pagination || null;
      })
      .addCase(getAttempts.rejected,  (state) => { state.loading = false; });

    builder
      .addCase(getAttemptById.pending,   (state) => { state.loading = true; })
      .addCase(getAttemptById.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.selectedAttempt = payload.attempt || null;
      })
      .addCase(getAttemptById.rejected,  (state) => { state.loading = false; });
  },
});

export const {
  selectAnswer,
  nextQuestion,
  prevQuestion,
  goToQuestion,
  goToSection,
  tickTimer,
  tickSectionTimer,
  advanceSection,
  resetQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;