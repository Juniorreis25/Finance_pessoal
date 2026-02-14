/**
 * Logo Diamond - Minimalist Version
 * Compact design with subtle neon accent
 */
export function LogoDiamond({
    size = 'medium',
    showText = true,
    animated = false
}: {
    size?: 'small' | 'medium' | 'large',
    showText?: boolean,
    animated?: boolean
}) {
    const sizes = {
        small: 'w-12 h-12',
        medium: 'w-14 h-14',
        large: 'w-16 h-16'
    }

    const textSizes = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg'
    }

    return (
        <div className={`flex flex-col items-center gap-3 ${animated ? 'animate-in fade-in duration-500' : ''}`}>
            {/* Logo Diamante Compacto */}
            <div className="relative">
                {/* Subtle glow */}
                <div className="absolute -inset-2 bg-brand-accent/5 rounded-full blur-xl opacity-40" />

                {/* Diamond frame - Smaller */}
                <div
                    className={`${sizes[size]} relative rotate-45 border-2 border-brand-accent/80 rounded-sm 
                    shadow-[0_0_8px_rgba(0,240,255,0.3)]
                    flex items-center justify-center transition-all duration-300
                    hover:border-brand-accent hover:shadow-[0_0_12px_rgba(0,240,255,0.5)]`}
                >
                    {/* FP Text */}
                    <div className="-rotate-45">
                        <span className={`${textSizes[size]} font-bold tracking-tight text-white`}>
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
