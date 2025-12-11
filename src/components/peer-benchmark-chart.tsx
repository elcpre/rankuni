'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

interface PeerBenchmarkProps {
    schoolName: string;
    metrics: {
        name: string;
        schoolValue: number;
        nationalAverage: number;
        format: 'currency' | 'percent' | 'number';
        currency?: string;
    }[];
}

export function PeerBenchmarkChart({ schoolName, metrics }: PeerBenchmarkProps) {
    if (!metrics || metrics.length === 0) return null;

    // We only show first 3 metrics max to keep it clean
    const displayMetrics = metrics.slice(0, 3);

    const formatValue = (val: number, fmt: string, curr?: string) => {
        if (fmt === 'percent') return `${(val * 100).toFixed(1)}%`;
        if (fmt === 'currency') return `${curr === 'GBP' ? '£' : curr === 'EUR' ? '€' : '$'}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
        return val.toLocaleString();
    };

    return (
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle>Peer Benchmark</CardTitle>
                <CardDescription>Comparing {schoolName} against National Averages</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {displayMetrics.map((metric, idx) => {
                        const data = [
                            { name: 'This School', value: metric.schoolValue, fill: '#4f46e5' }, // Indigo
                            { name: 'National Avg', value: metric.nationalAverage, fill: '#94a3b8' } // Slate
                        ];

                        // Calculate difference
                        const diff = metric.schoolValue - metric.nationalAverage;
                        const pctDiff = (diff / metric.nationalAverage) * 100;
                        const isHigher = diff > 0;

                        let narrative = "";
                        if (metric.name.includes("Tuition")) {
                            narrative = isHigher ? `${Math.abs(pctDiff).toFixed(0)}% more expensive` : `${Math.abs(pctDiff).toFixed(0)}% cheaper`;
                        } else if (metric.name.includes("Admission")) {
                            narrative = isHigher ? `${Math.abs(pctDiff).toFixed(0)}% higher acceptance` : `${Math.abs(pctDiff).toFixed(0)}% harder to get in`;
                        } else {
                            narrative = isHigher ? `${Math.abs(pctDiff).toFixed(0)}% above average` : `${Math.abs(pctDiff).toFixed(0)}% below average`;
                        }

                        return (
                            <div key={idx} className="flex flex-col h-[200px]">
                                <h3 className="text-sm font-semibold text-slate-700 text-center mb-1">{metric.name}</h3>
                                <div className="text-xs text-center text-indigo-600 font-medium mb-2">{narrative}</div>
                                <div className="flex-1 min-h-0">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={data} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                formatter={(value: number) => [formatValue(value, metric.format, metric.currency), '']}
                                            />
                                            <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
