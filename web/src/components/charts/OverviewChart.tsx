'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

type OverviewData = {
    name: string
    receita: number
    despesa: number
}

export function OverviewChart({ data }: { data: OverviewData[] }) {
    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-500 font-medium">Sem dados para exibir</div>
    }

    return (
        <div className="h-[300px] w-full">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white tracking-tight">Balanço Mensal</h3>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart
                    data={data}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.5} />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                        tickFormatter={(value) => `R$${value}`}
                    />
                    <Tooltip
                        cursor={{ fill: 'rgba(51, 65, 85, 0.2)' }}
                        formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                        contentStyle={{
                            backgroundColor: '#1e293b',
                            borderColor: '#334155',
                            borderRadius: '12px',
                            color: '#f8fafc',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)'
                        }}
                        itemStyle={{ color: '#f8fafc' }}
                    />
                    <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => <span className="text-slate-600 dark:text-slate-400 font-medium">{value}</span>}
                    />
                    <Bar dataKey="receita" name="Receitas" fill="#34d399" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="despesa" name="Despesas" fill="#fb7185" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}
