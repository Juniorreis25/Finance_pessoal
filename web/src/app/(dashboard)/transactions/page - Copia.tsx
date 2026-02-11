
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Edit2, Trash2, Search, Filter } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MonthSelector } from '@/components/ui/MonthSelector'

type Transaction = {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
}

export default function TransactionsPage() {
    const supabase = createClient()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())

    const fetchTransactions = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('transactions')
            .select('*')
            .order('date', { ascending: false })

        if (data) setTransactions(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            const { error } = await supabase.from('transactions').delete().eq('id', id)
            if (error) {
                alert('Erro ao excluir transação')
                console.error(error)
            } else {
                fetchTransactions()
            }
        }
    }

    // Filter transactions by selected month
    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date)
        return isWithinInterval(txDate, {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        })
    })

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header with Search and Date Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Transações</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie suas entradas e saídas.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Fake Search Bar */}
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                placeholder="Buscar..."
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                                readOnly
                            />
                        </div>
                        <Link
                            href="/transactions/new"
                            className="flex items-center gap-2 bg-brand-500 text-slate-950 px-5 py-2 rounded-xl font-bold hover:bg-brand-400 transition hover:scale-105 shadow-lg shadow-brand-500/20 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" />
                            Nova
                        </Link>
                    </div>
                </div>
            </div>

            {/* Transaction List - Floating Blocks */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex justify-center">
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="relative group bg-white dark:bg-slate-900 p-5 rounded-2xl flex items-center justify-between border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-brand-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                        >
                            {/* Left: Icon & Info */}
                            <div className="flex items-center gap-5">
                                <div className={`p-3 rounded-full ${tx.type === 'income'
                                    ? 'bg-emerald-500/10 text-emerald-500'
                                    : 'bg-rose-500/10 text-rose-500'
                                    }`}>
                                    {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-lg">{tx.description}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                            {tx.category}
                                        </span>
                                        <span className="text-sm text-slate-400">
                                            {format(new Date(tx.date), "d 'de' MMM, yyyy", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Amount & Actions */}
                            <div className="flex items-center gap-8">
                                <span className={`text-lg font-bold tracking-tight ${tx.type === 'income' ? 'text-emerald-500' : 'text-slate-900 dark:text-white'
                                    }`}>
                                    {tx.type === 'expense' && '- '}
                                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>

                                {/* Actions - Always Visible but subtle */}
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-x-2 group-hover:translate-x-0">
                                    <Link href={`/transactions/${tx.id}/edit`} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(tx.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                            <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem transações em {format(currentDate, 'MMMM', { locale: ptBR })}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                            Nenhuma movimentação encontrada para este mês.
                        </p>
                        <Link
                            href="/transactions/new"
                            className="text-brand-500 font-bold hover:underline"
                        >
                            Criar primeira transação
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
