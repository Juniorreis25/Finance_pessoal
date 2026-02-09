import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TransactionForm } from '../components/forms/TransactionForm'
import { supabase } from '@/lib/supabase'

vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            getUser: vi.fn(),
        },
        from: vi.fn(() => ({
            select: vi.fn().mockResolvedValue({ data: [] }), // Mock fetching cards
            insert: vi.fn().mockResolvedValue({ error: null })
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

describe('TransactionForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders form and toggles type', () => {
        render(<TransactionForm />)
        expect(screen.getByText(/Despesa/i)).toBeInTheDocument()
        expect(screen.getByText(/Receita/i)).toBeInTheDocument()

        // Default is expense, check for cards select (optional text or logic)
        // Check placeholder
        expect(screen.getByPlaceholderText(/Ex: Supermercado/i)).toBeInTheDocument()

        // Switch to Income
        fireEvent.click(screen.getByText(/Receita/i))
        expect(screen.getByPlaceholderText(/Ex: Salário Mensal/i)).toBeInTheDocument()
    })

    it('submits transaction successfully', async () => {
        vi.mocked(supabase.auth.getUser).mockResolvedValue({
            data: { user: { id: 'user123' } } as any,
            error: null
        })

        const insertMock = vi.fn().mockResolvedValue({ error: null })
        // We need to mock the chain: from().insert()
        // And also from().select() for the cards fetch on mount

        vi.mocked(supabase.from).mockImplementation((table) => {
            if (table === 'cards') return { select: vi.fn().mockResolvedValue({ data: [] }) } as any
            if (table === 'transactions') return { insert: insertMock } as any
            return {} as any
        })

        render(<TransactionForm />)

        fireEvent.change(screen.getByPlaceholderText(/Ex: Supermercado/i), { target: { value: 'Lunch' } })
        fireEvent.change(screen.getByPlaceholderText(/0.00/i), { target: { value: '50' } })

        // Select Category
        fireEvent.change(screen.getByLabelText(/Categoria/i), { target: { value: 'Alimentação' } })

        fireEvent.click(screen.getByText(/Salvar Transação/i))

        await waitFor(() => {
            expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
                user_id: 'user123',
                description: 'Lunch',
                amount: 50,
                type: 'expense',
                category: 'Alimentação'
            }))
            expect(pushMock).toHaveBeenCalledWith('/transactions')
        })
    })
})
