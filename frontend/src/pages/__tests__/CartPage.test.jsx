import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CartPage from '../CartPage';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Mock dependencies
vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useSelector: vi.fn(),
    };
});

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
    };
});

// Mock Icons to prevent finding issues
vi.mock('react-icons/io', () => ({
    IoIosArrowRoundBack: () => <div data-testid="back-icon" />
}));
vi.mock('react-icons/fa', () => ({
    FaShoppingCart: () => <div data-testid="cart-icon" />,
    FaReceipt: () => <div data-testid="receipt-icon" />
}));

// Mock Child Component
vi.mock('../../components/CartItemCard', () => ({ default: ({ data }) => <div data-testid="cart-item">{data.name}</div> }));

describe('CartPage Component', () => {
    it('renders empty cart state', () => {
        useSelector.mockReturnValue({
            cartItems: [],
            totalAmount: 0
        });

        render(
            <BrowserRouter>
                <CartPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
        expect(screen.getByText('Browse Food Items')).toBeInTheDocument();
    });

    it('renders cart with items and bill details', () => {
        useSelector.mockReturnValue({
            cartItems: [
                { name: 'Pizza', price: 200, quantity: 1 },
                { name: 'Burger', price: 100, quantity: 2 }
            ],
            totalAmount: 400
        });

        render(
            <BrowserRouter>
                <CartPage />
            </BrowserRouter>
        );

        // Check Items
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        expect(screen.getByText('Burger')).toBeInTheDocument();

        // Check Bill Details
        expect(screen.getByText('Bill Details')).toBeInTheDocument();
        expect(screen.getByText('₹400')).toBeInTheDocument(); // Item Total
        expect(screen.getByText('Proceed to Checkout')).toBeInTheDocument();
    });
});
