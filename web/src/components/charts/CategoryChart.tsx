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

    // Neo-Dark Hybrid Banking Palette
    const NEO_PALETTE = [
        '#00F0FF', // Cyan
        '#00FF94', // Emerald
        '#FFFFFF', // White
        '#8E8E93', // Gray
        '#003D2B', // Dark Emerald
        '#141C24', // Deep Sea
    ]

    return (
        <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        cx="40%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={8}
                        dataKey="value"
                        stroke="none"
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={NEO_PALETTE[index % NEO_PALETTE.length]} stroke="none" />
                        ))}
                    </Pie>
                    <Tooltip
                        formatter={(value: number | string | undefined) => `R$ ${Number(value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        contentStyle={{
                            backgroundColor: '#141C24',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: '16px',
                            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            padding: '12px'
                        }}
                        itemStyle={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ color: '#FFFFFF', marginBottom: '4px', fontWeight: 'bold' }}
                    />
                    <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px' }}
                        formatter={(value) => <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] ml-2">{value}</span>}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}
