'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, ArrowUpCircle, ArrowDownCircle, X } from 'lucide-react'

type Card = {
    id: string
    name: string
}

type TransactionData = {
    id?: string
    description: string
    amount: number | string
    category: string
    date: string
    type: 'income' | 'expense'
    card_id?: string | null
}

interface TransactionFormProps {
    initialData?: TransactionData
}

export function TransactionForm({ initialData }: TransactionFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [cards, setCards] = useState<Card[]>([])

    const [type, setType] = useState<'income' | 'expense'>(initialData?.type || 'expense')

    // Helper to format currency on init
    const formatCurrency = (value: number | string) => {
        if (!value) return ''
        const num = typeof value === 'string' ? parseFloat(value) : value
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
    }

    const [formData, setFormData] = useState({
        description: initialData?.description || '',
        amount: initialData?.amount ? formatCurrency(initialData.amount) : '',
        category: initialData?.category || '',
        date: initialData?.date || new Date().toISOString().split('T')[0],
        card_id: initialData?.card_id || '',
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function fetchCards() {
            const { data } = await supabase.from('cards').select('id, name')
            if (data) setCards(data)
        }
        fetchCards()
    }, [])

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value

        // Remove non-digits
        const numericValue = value.replace(/\D/g, '')

        if (!numericValue) {
            setFormData({ ...formData, amount: '' })
            return
        }

        // Convert to float (divide by 100 for cents)
        const floatValue = parseFloat(numericValue) / 100

        // Format back to currency string
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(floatValue)

        setFormData({ ...formData, amount: formatted })
    }

    const parseCurrency = (value: string) => {
        if (!value) return 0
        // Clean non-numeric characters except comma (if any, but our formatter uses dot for thousands and comma for decimal)
        // Standard approach for BRL: remove 'R$', trim, remove dots, replace comma with dot
        const clean = value.replace(/[R$\s.]/g, '').replace(',', '.')
        return parseFloat(clean)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            // if (!user) throw new Error('Usuário não autenticado')
            const userId = user?.id || 'anon-user'

            const amountValue = parseCurrency(formData.amount)

            const payload = {
                user_id: userId,
                type,
                description: formData.description,
                amount: amountValue,
                category: formData.category,
                date: formData.date,
                card_id: type === 'expense' && formData.card_id ? formData.card_id : null,
            }

            if (initialData?.id) {
                const { error: updateError } = await supabase
                    .from('transactions')
                    .update(payload)
                    .eq('id', initialData.id)
                if (updateError) throw updateError
            } else {
                const { error: insertError } = await supabase
                    .from('transactions')
                    .insert(payload)
                if (insertError) throw insertError
            }

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
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">

            <div className="flex items-center justify-between mb-2">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {initialData ? 'Editar Transação' : 'Nova Transação'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Registre suas movimentações.</p>
                </div>
            </div>

            {/* Type Toggle - Neo Style */}
            <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl max-w-md mx-auto">
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'expense'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <ArrowDownCircle className="w-5 h-5" />
                    Despesa
                </button>
                <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${type === 'income'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                >
                    <ArrowUpCircle className="w-5 h-5" />
                    Receita
                </button>
            </div>

            {error && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-medium border border-rose-500/20">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Valor (R$)
                    </label>
                    <input
                        id="amount"
                        name="amount"
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="R$ 0,00"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-bold text-2xl text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={formData.amount}
                        onChange={handleAmountChange}
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Descrição
                    </label>
                    <input
                        id="description"
                        name="description"
                        required
                        placeholder={type === 'expense' ? "Ex: Supermercado" : "Ex: Salário Mensal"}
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Categoria
                        </label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white [&>option]:text-slate-900"
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
                        <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Data
                        </label>
                        <input
                            id="date"
                            name="date"
                            type="date"
                            required
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white"
                            value={formData.date}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                {type === 'expense' && (
                    <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                        <label htmlFor="card_id" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Cartão (Opcional)
                        </label>
                        <select
                            id="card_id"
                            name="card_id"
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white [&>option]:text-slate-900"
                            value={formData.card_id || ''}
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

            <div className="pt-6 flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                >
                    <X className="w-5 h-5" />
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3.5 bg-brand-500 text-slate-950 rounded-2xl font-bold hover:bg-brand-400 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg shadow-brand-500/20"
                >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                    {initialData ? 'Atualizar Transação' : 'Salvar Transação'}
                </button>
            </div>
        </form>
    )
}
