
'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';

interface DataPoint {
    name: string;
    value: number;
    fill?: string;
}

export function SchoolMetricsChart({ data }: { data: DataPoint[] }) {
    if (!data || data.length === 0) return <div>No data to display</div>;

    // Filter out zero values if needed, or keep to show 0
    const validData = data.filter(d => d.value > 0);

    if (validData.length === 0) return <div className="flex items-center justify-center h-full text-slate-400">No tuition data available</div>;

    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={validData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 12 }} />
                <Tooltip
                    cursor={{ fill: 'transparent' }}
                    formatter={(value: number) => [`$${value.toLocaleString()}`, 'Cost']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={40}>
                    {validData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || '#6366f1'} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
}
