'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Table as TableIcon, BarChart as ChartIcon, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricWidgetProps {
    title: string;
    description: string;
    metrics: any[]; // Typed loosely for now
    valueLabel: string;
    formatType?: 'number' | 'percent' | 'currency'; // Replaced function with serializable type
    metricName?: string;
    contextParams?: any;
}

export function MetricWidget({ title, description, metrics: initialMetrics, valueLabel, formatType = 'number', metricName, contextParams = {} }: MetricWidgetProps) {
    const [view, setView] = useState<'table' | 'chart'>('table');
    const [isExpanded, setIsExpanded] = useState(false);

    // Data State
    const [expandedMetrics, setExpandedMetrics] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // Use initial metrics when collapsed. When expanded, use expandedMetrics if available, or stay empty while loading.
    const displayMetrics = isExpanded ? expandedMetrics : initialMetrics;

    // Reset data when context changes
    useEffect(() => {
        setExpandedMetrics([]);
    }, [metricName, JSON.stringify(contextParams)]);

    // Fetch data when expanded and empty (and not already loading)
    useEffect(() => {
        if (isExpanded && expandedMetrics.length === 0 && metricName && !isLoading) {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    // Filter out undefined/null/empty strings
                    const cleanContext: Record<string, string> = {};
                    if (contextParams) {
                        Object.entries(contextParams).forEach(([key, value]) => {
                            if (value !== undefined && value !== null && value !== '' && value !== 'undefined') {
                                cleanContext[key] = String(value);
                            }
                        });
                    }

                    const params = new URLSearchParams({
                        metric: metricName,
                        limit: '500', // Load up to 500 for "All" view
                        ...cleanContext
                    });
                    // Maintain sort order logic from parent if needed? 
                    // Usually parent passes pre-sorted top 10. API defaults to desc.
                    // Exception: "Lowest Tuition" needs order=asc.
                    if (title.toLowerCase().includes('lowest')) {
                        params.set('order', 'asc');
                    }

                    const res = await fetch(`/api/metrics?${params.toString()}`);
                    const data = await res.json();
                    if (Array.isArray(data)) {
                        setExpandedMetrics(data);
                    }
                } catch (e) {
                    console.error("Failed to fetch extended metrics", e);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [isExpanded, metricName, JSON.stringify(contextParams), expandedMetrics.length]);

    // Internal Formatter
    const formatValue = (val: number, currency?: string) => {
        if (formatType === 'percent') return (val * 100).toFixed(1) + '%';
        if (formatType === 'currency') {
            const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
            return symbol + val.toLocaleString();
        }
        return val.toLocaleString();
    };

    // Chart Data Preparation
    const chartData = displayMetrics.map((m, i) => ({
        name: m.school.name,
        shortName: m.school.name.length > 20 && !isExpanded ? m.school.name.substring(0, 20) + '...' : m.school.name, // Show full name if expanded
        value: m.value,
        fullData: m
    }));

    const toggleExpand = () => setIsExpanded(!isExpanded);

    // Styles for expanded vs normal state
    const containerClasses = isExpanded
        ? "fixed inset-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md p-8 overflow-auto flex flex-col transition-all duration-300"
        : "shadow-md border-0 bg-white/50 backdrop-blur-sm h-full flex flex-col transition-all duration-300";

    const contentHeight = isExpanded ? "h-[80vh]" : "h-[400px]";

    return (
        <Card className={containerClasses}>
            <CardHeader className="flex flex-row items-start justify-between pb-2 shrink-0">
                <div>
                    <CardTitle className={isExpanded ? "text-2xl font-bold text-slate-800" : "text-lg font-bold text-slate-800"}>
                        {title}
                        {isLoading && isExpanded && <span className="ml-3 text-sm font-normal text-indigo-500 animate-pulse">Loading all entries...</span>}
                    </CardTitle>
                    <CardDescription className={isExpanded ? "text-base mt-2" : ""}>{description}</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 space-x-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 ${view === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setView('table')}
                        >
                            <TableIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 ${view === 'chart' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            onClick={() => setView('chart')}
                        >
                            <ChartIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-slate-400 hover:text-indigo-600 border-l border-slate-200 ml-1 pl-1"
                            onClick={toggleExpand}
                        >
                            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-grow">
                {view === 'table' ? (
                    <div className={isExpanded ? "mt-4" : ""}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">Rank</TableHead>
                                    <TableHead>School</TableHead>
                                    <TableHead className="text-right">{valueLabel}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayMetrics.map((m, i) => (
                                    <TableRow key={m.id}>
                                        <TableCell className="font-medium text-slate-500">{i + 1}</TableCell>
                                        <TableCell>
                                            <Link href={`/school/${m.schoolId}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors block">
                                                {m.school.name}
                                            </Link>
                                            <div className="text-xs text-slate-400">{m.school.city}, {m.school.state}, {m.school.country}</div>
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-slate-600">
                                            {formatValue(m.value, m.school.currency)}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {isLoading && isExpanded && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8">
                                            <div className="flex justify-center items-center space-x-2 text-indigo-500">
                                                <span className="animate-spin">⟳</span>
                                                <span>Loading data...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!isLoading && displayMetrics.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-slate-400 italic">No data available.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                ) : (
                    <div className={`${contentHeight} w-full mt-4 transition-all duration-300`}>
                        {displayMetrics.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        type="category"
                                        dataKey={isExpanded ? "name" : "shortName"}
                                        width={isExpanded ? 300 : 150}
                                        tick={{ fontSize: 11, fill: '#64748b' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const d = payload[0].payload;
                                                return (
                                                    <div className="bg-white dark:bg-slate-900 border border-slate-200 p-3 rounded-lg shadow-xl text-xs z-50">
                                                        <div className="font-bold mb-1">{d.fullData.school.name}</div>
                                                        <div className="text-slate-500 mb-2">{d.fullData.school.city}, {d.fullData.school.country}</div>
                                                        <div className="font-mono text-indigo-600 font-bold text-sm">
                                                            {formatValue(d.value, d.fullData.school.currency)}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? '#4f46e5' : '#94a3b8'} /> // Top 3 highlighted
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-400 italic">
                                {isLoading ? "Loading..." : "No chart data available."}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
