import { NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
    createServerClient: vi.fn(),
    getUser: vi.fn(),
    cookieAdapter: undefined as unknown,
}))

vi.mock('@supabase/ssr', () => ({
    createServerClient: mocks.createServerClient,
}))

vi.mock('@/lib/supabase/config', () => ({
    getSupabaseConfig: () => ({
        url: 'https://project.example.supabase.co',
        anonKey: 'test-public-key',
    }),
}))

import { proxy } from '../proxy'

type CookieAdapter = {
    getAll: () => Array<{ name: string; value: string }>
    setAll: (cookiesToSet: Array<{
        name: string
        value: string
        options?: { path?: string; maxAge?: number }
    }>) => void
}

describe('Supabase session middleware', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mocks.cookieAdapter = undefined
        mocks.createServerClient.mockImplementation((
            _url: unknown,
            _anonKey: unknown,
            options: unknown,
        ) => {
            mocks.cookieAdapter = (options as { cookies: CookieAdapter }).cookies
            return { auth: { getUser: mocks.getUser } }
        })
    })

    it('passes refreshed session cookies through the middleware response', async () => {
        mocks.getUser.mockImplementation(async () => {
            const cookies = mocks.cookieAdapter as CookieAdapter
            cookies.setAll([{
                name: 'sb-project-auth-token',
                value: 'refreshed-test-token',
                options: { path: '/', maxAge: 3600 },
            }])
            return { data: { user: { id: 'test-user' } } }
        })

        const response = await proxy(new NextRequest('https://app.example/dashboard'))

        expect(response.headers.get('x-middleware-next')).toBe('1')
        expect(response.headers.get('set-cookie')).toContain(
            'sb-project-auth-token=refreshed-test-token',
        )
    })

    it('redirects expired sessions away from protected routes', async () => {
        mocks.getUser.mockResolvedValue({ data: { user: null } })

        const response = await proxy(new NextRequest('https://app.example/dashboard'))

        expect(response.headers.get('location')).toBe('https://app.example/login')
    })

    it('keeps the health check available when Supabase is down', async () => {
        const response = await proxy(new NextRequest('https://app.example/api/health'))

        expect(response.headers.get('x-middleware-next')).toBe('1')
        expect(mocks.createServerClient).not.toHaveBeenCalled()
    })
})
