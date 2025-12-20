import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import FoodCard from '../FoodCard';
import { useSelector, useDispatch } from 'react-redux';
import { addToCart, updateQuantity, removeCartItem } from '../../redux/userSlice';

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
    return {
        ...await vi.importActual('react-redux'),
        useDispatch: () => mockDispatch,
        useSelector: vi.fn(),
    };
});

// Mock Icons
vi.mock('react-icons/fa', () => ({
    FaStar: () => <div data-testid="star-icon" />,
    FaMinus: () => <div data-testid="minus-icon" />,
    FaPlus: () => <div data-testid="plus-icon" />
}));

vi.mock('../../redux/userSlice', () => ({
    addToCart: vi.fn(),
    updateQuantity: vi.fn(),
    removeCartItem: vi.fn()
}));

describe('FoodCard Component', () => {
    const mockItem = {
        _id: '1',
        name: 'Pizza',
        price: 300,
        image: 'pizza.jpg',
        foodType: 'veg',
        description: 'Yummy',
        rating: { average: 4.5, count: 10 }
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders item details correctly', () => {
        useSelector.mockReturnValue({ cartItems: [] });

        render(<FoodCard data={mockItem} />);

        expect(screen.getByText('Pizza')).toBeInTheDocument();
        expect(screen.getByText('₹300')).toBeInTheDocument();
        const ratings = screen.getAllByText('4.5');
        expect(ratings.length).toBeGreaterThanOrEqual(1);
        expect(screen.getByText('Yummy')).toBeInTheDocument();
        expect(screen.getByText('ADD')).toBeInTheDocument();
    });

    it('handles add to cart', () => {
        useSelector.mockReturnValue({ cartItems: [] });

        render(<FoodCard data={mockItem} />);

        fireEvent.click(screen.getByText('ADD'));
        expect(addToCart).toHaveBeenCalledWith(expect.objectContaining({
            id: '1',
            quantity: 1
        }));
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('shows quantity controls when item in cart', () => {
        useSelector.mockReturnValue({ cartItems: [{ id: '1', quantity: 2 }] });

        render(<FoodCard data={mockItem} />);

        expect(screen.queryByText('ADD')).not.toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByTestId('minus-icon')).toBeInTheDocument();
        expect(screen.getByTestId('plus-icon')).toBeInTheDocument();
    });

    it('handles increment and decrement', () => {
        useSelector.mockReturnValue({ cartItems: [{ id: '1', quantity: 2 }] });

        render(<FoodCard data={mockItem} />);

        // Increment
        fireEvent.click(screen.getByTestId('plus-icon').parentElement);
        expect(updateQuantity).toHaveBeenCalledWith({ id: '1', quantity: 3 });

        // Decrement
        fireEvent.click(screen.getByTestId('minus-icon').parentElement);
        expect(updateQuantity).toHaveBeenCalledWith({ id: '1', quantity: 1 });
    });

    it('handles remove when quantity is 1 and decrement clicked', () => {
        useSelector.mockReturnValue({ cartItems: [{ id: '1', quantity: 1 }] });

        render(<FoodCard data={mockItem} />);

        fireEvent.click(screen.getByTestId('minus-icon').parentElement);
        expect(removeCartItem).toHaveBeenCalledWith('1');
    });
});
