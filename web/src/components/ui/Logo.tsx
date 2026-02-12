export function Logo({ className = "w-10 h-10", textSize = "text-xl", text }: { className?: string, textSize?: string, text?: string }) {
    return (
        <div className="flex items-center gap-2.5 group">
            {/* Custom SVG Icon inspired by the new logo */}
            <div className={`relative flex items-center justify-center ${className} transition-all duration-500 group-hover:scale-110`}>
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" className="stop-color-emerald-400" style={{ stopColor: '#34d399' }} />
                            <stop offset="100%" className="stop-color-emerald-600" style={{ stopColor: '#059669' }} />
                        </linearGradient>
                    </defs>
                    {/* Background Faint Trend Line */}
                    <path
                        d="M2 18C4.5 15.5 7 16.5 10 12.5C13 8.5 17 9.5 22 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="text-emerald-500/20 dark:text-emerald-400/20"
                    />
                    {/* Growth Bars */}
                    <rect x="3" y="14" width="3" height="7" rx="1" fill="url(#logo-grad)" />
                    <rect x="8" y="10" width="3" height="11" rx="1" fill="url(#logo-grad)" />
                    <rect x="13" y="6" width="3" height="15" rx="1" fill="url(#logo-grad)" />
                    <rect x="18" y="2" width="3" height="19" rx="1" fill="url(#logo-grad)" />
                </svg>
            </div>

            {text && (
                <div className="flex flex-col -space-y-1.5">
                    <span className={`${textSize} font-black tracking-tighter text-slate-900 dark:text-white`}>
                        Finance<span className="text-emerald-600 dark:text-emerald-500 ml-0.5">Pessoal</span>
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 ml-0.5">
                        Controle & Crescimento
                    </span>
                </div>
            )}
        </div>
    )
}
