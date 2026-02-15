
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus, ArrowDownRight, ArrowUpRight, ArrowRightLeft, Edit2, Trash2, Search, CreditCard, Wallet, CalendarRange, ListTree } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { MonthSelector } from '@/components/ui/MonthSelector'
import { usePrivacy } from '@/providers/PrivacyProvider'
import { MaskedValue } from '@/components/ui/MaskedValue'
import { MethodSelector } from '@/components/ui/MethodSelector'

type Transaction = {
    id: string
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
    purchase_date: string | null
    card_id: string | null
    installment_id: string | null
    installment_number: number | null
    total_installments: number | null
    cards: {
        name: string
    } | null
}

type Card = {
    id: string
    name: string
}

export default function TransactionsPage() {
    const supabase = createClient()
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [recurringExpenses, setRecurringExpenses] = useState<any[]>([])
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCardIds, setSelectedCardIds] = useState<string[]>(['all'])
    const { isValuesVisible, toggleVisibility } = usePrivacy()

    const fetchData = useCallback(async () => {
        setLoading(true)

        // Fetch transactions with JOIN
        const { data: txData } = await supabase
            .from('transactions')
            .select('*, cards(name)')
            .order('date', { ascending: false })

        if (txData) setTransactions(txData)

        // Fetch cards for filter
        const { data: cardData } = await supabase
            .from('cards')
            .select('id, name')
            .order('name')

        if (cardData) setCards(cardData)

        // Fetch recurring expenses
        const { data: recData } = await supabase
            .from('recurring_expenses')
            .select('*')
            .eq('active', true)

        if (recData) setRecurringExpenses(recData)

        setLoading(false)
    }, [supabase])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleDelete = async (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir esta transação?')) {
            const { error } = await supabase.from('transactions').delete().eq('id', id)
            if (error) {
                alert('Erro ao excluir transação')
                console.error(error)
            } else {
                fetchData()
            }
        }
    }

    // Filter transactions by selected month, search term and card
    const filteredTransactions = transactions.filter(tx => {
        const txDate = parseISO(tx.date)
        const matchesDate = isWithinInterval(txDate, {
            start: startOfMonth(currentDate),
            end: endOfMonth(currentDate)
        })

        const matchesSearch = tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tx.category.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesCard = selectedCardIds.includes('all') ||
            (selectedCardIds.includes('cash') && !tx.card_id) ||
            (tx.card_id && selectedCardIds.includes(tx.card_id))

        return matchesDate && matchesSearch && matchesCard
    })

    // Calculate totals
    // Calculate totals including recurring items
    const totalIncome = filteredTransactions
        .filter(tx => tx.type === 'income')
        .reduce((acc, tx) => acc + tx.amount, 0) +
        recurringExpenses
            .filter(re => re.type === 'income')
            .reduce((acc, re) => acc + re.amount, 0)

    // Total Expense considera APENAS as transações pontuais da lista (conforme solicitado)
    const totalExpense = filteredTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((acc, tx) => acc + tx.amount, 0)

    const totalCardExpense = filteredTransactions
        .filter(tx => tx.type === 'expense' && tx.card_id)
        .reduce((acc, tx) => acc + tx.amount, 0)

    const projectedBalance = totalIncome - totalExpense


    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header with Search and Date Filter */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Transações</h1>
                    <p className="text-slate-400">Gerencie suas entradas e saídas.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto items-center">
                    <MonthSelector currentDate={currentDate} onDateChange={setCurrentDate} />

                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Search Bar */}
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-gray" />
                            <label htmlFor="search-transactions" className="sr-only">Buscar transações</label>
                            <input
                                id="search-transactions"
                                placeholder="Buscar transações..."
                                className="w-full pl-11 pr-4 py-3 bg-brand-deep-sea border border-white/5 rounded-2xl text-sm focus:border-brand-accent/50 outline-none transition-all text-white placeholder:text-brand-gray/50"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Link
                            href="/transactions/new"
                            className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#00F0FF] to-[#00A3FF] text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_15px_rgba(0,240,255,0.3)]"
                        >
                            <Plus className="w-6 h-6" strokeWidth={3} />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-wrap gap-4 items-center">
                <MethodSelector
                    cards={cards}
                    selectedIds={selectedCardIds}
                    onChange={setSelectedCardIds}
                />
            </div>

            {/* Master Summary Card - Inspired by Dashboard minimal style */}
            <div className="relative overflow-hidden bg-brand-deep-sea rounded-[2.5rem] border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 w-80 h-80 bg-brand-accent/5 blur-[120px] rounded-full pointer-events-none" />

                <div className="relative z-10 p-8">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-full border border-white/10 w-fit backdrop-blur-md">
                            <Wallet className="w-4 h-4 text-brand-accent" />
                            <span className="text-xs font-bold text-brand-gray uppercase tracking-widest">Saldo Projetado</span>
                        </div>
                        <button
                            onClick={toggleVisibility}
                            className="p-2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            aria-label={isValuesVisible ? "Ocultar valores" : "Mostrar valores"}
                        >
                            {isValuesVisible ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" /><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" /><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" /><line x1="2" x2="22" y1="2" y2="22" /></svg>
                            )}
                        </button>
                    </div>

                    <div className="mt-8 flex items-baseline gap-2">
                        <h2 className={`text-4xl md:text-[52px] font-bold tracking-tighter glow-cyan ${projectedBalance >= 0 ? 'text-brand-accent' : 'text-rose-500'}`}>
                            <MaskedValue value={projectedBalance} prefix={isValuesVisible ? "R$ " : ""} />
                        </h2>
                    </div>

                    <div className="mt-10 flex flex-wrap gap-8 md:gap-12">
                        {/* Income */}
                        <div className="flex items-center gap-3 group">
                            <div className="p-3 bg-brand-success/10 rounded-2xl text-brand-success border border-brand-success/10 group-hover:bg-brand-success/20 transition-all">
                                <ArrowUpRight className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Receitas</p>
                                <p className="text-lg font-bold text-brand-success">
                                    <MaskedValue value={totalIncome} prefix={isValuesVisible ? "+ R$ " : ""} />
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5 self-center" />

                        {/* Regular Expenses */}
                        <div className="flex items-center gap-3 group">
                            <div className="p-3 bg-white/5 rounded-2xl text-white border border-white/10 group-hover:bg-white/10 transition-all">
                                <ArrowDownRight className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Saídas</p>
                                <p className="text-lg font-bold text-white">
                                    <MaskedValue value={totalExpense} prefix={isValuesVisible ? "- R$ " : ""} />
                                </p>
                            </div>
                        </div>

                        <div className="hidden md:block w-px h-10 bg-white/5 self-center" />

                        {/* Card Expenses */}
                        <div className="flex items-center gap-3 group">
                            <div className="p-2.5 bg-brand-accent/10 rounded-2xl text-brand-accent border border-brand-accent/10 group-hover:bg-brand-accent/20 transition-all">
                                <CreditCard className="w-5 h-5 font-bold" />
                            </div>
                            <div>
                                <p className="text-[10px] text-brand-gray font-bold uppercase tracking-wider">Cartões</p>
                                <p className="text-lg font-bold text-white">
                                    <MaskedValue value={totalCardExpense} prefix={isValuesVisible ? "- R$ " : ""} />
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transaction List - Floating Blocks */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-12 text-center text-slate-500 flex justify-center">
                        <div className="animate-pulse flex flex-col gap-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                        </div>
                    </div>
                ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((tx) => {
                        const isInstallment = tx.installment_id && tx.total_installments && tx.total_installments > 1

                        // Calculate installment dates if applicable
                        let firstDate: Date | null = null
                        let lastDate: Date | null = null

                        if (isInstallment && tx.installment_number) {
                            const txDate = parseISO(tx.date)
                            firstDate = subMonths(txDate, tx.installment_number - 1)
                            lastDate = addMonths(firstDate, tx.total_installments! - 1)
                        }

                        return (
                            <div
                                key={tx.id}
                                className="relative group bg-brand-deep-sea/80 backdrop-blur-sm p-6 rounded-[2rem] flex items-center justify-between border border-white/5 shadow-xl hover:bg-brand-deep-sea transition-all"
                            >
                                {/* Left: Icon & Info */}
                                <div className="flex items-center gap-5">
                                    <div className={`p-4 rounded-2xl border ${tx.type === 'income'
                                        ? 'bg-brand-success/10 text-brand-success border-brand-success/10'
                                        : 'bg-white/5 text-white border-white/10'
                                        }`}>
                                        {tx.type === 'income' ? <ArrowUpRight className="w-6 h-6 font-bold" /> : <ArrowDownRight className="w-6 h-6 font-bold" />}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-lg tracking-tight leading-none">{tx.description}</h3>
                                            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-white/5 border border-white/5">
                                                {tx.card_id ? (
                                                    <CreditCard className="w-3 h-3 text-brand-accent opacity-70" />
                                                ) : (
                                                    <Wallet className="w-3 h-3 text-brand-gray opacity-50" />
                                                )}
                                                <span className="text-[9px] font-bold text-brand-gray uppercase tracking-wider">
                                                    {tx.cards?.name || 'Dinheiro/Débito'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Installment Info */}
                                        {isInstallment && (
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 py-1">
                                                <div className="flex items-center gap-1.5 text-brand-accent bg-brand-accent/10 px-2 py-0.5 rounded-md border border-brand-accent/10">
                                                    <ListTree className="w-3 h-3" />
                                                    <span className="text-[10px] font-black tracking-widest uppercase">
                                                        Parcela {tx.installment_number}/{tx.total_installments}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-brand-gray opacity-60">
                                                    <CalendarRange className="w-3 h-3" />
                                                    <span className="text-[9px] font-bold uppercase tracking-wider">
                                                        {format(firstDate!, "MMM yy", { locale: ptBR })} ➜ {format(lastDate!, "MMM yy", { locale: ptBR })}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/5 text-brand-gray border border-white/5">
                                                {tx.category}
                                            </span>
                                            {!isInstallment && (
                                                <span className="text-xs font-bold text-brand-gray uppercase tracking-widest opacity-60">
                                                    {format(parseISO(tx.date), "d 'de' MMM", { locale: ptBR })}
                                                </span>
                                            )}
                                            {tx.purchase_date && (
                                                <span className={`text-[9px] font-bold text-brand-accent/50 uppercase tracking-widest ${!isInstallment ? 'border-l border-white/10 pl-3' : ''}`}>
                                                    Dt Compra: {format(parseISO(tx.purchase_date), "dd/MM/yy")}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Amount & Actions */}
                                <div className="flex items-center gap-8">
                                    <span className={`text-xl font-black tracking-tighter ${tx.type === 'income' ? 'text-brand-success' : 'text-white'
                                        }`}>
                                        {tx.type === 'expense' && '- '}
                                        R$ {tx.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>

                                    {/* Actions */}
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                        <Link href={`/transactions/${tx.id}/edit`} className="p-2 text-brand-gray hover:text-brand-accent hover:bg-white/5 rounded-xl transition-all" title="Editar">
                                            <Edit2 className="w-4 h-4" />
                                        </Link>
                                        <button onClick={() => handleDelete(tx.id)} className="p-2 text-brand-gray hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer" title="Excluir">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="p-16 text-center flex flex-col items-center bg-slate-900 rounded-3xl border border-slate-800 border-dashed">
                        <div className="p-4 bg-slate-800 rounded-full mb-4">
                            <ArrowRightLeft className="w-8 h-8 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Sem transações para este filtro</h3>
                        <p className="text-slate-400 mb-6 max-w-sm mx-auto">
                            Tente ajustar seus filtros ou mude o período selecionado.
                        </p>
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setSelectedCardIds(['all'])
                            }}
                            className="text-brand-accent font-bold hover:underline uppercase text-[10px] tracking-widest"
                        >
                            Limpar Filtros
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
