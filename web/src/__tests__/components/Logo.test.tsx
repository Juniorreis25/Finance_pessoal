import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/ui/Logo'
import { describe, it, expect, vi } from 'vitest'

// Mock lucide-react Wallet icon
vi.mock('lucide-react', () => ({
    Wallet: () => <div data-testid="wallet-icon" />
}))

describe('Logo', () => {
    it('renders correctly with default props', () => {
        render(<Logo />)

        expect(screen.getByText('Finance')).toBeDefined()
        expect(screen.getByText('Pessoal')).toBeDefined()
        expect(screen.getByTestId('wallet-icon')).toBeDefined()
    })

    it('applies custom className to the wallet container', () => {
        const customClass = 'w-10 h-10'
        const { container } = render(<Logo className={customClass} />)

        const walletContainer = container.querySelector('.relative.flex')
        expect(walletContainer?.className).toContain(customClass)
    })

    it('applies custom textSize to the text span', () => {
        const customTextSize = 'text-3xl'
        render(<Logo textSize={customTextSize} />)

        const textSpan = screen.getByText('Finance')
        expect(textSpan.className).toContain(customTextSize)
    })
})
