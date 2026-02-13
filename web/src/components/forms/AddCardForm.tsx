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
        <form onSubmit={handleSubmit} className="space-y-8 bg-brand-deep-sea/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/5 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] rounded-full pointer-events-none" />

            {error && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-500/20 uppercase tracking-tight">
                    {error}
                </div>
            )}

            <div className="space-y-6 relative z-10">
                <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                        Card Name
                    </label>
                    <input
                        name="name"
                        required
                        placeholder="e.g. Nubank Black, Visa Infinite"
                        className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white placeholder:text-brand-gray/30"
                        value={formData.name}
                        onChange={handleChange}
                        autoFocus
                    />
                </div>

                <div className="bg-brand-nav/30 p-6 rounded-3xl border border-white/5">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-3 opacity-60">
                        Credit Limit (BRL)
                    </label>
                    <input
                        name="limit_amount"
                        type="text"
                        inputMode="numeric"
                        required
                        placeholder="R$ 0,00"
                        className="w-full bg-transparent border-0 p-0 focus:ring-0 transition-all font-bold text-4xl text-white placeholder:text-white/10 tracking-tighter"
                        value={formData.limit_amount}
                        onChange={handleAmountChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                            Closing Day
                        </label>
                        <input
                            name="closing_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="10"
                            className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white text-center"
                            value={formData.closing_day}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                            Due Day
                        </label>
                        <input
                            name="due_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="17"
                            className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white text-center"
                            value={formData.due_day}
                            onChange={handleChange}
                        />
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
                    className="flex-[2] flex items-center justify-center gap-2 px-8 py-4 bg-white text-black rounded-2xl font-black uppercase tracking-tighter text-xs hover:bg-brand-accent transition-all shadow-xl"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    {initialData ? 'Update Card' : 'Connect Card'}
                </button>
            </div>
        </form>
    )
}
