import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AddCardForm } from '../components/forms/AddCardForm'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(() => ({
            insert: vi.fn(),
        })),
    },
}))

const pushMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        refresh: refreshMock,
    }),
}))

describe('AddCardForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form fields correctly', () => {
        render(<AddCardForm />)
        expect(screen.getByText(/Novo Cartão/i)).toBeInTheDocument()
        expect(screen.getByText(/Nome do Cartão/i)).toBeInTheDocument()
        expect(screen.getByText(/Limite/i)).toBeInTheDocument()
    })

    it('submits form successfully', async () => {
        // Mock User
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
            data: { user: { id: 'user123' } } as any,
            error: null
        })

        // Mock Insert success
        const insertMock = vi.fn().mockResolvedValue({ error: null })
        vi.mocked(supabase.from).mockReturnValue({
            insert: insertMock
        } as any)

        render(<AddCardForm />)

        fireEvent.change(screen.getByPlaceholderText(/Ex: Nubank/i), { target: { value: 'My Card' } })
        fireEvent.change(screen.getByPlaceholderText(/5000.00/i), { target: { value: '1000' } })
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
