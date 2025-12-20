import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignIn from '../SignIn';
import { BrowserRouter } from 'react-router-dom';
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

vi.mock('../../hooks/useGetCity', () => ({
    default: () => ({
        getCity: vi.fn().mockResolvedValue({ city: 'Test City', address: 'Test Address' })
    })
}));

// Mock Redux
const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
    return {
        ...await vi.importActual('react-redux'),
        useDispatch: () => mockDispatch,
    };
});

// Mock specific icons (react-icons/fa and fc)
vi.mock('react-icons/fa', () => ({
    FaRegEye: () => <div data-testid="eye-icon" />,
    FaRegEyeSlash: () => <div data-testid="eye-slash-icon" />,
}));
vi.mock('react-icons/fc', () => ({
    FcGoogle: () => <div data-testid="google-icon" />,
}));

describe('SignIn Component', () => {
    it('renders login form correctly', () => {
        render(
            <BrowserRouter>
                <SignIn />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    });

    it('toggles password visibility', () => {
        render(
            <BrowserRouter>
                <SignIn />
            </BrowserRouter>
        );
        const toggleBtn = screen.getByText('Show');
        fireEvent.click(toggleBtn);
        expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'text');
        
        fireEvent.click(screen.getByText('Hide'));
        expect(screen.getByPlaceholderText('Password')).toHaveAttribute('type', 'password');
    });

    it('handles form submission successfully', async () => {
        axios.post.mockResolvedValueOnce({ data: { user: 'test' } });

        render(
            <BrowserRouter>
                <SignIn />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
        
        const loginBtn = screen.getByRole('button', { name: 'Login' });
        fireEvent.click(loginBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/signin'),
                { email: 'test@example.com', password: 'password123' },
                expect.any(Object)
            );
            expect(mockDispatch).toHaveBeenCalled();
        });
    });

    it('displays error on failed login', async () => {
        axios.post.mockRejectedValueOnce({ 
            response: { data: { message: 'Invalid credentials' } } 
        });

        render(
            <BrowserRouter>
                <SignIn />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'wrongpass' } });
        
        fireEvent.click(screen.getByRole('button', { name: 'Login' }));

        await waitFor(() => {
            expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
        });
    });
});
