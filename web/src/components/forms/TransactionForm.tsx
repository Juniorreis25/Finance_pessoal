'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, ArrowUpCircle, ArrowDownCircle, X, CalendarClock, Calculator, Repeat } from 'lucide-react'
import { addMonths, format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

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
    installment_id?: string | null
    installment_number?: number | null
    total_installments?: number | null
    purchase_date?: string | null
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
    const [isInstallment, setIsInstallment] = useState(!!initialData?.installment_id)
    const [isRecurring, setIsRecurring] = useState(false)
    const [installments, setInstallments] = useState(initialData?.total_installments || 2)

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
        purchaseDate: initialData?.purchase_date || new Date().toISOString().split('T')[0],
        card_id: initialData?.card_id || '',
    })
    const [error, setError] = useState<string | null>(null)

    // Derived state for installment summaries
    const [installmentSummary, setInstallmentSummary] = useState<{
        lastDate: string
        monthlyValue: string
    } | null>(null)

    useEffect(() => {
        async function fetchCards() {
            const { data } = await supabase.from('cards').select('id, name')
            if (data) setCards(data)
        }
        fetchCards()
    }, [])

    const parseCurrency = (value: string) => {
        if (!value) return 0
        const clean = value.replace(/[R$\s.]/g, '').replace(',', '.')
        return parseFloat(clean)
    }

    // Effect to calculate installment summary
    useEffect(() => {
        if (!isInstallment || !formData.date || !formData.amount || installments < 2) {
            setInstallmentSummary(null)
            return
        }

        try {
            // Fix timezone issue by appending time or just using parseISO
            const startDate = parseISO(formData.date)
            const totalAmount = parseCurrency(formData.amount)

            // Calculate last date
            const finalDate = addMonths(startDate, installments - 1)

            // Calculate monthly amount (approximate)
            const monthly = totalAmount / installments

            setInstallmentSummary({
                lastDate: format(finalDate, "MMMM 'de' yyyy", { locale: ptBR }),
                monthlyValue: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthly)
            })
        } catch (e) {
            setInstallmentSummary(null)
        }
    }, [isInstallment, formData.date, formData.amount, installments])

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            const userId = user?.id || 'anon-user'
            const amountValue = parseCurrency(formData.amount)

            // Common payload props
            const basePayload = {
                user_id: userId,
                type,
                category: formData.category,
                date: formData.date,
                card_id: type === 'expense' && formData.card_id ? formData.card_id : null,
                purchase_date: isInstallment ? formData.purchaseDate : null,
                total_installments: isInstallment ? installments : null
            }

            if (isInstallment && type === 'expense' && !initialData?.id) {
                // CREATE INSTALLMENTS (RPC Call)
                // Note: RPC function must be created in Supabase (20240211_add_installments.sql)
                const { error: rpcError } = await supabase.rpc('create_installment_transaction', {
                    p_user_id: userId,
                    p_description: formData.description,
                    p_amount: amountValue,
                    p_category: formData.category,
                    p_date: formData.date, // First Installment Date
                    p_total_installments: installments,
                    p_card_id: formData.card_id || null,
                    p_purchase_date: formData.purchaseDate // Actual Purchase Date
                })

                if (rpcError) throw new Error(`Erro ao criar parcelas: ${rpcError.message}`)

            } else {
                // STANDARD CREATE / UPDATE
                const payload = {
                    ...basePayload,
                    description: formData.description,
                    amount: amountValue,
                }

                if (isRecurring && type === 'income') {
                    const dayOfMonth = new Date(formData.date).getUTCDate()

                    const { error: insertError } = await supabase
                        .from('recurring_expenses')
                        .insert({
                            user_id: userId,
                            description: formData.description,
                            amount: amountValue,
                            category: formData.category,
                            day_of_month: dayOfMonth,
                            type: 'income',
                            active: true
                        })
                    if (insertError) throw insertError

                    router.push('/recurring')
                } else if (initialData?.id) {
                    const { error: updateError } = await supabase
                        .from('transactions')
                        .update(payload)
                        .eq('id', initialData.id)
                    if (updateError) throw updateError
                    router.push('/transactions')
                } else {
                    const { error: insertError } = await supabase
                        .from('transactions')
                        .insert(payload)
                    if (insertError) throw insertError
                    router.push('/transactions')
                }
            }
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

    const expenseCategories = ['Alimentação', 'Educação', 'Empréstimo', 'Financiamento', 'Lazer', 'Moradia', 'Saúde', 'Transporte', 'Outros']
    const incomeCategories = ['Freelance', 'Investimentos', 'Salário', 'Outros']

    return (
        <form onSubmit={handleSubmit} className="space-y-8 bg-brand-deep-sea/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-2xl border border-white/5 max-w-2xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-accent/5 blur-[80px] rounded-full pointer-events-none" />

            {/* Type Toggle - Neo Style */}
            <div className="flex gap-2 p-1.5 bg-brand-nav/50 backdrop-blur-md rounded-2xl max-w-md mx-auto border border-white/5">
                <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'expense'
                        ? 'bg-white text-black shadow-lg'
                        : 'text-brand-gray hover:text-white'
                        }`}
                >
                    <ArrowDownCircle className={`w-4 h-4 ${type === 'expense' ? 'text-black' : 'text-brand-gray'}`} />
                    Cash Out
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setType('income')
                        setIsInstallment(false)
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${type === 'income'
                        ? 'bg-brand-success text-black shadow-lg shadow-brand-success/20'
                        : 'text-brand-gray hover:text-white'
                        }`}
                >
                    <ArrowUpCircle className={`w-4 h-4 ${type === 'income' ? 'text-black' : 'text-brand-gray'}`} />
                    Cash In
                </button>
            </div>

            {type === 'income' && (
                <div className="bg-brand-success/5 p-6 rounded-[2rem] border border-brand-success/10 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl ${isRecurring ? 'bg-brand-success text-black' : 'bg-white/5 text-brand-gray'}`}>
                            <Repeat className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-black text-white text-xs uppercase tracking-widest">Recurring?</p>
                            <p className="text-[10px] text-brand-gray font-bold uppercase opacity-60">Generate every month</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setIsRecurring(!isRecurring)}
                        className={`w-14 h-8 rounded-full transition-all relative ${isRecurring ? 'bg-brand-success' : 'bg-white/10'}`}
                    >
                        <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-xl ${isRecurring ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>
            )}

            {error && (
                <div className="bg-rose-500/10 text-rose-500 p-4 rounded-2xl text-xs font-bold border border-rose-500/20 uppercase tracking-tight">
                    {error}
                </div>
            )}

            <div className="space-y-6 relative z-10">
                <div className="bg-brand-nav/30 p-6 rounded-3xl border border-white/5">
                    <label htmlFor="amount" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-3 opacity-60">
                        Value {isInstallment ? 'Total' : ''} (BRL)
                    </label>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="description" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                            Description
                        </label>
                        <input
                            id="description"
                            name="description"
                            required
                            placeholder={type === 'expense' ? "e.g. Shopping" : "e.g. Monthly Salary"}
                            className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white placeholder:text-brand-gray/30"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label htmlFor="category" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                            Category
                        </label>
                        <select
                            id="category"
                            name="category"
                            required
                            className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="" className="bg-brand-deep-sea">Select...</option>
                            {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                <option key={cat} value={cat} className="bg-brand-deep-sea">{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className={isInstallment ? "grid grid-cols-2 gap-4" : ""}>
                        {isInstallment && (
                            <div>
                                <label htmlFor="purchaseDate" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                                    Purchase
                                </label>
                                <input
                                    id="purchaseDate"
                                    name="purchaseDate"
                                    type="date"
                                    required={isInstallment}
                                    className="w-full px-4 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white [color-scheme:dark] text-sm"
                                    value={formData.purchaseDate}
                                    onChange={handleChange}
                                />
                            </div>
                        )}
                        <div>
                            <label htmlFor="date" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                                {isInstallment ? '1st Due' : 'Date'}
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                required
                                className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white [color-scheme:dark]"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {type === 'expense' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div>
                            <label htmlFor="card_id" className="block text-[10px] font-black uppercase tracking-[0.2em] text-brand-gray mb-2 opacity-60">
                                Payment Method
                            </label>
                            <select
                                id="card_id"
                                name="card_id"
                                className="w-full px-5 py-4 bg-brand-nav/50 border border-white/5 rounded-2xl focus:border-brand-accent/50 outline-none transition-all font-bold text-white appearance-none cursor-pointer"
                                value={formData.card_id || ''}
                                onChange={handleChange}
                            >
                                <option value="" className="bg-brand-deep-sea">Cash / Debit</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id} className="bg-brand-deep-sea">{card.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl ${isInstallment ? 'bg-brand-accent text-black' : 'bg-white/5 text-brand-gray'}`}>
                                        <CalendarClock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-black text-white text-xs uppercase tracking-widest">Installments?</p>
                                        <p className="text-[10px] text-brand-gray font-bold uppercase opacity-60">Spread across future months</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsInstallment(!isInstallment)}
                                    className={`w-14 h-8 rounded-full transition-all relative ${isInstallment ? 'bg-brand-accent' : 'bg-white/10'}`}
                                >
                                    <div className={`w-6 h-6 bg-white rounded-full absolute top-1 transition-all shadow-xl ${isInstallment ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {isInstallment && (
                                <div className="mt-8 space-y-6 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-brand-gray mb-4 opacity-60">
                                            Number of Payments
                                        </label>
                                        <div className="flex items-center gap-6">
                                            <input
                                                type="range"
                                                min="2"
                                                max="24"
                                                value={installments}
                                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                                                className="flex-1 h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer accent-brand-accent"
                                            />
                                            <div className="w-16 h-12 flex items-center justify-center bg-brand-nav border border-white/5 rounded-2xl font-black text-white text-lg tracking-tighter">
                                                {installments}x
                                            </div>
                                        </div>
                                    </div>

                                    {installmentSummary && (
                                        <div className="bg-brand-accent/5 border border-brand-accent/10 rounded-2xl p-5 flex flex-col gap-3">
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-brand-gray font-bold uppercase tracking-widest">Monthly:</span>
                                                <span className="font-black text-brand-accent text-sm tracking-tighter">{installmentSummary.monthlyValue}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-xs">
                                                <span className="text-brand-gray font-bold uppercase tracking-widest">Final Payment:</span>
                                                <span className="font-black text-white text-sm tracking-tighter uppercase">{installmentSummary.lastDate}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
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
                    {initialData ? 'Update Transaction' : 'Confirm Transaction'}
                </button>
            </div>
        </form>
    )
}
