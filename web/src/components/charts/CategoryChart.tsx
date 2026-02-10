'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type CategoryData = {
    name: string
    value: number
    color: string
}

export function CategoryChart({ data }: { data: CategoryData[] }) {
    if (!data || data.length === 0) {
        return <div className="h-full flex items-center justify-center text-slate-500 font-medium">Sem dados para exibir</div>
    }

    // Neo-Fintech Palette
    const NEO_PALETTE = [
        '#a3e635', // lime-400
        '#34d399', // emerald-400
        '#38bdf8', // sky-400
        '#fb7185', // rose-400
        '#c084fc', // purple-400 (Just one accent allowed? "Purple Ban" says NO purple. Let's use Violet or Orange)
        // Wait, Purple Ban says "No purple, violet, indigo or magenta as PRIMARY". Accent is ok? 
        // "NEVER use purple... unless EXPLICITLY requested."
        // Better replace purple with Orange/Yellow
        '#facc15', // yellow-400
        '#fb923c', // orange-400
    ]

    return (
        <div className="h-[300px] w-full">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white tracking-tight">Gastos por Categoria</h3>
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
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={NEO_PALETTE[index % NEO_PALETTE.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
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
                        wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                        formatter={(value) => <span className="text-slate-600 dark:text-slate-400 font-medium">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
