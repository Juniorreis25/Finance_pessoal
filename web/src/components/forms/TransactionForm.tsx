'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Loader2, Save, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'

type Card = {
    id: string
    name: string
}

export function TransactionForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<Card[]>([])

    const [type, setType] = useState<'income' | 'expense'>('expense')
    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0],
        card_id: '',
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCards() {
            const { data } = await supabase.from('cards').select('id, name')
            if (data) setCards(data)
        }
        fetchCards()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            const { error: insertError } = await supabase.from('transactions').insert({
                user_id: user.id,
                type,
                description: formData.description,
                amount: parseFloat(formData.amount),
                category: formData.category,
                date: formData.date,
                card_id: type === 'expense' && formData.card_id ? formData.card_id : null,
            })

            if (insertError) throw insertError

            router.push('/transactions')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const expenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Outros']
    const incomeCategories = ['Salário', 'Investimentos', 'Freelance', 'Outros']

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">

            {/* Type Toggle */}
            <div className="flex gap-4 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg max-w-sm">
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${type === 'expense'
                        ? 'bg-white text-danger shadow-sm dark:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    <ArrowDownCircle className="w-4 h-4" />
                    Despesa
                </button>
                <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${type === 'income'
                        ? 'bg-white text-success shadow-sm dark:bg-slate-800'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                        }`}
                >
                    <ArrowUpCircle className="w-4 h-4" />
                    Receita
                </button>
            </div>

            {error && (
                <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Descrição
                    </label>
                    <input
                        id="description"
                        name="description"
                        required
                        placeholder={type === 'expense' ? "Ex: Supermercado" : "Ex: Salário Mensal"}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Valor (R$)
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="0.00"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                        value={formData.amount}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Categoria
                    </label>
                    <select
                        id="category"
                        name="category"
                        required
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white [&>option]:text-slate-900"
                        value={formData.category}
                        onChange={handleChange}
                    >
                        <option value="">Selecione...</option>
                        {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Data
                    </label>
                    <input
                        id="date"
                        name="date"
                        type="date"
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                        value={formData.date}
                        onChange={handleChange}
                    />
                </div>

                {type === 'expense' && (
                    <div>
                        <label htmlFor="card_id" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Cartão (Opcional)
                        </label>
                        <select
                            id="card_id"
                            name="card_id"
                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white [&>option]:text-slate-900"
                            value={formData.card_id}
                            onChange={handleChange}
                        >
                            <option value="">Nenhum (Dinheiro/Débito)</option>
                            {cards.map(card => (
                                <option key={card.id} value={card.id}>{card.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-500 disabled:opacity-50 transition-colors shadow-sm shadow-brand-600/20"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Salvar Transação
                </button>
            </div>
        </form>
    )
}
