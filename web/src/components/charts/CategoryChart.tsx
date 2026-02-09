'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type CategoryData = {
    name: string
    value: number
    color: string
}

export function CategoryChart({ data }: { data: CategoryData[] }) {
    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-500">Sem dados para exibir</div>
    }

    return (
        <div className="h-[300px] w-full">
            <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">Gastos por Categoria</h3>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: any) => `R$ ${Number(value).toFixed(2)}`}
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
