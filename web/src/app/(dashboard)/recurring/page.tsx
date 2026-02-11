'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Edit2, Trash2, Repeat, CheckCircle, XCircle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type RecurringExpense = {
    id: string
    description: string
    amount: number
    category: string
    day_of_month: number
    active: boolean
    last_processed_date?: string
}

export default function RecurringExpensesPage() {
    const supabase = createClient()
    const [expenses, setExpenses] = useState<RecurringExpense[]>([])
    const [loading, setLoading] = useState(true)

    const fetchExpenses = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('recurring_expenses')
            .select('*')
            .order('day_of_month', { ascending: true })

        if (data) setExpenses(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchExpenses()
    }, [])

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta despesa recorrente?')) {
            const { error } = await supabase.from('recurring_expenses').delete().eq('id', id)
            if (error) {
                alert('Erro ao excluir despesa')
            } else {
                fetchExpenses()
            }
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from('recurring_expenses')
            .update({ active: !currentStatus })
            .eq('id', id)

        if (!error) fetchExpenses()
    }

    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Despesas Recorrentes</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gerencie seus pagamentos fixos mensais.</p>
                </div>

                <Link
                    href="/recurring/new"
                    className="flex items-center gap-2 bg-brand-500 text-slate-950 px-5 py-2 rounded-xl font-bold hover:bg-brand-400 transition hover:scale-105 shadow-lg shadow-brand-500/20 whitespace-nowrap"
                >
                    <Plus className="w-4 h-4" />
                    Nova Recorrente
                </Link>
            </div>

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex justify-center">
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                ) : expenses.length > 0 ? (
                    <div className="grid gap-4">
                        {expenses.map((expense) => (
                            <div
                                key={expense.id}
                                className={`relative group bg-white dark:bg-slate-900 p-5 rounded-2xl flex items-center justify-between border ${!expense.active ? 'border-dashed border-slate-300 dark:border-slate-700 opacity-70' : 'border-slate-100 dark:border-slate-800'} shadow-sm hover:shadow-md transition-all`}
                            >
                                <div className="flex items-center gap-5">
                                    <div className={`p-3 rounded-full ${expense.active ? 'bg-brand-500/10 text-brand-500' : 'bg-slate-200 text-slate-400 dark:bg-slate-800'}`}>
                                        <Repeat className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{expense.description}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                                {expense.category}
                                            </span>
                                            <span className="text-sm text-slate-500">
                                                Dia {expense.day_of_month}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                                        R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => toggleStatus(expense.id, expense.active)}
                                            className={`p-2 rounded-lg transition-colors ${expense.active ? 'text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                            title={expense.active ? "Desativar" : "Ativar"}
                                        >
                                            {expense.active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                        </button>
                                        <Link href={`/recurring/${expense.id}/edit`} className="p-2 text-slate-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-lg transition-colors">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(expense.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors">
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
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sem despesas recorrentes</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                            Cadastre suas contas fixas (aluguel, internet, streaming) para não esquecer.
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
        </div>
    )
}
