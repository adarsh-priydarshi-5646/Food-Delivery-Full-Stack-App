import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CheckOut from '../CheckOut';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
    return {
        ...await vi.importActual('react-redux'),
        useDispatch: () => mockDispatch,
        useSelector: vi.fn(),
    };
});

// Mock Leaflet (CRITICAL for testing components with Maps)
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
    TileLayer: () => <div data-testid="tile-layer" />,
    Marker: () => <div data-testid="marker" />,
    useMap: () => ({ setView: vi.fn() }),
}));

// Mock Stripe
vi.mock('@stripe/stripe-js', () => ({
    loadStripe: vi.fn().mockResolvedValue({}),
}));

describe('CheckOut Component', () => {
    const defaultState = {
        map: { location: { lat: 12, lon: 77 }, address: '' },
        user: { 
            cartItems: [{ name: 'Pizza', price: 200, quantity: 1 }], 
            totalAmount: 200,
            userData: { location: { coordinates: [77, 12] } }
        }
    };

    it('renders checkout form and summary', () => {
        useSelector.mockReturnValue(defaultState.user); // Hack for first selector
        // Actually CheckOut uses multiple selectors. We need to mock implementation.
        useSelector.mockImplementation((selector) => {
            const state = defaultState;
            return selector(state);
        });

        render(
            <BrowserRouter>
                <CheckOut />
            </BrowserRouter>
        );

        expect(screen.getByText('Checkout')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your delivery address')).toBeInTheDocument();
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByText('Pizza x 1')).toBeInTheDocument();
        expect(screen.getByText('Place Order')).toBeInTheDocument(); // Default COD
    });

    it('toggles payment method', () => {
        useSelector.mockImplementation((selector) => selector(defaultState));

        render(
            <BrowserRouter>
                <CheckOut />
            </BrowserRouter>
        );

        const cardBtn = screen.getByText('UPI / Card');
        fireEvent.click(cardBtn);
        
        expect(screen.getByText('Pay & Place Order')).toBeInTheDocument();
    });

    it('handles order placement (COD)', async () => {
        useSelector.mockImplementation((selector) => selector({
            ...defaultState,
            map: { location: { lat: 12, lon: 77 }, address: 'Test Address' }
        }));
        
        axios.post.mockResolvedValueOnce({ data: { _id: 'order-123' } });

        render(
            <BrowserRouter>
                <CheckOut />
            </BrowserRouter>
        );
        
        // Input address
        fireEvent.change(screen.getByPlaceholderText('Enter your delivery address'), { target: { value: 'Test Address' } });

        const placeOrderBtn = screen.getByText('Place Order');
        fireEvent.click(placeOrderBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/place-order'),
                expect.objectContaining({ paymentMethod: 'cod' }),
                expect.anything()
            );
            expect(mockDispatch).toHaveBeenCalled();
        });
    });
});
