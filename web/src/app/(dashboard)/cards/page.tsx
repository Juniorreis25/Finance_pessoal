'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { CardItem } from '@/components/cards/CardItem'

type Card = {
    id: string
    name: string
    limit_amount: number
    closing_day: number
    due_day: number
    user_id: string
}

export default function CardsPage() {
    const supabase = createClient()
    const [cards, setCards] = useState<Card[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchCards() {
            const { data } = await supabase.from('cards').select('*')
            if (data) setCards(data)
            setLoading(false)
        }
        fetchCards()
    }, [])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Meus Cartões</h1>
                <Link
                    href="/cards/new"
                    className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg hover:bg-brand-500 transition shadow-sm shadow-brand-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Novo Cartão
                </Link>
            </div>

            {loading ? (
                <div className="flex h-40 items-center justify-center">
                    <Loader2 className="animate-spin text-brand-600 w-8 h-8" />
                </div>
            ) : cards.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card) => (
                        <CardItem key={card.id} card={card} />
                    ))}
                </div>
            ) : (
                <div className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-center flex flex-col items-center">
                    <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-full mb-4">
                        <Plus className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Nenhum cartão cadastrado</h3>
                    <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-sm">Cadastre seus cartões de crédito para acompanhar faturas e limites.</p>
                    <Link
                        href="/cards/new"
                        className="bg-brand-100 text-brand-700 px-4 py-2 rounded-lg hover:bg-brand-200 transition font-medium dark:bg-brand-900/30 dark:text-brand-300"
                    >
                        Cadastrar agora
                    </Link>
                </div>
            )}
        </div>
    )
}
