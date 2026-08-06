import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { getSupabaseConfig } from './lib/supabase/config'

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname
    const isLocalDemoMode =
        process.env.NODE_ENV === 'development' &&
        process.env.LOCAL_DEMO_MODE === 'true'

    if (isLocalDemoMode && (path.startsWith('/dashboard') || path.startsWith('/cards') || path.startsWith('/transactions'))) {
        return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
        request,
    })
    const { url, anonKey } = getSupabaseConfig()

    const supabase = createServerClient(
        url,
        anonKey,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    const {
        data: { user },
    } = await supabase.auth.getUser()
    if (user && (path === '/login' || path === '/register' || path === '/')) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    if (!user && (path.startsWith('/dashboard') || path.startsWith('/cards') || path.startsWith('/transactions'))) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return supabaseResponse
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}