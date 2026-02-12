import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { CardForm as AddCardForm } from '../components/forms/AddCardForm'

// Define mock functions outside
const getUserMock = vi.fn()
const insertMock = vi.fn()
const fromMock = vi.fn(() => ({
    insert: insertMock,
    update: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn().mockReturnValue({ error: null }) // For update/delete chains if any
}))

// Mock @/lib/supabase/client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            getUser: getUserMock,
        },
        from: fromMock,
    }))
}))

const pushMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        refresh: refreshMock,
        back: vi.fn(),
    }),
}))

describe('CardForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        // Reset default mock implementations
        getUserMock.mockResolvedValue({ data: { user: { id: 'user123' } }, error: null })
        insertMock.mockResolvedValue({ error: null })
    })

    it('renders form fields correctly', () => {
        render(<AddCardForm />)
        expect(screen.getByText(/Salvar Cartão/i)).toBeInTheDocument()
        expect(screen.getByText(/Nome do Cartão/i)).toBeInTheDocument()
        expect(screen.getByText(/Limite/i)).toBeInTheDocument()
    })

    it('submits form successfully', async () => {
        render(<AddCardForm />)

        fireEvent.change(screen.getByPlaceholderText(/Ex: Nubank/i), { target: { value: 'My Card' } })
        fireEvent.change(screen.getByPlaceholderText(/R\$ 0,00/i), { target: { value: '100000' } })
        fireEvent.change(screen.getByPlaceholderText(/10/i), { target: { value: '10' } })
        fireEvent.change(screen.getByPlaceholderText(/17/i), { target: { value: '17' } })

        fireEvent.click(screen.getByText(/Salvar Cartão/i))

        await waitFor(() => {
            expect(insertMock).toHaveBeenCalledWith({
                user_id: 'user123',
                name: 'My Card',
                limit_amount: 1000,
                closing_day: 10,
                due_day: 17
            })
            expect(pushMock).toHaveBeenCalledWith('/cards')
            expect(refreshMock).toHaveBeenCalled()
        })
    })
})
