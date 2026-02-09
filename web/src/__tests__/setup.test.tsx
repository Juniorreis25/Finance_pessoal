import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Page from '../app/page'

describe('Home Page', () => {
    it('renders learn next.js link', () => {
        render(<Page />)
        const linkElement = screen.getByText(/Learn/i)
        expect(linkElement).toBeInTheDocument()
    })
})
