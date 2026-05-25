import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

export const fetchSettings = createAsyncThunk('settings/fetch', async (_, { rejectWithValue }) => {
  try {
    const data = await api.get('/settings');
    return data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch settings');
  }
});

export const updateSettings = createAsyncThunk('settings/update', async (payload, { rejectWithValue }) => {
  try {
    const data = await api.put('/admin/settings', payload);
    return data.settings;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to update settings');
  }
});

const settingsSlice = createSlice({
  name: 'settings',
  initialState: {
    settings: null,
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchSettings.fulfilled, (state, action) => { state.loading = false; state.settings = action.payload; })
      .addCase(fetchSettings.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(updateSettings.pending, (state) => { state.saving = true; state.error = null; })
      .addCase(updateSettings.fulfilled, (state, action) => { state.saving = false; state.settings = action.payload; })
      .addCase(updateSettings.rejected, (state, action) => { state.saving = false; state.error = action.payload; });
  },
});

export default settingsSlice.reducer;
