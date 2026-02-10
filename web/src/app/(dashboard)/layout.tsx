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
    LogOut
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

import { Logo } from '@/components/ui/Logo'

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
        { href: '/cards', label: 'Cartões', icon: CreditCard },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex text-slate-900 dark:text-slate-100">

            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-center">
                        <Logo />
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
                            // Special case for dashboard root match
                            const activeClass = isActive
                                ? 'bg-brand-50 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${activeClass}`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </nav>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 px-4 py-3 text-slate-600 dark:text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
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
                <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                    <Logo className="w-6 h-6" textSize="text-lg" />
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                </header>

                <div className="flex-1 overflow-auto p-4 lg:p-8">
                    <div className="max-w-6xl mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
