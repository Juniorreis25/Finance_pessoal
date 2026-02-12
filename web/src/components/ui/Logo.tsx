import Image from 'next/image'

export function Logo({ className = "w-48 h-12" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center ${className} transition-all duration-500 hover:scale-105 active:scale-95`}>
            <Image
                src="/logo_nova.png"
                alt="Finance Pessoal Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    )
}
