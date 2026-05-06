import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

export const loginUser = createAsyncThunk('auth/login', async (credentials, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    dispatch(fetchUserProfile());
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await api.post('/auth/logout');
  } catch (_) {
    // DB ga yeta olmasa ham local tozalash davom etadi
  }
  localStorage.removeItem('accessToken');
  localStorage.removeItem('user');
});

// Talaba yoki o'qituvchining profil ma'lumotlarini olish (group, faculty, ...)
export const fetchUserProfile = createAsyncThunk('auth/fetchProfile', async (_, { getState, rejectWithValue }) => {
  const { user } = getState().auth;
  if (!user) return null;
  try {
    if (user.role === 'student') {
      const { data } = await api.get('/students/me');
      return data.data;
    }
    if (user.role === 'teacher') {
      const { data } = await api.get('/teachers/me');
      return data.data;
    }
    return null;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Profile fetch failed');
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            JSON.parse(localStorage.getItem('user')) || null,
    accessToken:     localStorage.getItem('accessToken') || null,
    isAuthenticated: !!localStorage.getItem('accessToken'),
    profile:         null,
    loading:         false,
    error:           null,
  },
  reducers: {
    logout(state) {
      state.user            = null;
      state.accessToken     = null;
      state.isAuthenticated = false;
      state.profile         = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload.user;
        state.accessToken     = payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading = false;
        state.error   = payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user            = null;
        state.accessToken     = null;
        state.isAuthenticated = false;
        state.profile         = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, { payload }) => {
        state.profile = payload;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
