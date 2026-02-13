
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
    const [searchTerm, setSearchTerm] = useState('')

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

    // Filter transactions by selected month and search term
    const filteredTransactions = transactions.filter(tx => {
        const txDate = new Date(tx.date)
        const matchesDate = isWithinInterval(txDate, {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        })

        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase())

        return matchesDate && matchesSearch
    })

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header with Search and Date Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transações</h1>
                    <p className="text-slate-400">Gerencie suas entradas e saídas.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
                            <input
                                placeholder="Search transactions..."
                                className="w-full pl-11 pr-4 py-3 bg-brand-deep-sea border border-white/5 rounded-2xl text-sm focus:border-brand-accent/50 outline-none transition-all text-white placeholder:text-brand-gray/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link
                            href="/transactions/new"
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,240,255,0.3)]"
                        >
                            <Plus className="w-6 h-6" strokeWidth={3} />
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
                            className="relative group bg-brand-deep-sea/80 backdrop-blur-sm p-6 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-xl hover:bg-brand-deep-sea transition-all"
                        >
                            {/* Left: Icon & Info */}
                            <div className="flex items-center gap-5">
                                <div className={`p-4 rounded-2xl border ${tx.type === 'income'
                                    ? 'bg-brand-success/10 text-brand-success border-brand-success/10'
                                    : 'bg-white/5 text-white border-white/10'
                                    }`}>
                                    {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6 font-bold" /> : <ArrowDownRight className="w-6 h-6 font-bold" />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg tracking-tight leading-none mb-2">{tx.description}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-brand-gray border border-white/5">
                                            {tx.category}
                                        </span>
                                        <span className="text-xs font-bold text-brand-gray uppercase tracking-widest opacity-60">
                                            {format(new Date(tx.date), "d 'de' MMM", { locale: ptBR })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Amount & Actions */}
                            <div className="flex items-center gap-8">
                                <span className={`text-xl font-black tracking-tighter ${tx.type === 'income' ? 'text-brand-success' : 'text-white'
                                    }`}>
                                    {tx.type === 'expense' && '- '}
                                    R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>

                                {/* Actions */}
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                    <Link href={`/transactions/${tx.id}/edit`} className="p-2 text-brand-gray hover:text-brand-accent hover:bg-white/5 rounded-xl transition-all" title="Editar">
                                        <Edit2 className="w-4 h-4" />
                                    </Link>
                                    <button onClick={() => handleDelete(tx.id)} className="p-2 text-brand-gray hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer" title="Excluir">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-16 text-center flex flex-col items-center bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                        <div className="p-4 bg-slate-800 rounded-full mb-4">
                            <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sem transações em {format(currentDate, 'MMMM', { locale: ptBR })}</h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
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
