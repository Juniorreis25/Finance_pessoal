import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { getSupabaseConfig } from '@/lib/supabase/config'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
        const { url, anonKey } = getSupabaseConfig()
        const supabase = createServerClient(
            url,
            anonKey,
            {
                cookies: {
                    getAll() {
                        return []
                    },
                    setAll() {
                        // Callback route only exchanges the auth code and redirects.
                    }
                }
            }
        )

        await supabase.auth.exchangeCodeForSession(code)
        return response
    }

    return NextResponse.redirect(new URL('/login', requestUrl.origin))
}
