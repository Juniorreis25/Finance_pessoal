import Image from 'next/image'

export function Logo({ className = "w-10 h-10", textSize = "text-xl", showText = true }: { className?: string, textSize?: string, showText?: boolean }) {
    return (
        <div className="flex items-center gap-3 group">
            <div className={`relative flex items-center justify-center ${className} overflow-hidden rounded-xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <Image
                    src="/logo.png"
                    alt="Finance Pessoal Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {showText && (
                <div className="flex flex-col -space-y-1">
                    <span className={`${textSize} font-black tracking-tighter text-slate-900 dark:text-white transition-colors duration-300`}>
                        Finance<span className="text-emerald-500">Pessoal</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-0.5">
                        Controle & Crescimento
                    </span>
                </div>
            )}
        </div>
    )
}
