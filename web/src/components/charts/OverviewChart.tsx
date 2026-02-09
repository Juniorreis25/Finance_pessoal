'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type OverviewData = {
    name: string
    receita: number
    despesa: number
}

export function OverviewChart({ data }: { data: OverviewData[] }) {
    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-500">Sem dados para exibir</div>
    }

    return (
        <div className="h-[300px] w-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Balanço Mensal</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 10,
                        left: -20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#64748b', fontSize: 12 }}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'transparent' }}
                        formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} />
                    <Bar dataKey="receita" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                    <Bar dataKey="despesa" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={30} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
