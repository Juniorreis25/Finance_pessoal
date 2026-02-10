'use client'

import { useEffect, useState, use } from 'react'
import { TransactionForm } from '@/components/forms/TransactionForm'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [transaction, setTransaction] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function fetchTransaction() {
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('id', id)
                .single()

            if (error) {
                console.error('Error fetching transaction:', error)
                router.push('/transactions')
                return
            }

            setTransaction(data)
            setLoading(false)
        }
        fetchTransaction()
    }, [id, router])

    if (loading) return <div className="p-8 text-center text-slate-500">Carregando...</div>

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">Editar Transação</h1>
                <p className="text-slate-500 dark:text-slate-400">Atualize os dados do lançamento.</p>
            </div>

            <TransactionForm initialData={transaction} />
        </div>
    )
}
