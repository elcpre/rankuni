'use client';

import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface EnrollmentHistoryChartProps {
    data: { year: number; value: number }[];
}

export function EnrollmentHistoryChart({ data }: EnrollmentHistoryChartProps) {
    // Sort data by year ascending for the line chart
    const sortedData = [...data].sort((a, b) => a.year - b.year);

    if (sortedData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-slate-400 italic">
                No historical data available.
            </div>
        );
    }

    return (
        <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart
                    data={sortedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickMargin={10}
                    />
                    <YAxis
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        tickFormatter={(value) => value.toLocaleString()}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value: number) => [value.toLocaleString(), 'Students']}
                        labelStyle={{ color: '#64748b', marginBottom: '0.25rem' }}
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="value"
                        name="Student Enrollment"
                        stroke="#4f46e5"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
