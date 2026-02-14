'use client'

import { useEffect, useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Wallet, Loader2, Plus, CreditCard, BarChart3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { OverviewChart } from '@/components/charts/OverviewChart'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { CategorySelector } from '@/components/ui/CategorySelector'
import Link from 'next/link'
import { startOfMonth, endOfMonth, isWithinInterval, startOfYear, endOfYear, format, addMonths } from 'date-fns'
import { usePrivacy } from '@/providers/PrivacyProvider'
import { MaskedValue } from '@/components/ui/MaskedValue'
import { ptBR } from 'date-fns/locale'

type Transaction = {
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
}

export default function DashboardPage() {
    const supabase = createClient()
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedCategory, setSelectedCategory] = useState('')
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0
    })
    const [nextMonthStats, setNextMonthStats] = useState({
        expense: 0
    })
    const [overviewData, setOverviewData] = useState<any[]>([])
    const [categoryData, setCategoryData] = useState<any[]>([])
    const [userProfile, setUserProfile] = useState<{ display_name: string | null, welcome_message: string | null }>({
        display_name: null,
        welcome_message: null
    })
    const { isValuesVisible, toggleVisibility } = usePrivacy()

    useEffect(() => {
        async function fetchData() {
            setLoading(true)

            // Fetch regular transactions
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: true })

            // Fetch active recurring expenses
            const { data: recurringExpenses } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('active', true)

            if (transactions) {
                // Filter for Current Month (Stats & Categories)
                const monthStart = startOfMonth(currentDate)
                const monthEnd = endOfMonth(currentDate)

                // Apply Category Filter if Selected
                const filteredTransactions = selectedCategory
                    ? transactions.filter(t => t.category === selectedCategory)
                    : transactions

                const monthTransactions = filteredTransactions.filter(t =>
                    isWithinInterval(new Date(t.date), { start: monthStart, end: monthEnd })
                )

                // Calculate Totals for Selected Month
                let income = monthTransactions
                    .filter(t => t.type === 'income')
                    .reduce((acc, curr) => acc + curr.amount, 0)

                let expense = monthTransactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, curr) => acc + curr.amount, 0)

                // Add recurring items to current month
                const recurringItems = (recurringExpenses || [])
                    .filter(re => !selectedCategory || re.category === selectedCategory)

                const recurringIncomeTotal = recurringItems
                    .filter(re => re.type === 'income')
                    .reduce((acc, curr) => acc + curr.amount, 0)

                const recurringExpenseTotal = recurringItems
                    .filter(re => re.type !== 'income') // default to expense
                    .reduce((acc, curr) => acc + curr.amount, 0)

                income += recurringIncomeTotal
                expense += recurringExpenseTotal

                setStats({
                    balance: income - expense,
                    income,
                    expense
                })

                // Group by Month (For Overview Chart - Whole Year of Selected Date)
                const yearStart = startOfYear(currentDate)
                const yearEnd = endOfYear(currentDate)
                const yearTransactions = filteredTransactions.filter(t =>
                    isWithinInterval(new Date(t.date), { start: yearStart, end: yearEnd })
                )

                const monthlyData: Record<string, { income: number, expense: number }> = {}

                // Initialize all months for the year
                for (let i = 0; i < 12; i++) {
                    const d = new Date(yearStart.getFullYear(), i, 1)
                    const monthName = d.toLocaleDateString('pt-BR', { month: 'short' })
                    monthlyData[monthName] = { income: 0, expense: 0 }
                }

                yearTransactions.forEach(t => {
                    const dateObj = new Date(t.date)
                    const userTimezoneOffset = dateObj.getTimezoneOffset() * 60000
                    const adjustedDate = new Date(dateObj.getTime() + userTimezoneOffset)

                    const monthName = adjustedDate.toLocaleDateString('pt-BR', { month: 'short' })

                    if (monthlyData[monthName]) {
                        if (t.type === 'income') monthlyData[monthName].income += t.amount
                        else monthlyData[monthName].expense += t.amount
                    }
                })

                // Add recurring items to ALL months in the year
                Object.keys(monthlyData).forEach(monthName => {
                    monthlyData[monthName].income += recurringIncomeTotal
                    monthlyData[monthName].expense += recurringExpenseTotal
                })

                const chartData = Object.entries(monthlyData).map(([name, values]) => ({
                    name,
                    receita: values.income,
                    despesa: values.expense
                }))
                setOverviewData(chartData)

                // Category Data (Selected Month) - Include recurring expenses
                const catMap: Record<string, number> = {}
                monthTransactions
                    .filter(t => t.type === 'expense')
                    .forEach(t => {
                        catMap[t.category] = (catMap[t.category] || 0) + t.amount
                    })

                    // Add recurring items to category breakdown (expenses only for the pie chart)
                    ; (recurringExpenses || [])
                        .filter(re => re.type !== 'income')
                        .filter(re => !selectedCategory || re.category === selectedCategory)
                        .forEach(re => {
                            catMap[re.category] = (catMap[re.category] || 0) + re.amount
                        })

                const pieData = Object.entries(catMap).map(([name, value]) => ({
                    name,
                    value,
                    color: '' // Handled in component
                }))
                setCategoryData(pieData)

                // Calculate NEXT MONTH projected expenses
                const nextMonth = new Date(currentDate)
                nextMonth.setMonth(nextMonth.getMonth() + 1)
                const nextMonthStart = startOfMonth(nextMonth)
                const nextMonthEnd = endOfMonth(nextMonth)

                const nextMonthTransactions = filteredTransactions.filter(t =>
                    t.type === 'expense' && isWithinInterval(new Date(t.date), { start: nextMonthStart, end: nextMonthEnd })
                )

                let nextMonthExpense = nextMonthTransactions.reduce((acc, curr) => acc + curr.amount, 0)

                // Add recurring items to next month
                nextMonthExpense += recurringExpenseTotal

                setNextMonthStats({
                    expense: nextMonthExpense
                })
            }
            setLoading(false)
        }
        fetchData()
    }, [currentDate, selectedCategory])

    // Fetch user profile
    useEffect(() => {
        async function fetchProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('display_name, welcome_message')
                .eq('user_id', user.id)
                .single()

            if (profile) {
                setUserProfile({
                    display_name: profile.display_name,
                    welcome_message: profile.welcome_message
                })
            }
        }
        fetchProfile()
    }, [])

    return (
        <div className="space-y-8 pb-10">
            {/* Header with Asymmetry */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tighter text-white">
                        Visão<span className="text-brand-500">Geral</span>
                    </h1>
                    {userProfile.display_name || userProfile.welcome_message ? (
                        <p className="text-slate-400 font-medium mt-1">
                            {userProfile.display_name && `Olá, ${userProfile.display_name}! `}
                            {userProfile.welcome_message || 'Bem-vindo de volta!'}
                        </p>
                    ) : (
                        <p className="text-slate-400 font-medium mt-1">
                            Resumo financeiro em tempo real.
                        </p>
                    )}
                </div>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <CategorySelector selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                    <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />

                    <div className="flex gap-2">
                        <Link href="/transactions" className="p-3 bg-brand-deep-sea text-brand-gray rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer" aria-label="Ver transações" title="Ver Histórico de Transações">
                            <BarChart3 className="w-5 h-5" />
                        </Link>
                        <Link href="/cards" className="p-3 bg-brand-deep-sea text-brand-gray rounded-2xl border border-white/5 hover:bg-white/5 transition-all cursor-pointer" aria-label="Ver cartões" title="Gerenciar Meus Cartões">
                            <CreditCard className="w-5 h-5" />
                        </Link>
                        <Link href="/transactions/new" className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] text-black font-black uppercase tracking-tighter text-xs rounded-2xl hover:scale-105 transition-transform shadow-[0_8px_20px_rgba(0,240,255,0.3)] cursor-pointer" title="Adicionar Nova Transação">
                            <Plus className="w-5 h-5" strokeWidth={3} />
                            Novo
                        </Link>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex h-[50vh] items-center justify-center w-full">
                    <Loader2 className="animate-spin w-10 h-10 text-brand-500" />
                </div>
            ) : (
                <>
                    {/* Master Card Layout - Asymmetric Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                        {/* Master Balance Card (Span 12) - Split Layout */}
                        <div className="md:col-span-12 relative overflow-hidden bg-brand-deep-sea rounded-[2.5rem] border border-white/5 shadow-2xl">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

                            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-8">
                                {/* Current Month - Main Section (8 cols) */}
                                <div className="lg:col-span-8 flex flex-col justify-between min-h-[240px]">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 w-fit backdrop-blur-md">
                                            <Wallet className="w-4 h-4 text-brand-accent" />
                                            <span className="text-xs font-bold text-brand-gray uppercase tracking-widest">Saldo Disponível</span>
                                        </div>
                                        <button
                                            onClick={toggleVisibility}
                                            className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                                            aria-label={isValuesVisible ? "Ocultar valores" : "Mostrar valores"}
                                            title={isValuesVisible ? "Ocultar valores para privacidade" : "Mostrar valores financeiros"}
                                        >
                                            {isValuesVisible ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                                            )}
                                        </button>
                                    </div>

                                    <div className="mt-8 flex items-baseline gap-2">
                                        <h2 className="text-4xl md:text-[52px] font-bold text-brand-accent tracking-tighter glow-cyan">
                                            <MaskedValue value={stats.balance} prefix={isValuesVisible ? "R$ " : ""} />
                                        </h2>
                                    </div>

                                    <div className="mt-8 flex gap-6">
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-3 bg-brand-success/10 rounded-2xl text-brand-success border border-brand-success/10 group-hover:bg-brand-success/20 transition-all">
                                                <ArrowUpRight className="w-5 h-5 font-bold" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-brand-gray font-bold uppercase tracking-wider">Ganhos</p>
                                                <p className="text-xl font-bold text-brand-success">
                                                    <MaskedValue value={stats.income} />
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-px h-12 bg-white/5" />
                                        <div className="flex items-center gap-3 group">
                                            <div className="p-3 bg-white/5 rounded-2xl text-white border border-white/10 group-hover:bg-white/10 transition-all">
                                                <ArrowDownRight className="w-5 h-5 font-bold" />
                                            </div>
                                            <div>
                                                <p className="text-[11px] text-brand-gray font-bold uppercase tracking-wider">Gastos</p>
                                                <p className="text-xl font-bold text-white">
                                                    <MaskedValue value={stats.expense} />
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Next Month Preview - Right Section (4 cols on desktop, full width on mobile) */}
                                <div className="lg:col-span-4 flex flex-col justify-center lg:border-l lg:border-white/5 lg:pl-8 mt-8 lg:mt-0">
                                    <div className="bg-white/5 backdrop-blur-sm rounded-[2rem] p-6 border border-white/5">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)] animate-pulse" />
                                            <span className="text-[10px] font-black text-brand-gray uppercase tracking-widest">Previsão • Próximo Mês</span>
                                        </div>
                                        <p className="text-xs text-brand-gray mb-1 capitalize">{format(addMonths(currentDate, 1), "MMMM 'de' yyyy", { locale: ptBR })}</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-3xl font-bold text-white tracking-tighter">
                                                <MaskedValue value={nextMonthStats.expense} prefix={isValuesVisible ? "R$ " : ""} />
                                            </span>
                                        </div>
                                        <p className="text-[10px] font-bold text-brand-gray mt-4 tracking-tight uppercase opacity-50">Fluxo Estimado</p>
                                    </div>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <section className="bg-brand-deep-sea rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-semibold text-white">Análise Anual</h3>
                                <span className="text-xs text-brand-gray font-medium">Jan — Dez 2024</span>
                            </div>
                            <OverviewChart data={overviewData} />
                        </section>
                        <section className="bg-brand-deep-sea rounded-[2.5rem] p-8 border border-white/5 shadow-xl">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-lg font-semibold text-white">Distribuição</h3>
                                <div className="text-[10px] font-black bg-white/5 px-2 py-1 rounded text-brand-gray uppercase tracking-widest">Top Categorias</div>
                            </div>
                            <CategoryChart data={categoryData} />
                        </section>
                    </div>
                </>
            )}
        </div>
    )
}
