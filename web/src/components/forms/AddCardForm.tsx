'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { CreditCard, Loader2, Save } from 'lucide-react'

export function AddCardForm() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        limit_amount: '',
        closing_day: '',
        due_day: '',
    })
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Usuário não autenticado')

            const { error: insertError } = await supabase.from('cards').insert({
                user_id: user.id,
                name: formData.name,
                limit_amount: parseFloat(formData.limit_amount),
                closing_day: parseInt(formData.closing_day),
                due_day: parseInt(formData.due_day),
            })

            if (insertError) throw insertError

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
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl shadow-sm border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-brand-100 text-brand-600 rounded-lg dark:bg-brand-900/30 dark:text-brand-400">
                    <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Novo Cartão</h2>
            </div>

            {error && (
                <div className="bg-danger/10 text-danger p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Nome do Cartão
                    </label>
                    <input
                        name="name"
                        required
                        placeholder="Ex: Nubank, Visa Platinum"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Limite (R$)
                    </label>
                    <input
                        name="limit_amount"
                        type="number"
                        step="0.01"
                        required
                        placeholder="5000.00"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                        value={formData.limit_amount}
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Dia Fechamento
                        </label>
                        <input
                            name="closing_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="10"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                            value={formData.closing_day}
                            onChange={handleChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Dia Vencimento
                        </label>
                        <input
                            name="due_day"
                            type="number"
                            min="1"
                            max="31"
                            required
                            placeholder="17"
                            className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all dark:text-white"
                            value={formData.due_day}
                            onChange={handleChange}
                        />
                    </div>
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-500 disabled:opacity-50 transition-colors shadow-sm shadow-brand-600/20"
                >
                    {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                    Salvar Cartão
                </button>
            </div>
        </form>
    )
}
