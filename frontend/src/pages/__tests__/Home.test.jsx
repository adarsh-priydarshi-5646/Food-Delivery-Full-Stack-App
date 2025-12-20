import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '../Home';
import { useSelector } from 'react-redux';

// Mock Redux
vi.mock('react-redux', async () => {
    const actual = await vi.importActual('react-redux');
    return {
        ...actual,
        useSelector: vi.fn(),
    };
});

// Mock child components
vi.mock('../../components/UserDashboard', () => ({ default: () => <div data-testid="user-dashboard">User Dashboard</div> }));
vi.mock('../../components/OwnerDashboard', () => ({ default: () => <div data-testid="owner-dashboard">Owner Dashboard</div> }));
vi.mock('../../components/DeliveryBoy', () => ({ default: () => <div data-testid="delivery-boy">Delivery Boy</div> }));
vi.mock('../../components/Footer', () => ({ default: () => <div data-testid="footer">Footer</div> }));

describe('Home Component', () => {
    it('renders UserDashboard when role is user', () => {
        useSelector.mockReturnValue({
            userData: { role: 'user' }
        });

        render(<Home />);
        expect(screen.getByTestId('user-dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('owner-dashboard')).not.toBeInTheDocument();
        expect(screen.getByTestId('footer')).toBeInTheDocument();
    });

    it('renders OwnerDashboard when role is owner', () => {
        useSelector.mockReturnValue({
            userData: { role: 'owner' }
        });

        render(<Home />);
        expect(screen.getByTestId('owner-dashboard')).toBeInTheDocument();
        expect(screen.queryByTestId('user-dashboard')).not.toBeInTheDocument();
    });

    it('renders DeliveryBoy when role is deliveryBoy', () => {
        useSelector.mockReturnValue({
            userData: { role: 'deliveryBoy' }
        });

        render(<Home />);
        expect(screen.getByTestId('delivery-boy')).toBeInTheDocument();
    });
});
