import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, ArrowUpCircle, ArrowDownCircle, X, CalendarClock, Calculator } from 'lucide-react'
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

    const expenseCategories = ['Alimentação', 'Moradia', 'Transporte', 'Lazer', 'Saúde', 'Educação', 'Financiamento', 'Empréstimo', 'Outros']
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
                    onClick={() => {
                        setType('expense')
                        // Reset installment if switching to income (optional, but safer)
                    }}
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
                    onClick={() => {
                        setType('income')
                        setIsInstallment(false)
                    }}
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
                        Valor {isInstallment ? 'Total' : ''} (R$)
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
                            className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white dark:[color-scheme:dark]"
                            value={formData.category}
                            onChange={handleChange}
                        >
                            <option value="">Selecione...</option>
                            {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Date Container */}
                    <div className={isInstallment ? "col-span-1 md:col-span-2 grid grid-cols-2 gap-6" : "col-span-1"}>
                        {isInstallment && (
                            <div>
                                <label htmlFor="purchaseDate" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                    Data da Compra
                                </label>
                                <input
                                    id="purchaseDate"
                                    name="purchaseDate"
                                    type="date"
                                    required={isInstallment}
                                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white dark:[color-scheme:dark]"
                                    value={formData.purchaseDate}
                                    onChange={handleChange}
                                />
                            </div>
                        )}

                        <div className={isInstallment ? "" : "w-full"}>
                            <label htmlFor="date" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                {isInstallment ? 'Data da 1ª Parcela' : 'Data'}
                            </label>
                            <input
                                id="date"
                                name="date"
                                type="date"
                                required
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white dark:[color-scheme:dark]"
                                value={formData.date}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </div>

                {type === 'expense' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
                        {/* Card Selection */}
                        <div>
                            <label htmlFor="card_id" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                Cartão (Opcional)
                            </label>
                            <select
                                id="card_id"
                                name="card_id"
                                className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border-0 rounded-2xl focus:ring-2 focus:ring-brand-500 transition-all font-medium text-slate-900 dark:text-white dark:[color-scheme:dark]"
                                value={formData.card_id || ''}
                                onChange={handleChange}
                            >
                                <option value="">Nenhum (Dinheiro/Débito)</option>
                                {cards.map(card => (
                                    <option key={card.id} value={card.id}>{card.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Installment Toggle & Logic */}
                        {/* Installment Toggle & Logic */}
                        <div className="bg-slate-50 dark:bg-slate-950/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isInstallment ? 'bg-brand-500 text-slate-950' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                                        <CalendarClock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Transação Parcelada?</p>
                                        <p className="text-xs text-slate-500">Divide o valor em meses futuros</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsInstallment(!isInstallment)}
                                    className={`w-12 h-6 rounded-full transition-colors relative ${isInstallment ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                >
                                    <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${isInstallment ? 'left-7' : 'left-1'}`} />
                                </button>
                            </div>

                            {isInstallment && (
                                <div className="mt-5 space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 ml-1">
                                            Número de Parcelas
                                        </label>
                                        <div className="flex items-center gap-4">
                                            <input
                                                type="range"
                                                min="2"
                                                max="24"
                                                value={installments}
                                                onChange={(e) => setInstallments(parseInt(e.target.value))}
                                                className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                                            />
                                            <div className="w-16 h-12 flex items-center justify-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-lg">
                                                {installments}x
                                            </div>
                                        </div>
                                    </div>

                                    {installmentSummary && (
                                        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 flex flex-col gap-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Mensalidade:</span>
                                                <span className="font-bold text-brand-600 dark:text-brand-400">{installmentSummary.monthlyValue}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-slate-600 dark:text-slate-400">Última parcela:</span>
                                                <span className="font-bold text-slate-900 dark:text-white">{installmentSummary.lastDate}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
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
