'use client'

import { Logo } from '@/components/ui/Logo'
import { LogoStacked, LogoHorizontal } from '@/components/ui/LogoPremium'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LogoDemoPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-12">
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-brand-gray hover:text-brand-accent transition-colors mb-6"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Voltar ao Dashboard
                </Link>
                <h1 className="text-4xl font-black text-white mb-2">
                    <span className="text-brand-accent">Logo</span> Variations
                </h1>
                <p className="text-brand-gray text-sm">
                    Comparação das variações do logo - Original vs. Stitch-Inspired
                </p>
            </div>

            {/* Logo Grid */}
            <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                {/* Original Logo */}
                <div className="bg-brand-deep-sea/50 backdrop-blur-sm rounded-3xl p-8 border border-white/5 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Original</h2>
                        <p className="text-xs text-brand-gray">Current logo design</p>
                    </div>

                    <div className="flex flex-col gap-8 items-center justify-center min-h-[400px] bg-slate-950/50 rounded-2xl p-8">
                        {/* Large version */}
                        <div className="flex flex-col items-center gap-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Large</span>
                            <Logo className="w-16 h-16" textSize="text-3xl" />
                        </div>

                        {/* Medium version */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Medium</span>
                            <Logo className="w-12 h-12" textSize="text-2xl" />
                        </div>

                        {/* Small version */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Small</span>
                            <Logo className="w-10 h-10" textSize="text-xl" />
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/5 rounded-xl">
                        <h3 className="text-xs font-bold text-brand-accent mb-2">Características:</h3>
                        <ul className="text-xs text-brand-gray space-y-1">
                            <li>• Layout horizontal</li>
                            <li>• Ícone com gradiente</li>
                            <li>• Tagline: "Sua Vida Financeira"</li>
                            <li>• Animação scale no hover</li>
                        </ul>
                    </div>
                </div>

                {/* Stacked Logo (Stitch Inspired) */}
                <div className="bg-brand-deep-sea/50 backdrop-blur-sm rounded-3xl p-8 border border-brand-accent/20 shadow-2xl shadow-brand-accent/10 relative overflow-hidden">
                    {/* "NEW" Badge */}
                    <div className="absolute top-4 right-4 bg-brand-accent text-black text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                        NEW
                    </div>

                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Stacked</h2>
                        <p className="text-xs text-brand-gray">Inspirado no Stitch Design</p>
                    </div>

                    <div className="flex flex-col gap-8 items-center justify-center min-h-[400px] bg-slate-950/50 rounded-2xl p-8">
                        {/* Large version */}
                        <div className="flex flex-col items-center gap-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Large</span>
                            <LogoStacked className="w-20 h-20" textSize="text-3xl" />
                        </div>

                        {/* Medium version */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Medium</span>
                            <LogoStacked className="w-16 h-16" textSize="text-2xl" />
                        </div>

                        {/* Small version */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Small</span>
                            <LogoStacked className="w-12 h-12" textSize="text-xl" />
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-brand-accent/10 rounded-xl border border-brand-accent/20">
                        <h3 className="text-xs font-bold text-brand-accent mb-2">Características:</h3>
                        <ul className="text-xs text-brand-gray space-y-1">
                            <li>✨ Layout vertical centralizado</li>
                            <li>✨ Glassmorphism aprimorado</li>
                            <li>✨ "Smart Wealth Management"</li>
                            <li>✨ Animação rotate + scale</li>
                        </ul>
                    </div>
                </div>

                {/* Horizontal Compact Logo */}
                <div className="bg-brand-deep-sea/50 backdrop-blur-sm rounded-3xl p-8 border border-white/5 shadow-xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-white mb-1">Horizontal</h2>
                        <p className="text-xs text-brand-gray">Compact navigation version</p>
                    </div>

                    <div className="flex flex-col gap-8 items-center justify-center min-h-[400px] bg-slate-950/50 rounded-2xl p-8">
                        {/* Large version */}
                        <div className="flex flex-col items-center gap-6">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Large</span>
                            <LogoHorizontal className="w-14 h-14" textSize="text-2xl" />
                        </div>

                        {/* Medium version */}
                        <div className="flex flex-col items-center gap-4">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Medium</span>
                            <LogoHorizontal className="w-12 h-12" textSize="text-xl" />
                        </div>

                        {/* Small version */}
                        <div className="flex flex-col items-center gap-3">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50">Small</span>
                            <LogoHorizontal className="w-10 h-10" textSize="text-lg" />
                        </div>

                        {/* With tagline */}
                        <div className="border-t border-white/10 pt-6 w-full">
                            <span className="text-xs font-bold uppercase tracking-widest text-brand-gray/50 block text-center mb-3">
                                Com Tagline
                            </span>
                            <div className="flex justify-center">
                                <LogoHorizontal className="w-12 h-12" textSize="text-xl" showTagline />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 p-4 bg-white/5 rounded-xl">
                        <h3 className="text-xs font-bold text-brand-accent mb-2">Características:</h3>
                        <ul className="text-xs text-brand-gray space-y-1">
                            <li>• Layout horizontal compacto</li>
                            <li>• Otimizado para navegação</li>
                            <li>• Tagline opcional</li>
                            <li>• Animação suave</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Usage Examples */}
            <div className="max-w-7xl mx-auto mt-12">
                <div className="bg-brand-deep-sea/30 backdrop-blur-sm rounded-3xl p-8 border border-white/5">
                    <h2 className="text-2xl font-bold text-white mb-6">
                        <span className="text-brand-accent">Uso</span> Recomendado
                    </h2>

                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-white">Original</h3>
                            <ul className="text-xs text-brand-gray space-y-1">
                                <li>→ Sidebar atual</li>
                                <li>→ Headers tradicionais</li>
                                <li>→ Emails e documentos</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-brand-accent">Stacked ✨</h3>
                            <ul className="text-xs text-brand-gray space-y-1">
                                <li>→ Landing page hero</li>
                                <li>→ Onboarding screens</li>
                                <li>→ Splash screens</li>
                                <li>→ Apresentações</li>
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-white">Horizontal</h3>
                            <ul className="text-xs text-brand-gray space-y-1">
                                <li>→ Navbar mobile</li>
                                <li>→ Footers</li>
                                <li>→ Espaços compactos</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Code Snippets */}
            <div className="max-w-7xl mx-auto mt-8">
                <div className="bg-brand-deep-sea/30 backdrop-blur-sm rounded-3xl p-8 border border-white/5">
                    <h2 className="text-xl font-bold text-white mb-4">
                        <span className="text-brand-accent">Como</span> Usar
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-slate-950/80 rounded-xl p-4 font-mono text-xs border border-white/5">
                            <div className="text-brand-gray mb-2">// Stacked (Hero)</div>
                            <div className="text-brand-accent">import</div>{' '}
                            <div className="text-white inline">{'{ LogoStacked }'}</div>{' '}
                            <div className="text-brand-accent inline">from</div>{' '}
                            <div className="text-green-400 inline">'@/components/ui/LogoPremium'</div>
                            <br />
                            <div className="text-white mt-2">&lt;LogoStacked className="w-16 h-16" textSize="text-3xl" /&gt;</div>
                        </div>

                        <div className="bg-slate-950/80 rounded-xl p-4 font-mono text-xs border border-white/5">
                            <div className="text-brand-gray mb-2">// Horizontal (Navbar)</div>
                            <div className="text-brand-accent">import</div>{' '}
                            <div className="text-white inline">{'{ LogoHorizontal }'}</div>{' '}
                            <div className="text-brand-accent inline">from</div>{' '}
                            <div className="text-green-400 inline">'@/components/ui/LogoPremium'</div>
                            <br />
                            <div className="text-white mt-2">&lt;LogoHorizontal className="w-12 h-12" textSize="text-xl" /&gt;</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
