import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import Cookies from 'js-cookie';

export const register = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.register(data);
    return res ?? {};
  } catch (err) {
    return rejectWithValue(
      err.response?.data?.message || err.message || 'Registration failed'
    );
  }
});

export const login = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    const res = await authService.login(data);
    // console.log('LOGIN RES:', JSON.stringify(res));

    // Interceptor returns res.data?.data ?? res.data
    // So res could be { user, accessToken, refreshToken }        ← if data exists
    // Or             { success, message, data: {...} }           ← if interceptor fell back
    // Handle both shapes safely:
    const payload = res?.accessToken ? res : res?.data;

    if (!payload?.accessToken) {
      return rejectWithValue('Login failed — no token received');
    }

    Cookies.set('accessToken', payload.accessToken, { expires: 1 / 96 });
    Cookies.set('refreshToken', payload.refreshToken, { expires: 7 });
    if (payload?.sessionId) {
      Cookies.set('sessionId', payload.sessionId, { expires: 7 });
    }
    return payload;
  } catch (err) {
    return rejectWithValue(
      err.response?.data?.message || err.message || 'Login failed'
    );
  }
});

export const logout = createAsyncThunk('auth/logout', async () => {
  try {
    const sessionId = Cookies.get('sessionId');
    await authService.logout({ sessionId });
  } catch {
    // ignore — token may already be gone, still clean up locally
  } finally {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('sessionId');
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    const res = await authService.getMe();
    // Handle both shapes: { user } or { data: { user } }
    return res?.user ? res : res?.data ?? res;
  } catch (err) {
    return rejectWithValue(
      err.response?.data?.message || err.message || 'Failed to fetch user'
    );
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    accessToken: Cookies.get('accessToken') || null,
    isAuthenticated: !!Cookies.get('accessToken'),
    loading: false,
    initializing: true,
    error: null,
    registrationDone: false,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
    clearRegistration: (state) => { state.registrationDone = false; },
    setToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => { state.loading = true; state.error = null; };
    const rejected = (state, action) => { state.loading = false; state.error = action.payload; };

    builder
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.registrationDone = true;
      })
      .addCase(register.rejected, rejected)

      .addCase(login.pending, pending)
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.initializing = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, rejected)

      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.initializing = false;
      })

      .addCase(getMe.pending, (state) => { state.initializing = true; })
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.initializing = false;
      })
      .addCase(getMe.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.initializing = false;
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        Cookies.remove('sessionId');
      });
  },
});

export const { clearError, clearRegistration, setToken } = authSlice.actions;
export default authSlice.reducer;