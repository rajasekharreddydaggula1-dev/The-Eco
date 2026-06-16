import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponse } from '../../utils/api';

// Thunks
export const fetchStores = createAsyncThunk(
  'stores/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      const response = await fetch('/api/stores', { headers });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchStoreBySlug = createAsyncThunk(
  'stores/fetchBySlug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await fetch(`/api/stores/slug/${slug}`);
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateStoreMetadata = createAsyncThunk(
  'stores/updateMetadata',
  async ({ id, storeData }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(`/api/stores/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(storeData)
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateStoreStatus = createAsyncThunk(
  'stores/updateStatus',
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(`/api/stores/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      const data = await handleResponse(response);
      return { id, status: data.data.status };
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const storeSlice = createSlice({
  name: 'stores',
  initialState: {
    stores: [],
    currentStore: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentStore: (state) => {
      state.currentStore = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All Stores
      .addCase(fetchStores.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStores.fulfilled, (state, action) => {
        state.loading = false;
        state.stores = action.payload;
      })
      .addCase(fetchStores.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Store by Slug
      .addCase(fetchStoreBySlug.pending, (state) => {
        state.loading = true;
        state.currentStore = null;
        state.error = null;
      })
      .addCase(fetchStoreBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentStore = action.payload;
      })
      .addCase(fetchStoreBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Store Metadata
      .addCase(updateStoreMetadata.fulfilled, (state, action) => {
        if (state.currentStore && state.currentStore._id === action.payload._id) {
          state.currentStore = action.payload;
        }
        state.stores = state.stores.map(store => 
          store._id === action.payload._id ? action.payload : store
        );
      })
      // Update Store Status
      .addCase(updateStoreStatus.fulfilled, (state, action) => {
        state.stores = state.stores.map(store => 
          store._id === action.payload.id ? { ...store, status: action.payload.status } : store
        );
      });
  }
});

export const { clearCurrentStore } = storeSlice.actions;
export default storeSlice.reducer;
