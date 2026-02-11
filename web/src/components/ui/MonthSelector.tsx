'use client'

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface MonthSelectorProps {
    currentDate: Date
    onDateChange: (date: Date) => void
}

export function MonthSelector({ currentDate, onDateChange }: MonthSelectorProps) {
    const handlePrevious = () => {
        onDateChange(subMonths(currentDate, 1))
    }

    const handleNext = () => {
        onDateChange(addMonths(currentDate, 1))
    }

    return (
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 shadow-sm border border-slate-200 dark:border-slate-800">
            <button
                onClick={handlePrevious}
                className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Mês anterior"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 px-4 py-1 border-x border-slate-100 dark:border-slate-800 mx-1 min-w-[160px] justify-center">
                <Calendar className="w-4 h-4 text-brand-500" />
                <span className="font-bold text-slate-900 dark:text-white capitalize text-sm">
                    {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
                </span>
            </div>

            <button
                onClick={handleNext}
                className="p-2 text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                aria-label="Próximo mês"
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    )
}
