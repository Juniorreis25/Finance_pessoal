import Image from 'next/image'

export function Logo({ className = "w-10 h-10", textSize = "text-xl", text }: { className?: string, textSize?: string, text?: string }) {
    return (
        <div className="flex items-center gap-3 group">
            <div className={`relative flex items-center justify-center ${className} overflow-hidden transition-all duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                <Image
                    src="/logo.png"
                    alt="Finance Pessoal Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            {text && (
                <span className={`${textSize} font-black tracking-tighter text-slate-900 dark:text-white transition-colors duration-300`}>
                    {text}
                </span>
            )}
        </div>
    )
}
