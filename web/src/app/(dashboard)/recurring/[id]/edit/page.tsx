'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, X, Calendar, DollarSign, Tag, FileText } from 'lucide-react'

export default function EditRecurringExpensePage() {
    const router = useRouter()
    const params = useParams()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [initialLoading, setInitialLoading] = useState(true)

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        day_of_month: '5'
    })

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    }

    useEffect(() => {
        async function loadExpense() {
            const { data } = await supabase
                .from('recurring_expenses')
                .select('*')
                .eq('id', params.id)
                .single()

            if (data) {
                setFormData({
                    description: data.description,
                    amount: formatCurrency(data.amount),
                    category: data.category,
                    day_of_month: data.day_of_month.toString()
                })
            }
            setInitialLoading(false)
        }
        loadExpense()
    }, [params.id])

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value
        const numericValue = value.replace(/\D/g, '')

        if (!numericValue) {
            setFormData({ ...formData, amount: '' })
            return
        }

        const floatValue = parseFloat(numericValue) / 100
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(floatValue)

        setFormData({ ...formData, amount: formatted })
    }

    const parseCurrency = (value: string) => {
        if (!value) return 0
        const clean = value.replace(/[R$\s.]/g, '').replace(',', '.')
        return parseFloat(clean)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const amountValue = parseCurrency(formData.amount)
            const dayValue = parseInt(formData.day_of_month)

            if (dayValue < 1 || dayValue > 31) {
                throw new Error('Dia do mês inválido (1-31)')
            }

            const { error: updateError } = await supabase
                .from('recurring_expenses')
                .update({
                    description: formData.description,
                    amount: amountValue,
                    category: formData.category,
                    day_of_month: dayValue,
                    updated_at: new Date().toISOString()
                })
                .eq('id', params.id)

            if (updateError) throw updateError

            router.push('/recurring')
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

    const categories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Assinaturas', 'Outros']

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Editar Despesa Recorrente</h2>
                    <p className="text-slate-500 dark:text-slate-400">Atualize os dados da conta fixa.</p>
                </div>

                {error && (
                    <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-medium border border-rose-500/20">
                        {error}
                    </div>
                )}

                <div className="space-y-6">
                    <div>
                        <label htmlFor="amount" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Valor Mensal (R$)
                        </label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                id="amount"
                                name="amount"
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="R$ 0,00"
                                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-bold text-2xl text-slate-900 dark:text-white placeholder:text-slate-400"
                                value={formData.amount}
                                onChange={handleAmountChange}
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Descrição
                        </label>
                        <div className="relative">
                            <FileText className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                            <input
                                id="description"
                                name="description"
                                required
                                placeholder="Ex: Netflix, Aluguel, Internet"
                                className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                Categoria
                            </label>
                            <div className="relative">
                                <Tag className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white appearance-none cursor-pointer dark:[color-scheme:dark]"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione...</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="day_of_month" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                Dia do Vencimento
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
                                <input
                                    id="day_of_month"
                                    name="day_of_month"
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    className="w-full pl-12 pr-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                                    value={formData.day_of_month}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
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
                        Atualizar Recorrência
                    </button>
                </div>
            </form>
        </div>
    )
}
