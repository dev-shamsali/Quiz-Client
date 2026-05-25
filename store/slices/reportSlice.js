import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import reportService from '../../services/reportService';

export const generateReport = createAsyncThunk('report/generate', async (attemptId, { rejectWithValue }) => {
  try {
    return await reportService.generate(attemptId);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to generate report');
  }
});

export const getReport = createAsyncThunk('report/get', async (attemptId, { rejectWithValue }) => {
  try {
    return await reportService.get(attemptId);
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Report not found');
  }
});

export const getMyReports = createAsyncThunk('report/getAll', async (_, { rejectWithValue }) => {
  try {
    return await reportService.getAll();
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch reports');
  }
});

const reportSlice = createSlice({
  name: 'report',
  initialState: {
    current: null,
    reports: [],
    loading: false,
    generating: false,
    error: null,
  },
  reducers: {
    clearReport: (state) => { state.current = null; state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReport.pending, (state) => { state.generating = true; state.error = null; })
      .addCase(generateReport.fulfilled, (state, action) => {
        state.generating = false;
        state.current = action.payload.report;
      })
      .addCase(generateReport.rejected, (state, action) => {
        state.generating = false;
        state.error = action.payload;
      })

      .addCase(getReport.pending, (state) => { state.loading = true; })
      .addCase(getReport.fulfilled, (state, action) => {
        state.loading = false;
        state.current = action.payload.report;
      })
      .addCase(getReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(getMyReports.pending, (state) => { state.loading = true; })
      .addCase(getMyReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.reports;
      })
      .addCase(getMyReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearReport } = reportSlice.actions;
export default reportSlice.reducer;
