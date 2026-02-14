'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogoDiamond } from '@/components/ui/LogoDiamond'
import { Loader2, Lock, Mail, LogIn, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

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
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            {/* Ambient glow effects */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-brand-accent/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Main container */}
            <div className="w-full max-w-md z-10 space-y-8">
                {/* Logo Section */}
                <div className="flex justify-center">
                    <LogoDiamond size="large" showText={true} animated={true} />
                </div>

                {/* Login Form */}
                <div className="bg-brand-deep-sea/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/5 relative overflow-hidden">
                    {/* Decorative gradient */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-accent/50 to-transparent" />

                    <div className="space-y-6">
                        {/* Header */}
                        <div className="text-center space-y-2">
                            <h1 className="text-2xl font-bold text-white">Bem-vindo de volta</h1>
                            <p className="text-sm text-brand-gray">Entre para gerenciar suas finanças</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="rounded-xl bg-rose-500/10 p-4 text-sm text-rose-400 text-center border border-rose-500/20 backdrop-blur-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-semibold text-white/90">
                                    Email
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray/50 group-focus-within:text-brand-accent transition-colors" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3.5 pl-12 pr-4 text-white outline-none 
                                        focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 
                                        transition-all placeholder:text-brand-gray/40 backdrop-blur-sm
                                        hover:border-white/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="text-sm font-semibold text-white/90">
                                    Senha
                                </label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-brand-gray/50 group-focus-within:text-brand-accent transition-colors" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full rounded-2xl border border-white/10 bg-slate-950/50 py-3.5 pl-12 pr-4 text-white outline-none 
                                        focus:border-brand-accent/50 focus:ring-2 focus:ring-brand-accent/20 
                                        transition-all placeholder:text-brand-gray/40 backdrop-blur-sm
                                        hover:border-white/20"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-2xl bg-gradient-to-r from-brand-accent to-brand-accent/80 py-4 font-bold text-black
                                transition-all hover:shadow-lg hover:shadow-brand-accent/30 hover:scale-[1.02]
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                                flex items-center justify-center gap-3 transform active:scale-95
                                relative overflow-hidden group"
                            >
                                {/* Button glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />

                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    <>
                                        <LogIn className="w-5 h-5" />
                                        <span>Entrar</span>
                                        <ArrowRight className="w-5 h-5 ml-auto" />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/5" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-brand-deep-sea px-3 text-brand-gray/50">ou</span>
                            </div>
                        </div>

                        {/* Register Link */}
                        <div className="text-center">
                            <p className="text-sm text-brand-gray">
                                Não tem uma conta?{' '}
                                <Link
                                    href="/register"
                                    className="text-brand-accent font-bold hover:underline hover:text-brand-accent/80 transition-colors inline-flex items-center gap-1"
                                >
                                    Cadastre-se
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer pulse indicator */}
                <div className="flex justify-center space-x-1.5 opacity-30">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse [animation-delay:0.4s]" />
                </div>
            </div>
        </div>
    )
}
