'use client'

import { CardForm } from '@/components/forms/AddCardForm'

export default function NewCardPage() {
    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Novo Cartão</h1>
                <p className="text-slate-500 dark:text-slate-400">Cadastre seu cartão de crédito para controlar as faturas.</p>
            </div>

            <CardForm />
        </div>
    )
}
