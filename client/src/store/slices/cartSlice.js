import { createSlice } from '@reduxjs/toolkit';

const getInitialCart = () => {
  try {
    const savedCart = localStorage.getItem('eco_carts');
    return savedCart ? JSON.parse(savedCart) : {};
  } catch (e) {
    return {};
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    // Structure: { [storeId]: [ { productId, name, price, quantity, variantName, image } ] }
    carts: getInitialCart(),
  },
  reducers: {
    addToCart: (state, action) => {
      const { storeId, productId, name, price, quantity, variantName, image } = action.payload;
      
      if (!state.carts[storeId]) {
        state.carts[storeId] = [];
      }

      // Check if product with same variant is already in cart
      const existingItemIndex = state.carts[storeId].findIndex(
        item => item.productId === productId && item.variantName === variantName
      );

      if (existingItemIndex > -1) {
        state.carts[storeId][existingItemIndex].quantity += quantity;
      } else {
        state.carts[storeId].push({
          productId,
          name,
          price,
          quantity,
          variantName: variantName || '',
          image
        });
      }

      localStorage.setItem('eco_carts', JSON.stringify(state.carts));
    },
    removeFromCart: (state, action) => {
      const { storeId, productId, variantName } = action.payload;
      if (state.carts[storeId]) {
        state.carts[storeId] = state.carts[storeId].filter(
          item => !(item.productId === productId && item.variantName === variantName)
        );
        if (state.carts[storeId].length === 0) {
          delete state.carts[storeId];
        }
      }
      localStorage.setItem('eco_carts', JSON.stringify(state.carts));
    },
    updateQuantity: (state, action) => {
      const { storeId, productId, variantName, quantity } = action.payload;
      if (state.carts[storeId]) {
        const item = state.carts[storeId].find(
          item => item.productId === productId && item.variantName === variantName
        );
        if (item) {
          item.quantity = Math.max(1, quantity);
        }
      }
      localStorage.setItem('eco_carts', JSON.stringify(state.carts));
    },
    clearCart: (state, action) => {
      const { storeId } = action.payload;
      if (state.carts[storeId]) {
        delete state.carts[storeId];
      }
      localStorage.setItem('eco_carts', JSON.stringify(state.carts));
    }
  }
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
