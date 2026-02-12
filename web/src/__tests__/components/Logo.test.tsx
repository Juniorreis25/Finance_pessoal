import { render, screen } from '@testing-library/react'
import { Logo } from '@/components/ui/Logo'
import { describe, it, expect, vi } from 'vitest'

describe('Logo', () => {
    it('renders the logo image correctly', () => {
        render(<Logo />)
        const logo = screen.getByAltText('Finance Pessoal Logo')
        expect(logo).toBeDefined()
    })

    it('applies custom className to the container', () => {
        const customClass = 'w-10 h-10'
        const { container } = render(<Logo className={customClass} />)

        const logoContainer = container.querySelector(`.${customClass}`)
        expect(logoContainer).toBeDefined()
    })
})
