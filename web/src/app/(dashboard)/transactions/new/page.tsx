'use client'

import { TransactionForm } from '@/components/forms/TransactionForm'

export default function NewTransactionPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">Nova Transação</h1>
                <p className="text-slate-500 dark:text-slate-400">Registre seus ganhos e gastos para manter o controle.</p>
            </div>

            <TransactionForm />
        </div>
    )
}
