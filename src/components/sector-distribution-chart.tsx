
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface SectorStat {
    name: string;
    value: number;
    [key: string]: any;
}

interface SectorDistributionChartProps {
    data: SectorStat[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export function SectorDistributionChart({ data }: SectorDistributionChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="shadow-md h-full">
                <CardHeader>
                    <CardTitle>School Sector Distribution</CardTitle>
                    <CardDescription>Public vs. Private breakdown</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center text-slate-500">
                    No data available via current filters.
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-md h-full">
            <CardHeader>
                <CardTitle>Sector Distribution</CardTitle>
                <CardDescription>Breakdown by institutional control</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                                label={(props: any) => {
                                    const { name, percent } = props;
                                    return `${name || ''} ${((percent || 0) * 100).toFixed(0)}%`;
                                }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => [value, 'Schools']} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
