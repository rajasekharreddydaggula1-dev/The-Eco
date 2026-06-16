const getInitialState = () => {
  const token = localStorage.getItem('eco_token') || null;
  let user = null;
  try {
    const savedUser = localStorage.getItem('eco_user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error('Error parsing saved user', e);
  }
  return {
    user,
    token,
    loading: false,
    error: null
  };
};

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponse } from '../../utils/api';

// Async Thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      return await handleResponse(response);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      if (!token) return null;

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await handleResponse(response);
      return data.user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: getInitialState(),
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem('eco_token');
      localStorage.removeItem('eco_user');
    },
    clearAuthError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('eco_token', action.payload.token);
        localStorage.setItem('eco_user', JSON.stringify(action.payload.user));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        localStorage.setItem('eco_token', action.payload.token);
        localStorage.setItem('eco_user', JSON.stringify(action.payload.user));
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.user = {
            id: action.payload._id,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
            store: action.payload.store ? action.payload.store._id : null,
            status: action.payload.status,
            storeDetails: action.payload.store
          };
          localStorage.setItem('eco_user', JSON.stringify(state.user));
        }
      });
  }
});

export const { logout, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
