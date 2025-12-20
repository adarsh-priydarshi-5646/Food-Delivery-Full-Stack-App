import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CategoryPage from '../CategoryPage';
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
        useParams: () => ({ categoryName: 'Pizza' }),
        useNavigate: () => vi.fn(),
    };
});

// Mock Child Components
vi.mock('../../components/Nav', () => ({ default: () => <div data-testid="nav">Nav</div> }));
vi.mock('../../components/FilterSidebar', () => ({ default: () => <div data-testid="filter-sidebar">Filter Sidebar</div> }));
vi.mock('../../components/FoodCard', () => ({ default: ({ data }) => <div data-testid="food-card">{data.name}</div> }));

describe('CategoryPage Component', () => {
    const mockItems = [
        { name: 'Veg Pizza', category: 'Pizza', price: 200, isVeg: true, rating: 4.5, deliveryTime: 25 },
        { name: 'Chicken Pizza', category: 'Pizza', price: 300, isVeg: false, rating: 4.0, deliveryTime: 35 },
        { name: 'Burger', category: 'Burger', price: 100, isVeg: false, rating: 3.5, deliveryTime: 20 }
    ];

    const defaultState = {
        itemsInMyCity: mockItems,
        selectedCategories: [],
        priceRange: { min: 0, max: 1000 },
        sortBy: 'popularity',
        quickFilters: { veg: false, fastDelivery: false, topRated: false }
    };

    it('renders filtered items correctly', () => {
        useSelector.mockReturnValue(defaultState);

        render(
            <BrowserRouter>
                <CategoryPage />
            </BrowserRouter>
        );

        // Should show only Pizza items
        expect(screen.getByText('Veg Pizza')).toBeInTheDocument();
        expect(screen.getByText('Chicken Pizza')).toBeInTheDocument();
        expect(screen.queryByText('Burger')).not.toBeInTheDocument();
        expect(screen.getByText('2 items found')).toBeInTheDocument();
    });

    it('applies quick filters (Veg Only)', () => {
        useSelector.mockReturnValue({
            ...defaultState,
            quickFilters: { veg: true, fastDelivery: false, topRated: false }
        });

        render(
            <BrowserRouter>
                <CategoryPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Veg Pizza')).toBeInTheDocument();
        expect(screen.queryByText('Chicken Pizza')).not.toBeInTheDocument();
    });

    it('applies price range filter', () => {
        useSelector.mockReturnValue({
            ...defaultState,
            priceRange: { min: 0, max: 250 }
        });

        render(
            <BrowserRouter>
                <CategoryPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Veg Pizza')).toBeInTheDocument(); // 200
        expect(screen.queryByText('Chicken Pizza')).not.toBeInTheDocument(); // 300
    });
});
