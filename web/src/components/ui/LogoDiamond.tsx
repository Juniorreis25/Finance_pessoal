/**
 * Logo Diamond - Inspirado no Stitch Design
 * Design premium com formato de diamante rotacionado e efeito neon
 */
export function LogoDiamond({
    size = 'large',
    showText = true,
    animated = true
}: {
    size?: 'small' | 'medium' | 'large',
    showText?: boolean,
    animated?: boolean
}) {
    const sizes = {
        small: 'w-16 h-16',
        medium: 'w-24 h-24',
        large: 'w-32 h-32'
    }

    const textSizes = {
        small: 'text-xl',
        medium: 'text-2xl',
        large: 'text-3xl'
    }

    return (
        <div className={`flex flex-col items-center space-y-6 ${animated ? 'animate-in fade-in duration-700' : ''}`}>
            {/* Logo Diamante */}
            <div className="relative">
                {/* Glow background */}
                <div className="absolute -inset-4 bg-brand-accent/5 rounded-full blur-2xl opacity-50" />

                {/* Diamond frame */}
                <div
                    className={`${sizes[size]} relative rotate-45 border-[4px] border-brand-accent rounded-sm 
                    shadow-[0_0_15px_rgba(0,240,255,0.4),inset_0_0_8px_rgba(0,240,255,0.2)]
                    flex items-center justify-center transition-all duration-500
                    hover:scale-110 hover:shadow-[0_0_25px_rgba(0,240,255,0.6)]`}
                >
                    {/* FP Text inside diamond */}
                    <div className="-rotate-45">
                        <span className={`${textSizes[size]} font-extrabold tracking-tighter text-white`}>
                            FP
                        </span>
                    </div>
                </div>
            </div>

            {/* Brand Text */}
            {showText && (
                <div className={`text-center space-y-1 ${animated ? 'animate-in fade-in slide-in-from-bottom-2 duration-700 delay-300' : ''}`}>
                    <h1 className={`${textSizes[size]} tracking-tight leading-none`}>
                        <span className="font-bold text-white">Finance</span>
                        {' '}
                        <span className="font-light text-brand-accent">Pessoal</span>
                    </h1>
                    <p className="text-xs uppercase tracking-[0.3em] text-brand-gray/70 font-medium">
                        Smart Wealth Management
                    </p>
                </div>
            )}
        </div>
    )
}
