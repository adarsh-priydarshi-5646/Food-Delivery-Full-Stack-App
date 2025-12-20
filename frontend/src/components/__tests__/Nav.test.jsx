import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Nav from '../Nav';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

vi.mock('axios');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
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

// Mock Icons to allow text queries or existence checks without fails
vi.mock('react-icons/fa6', () => ({
    FaLocationDot: () => <div data-testid="location-icon" />,
    FaPlus: () => <div data-testid="plus-icon" />
}));
vi.mock('react-icons/io', () => ({
    IoIosSearch: () => <div data-testid="search-icon" />
}));
vi.mock('react-icons/fi', () => ({
    FiShoppingCart: () => <div data-testid="cart-icon" />
}));
vi.mock('react-icons/rx', () => ({
    RxCross2: () => <div data-testid="close-icon" />
}));
vi.mock('react-icons/tb', () => ({
    TbReceipt2: () => <div data-testid="receipt-icon" />
}));

describe('Nav Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockUser = {
        fullName: 'John Doe',
        role: 'user',
        _id: 'u1'
    };

    it('renders user navigation', () => {
        useSelector.mockReturnValue({
            userData: mockUser,
            currentCity: 'Mumbai',
            cartItems: [],
            myShopData: null,
            user: { userData: mockUser } // State shape
        });
        // Fixing selector return value: Nav uses state.user and state.owner
        useSelector.mockImplementation((selector) => {
            const state = {
                user: { userData: mockUser, currentCity: 'Mumbai', cartItems: [{ id: 1 }] },
                owner: { myShopData: null }
            };
            return selector(state);
        });

        render(
            <BrowserRouter>
                <Nav />
            </BrowserRouter>
        );

        expect(screen.getByText('Vingo')).toBeInTheDocument();
        expect(screen.getByText('Mumbai')).toBeInTheDocument();
        expect(screen.getByText('My Orders')).toBeInTheDocument();
        // Cart badge
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('renders owner navigation', () => {
        const mockOwner = { ...mockUser, role: 'owner' };
        useSelector.mockImplementation((selector) => {
            const state = {
                user: { userData: mockOwner, currentCity: 'Mumbai', cartItems: [] },
                owner: { myShopData: { name: 'Shop' } }
            };
            return selector(state);
        });

        render(
            <BrowserRouter>
                <Nav />
            </BrowserRouter>
        );

        expect(screen.getByText('Add Item')).toBeInTheDocument();
        expect(screen.queryByText('My Orders')).not.toBeInTheDocument(); // Owner has Orders icon button, label might be hidden on mobile but "Orders" text exists in md view
        expect(screen.getByText('Orders')).toBeInTheDocument();
    });

    it('handles logout', async () => {
        useSelector.mockImplementation((selector) => selector({
            user: { userData: mockUser, currentCity: 'Mumbai', cartItems: [] },
            owner: { myShopData: null }
        }));
        axios.get.mockResolvedValueOnce({});

        render(
            <BrowserRouter>
                <Nav />
            </BrowserRouter>
        );

        // Click Avatar to show menu
        fireEvent.click(screen.getByText('J'));
        
        // Click Log Out
        fireEvent.click(screen.getByText('Log Out'));

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/signout'),
                expect.any(Object)
            );
            expect(mockDispatch).toHaveBeenCalled();
        });
    });

    it('handles search input', async () => {
        useSelector.mockImplementation((selector) => selector({
            user: { userData: mockUser, currentCity: 'Mumbai', cartItems: [] },
            owner: { myShopData: null }
        }));
        axios.get.mockResolvedValueOnce({ data: [] });

        render(
            <BrowserRouter>
                <Nav />
            </BrowserRouter>
        );

        // Input is visible for desktop 'user' role
        const inputs = screen.getAllByPlaceholderText('Search delicious food...');
        // Desktop input
        fireEvent.change(inputs[0], { target: { value: 'Pizza' } });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('query=Pizza'),
                expect.any(Object)
            );
            expect(mockDispatch).toHaveBeenCalled(); // setSearchItems
        });
    });
});
