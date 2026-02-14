'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    CreditCard,
    ArrowRightLeft,
    Menu,
    X,
    LogOut,
    Repeat,
    User
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { LogoDiamond } from '@/components/ui/LogoDiamond'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const supabase = createClient()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        { href: '/dashboard', label: 'Visão Geral', icon: LayoutDashboard },
        { href: '/transactions', label: 'Transações', icon: ArrowRightLeft },
        { href: '/recurring', label: 'Recorrentes', icon: Repeat },
        { href: '/cards', label: 'Cartões', icon: CreditCard },
        { href: '/profile', label: 'Perfil', icon: User },
    ]

    return (
        <div className="min-h-screen bg-background flex text-foreground font-sans">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar (Desktop) */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-brand-deep-sea/80 backdrop-blur-xl border-r border-white/5
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:flex-shrink-0
        h-screen
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    <div className="p-4 border-b border-white/5">
                        <Link href="/dashboard" className="flex items-center justify-center w-full hover:bg-white/5 p-3 rounded-2xl transition-all group" title="Ir para Visão Geral">
                            <LogoDiamond size="small" showText={true} animated={false} />
                        </Link>
                    </div>

                    <nav className="flex-1 p-4 space-y-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                            const activeClass = isActive
                                ? 'bg-brand-accent/10 text-brand-accent shadow-[inset_0_0_10px_rgba(0,240,255,0.1)]'
                                : 'text-brand-gray hover:bg-white/5'

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition-all duration-300 ${activeClass}`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'glow-cyan' : ''}`} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-brand-gray hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors cursor-pointer"
                            aria-label="Sair da conta"
                        >
                            <LogOut className="w-5 h-5" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 bg-background border-b border-white/5">
                    <Link href="/dashboard" className="flex items-center p-1 -ml-1 rounded-lg hover:bg-white/5 transition-colors" title="Ir para Visão Geral">
                        <LogoDiamond size="small" showText={false} animated={false} />
                    </Link>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="p-2 text-brand-gray hover:bg-white/5 rounded-full transition-all"
                        >
                            <Menu className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8 pb-24 lg:pb-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>

                {/* Bottom Navigation (Mobile) */}
                <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-brand-nav/80 backdrop-blur-2xl border-t border-white/5 pb-safe">
                    <div className="flex items-center justify-around h-20 px-4 relative">
                        {navItems.slice(0, 2).map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-brand-accent' : 'text-brand-gray'}`}>
                                    <item.icon className={`w-6 h-6 ${isActive ? 'glow-cyan' : ''}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label.split(' ')[0]}</span>
                                </Link>
                            )
                        })}

                        {/* Floating Action Button */}
                        <div className="relative -top-8">
                            <Link
                                href="/transactions"
                                className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] shadow-[0_8px_20px_rgba(0,240,255,0.4)] hover:scale-110 active:scale-95 transition-all text-black"
                            >
                                <X className="w-8 h-8 rotate-45" strokeWidth={3} />
                            </Link>
                        </div>

                        {navItems.slice(3).map((item) => {
                            const isActive = pathname === item.href
                            return (
                                <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-brand-accent' : 'text-brand-gray'}`}>
                                    <item.icon className={`w-6 h-6 ${isActive ? 'glow-cyan' : ''}`} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </nav>
            </main>
        </div>
    )
}
