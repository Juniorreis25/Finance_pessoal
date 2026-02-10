'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CreditCard, Save, X } from 'lucide-react'

type CardData = {
    id?: string
    name: string
    limit_amount: number | string
    closing_day: number | string
    due_day: number | string
}

interface CardFormProps {
    initialData?: CardData
}

export function CardForm({ initialData }: CardFormProps) {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)

    // Helper to format currency on init
    const formatCurrency = (value: number | string) => {
        if (!value) return ''
        const num = typeof value === 'string' ? parseFloat(value) : value
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num)
    }

    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        limit_amount: initialData?.limit_amount ? formatCurrency(initialData.limit_amount) : '',
        closing_day: initialData?.closing_day || '',
        due_day: initialData?.due_day || '',
    })
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                limit_amount: initialData.limit_amount ? formatCurrency(initialData.limit_amount) : '',
                closing_day: String(initialData.closing_day),
                due_day: String(initialData.due_day),
            })
        }
    }, [initialData])

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value

        // Remove non-digits
        const numericValue = value.replace(/\D/g, '')

        if (!numericValue) {
            setFormData({ ...formData, limit_amount: '' })
            return
        }

        // Convert to float (divide by 100 for cents)
        const floatValue = parseFloat(numericValue) / 100

        // Format back to currency string
        const formatted = new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(floatValue)

        setFormData({ ...formData, limit_amount: formatted })
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
            const { data: { user } } = await supabase.auth.getUser()
            // if (!user) throw new Error('Usuário não autenticado')
            const userId = user?.id || 'anon-user'

            const limitValue = parseCurrency(String(formData.limit_amount))

            const payload = {
                user_id: userId,
                name: formData.name,
                limit_amount: limitValue,
                closing_day: Number(formData.closing_day),
                due_day: Number(formData.due_day),
            }

            if (initialData?.id) {
                const { error: updateError } = await supabase
                    .from('cards')
                    .update(payload)
                    .eq('id', initialData.id)
                if (updateError) throw updateError
            } else {
                const { error: insertError } = await supabase
                    .from('cards')
                    .insert(payload)
                if (insertError) throw insertError
            }

            router.push('/cards')
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-800 max-w-2xl mx-auto">
            <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-brand-500/10 text-brand-500 rounded-2xl">
                    <CreditCard className="w-8 h-8" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        {initialData ? 'Editar Cartão' : 'Novo Cartão'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400">Preencha os dados do seu cartão de crédito.</p>
                </div>
            </div>

            {error && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-xl text-sm font-medium border border-rose-500/20">
                    {error}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Nome do Cartão
                    </label>
                    <input
                        name="name"
                        required
                        placeholder="Ex: Nubank, Visa Platinum"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                        Limite (R$)
                    </label>
                    <input
                        name="limit_amount"
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="R$ 0,00"
                        className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-bold text-lg text-slate-900 dark:text-white placeholder:text-slate-400"
                        value={formData.limit_amount}
                        onChange={handleAmountChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Dia Fechamento
                        </label>
                        <input
                            name="closing_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="10"
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-center"
                            value={formData.closing_day}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                            Dia Vencimento
                        </label>
                        <input
                            name="due_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="17"
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white placeholder:text-slate-400 text-center"
                            value={formData.due_day}
                            onChange={handleChange}
                        />
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
                    {initialData ? 'Atualizar Cartão' : 'Salvar Cartão'}
                </button>
            </div>
        </form>
    )
}
