import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import adminService from '../../services/adminService';

export const getAnalytics = createAsyncThunk('admin/analytics', async (_, { rejectWithValue }) => {
  try { return await adminService.getAnalytics(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const getQuestions = createAsyncThunk('admin/questions', async (params, { rejectWithValue }) => {
  try { return await adminService.getQuestions(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const createQuestion = createAsyncThunk('admin/createQuestion', async (data, { rejectWithValue }) => {
  try { return await adminService.createQuestion(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const updateQuestion = createAsyncThunk('admin/updateQuestion', async ({ id, data }, { rejectWithValue }) => {
  try { return await adminService.updateQuestion(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const deleteQuestion = createAsyncThunk('admin/deleteQuestion', async (id, { rejectWithValue }) => {
  try { await adminService.deleteQuestion(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const getStudents = createAsyncThunk('admin/students', async (params, { rejectWithValue }) => {
  try { return await adminService.getStudents(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const getRankings = createAsyncThunk('admin/rankings', async (_, { rejectWithValue }) => {
  try { return await adminService.getRankings(); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const toggleResumeAttempt = createAsyncThunk('admin/toggleResumeAttempt', async (id, { rejectWithValue }) => {
  try { return await adminService.toggleResumeAttempt(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

export const forceSuspendAttempt = createAsyncThunk('admin/forceSuspendAttempt', async (id, { rejectWithValue }) => {
  try { return await adminService.forceSuspendAttempt(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed'); }
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: {
    analytics: null,
    questions: [],
    questionsPagination: null,
    students: [],
    studentsPagination: null,
    rankings: [],
    loading: false,
    error: null,
  },
  reducers: { clearError: (state) => { state.error = null; } },
  extraReducers: (builder) => {
    const load = (state) => { state.loading = true; state.error = null; };
    const fail = (state, a) => { state.loading = false; state.error = a.payload; };

    builder
      .addCase(getAnalytics.pending, load)
      .addCase(getAnalytics.fulfilled, (state, a) => { state.loading = false; state.analytics = a.payload; })
      .addCase(getAnalytics.rejected, fail)

      .addCase(getQuestions.pending, load)
      .addCase(getQuestions.fulfilled, (state, a) => {
        state.loading = false;
        state.questions = a.payload.questions;
        state.questionsPagination = a.payload.pagination;
      })
      .addCase(getQuestions.rejected, fail)

      .addCase(createQuestion.fulfilled, (state, a) => {
        state.questions.unshift(a.payload.question);
      })

      .addCase(updateQuestion.fulfilled, (state, a) => {
        const idx = state.questions.findIndex(q => q._id === a.payload.question._id);
        if (idx !== -1) state.questions[idx] = a.payload.question;
      })

      .addCase(deleteQuestion.fulfilled, (state, a) => {
        state.questions = state.questions.filter(q => q._id !== a.payload);
      })

      .addCase(getStudents.pending, load)
      .addCase(getStudents.fulfilled, (state, a) => {
        state.loading = false;
        state.students = a.payload.students;
        state.studentsPagination = a.payload.pagination;
      })
      .addCase(getStudents.rejected, fail)

      .addCase(getRankings.pending, load)
      .addCase(getRankings.fulfilled, (state, a) => {
        state.loading = false;
        state.rankings = a.payload.rankings;
      })
      .addCase(getRankings.rejected, fail)

      .addCase(toggleResumeAttempt.fulfilled, (state, a) => {
        const attempt = a.payload.attempt;
        const studentIdx = state.students.findIndex(s => s._id === attempt.student);
        if (studentIdx !== -1 && state.students[studentIdx].activeAttempt) {
          state.students[studentIdx].activeAttempt.adminAllowedResume = attempt.adminAllowedResume;
          state.students[studentIdx].activeAttempt.status = attempt.status;
        }
      })
      .addCase(forceSuspendAttempt.fulfilled, (state, a) => {
        const attempt = a.payload.attempt;
        const studentIdx = state.students.findIndex(s => s._id === attempt.student);
        if (studentIdx !== -1 && state.students[studentIdx].activeAttempt) {
          state.students[studentIdx].activeAttempt.status = attempt.status;
          state.students[studentIdx].activeAttempt.adminAllowedResume = attempt.adminAllowedResume;
        }
      });
  },
});

export const { clearError } = adminSlice.actions;
export default adminSlice.reducer;
