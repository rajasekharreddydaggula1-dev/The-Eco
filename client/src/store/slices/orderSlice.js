import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { handleResponse } from '../../utils/api';

// Thunks
export const checkoutCart = createAsyncThunk(
  'orders/checkout',
  async ({ items, shippingAddress, tenantId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-tenant-id': tenantId
        },
        body: JSON.stringify({ items, shippingAddress })
      });
      return await handleResponse(response);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const confirmMockPayment = createAsyncThunk(
  'orders/confirmMockPayment',
  async ({ sessionId }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch('/api/orders/confirm-mock-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ sessionId })
      });
      return await handleResponse(response);
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const fetchOrders = createAsyncThunk(
  'orders/fetchAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await handleResponse(response);
      return data.data;
    } catch (e) {
      return rejectWithValue(e.message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }, { getState, rejectWithValue }) => {
    try {
      const token = getState().auth.token;
      const response = await fetch(`/api/orders/${id}/status`, {
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

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    loading: false,
    checkoutLoading: false,
    error: null,
    checkoutSession: null
  },
  reducers: {
    resetCheckout: (state) => {
      state.checkoutSession = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Checkout
      .addCase(checkoutCart.pending, (state) => {
        state.checkoutLoading = true;
        state.error = null;
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.checkoutLoading = false;
        state.checkoutSession = action.payload; // has url, sessionId, mock
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.checkoutLoading = false;
        state.error = action.payload;
      })
      // Confirm Mock Payment
      .addCase(confirmMockPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmMockPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(confirmMockPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Orders
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Order Status
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.orders = state.orders.map(order => 
          order._id === action.payload.id ? { ...order, status: action.payload.status } : order
        );
      });
  }
});

export const { resetCheckout } = orderSlice.actions;
export default orderSlice.reducer;
