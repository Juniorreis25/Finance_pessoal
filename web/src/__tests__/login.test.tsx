import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import LoginPage from '../app/(auth)/login/page'

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
    supabase: {
        auth: {
            signInWithPassword: vi.fn(),
        },
    },
}))

// Mock Next Navigation
const pushMock = vi.fn()
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: pushMock,
    }),
}))

import { supabase } from '@/lib/supabase'

describe('LoginPage', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('renders login form correctly', () => {
        render(<LoginPage />)
        expect(screen.getByText(/Finance/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Senha/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Entrar/i })).toBeInTheDocument()
    })

    it('handles login submission successfully', async () => {
        // Setup Supabase mock success
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { user: { id: '1', email: 'test@test.com' } } as any,
            error: null,
        })

        render(<LoginPage />)

        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@test.com' } })
        fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'password123' } })
        fireEvent.click(screen.getByRole('button', { name: /Entrar/i }))

        await waitFor(() => {
            expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
                email: 'test@test.com',
                password: 'password123',
            })
            expect(pushMock).toHaveBeenCalledWith('/dashboard')
        })
    })

    it('displays error message on failure', async () => {
        // Setup Supabase mock error
        vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
            data: { user: null } as any,
            error: { message: 'Invalid login credentials' } as any,
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
