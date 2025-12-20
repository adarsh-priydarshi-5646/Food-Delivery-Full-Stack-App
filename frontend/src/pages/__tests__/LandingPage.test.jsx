import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../LandingPage';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

// Mock hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
  const actual = await vi.importActual('react-redux');
  return {
    ...actual,
    useDispatch: () => mockDispatch,
    useSelector: (selector) => selector({ user: { currentCity: 'Delhi NCR' } }),
  };
});

vi.mock('../../hooks/useGetCity', () => ({
  default: () => ({
    getCity: vi.fn(),
  }),
}));

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

// Mock framer-motion to avoid animation issues in tests
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

describe('LandingPage Component', () => {
  it('renders Vingo title correctly', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(screen.getByRole('heading', { name: 'Vingo', level: 1 })).toBeInTheDocument();
  });

  it('renders subtitle with city', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(screen.getByText((content, node) => {
      const hasText = (node) => node.textContent === "Find the best restaurants, cafés and bars in Delhi NCR";
      const nodeHasText = hasText(node);
      const childrenDontHaveText = Array.from(node.children).every(
        (child) => !hasText(child)
      );
      return nodeHasText && childrenDontHaveText;
    })).toBeInTheDocument();
  });

  it('renders Get the App button', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );
    expect(screen.getByText('Get the App')).toBeInTheDocument();
  });
});
