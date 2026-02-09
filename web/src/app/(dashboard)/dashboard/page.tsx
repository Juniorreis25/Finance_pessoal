'use client'

import { CardItem } from '@/components/cards/CardItem'
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react'

export default function DashboardPage() {
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
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ 5.430,00</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-success/10 text-success rounded-lg">
                            <ArrowUpCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Receitas (Mês)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ 8.200,00</h3>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-danger/10 text-danger rounded-lg">
                            <ArrowDownCircle className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Despesas (Mês)</p>
                            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">R$ 2.770,00</h3>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px] flex items-center justify-center">
                    <p className="text-slate-500">Gráfico de Receitas vs Despesas (Em Breve)</p>
                </div>
                <div className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[300px] flex items-center justify-center">
                    <p className="text-slate-500">Gráfico de Categorias (Em Breve)</p>
                </div>
            </div>
        </div>
    )
}
