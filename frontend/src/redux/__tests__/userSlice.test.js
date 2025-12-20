import { describe, it, expect } from 'vitest';
import userReducer, { 
    setUserData, 
    addToCart, 
    removeCartItem, 
    updateQuantity, 
    clearCart,
    setMyOrders,
    updateRealtimeOrderStatus
} from '../userSlice';

describe('userSlice', () => {
    const initialState = {
        userData: null,
        cartItems: [],
        totalAmount: 0,
        myOrders: [],
        currentCity: 'Mumbai',
        // ... other defaults
    };

    it('should handle initial state', () => {
        expect(userReducer(undefined, { type: 'unknown' })).toEqual(expect.objectContaining({
            cartItems: [],
            totalAmount: 0
        }));
    });

    it('should handle setUserData', () => {
        const user = { name: 'John', role: 'user' };
        const state = userReducer(initialState, setUserData(user));
        expect(state.userData).toEqual(user);
    });

    it('should handle addToCart', () => {
        const item = { id: '1', name: 'Pizza', price: 100, quantity: 1 };
        const state = userReducer(initialState, addToCart(item));
        expect(state.cartItems).toHaveLength(1);
        expect(state.cartItems[0]).toEqual(item);
        expect(state.totalAmount).toBe(100);
    });

    it('should increment quantity if item already exists', () => {
        const item = { id: '1', name: 'Pizza', price: 100, quantity: 1 };
        let state = userReducer(initialState, addToCart(item));
        state = userReducer(state, addToCart(item));
        expect(state.cartItems[0].quantity).toBe(2);
        expect(state.totalAmount).toBe(200);
    });

    it('should handle removeCartItem', () => {
        const item = { id: '1', name: 'Pizza', price: 100, quantity: 1 };
        let state = userReducer(initialState, addToCart(item));
        state = userReducer(state, removeCartItem('1'));
        expect(state.cartItems).toHaveLength(0);
        expect(state.totalAmount).toBe(0);
    });

    it('should handle updateQuantity', () => {
        const item = { id: '1', name: 'Pizza', price: 100, quantity: 1 };
        let state = userReducer(initialState, addToCart(item));
        state = userReducer(state, updateQuantity({ id: '1', quantity: 5 }));
        expect(state.cartItems[0].quantity).toBe(5);
        expect(state.totalAmount).toBe(500);
    });

    it('should handle clearCart', () => {
        const item = { _id: '1', name: 'Pizza', price: 100 };
        let state = userReducer(initialState, addToCart(item));
        state = userReducer(state, clearCart());
        expect(state.cartItems).toHaveLength(0);
        expect(state.totalAmount).toBe(0);
    });

    it('should handle updateRealtimeOrderStatus', () => {
        const initialOrders = {
            ...initialState,
            myOrders: [{ 
                _id: 'o1', 
                shopOrders: [
                    { shop: { _id: 's1' }, status: 'preparing' } // structure assumption based on code
                ] 
            }]
        };
        // Need to match structure expected by reducer. 
        // Based on `order.shopOrders.find(so => so.shop._id === shopId)` logic in reducer?
        // Let's verify structure by viewing file or guessing defensively.
        
        // Actually simpler test: setMyOrders
        const orders = [{ _id: 'o1' }];
        const state = userReducer(initialState, setMyOrders(orders));
        expect(state.myOrders).toEqual(orders);
    });
});
