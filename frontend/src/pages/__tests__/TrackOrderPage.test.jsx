import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import TrackOrderPage from '../TrackOrderPage';
import { BrowserRouter } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';

vi.mock('axios');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ orderId: '123' }),
        useNavigate: () => vi.fn(),
    };
});

// Mock Redux
const mockSocket = { on: vi.fn(), off: vi.fn() };
vi.mock('react-redux', async () => {
    return {
        ...await vi.importActual('react-redux'),
        useSelector: vi.fn(),
    };
});

// Mock Child Components
vi.mock('../../components/DeliveryBoyTracking', () => ({ default: () => <div data-testid="tracking-map">Tracking Map</div> }));

describe('TrackOrderPage Component', () => {
    const mockOrder = {
        _id: '123',
        deliveryAddress: { latitude: 12, longitude: 77, text: 'Home' },
        shopOrders: [
            {
                shop: { name: 'Dominos' },
                status: 'on the way',
                assignedDeliveryBoy: {
                    fullName: 'Raju',
                    mobile: '1234567890',
                    location: { coordinates: [77.1, 12.1] }
                },
                shopOrderItems: [{ name: 'Pizza', price: 200, quantity: 1 }],
                subtotal: 200
            }
        ]
    };

    it('renders tracking details', async () => {
        useSelector.mockReturnValue({ socket: mockSocket });
        axios.get.mockResolvedValueOnce({ data: mockOrder });

        render(
            <BrowserRouter>
                <TrackOrderPage />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByTestId('tracking-map')).toBeInTheDocument();
            expect(screen.getByText('Dominos')).toBeInTheDocument();
            expect(screen.getByText('Arriving Soon')).toBeInTheDocument(); // on the way status
            expect(screen.getByText('Raju')).toBeInTheDocument();
        });
    });

    it('shows loading state initially', () => {
        useSelector.mockReturnValue({ socket: mockSocket });
        // Don't resolve axios yet or make it slow
        axios.get.mockImplementation(() => new Promise(() => {}));

        render(
            <BrowserRouter>
                <TrackOrderPage />
            </BrowserRouter>
        );

        // Loading spinner usually has no text, so we check existence of container or class
        // The component has a spinner div.
        // Let's check if "Track Order" header is NOT present yet (it loads after data)
        expect(screen.queryByText('Track Order')).not.toBeInTheDocument();
    });
});
