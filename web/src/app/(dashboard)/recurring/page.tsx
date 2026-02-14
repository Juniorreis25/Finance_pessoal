'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Repeat, CheckCircle, XCircle, Search, Wallet, ArrowUpRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { RecurringModal } from '@/components/modals/RecurringModal'
import { usePrivacy } from '@/providers/PrivacyProvider'
import { MaskedValue } from '@/components/ui/MaskedValue'

type RecurringExpense = {
    id: string
    description: string
    amount: number
    category: string
    day_of_month: number
    active: boolean
    type: 'income' | 'expense'
    last_processed_date?: string
}

export default function RecurringExpensesPage() {
    const supabase = createClient()
    const router = useRouter()
    const [expenses, setExpenses] = useState<RecurringExpense[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const { isValuesVisible, toggleVisibility } = usePrivacy()

    const fetchExpenses = useCallback(async () => {
        setLoading(true)
        const { data } = await supabase
            .from('recurring_expenses')
            .select('*')
            .order('day_of_month', { ascending: true })

        if (data) setExpenses(data)
        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchExpenses()
    }, [fetchExpenses])

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta despesa recorrente?')) {
            const { error } = await supabase.from('recurring_expenses').delete().eq('id', id)
            if (error) {
                alert('Erro ao excluir despesa')
            } else {
                fetchExpenses()
                router.refresh() // Invalidate cache
            }
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('recurring_expenses')
            .update({ active: !currentStatus })
            .eq('id', id)

        if (!error) {
            fetchExpenses()
            router.refresh() // Invalidate Next.js cache so Dashboard re-fetches
        }
    }

    // Filter expenses by search term
    const filteredExpenses = expenses.filter(expense => {
        return expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            expense.category.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const totalRecurringExpense = filteredExpenses
        .filter(ex => ex.type === 'expense' && ex.active)
        .reduce((acc, ex) => acc + ex.amount, 0)

    const totalRecurringIncome = filteredExpenses
        .filter(ex => ex.type === 'income' && ex.active)
        .reduce((acc, ex) => acc + ex.amount, 0)

    const recurringBalance = totalRecurringIncome - totalRecurringExpense

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transações Recorrentes</h1>
                    <p className="text-slate-400">Gerencie seus ganhos e pagamentos fixos mensais.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto items-center">
                    {/* Search Bar */}
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <label htmlFor="search-recurring" className="sr-only">Buscar por descrição</label>
                        <input
                            id="search-recurring"
                            placeholder="Buscar por descrição..."
                            className="w-full pl-9 pr-4 py-2 bg-brand-nav border border-white/5 rounded-xl text-sm focus:ring-1 focus:ring-brand-accent/50 outline-none transition-all placeholder:text-brand-gray/30 text-white font-bold"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center justify-center w-10 h-10 bg-brand-accent text-black rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-brand-accent/20 cursor-pointer"
                        title="Nova Recorrência"
                    >
                        <Plus className="w-6 h-6" strokeWidth={3} />
                    </button>
                </div>
            </div>

            <RecurringModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => {
                    fetchExpenses()
                    router.refresh()
                }}
            />

            {/* Master Summary Card - Inspired by Dashboard minimal style */}
            <div className="relative overflow-hidden bg-brand-deep-sea rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 p-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 w-fit backdrop-blur-md">
                            <Wallet className="w-4 h-4 text-brand-accent" />
                            <span className="text-xs font-bold text-brand-gray uppercase tracking-widest">Sobra Mensal Garantida</span>
                        </div>
                        <button
                            onClick={toggleVisibility}
                            className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            aria-label={isValuesVisible ? "Ocultar valores" : "Mostrar valores"}
                        >
                            {isValuesVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-baseline gap-2">
                        <h2 className={`text-4xl md:text-[52px] font-bold tracking-tighter glow-cyan ${recurringBalance >= 0 ? 'text-brand-accent' : 'text-rose-500'}`}>
                            <MaskedValue value={recurringBalance} prefix={isValuesVisible ? "R$ " : ""} />
                        </h2>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-8 md:gap-12">
                        {/* Income */}
                        <div className="flex items-center gap-3 group">
                            <div className="p-3 bg-brand-success/10 rounded-2xl text-brand-success border border-brand-success/10 group-hover:bg-brand-success/20 transition-all">
                                <ArrowUpRight className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Ganhos Fixos</p>
                                <p className="text-lg font-bold text-brand-success">
                                    <MaskedValue value={totalRecurringIncome} prefix={isValuesVisible ? "+ R$ " : ""} />
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5 self-center" />

                        {/* Regular Expenses */}
                        <div className="flex items-center gap-3 group">
                            <div className="p-3 bg-brand-accent/10 rounded-2xl text-brand-accent border border-brand-accent/10 group-hover:bg-brand-accent/20 transition-all">
                                <Repeat className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Contas Fixas</p>
                                <p className="text-lg font-bold text-white">
                                    <MaskedValue value={totalRecurringExpense} prefix={isValuesVisible ? "- R$ " : ""} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex justify-center">
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                ) : filteredExpenses.length > 0 ? (
                    <div className="grid gap-4">
                        {filteredExpenses.map((expense) => (
                            <div
                                key={expense.id}
                                className={`relative group bg-slate-900 p-5 rounded-2xl flex items-center justify-between border ${!expense.active ? 'border-dashed border-slate-700 opacity-70' : 'border-slate-800'} shadow-sm hover:shadow-md transition-all`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-full ${expense.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} ${!expense.active ? 'grayscale opacity-50' : ''}`}>
                                        <Repeat className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">{expense.description}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md border ${expense.type === 'income' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/10'}`}>
                                                {expense.type === 'income' ? 'Receita' : 'Despesa'}
                                            </span>
                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                                                {expense.category}
                                            </span>
                                            <span className="text-sm text-slate-400 font-medium whitespace-nowrap">
                                                Dia {expense.day_of_month}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <span className={`text-xl font-bold tracking-tight ${expense.type === 'income' ? 'text-emerald-500' : 'text-white'}`}>
                                        {expense.type === 'income' ? '+' : '-'} R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(expense.id, expense.active)}
                                            className={`p-2 rounded-lg transition-colors ${expense.active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            title={expense.active ? "Desativar" : "Ativar"}
                                        >
                                            {expense.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                        <Link href={`/recurring/${expense.id}/edit`} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors cursor-pointer" title="Editar Recorrência">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors cursor-pointer" title="Excluir Recorrência">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-16 text-center flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full mb-4">
                            <Repeat className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem transações recorrentes</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                            Cadastre seus ganhos ou contas fixas (aluguel, internet, streaming) para não esquecer.
                        </p>
                        <Link
                            href="/recurring/new"
                            className="text-brand-500 font-bold hover:underline"
                        >
                            Criar primeira recorrente
                        </Link>
                    </div>
                )}
            </div>
        </div >
    )
}
