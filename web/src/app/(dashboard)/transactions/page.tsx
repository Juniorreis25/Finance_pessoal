'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, ArrowDownCircle, ArrowUpCircle, ArrowRightLeft } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Transaction = {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
}

export default function TransactionsPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchTransactions() {
            const { data } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })

            if (data) setTransactions(data)
            setLoading(false)
        }
        fetchTransactions()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Transações</h1>
                <Link
                    href="/transactions/new"
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500 transition shadow-sm shadow-brand-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Nova Transação
                </Link>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-slate-500">Carregando...</div>
                ) : transactions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Descrição</th>
                                    <th className="px-6 py-4 text-center">Categoria</th>
                                    <th className="px-6 py-4">Data</th>
                                    <th className="px-6 py-4 text-right">Valor</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {transactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                        <td className="px-6 py-4 font-medium flex items-center gap-3">
                                            {tx.type === 'income' ? (
                                                <ArrowUpCircle className="w-4 h-4 text-success" />
                                            ) : (
                                                <ArrowDownCircle className="w-4 h-4 text-danger" />
                                            )}
                                            {tx.description}
                                        </td>
                                        <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400">
                                            <span className="px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-xs">
                                                {tx.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                            {format(new Date(tx.date), "d MMM, yyyy", { locale: ptBR })}
                                        </td>
                                        <td className={`px-6 py-4 text-right font-medium ${tx.type === 'income' ? 'text-success' : 'text-danger'
                                            }`}>
                                            {tx.type === 'expense' ? '-' : '+'} R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center flex flex-col items-center">
                        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-full mb-4">
                            <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Sem transações</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Registre seus ganhos e gastos usando o botão acima.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
