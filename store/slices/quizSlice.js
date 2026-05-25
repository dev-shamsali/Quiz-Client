import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import quizService from '../../services/quizService';

export const startQuiz = createAsyncThunk('quiz/start', async (_, { rejectWithValue }) => {
  try {
    return await quizService.startQuiz();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to start quiz');
  }
});

export const submitQuiz = createAsyncThunk('quiz/submit', async ({ attemptId, answers, timeTaken }, { rejectWithValue }) => {
  try {
    return await quizService.submitQuiz(attemptId, { answers, timeTaken });
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to submit quiz');
  }
});

export const getAttempts = createAsyncThunk('quiz/getAttempts', async (params, { rejectWithValue }) => {
  try {
    return await quizService.getAttempts(params);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch attempts');
  }
});

export const getAttemptById = createAsyncThunk('quiz/getAttemptById', async (id, { rejectWithValue }) => {
  try {
    return await quizService.getAttemptById(id);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch attempt');
  }
});

const quizSlice = createSlice({
  name: 'quiz',
  initialState: {
    // Active quiz
    attemptId: null,
    questions: [],
    currentIndex: 0,
    answers: {}, // { questionId: selectedAnswer }
    startTime: null,
    timeLeft: 45 * 60, // 45 minutes in seconds

    // Results
    result: null,

    // Attempts history
    attempts: [],
    selectedAttempt: null,
    pagination: null,

    loading: false,
    submitting: false,
    error: null,
  },
  reducers: {
    selectAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },
    nextQuestion: (state) => {
      if (state.currentIndex < state.questions.length - 1) state.currentIndex++;
    },
    prevQuestion: (state) => {
      if (state.currentIndex > 0) state.currentIndex--;
    },
    goToQuestion: (state, action) => {
      state.currentIndex = action.payload;
    },
    tickTimer: (state) => {
      if (state.timeLeft > 0) state.timeLeft--;
    },
    resetQuiz: (state) => {
      state.attemptId = null;
      state.questions = [];
      state.currentIndex = 0;
      state.answers = {};
      state.startTime = null;
      state.timeLeft = 45 * 60;
      state.result = null;
      state.error = null;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startQuiz.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(startQuiz.fulfilled, (state, action) => {
        state.loading = false;
        state.attemptId = action.payload.attemptId;
        state.questions = action.payload.questions;
        state.startTime = action.payload.startTime;
        state.currentIndex = 0;
        state.answers = {};
      })
      .addCase(startQuiz.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(submitQuiz.pending, (state) => { state.submitting = true; state.error = null; })
      .addCase(submitQuiz.fulfilled, (state, action) => {
        state.submitting = false;
        state.result = action.payload;
      })
      .addCase(submitQuiz.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      })

      .addCase(getAttempts.pending, (state) => { state.loading = true; })
      .addCase(getAttempts.fulfilled, (state, action) => {
        state.loading = false;
        state.attempts = action.payload.attempts;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAttempts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getAttemptById.pending, (state) => { state.loading = true; })
      .addCase(getAttemptById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedAttempt = action.payload.attempt;
      })
      .addCase(getAttemptById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { selectAnswer, nextQuestion, prevQuestion, goToQuestion, tickTimer, resetQuiz, clearError } = quizSlice.actions;
export default quizSlice.reducer;
