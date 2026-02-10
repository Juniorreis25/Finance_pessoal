'use client'

import { useEffect, useState, use } from 'react'
import { CardForm } from '@/components/forms/AddCardForm'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function EditCardPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [card, setCard] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        async function fetchCard() {
            const { data, error } = await supabase
                .from('cards')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching card:', error)
                router.push('/cards')
                return
            }

            setCard(data)
            setLoading(false)
        }
        fetchCard()
    }, [id, router])

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Editar Cartão</h1>
                <p className="text-slate-500 dark:text-slate-400">Atualize as informações do seu cartão.</p>
            </div>

            <CardForm initialData={card} />
        </div>
    )
}
