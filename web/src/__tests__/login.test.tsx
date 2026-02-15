import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../app/(auth)/login/page'

// Define Mocks
const signInWithPasswordMock = vi.fn()

// Mock @/lib/supabase/client
vi.mock('@/lib/supabase/client', () => ({
    createClient: vi.fn(() => ({
        auth: {
            signInWithPassword: signInWithPasswordMock,
        },
    }))
}))

// Mock Next Navigation
const pushMock = vi.fn()
const refreshMock = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
        refresh: refreshMock,
    }),
}))

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login form correctly', () => {
        render(<LoginPage />)
        expect(screen.getByText(/Bem-vindo/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
    })

    it('handles login submission successfully', async () => {
        // Setup Supabase mock success
        signInWithPasswordMock.mockResolvedValue({
            data: { user: { id: '1', email: 'test@test.com' } },
            error: null,
        })

        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'user-pass-123' } })
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

        await waitFor(() => {
            expect(signInWithPasswordMock).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'user-pass-123',
            })
            expect(pushMock).toHaveBeenCalledWith('/dashboard')
            expect(refreshMock).toHaveBeenCalled()
        })
    })

    it('displays error message on failure', async () => {
        // Setup Supabase mock error
        signInWithPasswordMock.mockResolvedValue({
            data: { user: null },
            error: { message: 'Invalid login credentials' },
        })

        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'wrong@test.com' } })
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'wrongpass' } })
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

        await waitFor(() => {
            expect(screen.getByText('Invalid login credentials')).toBeInTheDocument()
        })
    })
})
