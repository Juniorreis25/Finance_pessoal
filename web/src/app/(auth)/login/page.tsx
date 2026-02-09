'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Loader2, Lock, Mail } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) throw error
            router.push('/dashboard')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <div className="w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-xl dark:bg-slate-800">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-brand-900 dark:text-brand-50">Finance</h1>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Entre para gerenciar suas finanças</p>
                </div>

                {error && (
                    <div className="rounded-md bg-danger/10 p-3 text-sm text-danger text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                id="email"
                                type="email"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full rounded-lg border border-slate-200 bg-transparent py-2 pl-10 pr-4 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-slate-700"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full rounded-lg bg-brand-600 py-2.5 font-medium text-white transition hover:bg-brand-500 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Entrar'}
                    </button>
                </form>
            </div>
        </div>
    )
}
