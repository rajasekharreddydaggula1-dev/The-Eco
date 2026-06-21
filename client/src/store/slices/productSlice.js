import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponse } from '../../utils/api';

const getTenantHeaders = ({ tenantId, tenantSlug }) => {
  const headers = {};
  if (tenantId) headers['x-tenant-id'] = tenantId;
  
  // Resolve tenant slug from passed args, or fallback to parsing from window.location.pathname
  let slug = tenantSlug;
  if (!tenantId && !slug && typeof window !== 'undefined' && window.location) {
    const match = window.location.pathname.match(/\/store\/([^/]+)/);
    if (match && match[1]) {
      slug = match[1];
    }
  }
  
  if (slug) headers['x-tenant-slug'] = slug;
  return headers;
};

// Thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async ({ tenantId, tenantSlug, search, category }, { rejectWithValue }) => {
    try {
      const headers = getTenantHeaders({ tenantId, tenantSlug });
      let url = '/api/products';
      const params = [];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (category) params.push(`category=${encodeURIComponent(category)}`);
      if (params.length > 0) {
        url += `?${params.join('&')}`;
      }

      const response = await fetch(url, { headers });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchById',
  async ({ id, tenantId, tenantSlug }, { rejectWithValue }) => {
    try {
      const headers = getTenantHeaders({ tenantId, tenantSlug });
      const response = await fetch(`/api/products/${id}`, { headers });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/create',
  async ({ productData, tenantId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...getTenantHeaders({ tenantId })
      };

      const response = await fetch('/api/products', {
        method: 'POST',
        headers,
        body: JSON.stringify(productData)
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData, tenantId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...getTenantHeaders({ tenantId })
      };

      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(productData)
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ id, tenantId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const headers = {
        'Authorization': `Bearer ${token}`,
        ...getTenantHeaders({ tenantId })
      };

      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers
      });
      await handleResponse(response);
      return id;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    loading: false,
    error: null
  },
  reducers: {
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Single Product
      .addCase(fetchProductById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.currentProduct = null;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create Product
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload);
      })
      // Update Product
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.products = state.products.map(prod => 
          prod._id === action.payload._id ? action.payload : prod
        );
        if (state.currentProduct && state.currentProduct._id === action.payload._id) {
          state.currentProduct = action.payload;
        }
      })
      // Delete Product
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(prod => prod._id !== action.payload);
      });
  }
});

export const { clearCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
