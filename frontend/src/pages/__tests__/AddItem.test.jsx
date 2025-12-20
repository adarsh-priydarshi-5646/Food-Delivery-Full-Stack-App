import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AddItem from '../AddItem';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

vi.mock('axios');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
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

global.URL.createObjectURL = vi.fn(() => 'blob:test');

describe('AddItem Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders form elements', () => {
        useSelector.mockReturnValue({ myShopData: { _id: '123' } });

        render(
            <BrowserRouter>
                <AddItem />
            </BrowserRouter>
        );

        expect(screen.getByText('Add New Item')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('e.g. Butter Chicken, Paneer Tikka...')).toBeInTheDocument();
        expect(screen.getByText('Veg')).toBeInTheDocument();
        expect(screen.getByText('Non-Veg')).toBeInTheDocument();
        expect(screen.getByText('Add Item to Menu')).toBeInTheDocument();
    });

    it('handles form submission', async () => {
        useSelector.mockReturnValue({ myShopData: { _id: '123' } });
        axios.post.mockResolvedValueOnce({ data: { items: [1,2] } });

        render(
            <BrowserRouter>
                <AddItem />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('e.g. Butter Chicken, Paneer Tikka...'), { target: { value: 'New Dish' } });
        fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '200' } });
        
        // Select Category
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'Pizza' } });

        const submitBtn = screen.getByText('Add Item to Menu');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalled();
            expect(mockDispatch).toHaveBeenCalled();
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
