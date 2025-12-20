import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SignUp from '../SignUp';
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

// Mock Icons
vi.mock('react-icons/fa', () => ({
    FaRegEye: () => <div />,
    FaRegEyeSlash: () => <div />,
}));
vi.mock('react-icons/fc', () => ({
    FcGoogle: () => <div />,
}));

// Mock Firebase
vi.mock('../../firebase', () => ({
    auth: {},
}));
vi.mock('firebase/auth', () => ({
    GoogleAuthProvider: vi.fn(),
    signInWithPopup: vi.fn().mockResolvedValue({
        user: { displayName: 'Test User', email: 'test@gmail.com' }
    }),
}));

describe('SignUp Component', () => {
    it('renders signup form elements', () => {
        render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );
        expect(screen.getByPlaceholderText('Full Name')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Mobile Number')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    });

    it('validates mobile number for Google Auth', async () => {
        render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );
        
        const googleBtn = screen.getByText('Continue with Google');
        fireEvent.click(googleBtn);
        
        // Should show error because mobile is empty
        expect(screen.getByText('Please enter your mobile number first')).toBeInTheDocument();
    });

    it('handles normal signup submission', async () => {
        axios.post.mockResolvedValueOnce({ data: { token: '123' } });

        render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Full Name'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByPlaceholderText('Mobile Number'), { target: { value: '9876543210' } });
        fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'pass123' } });
        
        fireEvent.click(screen.getByText('Create Account'));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
            expect(mockDispatch).toHaveBeenCalled();
        });
    });

    it('changes role selection', () => {
        render(
            <BrowserRouter>
                <SignUp />
            </BrowserRouter>
        );
        
        const ownerBtn = screen.getByText('Owner');
        fireEvent.click(ownerBtn);
        expect(ownerBtn).toHaveClass('bg-[#E23744]');
        
        const userBtn = screen.getByText('User');
        expect(userBtn).not.toHaveClass('bg-[#E23744]');
    });
});
