import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import EditItem from '../EditItem';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';

vi.mock('axios');
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useParams: () => ({ itemId: '123' }),
        useNavigate: () => mockNavigate,
    };
});

const mockDispatch = vi.fn();
vi.mock('react-redux', async () => {
    return {
        ...await vi.importActual('react-redux'),
        useDispatch: () => mockDispatch,
        useSelector: vi.fn(),
    };
});

global.URL.createObjectURL = vi.fn(() => 'blob:test');

describe('EditItem Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and displays item data', async () => {
        useSelector.mockReturnValue({ myShopData: { _id: 's1' } });
        axios.get.mockResolvedValueOnce({ 
            data: { name: 'Old Pizza', price: 150, category: 'Pizza', foodType: 'veg' } 
        });

        render(
            <BrowserRouter>
                <EditItem />
            </BrowserRouter>
        );

        await waitFor(() => {
            expect(screen.getByDisplayValue('Old Pizza')).toBeInTheDocument();
        });
    });

    it('submits updated data', async () => {
        useSelector.mockReturnValue({ myShopData: { _id: 's1' } });
        axios.get.mockResolvedValueOnce({ 
            data: { name: 'Old Pizza', price: 150, category: 'Pizza', foodType: 'veg' } 
        });
        axios.post.mockResolvedValueOnce({ data: { items: [] } });

        render(
            <BrowserRouter>
                <EditItem />
            </BrowserRouter>
        );

        await waitFor(() => expect(screen.getByDisplayValue('Old Pizza')).toBeInTheDocument());

        fireEvent.change(screen.getByDisplayValue('Old Pizza'), { target: { value: 'New Pizza' } });
        
        const submitBtn = screen.getByText('Save Changes');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                expect.stringContaining('/edit-item/123'),
                expect.any(FormData),
                expect.anything()
            );
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });
});
