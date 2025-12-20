import { createSlice } from "@reduxjs/toolkit";


const saveCartToLocalStorage = (cartItems, totalAmount) => {
  try {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('totalAmount', JSON.stringify(totalAmount));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const loadCartFromLocalStorage = () => {
  try {
    const cartItems = localStorage.getItem('cartItems');
    const totalAmount = localStorage.getItem('totalAmount');
    return {
      cartItems: cartItems ? JSON.parse(cartItems) : [],
      totalAmount: totalAmount ? JSON.parse(totalAmount) : 0,
    };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { cartItems: [], totalAmount: 0 };
  }
};

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    authLoading: true,
    currentCity: null,
    currentState: null,
    currentAddress: null,
    shopInMyCity: null,
    itemsInMyCity: null,
    cartItems: [],
    totalAmount: 0,
    myOrders: [],
    searchItems: null,
    socket: null,
    selectedAddressId: null,
    
    selectedCategories: [],
    priceRange: { min: 0, max: 1000 },
    sortBy: 'popularity',
    quickFilters: { veg: false, fastDelivery: false, topRated: false },
  },
  reducers: {
    hydrateCart: (state) => {
      const { cartItems, totalAmount } = loadCartFromLocalStorage();
      state.cartItems = cartItems;
      state.totalAmount = totalAmount;
    },
    setUserData: (state, action) => {
      state.userData = action.payload;
    },
    setAuthLoading: (state, action) => {
      state.authLoading = action.payload;
    },
    setCurrentCity: (state, action) => {
      state.currentCity = action.payload;
    },
    setCurrentState: (state, action) => {
      state.currentState = action.payload;
    },
    setCurrentAddress: (state, action) => {
      state.currentAddress = action.payload;
    },
    setShopsInMyCity: (state, action) => {
      state.shopInMyCity = action.payload;
    },
    setItemsInMyCity: (state, action) => {
      state.itemsInMyCity = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    },
    addToCart: (state, action) => {
      const cartItem = action.payload;
      const existingItem = state.cartItems.find((i) => i.id == cartItem.id);
      if (existingItem) {
        existingItem.quantity += cartItem.quantity;
      } else {
        state.cartItems.push(cartItem);
      }

      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      saveCartToLocalStorage(state.cartItems, state.totalAmount);
    },

    setTotalAmount: (state, action) => {
      state.totalAmount = action.payload;
    },

    updateQuantity: (state, action) => {
      const { id, quantity } = action.payload;
      const item = state.cartItems.find((i) => i.id == id);
      if (item) {
        item.quantity = quantity;
      }
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      saveCartToLocalStorage(state.cartItems, state.totalAmount);
    },

    removeCartItem: (state, action) => {
      state.cartItems = state.cartItems.filter((i) => i.id !== action.payload);
      state.totalAmount = state.cartItems.reduce(
        (sum, i) => sum + i.price * i.quantity,
        0
      );
      saveCartToLocalStorage(state.cartItems, state.totalAmount);
    },

    setMyOrders: (state, action) => {
      state.myOrders = action.payload;
    },
    addMyOrder: (state, action) => {
      state.myOrders = [action.payload, ...state.myOrders];
    },

    updateOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        if (order.shopOrders && order.shopOrders.shop._id == shopId) {
          order.shopOrders.status = status;
        }
      }
    },

    updateRealtimeOrderStatus: (state, action) => {
      const { orderId, shopId, status } = action.payload;
      const order = state.myOrders.find((o) => o._id == orderId);
      if (order) {
        const shopOrder = order.shopOrders.find((so) => so.shop._id == shopId);
        if (shopOrder) {
          shopOrder.status = status;
        }
      }
    },

    setSearchItems: (state, action) => {
      state.searchItems = action.payload;
    },

    clearCart: (state) => {
      state.cartItems = [];
      state.totalAmount = 0;
      saveCartToLocalStorage([], 0);
    },

    
    setSelectedCategories: (state, action) => {
      state.selectedCategories = action.payload;
    },
    toggleCategory: (state, action) => {
      const category = action.payload;
      if (state.selectedCategories.includes(category)) {
        state.selectedCategories = state.selectedCategories.filter(c => c !== category);
      } else {
        state.selectedCategories.push(category);
      }
    },
    setPriceRange: (state, action) => {
      state.priceRange = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    toggleQuickFilter: (state, action) => {
      const filterKey = action.payload;
      state.quickFilters[filterKey] = !state.quickFilters[filterKey];
    },
    clearFilters: (state) => {
      state.selectedCategories = [];
      state.priceRange = { min: 0, max: 1000 };
      state.sortBy = 'popularity';
      state.quickFilters = { veg: false, fastDelivery: false, topRated: false };
    },
    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload;
    },
  },
});

export const {
  setUserData,
  setAuthLoading,
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
  setShopsInMyCity,
  setItemsInMyCity,
  addToCart,
  updateQuantity,
  removeCartItem,
  setMyOrders,
  addMyOrder,
  updateOrderStatus,
  setSearchItems,
  setTotalAmount,
  setSocket,
  updateRealtimeOrderStatus,
  clearCart,
  hydrateCart,
  setSelectedCategories,
  toggleCategory,
  setPriceRange,
  setSortBy,
  toggleQuickFilter,
  clearFilters,
  setSelectedAddressId,
} = userSlice.actions;
export default userSlice.reducer;
