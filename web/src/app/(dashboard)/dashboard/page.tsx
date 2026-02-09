'use client'

import { useEffect, useState } from 'react'
import { CardItem } from '@/components/cards/CardItem'
import { ArrowUpCircle, ArrowDownCircle, Wallet, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { OverviewChart } from '@/components/charts/OverviewChart'
import { CategoryChart } from '@/components/charts/CategoryChart'
import { BalanceChart } from '@/components/charts/BalanceChart'

type Transaction = {
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({
        balance: 0,
        income: 0,
        expense: 0
    })
    const [overviewData, setOverviewData] = useState<any[]>([])
    const [categoryData, setCategoryData] = useState<any[]>([])
    const [balanceData, setBalanceData] = useState<any[]>([])

    useEffect(() => {
        async function fetchData() {
            const { data: transactions } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: true }) // Order by date for balance calculation

            if (transactions) {
                // Calculate Totals
                const income = transactions
                    .filter(t => t.type === 'income')
                    .reduce((acc, curr) => acc + curr.amount, 0)

                const expense = transactions
                    .filter(t => t.type === 'expense')
                    .reduce((acc, curr) => acc + curr.amount, 0)

                setStats({
                    balance: income - expense,
                    income,
                    expense
                })

                // Prepare Overview Data (Grouping by Month - Simplified to Current Month for MVP or All Time grouped by Month)
                // Group by Month (YYYY-MM)
                const monthlyData: Record<string, { income: number, expense: number }> = {}
                const balanceEvolution: { date: string, balance: number }[] = []
                let currentBalance = 0

                transactions.forEach(t => {
                    const dateObj = new Date(t.date)
                    // Overview Data
                    const monthName = dateObj.toLocaleDateString('pt-BR', { month: 'short' })
                    if (!monthlyData[monthName]) monthlyData[monthName] = { income: 0, expense: 0 }

                    if (t.type === 'income') monthlyData[monthName].income += t.amount
                    else monthlyData[monthName].expense += t.amount

                    // Balance Evolution (Daily)
                    const change = t.type === 'income' ? t.amount : -t.amount
                    currentBalance += change
                    // Simplified: Add entry for each transaction or group by day?
                    // Grouping by day is better for chart
                    const dateStr = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })

                    // If last entry is same day, update it, else push new
                    const lastEntry = balanceEvolution[balanceEvolution.length - 1]
                    if (lastEntry && lastEntry.date === dateStr) {
                        lastEntry.balance = currentBalance
                    } else {
                        balanceEvolution.push({ date: dateStr, balance: currentBalance })
                    }
                })

                const chartData = Object.entries(monthlyData).map(([name, values]) => ({
                    name,
                    receita: values.income,
                    despesa: values.expense
                }))
                setOverviewData(chartData)
                setBalanceData(balanceEvolution)

                // Prepare Category Data
                const catMap: Record<string, number> = {}
                transactions
                    .filter(t => t.type === 'expense')
                    .forEach(t => {
                        catMap[t.category] = (catMap[t.category] || 0) + t.amount
                    })

                const colors = ['#f43f5e', '#facc15', '#3b82f6', '#10b981', '#a855f7', '#64748b']
                const pieData = Object.entries(catMap).map(([name, value], index) => ({
                    name,
                    value,
                    color: colors[index % colors.length]
                }))
                setCategoryData(pieData)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin w-8 h-8 text-brand-600" /></div>
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Visão Geral</h1>
                <p className="text-slate-500 dark:text-slate-400">Acompanhe seus indicadores financeiros.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-brand-100 text-brand-600 rounded-lg dark:bg-brand-900/30 dark:text-brand-400">
                            <Wallet className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Saldo Atual</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                R$ {stats.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-success/10 text-success rounded-lg">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Receitas</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                R$ {stats.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-danger/10 text-danger rounded-lg">
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Despesas</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                                R$ {stats.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <OverviewChart data={overviewData} />
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <CategoryChart data={categoryData} />
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 md:col-span-2">
                    <BalanceChart data={balanceData} />
                </div>
            </div>
        </div>
    )
}
