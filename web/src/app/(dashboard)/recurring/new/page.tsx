'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, X, Calendar, DollarSign, Tag, FileText } from 'lucide-react'

export default function NewRecurringExpensePage() {
    const router = useRouter()
    const supabase = createClient()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [formData, setFormData] = useState({
        description: '',
        amount: '',
        category: '',
        day_of_month: '5'
    })

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
            const { data: { user } } = await supabase.auth.getUser()
            const userId = user?.id

            if (!userId) throw new Error('Usuário não autenticado')

            const amountValue = parseCurrency(formData.amount)
            const dayValue = parseInt(formData.day_of_month)

            if (dayValue < 1 || dayValue > 31) {
                throw new Error('Dia do mês inválido (1-31)')
            }

            const { error: insertError } = await supabase
                .from('recurring_expenses')
                .insert({
                    user_id: userId,
                    description: formData.description,
                    amount: amountValue,
                    category: formData.category,
                    day_of_month: dayValue,
                    active: true
                })

            if (insertError) throw insertError

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

    const categories = ['Alimentação', 'Assinaturas', 'Educação', 'Empréstimo', 'Financiamento', 'Lazer', 'Moradia', 'Saúde', 'Transporte', 'Outros']

    return (
        <div className="max-w-2xl mx-auto py-8">
            <div className="mb-10 px-4">
                <h1 className="text-4xl font-extrabold text-white tracking-tighter uppercase mb-2">
                    Nova <span className="text-brand-accent">Recorrência</span>
                </h1>
                <p className="text-brand-gray text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Automação de Fluxo de Caixa</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-brand-deep-sea/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] rounded-full pointer-events-none" />

                {error && (
                    <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-500/20 uppercase tracking-tight">
                        {error}
                    </div>
                )}

                <div className="space-y-6 relative z-10">
                    <div className="bg-brand-nav/30 p-6 rounded-3xl border border-white/5">
                        <label htmlFor="amount" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-3 opacity-60">
                            Monthly Value (BRL)
                        </label>
                        <div className="relative">
                            <input
                                id="amount"
                                name="amount"
                                type="text"
                                inputMode="numeric"
                                required
                                placeholder="R$ 0,00"
                                className="w-full bg-transparent border-0 p-0 focus:ring-0 transition-all font-bold text-4xl text-white placeholder:text-white/10 tracking-tighter"
                                value={formData.amount}
                                onChange={handleAmountChange}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                            Description
                        </label>
                        <div className="relative">
                            <input
                                id="description"
                                name="description"
                                required
                                placeholder="e.g. Netflix, Rent, Gym"
                                className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white placeholder:text-brand-gray/30"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="category" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    id="category"
                                    name="category"
                                    required
                                    className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                                    value={formData.category}
                                    onChange={handleChange}
                                >
                                    <option value="" className="bg-brand-deep-sea">Select...</option>
                                    {categories.map(cat => (
                                        <option key={cat} value={cat} className="bg-brand-deep-sea">{cat}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="day_of_month" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                                Due Day
                            </label>
                            <div className="relative">
                                <input
                                    id="day_of_month"
                                    name="day_of_month"
                                    type="number"
                                    min="1"
                                    max="31"
                                    required
                                    className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white text-center"
                                    value={formData.day_of_month}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-white/5 text-brand-gray rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all border border-white/5"
                    >
                        <X className="w-4 h-4" />
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-[2] flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] text-black rounded-2xl font-black uppercase tracking-tighter text-xs hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all shadow-[0_8px_25px_rgba(0,240,255,0.3)]"
                    >
                        {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                        Confirm Rule
                    </button>
                </div>
            </form>
        </div>
    )
}
