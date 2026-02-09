'use client'

import { CardStatus, calculateCardStatus } from '@/lib/date-logic'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CreditCard, CalendarCheck, CalendarX, AlertCircle } from 'lucide-react'

type Card = {
    id: string
    name: string
    limit_amount: number
    closing_day: number
    due_day: number
}

export function CardItem({ card }: { card: Card }) {
    const status = calculateCardStatus(new Date(), card.closing_day, card.due_day)

    const getStatusColor = (status: CardStatus) => {
        if (status.isGoodDayToBuy) return 'text-success bg-success/10 border-success/20'
        if (status.status === 'open') return 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-900/20 dark:border-brand-800'
        return 'text-slate-600 bg-slate-50 border-slate-200'
    }

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between h-full transition-all hover:shadow-md">
            <div>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300">
                            <CreditCard className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{card.name}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Final {card.id.slice(-4)}</p>
                        </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(status)}`}>
                        {status.isGoodDayToBuy ? <CalendarCheck className="w-3.5 h-3.5" /> : <CalendarX className="w-3.5 h-3.5" />}
                        {status.isGoodDayToBuy ? 'Melhor Dia' : 'Fatura Aberta'}
                    </div>
                </div>

                <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Limite</span>
                        <span className="font-medium">R$ {card.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Fecha dia</span>
                        <span className="font-medium">{card.closing_day}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Vence dia</span>
                        <span className="font-medium">{card.due_day}</span>
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                <p className="text-xs text-center text-slate-500">
                    Melhor compra a partir de: <strong className="text-slate-700 dark:text-slate-200">{format(status.bestPurchaseDate, "d 'de' MMMM", { locale: ptBR })}</strong>
                </p>
            </div>
        </div>
    )
}
