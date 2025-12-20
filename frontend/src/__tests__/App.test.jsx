import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from '../App';
import { BrowserRouter } from 'react-router-dom';

// Mock all custom hooks to avoid side effects
vi.mock('../hooks/useGetCurrentUser');
vi.mock('../hooks/useGetMyShop');
vi.mock('../hooks/useGetShopByCity');
vi.mock('../hooks/useGetItemsByCity');
vi.mock('../hooks/useGetMyOrders');
vi.mock('../hooks/useUpdateLocation');
vi.mock('../hooks/useGetCity', () => ({ default: () => ({ getCity: vi.fn() }) }));

// Mock socket.io
vi.mock('socket.io-client', () => ({
  io: () => ({
    on: vi.fn(),
    emit: vi.fn(),
    disconnect: vi.fn(),
  }),
}));

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({ 
      user: { 
        userData: null, 
        authLoading: false 
      } 
    }),
  };
});

// Mock react-icons
vi.mock('react-icons/fa', () => {
  const Icon = (props) => <span {...props} data-testid="icon" />;
  return {
    FaSearch: Icon,
    FaMapMarkerAlt: Icon,
    FaCaretDown: Icon,
    FaChevronRight: Icon,
    FaChevronDown: Icon,
    FaMobileAlt: Icon,
    FaEnvelope: Icon,
    FaUtensils: Icon,
    FaStore: Icon,
    FaLink: Icon,
    FaCity: Icon,
  };
});

// Mock Framer Motion to avoid index usage errors in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileInView, initial, animate, transition, variants, viewport, ...props }) => <div {...props}>{children}</div>,
    h1: ({ children, initial, animate, transition, ...props }) => <h1 {...props}>{children}</h1>,
    p: ({ children, initial, animate, transition, ...props }) => <p {...props}>{children}</p>,
    span: ({ children, initial, animate, transition, whileInView, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, initial, animate, transition, whileHover, whileTap, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

describe('App Component', () => {
  it('renders Landing Page when not authenticated', async () => {
    const { findByRole } = render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    // Wait for lazy-loaded component to render
    const heading = await findByRole('heading', { name: 'Vingo', level: 1 });
    expect(heading).toBeInTheDocument();
  });
});
