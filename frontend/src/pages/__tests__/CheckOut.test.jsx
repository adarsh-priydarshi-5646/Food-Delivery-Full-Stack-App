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

vi.mock('../../hooks/useGetCity', () => ({
    default: () => ({
        getCity: vi.fn().mockResolvedValue({ city: 'Test City', address: 'Test Address' })
    })
}));

vi.mock('../../components/AddressAutocomplete', () => ({
    default: ({ onSelect, initialValue }) => (
        <input 
            data-testid="address-autocomplete"
            value={initialValue}
            onChange={(e) => onSelect({ address: e.target.value, lat: 12, lon: 77 })}
            placeholder="Search for a building, street or area..."
        />
    )
}));

// Mock icons
vi.mock('react-icons/io', () => ({ IoIosArrowRoundBack: () => <div>Icon</div> }));
vi.mock('react-icons/io5', () => ({ IoSearchOutline: () => <div>Icon</div>, IoLocationSharp: () => <div>Icon</div> }));
vi.mock('react-icons/tb', () => ({ TbCurrentLocation: () => <div>Icon</div> }));
vi.mock('react-icons/md', () => ({ MdDeliveryDining: () => <div>Icon</div>, MdOutlineAddLocationAlt: () => <div>Icon</div> }));
vi.mock('react-icons/fa', () => ({ 
    FaCreditCard: () => <div>Icon</div>, 
    FaReceipt: () => <div>Icon</div>, 
    FaCheckCircle: () => <div>Icon</div>,
    FaPlus: () => <div>Icon</div>,
    FaFacebook: () => <div>Icon</div>,
    FaTwitter: () => <div>Icon</div>,
    FaInstagram: () => <div>Icon</div>,
    FaLinkedin: () => <div>Icon</div>,
    FaEnvelope: () => <div>Icon</div>,
    FaPhone: () => <div>Icon</div>,
    FaMapMarkerAlt: () => <div>Icon</div>
}));
vi.mock('react-icons/fa6', () => ({ FaMobileScreenButton: () => <div>Icon</div> }));

describe('CheckOut Component', () => {
    const defaultState = {
        map: { location: { lat: 12, lon: 77 }, address: '' },
        user: { 
            cartItems: [{ name: 'Pizza', price: 200, quantity: 1 }], 
            totalAmount: 200,
            userData: { fullName: 'Test User', location: { coordinates: [77, 12] } }
        },
        owner: { myShopData: null }
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
        expect(screen.getByPlaceholderText('Search for a building, street or area...')).toBeInTheDocument();
        expect(screen.getByTestId('map-container')).toBeInTheDocument();
        expect(screen.getByText('Pizza')).toBeInTheDocument();
        expect(screen.getByText('Place Order')).toBeInTheDocument(); // Default COD
    });

    it('toggles payment method', () => {
        useSelector.mockImplementation((selector) => selector(defaultState));

        render(
            <BrowserRouter>
                <CheckOut />
            </BrowserRouter>
        );

        const cardBtn = screen.getByText('Cards / Wallet / UPI');
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
        
        // Search address via autocomplete mock
        fireEvent.change(screen.getByPlaceholderText('Search for a building, street or area...'), { target: { value: 'Test Address' } });

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
