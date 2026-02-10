import { Wallet } from 'lucide-react'

export function Logo({ className = "w-8 h-8", textSize = "text-xl" }: { className?: string, textSize?: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`relative flex items-center justify-center ${className} bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl shadow-lg shadow-brand-500/20 text-slate-900 group-hover:scale-105 transition-transform duration-300`}>
                <Wallet className="w-1/2 h-1/2" strokeWidth={2.5} />
                <div className="absolute inset-0 bg-white/20 rounded-xl" />
            </div>
            <span className={`${textSize} font-extrabold tracking-tighter text-slate-900 dark:text-white`}>
                Finance<span className="text-brand-500">Pessoal</span>
            </span>
        </div>
    )
}
