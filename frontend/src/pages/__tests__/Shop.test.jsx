import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Shop from '../Shop';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mock dependencies
vi.mock('axios');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ shopId: 'shop-123' }),
        useNavigate: () => vi.fn(),
    };
});

// Mock Icons
vi.mock('react-icons/fa6', () => ({
    FaStore: () => <div data-testid="store-icon" />,
    FaLocationDot: () => <div data-testid="location-icon" />,
    FaStar: () => <div data-testid="star-icon" />,
    FaClock: () => <div data-testid="clock-icon" />,
    FaArrowLeft: () => <div data-testid="arrow-left-icon" />,
}));

// Mock FoodCard
vi.mock('../../components/FoodCard', () => ({ default: ({ data }) => <div data-testid="food-card">{data.name}</div> }));

describe('Shop Component', () => {
    const mockShopData = {
        shop: {
            name: 'Pizza Hut',
            rating: 4.5,
            deliveryTime: 30,
            address: 'Downtown',
            image: 'http://test.com/img.jpg',
            cuisine: 'Italian, Pizza'
        },
        items: [
            { _id: '1', name: 'Margherita' },
            { _id: '2', name: 'Pepperoni' }
        ]
    };

    it('renders shop details and menu items', async () => {
        axios.get.mockResolvedValueOnce({ data: mockShopData });

        render(
            <BrowserRouter>
                <Shop />
            </BrowserRouter>
        );

        // Check if loading or initial state is handled gracefully (Shop renders null initially)
        // Wait for data to load
        await waitFor(() => {
            expect(screen.getByText('Pizza Hut')).toBeInTheDocument();
            expect(screen.getByText('Margherita')).toBeInTheDocument();
            expect(screen.getByText('Pepperoni')).toBeInTheDocument();
            expect(screen.getByText('30 mins')).toBeInTheDocument();
            expect(screen.getByText('4.5')).toBeInTheDocument();
        });
    });

    it('renders no items state correctly', async () => {
        axios.get.mockResolvedValueOnce({ 
            data: { ...mockShopData, items: [] } 
        });

        render(
            <BrowserRouter>
                <Shop />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByText('No Items Available')).toBeInTheDocument();
            expect(screen.getByText("This restaurant hasn't added any items yet")).toBeInTheDocument();
        });
    });
});
