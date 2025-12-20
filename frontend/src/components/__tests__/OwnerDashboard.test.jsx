import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import OwnerDashboard from '../OwnerDashboard';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';

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
    FaStore: () => <div data-testid="store-icon" />,
    FaUtensils: () => <div />,
    FaPen: () => <div />,
    FaBoxOpen: () => <div />,
    FaRupeeSign: () => <div />,
    FaChartLine: () => <div />,
    FaStar: () => <div />,
    FaUniversity: () => <div />,
    FaPlus: () => <div />
}));

vi.mock('../../components/Nav', () => ({ default: () => <div data-testid="nav">Nav</div> }));
vi.mock('../../components/OwnerOrderCard', () => ({ default: ({ data }) => <div data-testid="order-card">{data._id}</div> }));

describe('OwnerDashboard Component', () => {
    const mockShopData = {
        _id: 'shop1',
        name: 'My Shop',
        city: 'Delhi',
        state: 'DL',
        items: [{ name: 'Burger', price: 100, category: 'Snacks' }]
    };

    const mockOrders = [
        {
            _id: 'o1',
            createdAt: new Date().toISOString(),
            shopOrders: { // Single shop order structure
                shop: { _id: 'shop1' },
                subtotal: 500,
                status: 'preparing'
            }
        }
    ];

    it('renders "Launch Your Restaurant" when no shop data', () => {
        useSelector.mockReturnValue({
            myShopData: null,
            myOrders: [],
            userData: { _id: 'u1' }
        });

        render(
            <BrowserRouter>
                <OwnerDashboard />
            </BrowserRouter>
        );

        expect(screen.getByText('Launch Your Restaurant')).toBeInTheDocument();
        expect(screen.getByText('Create Restaurant')).toBeInTheDocument();
    });

    it('renders dashboard with stats when shop data exists', () => {
        useSelector.mockReturnValue({
            myShopData: mockShopData,
            myOrders: mockOrders,
            userData: { _id: 'u1' }
        });

        render(
            <BrowserRouter>
                <OwnerDashboard />
            </BrowserRouter>
        );

        expect(screen.getByText('My Shop')).toBeInTheDocument();
        expect(screen.getByText('Delhi, DL')).toBeInTheDocument();
        
        // Stats
        expect(screen.getByText('Total Revenue')).toBeInTheDocument();
        expect(screen.getByText('₹500')).toBeInTheDocument();
        expect(screen.getByText('Total Orders')).toBeInTheDocument();
        // '1' appears twice (Orders and Menu Items count)
        const counts = screen.getAllByText('1');
        expect(counts.length).toBeGreaterThanOrEqual(2);

        // Menu Items
        expect(screen.getByText('Burger')).toBeInTheDocument();
    });
});
