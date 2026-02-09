'use client'

import { TransactionForm } from '@/components/forms/TransactionForm'

export default function NewTransactionPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Nova Transação</h1>
                <p className="text-slate-500 dark:text-slate-400">Registre seus ganhos e gastos para manter o controle.</p>
            </div>

            <TransactionForm />
        </div>
    )
}
