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
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(0);
    const BATCH_SIZE = 50;

    // Use initial metrics when collapsed. When expanded, use expandedMetrics if available.
    const displayMetrics = isExpanded && expandedMetrics.length > 0 ? expandedMetrics : initialMetrics;

    // Reset data when context changes
    useEffect(() => {
        // Clear on context change
        setExpandedMetrics([]);
        setPage(0);
        setHasMore(true);
    }, [metricName, JSON.stringify(contextParams)]);

    const loadMoreData = async (currentPage: number) => {
        if (isLoading || !hasMore || !metricName) return;

        setIsLoading(true);
        try {
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
                limit: String(BATCH_SIZE),
                skip: String(currentPage * BATCH_SIZE),
                ...cleanContext
            });

            if (title.toLowerCase().includes('lowest')) {
                params.set('order', 'asc');
            }

            const res = await fetch(`/api/metrics?${params.toString()}`);
            const data = await res.json();

            if (Array.isArray(data)) {
                if (data.length < BATCH_SIZE) {
                    setHasMore(false);
                }

                // Filter out duplicates to prevent key errors
                setExpandedMetrics(prev => {
                    const existingIds = new Set(prev.map(p => p.id));
                    const newItems = data.filter((d: any) => !existingIds.has(d.id));
                    return [...prev, ...newItems];
                });
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error("Failed to fetch extended metrics", e);
            setHasMore(false);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial Fetch on Expand
    useEffect(() => {
        if (isExpanded && expandedMetrics.length === 0 && hasMore && !isLoading) {
            loadMoreData(0);
            setPage(1); // Next page
        }
    }, [isExpanded, metricName]); // Depend only on stable props

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        e.stopPropagation(); // Stop bubble
        if (!isExpanded || isLoading || !hasMore) return;

        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        // Trigger when within 100px of bottom
        if (scrollHeight - scrollTop <= clientHeight + 100) {
            loadMoreData(page);
            setPage(prev => prev + 1);
        }
    };

    // Internal Formatter
    const formatValue = (val: number, currency?: string) => {
        if (formatType === 'percent') return (val * 100).toFixed(1) + '%';
        if (formatType === 'currency') {
            const symbol = currency === 'GBP' ? '£' : currency === 'EUR' ? '€' : '$';
            return symbol + val.toLocaleString();
        }
        return val.toLocaleString();
    };

    // Chart Data Preparation (limit logic?)
    const chartData = (isExpanded ? expandedMetrics.slice(0, 50) : initialMetrics).map((m, i) => ({
        name: m.school.name,
        shortName: m.school.name.length > 20 && !isExpanded ? m.school.name.substring(0, 20) + '...' : m.school.name,
        value: m.value,
        fullData: m
    }));

    const toggleExpand = () => setIsExpanded(!isExpanded);

    // Styles for expanded vs normal state
    const expandStyles = isExpanded ? "fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-hidden flex flex-col" : "";
    const contentHeight = isExpanded ? "h-[60vh]" : "h-[400px]";

    return (
        <Card className={`relative transition-all duration-300 ${expandStyles} ${isExpanded ? 'rounded-none shadow-none' : 'hover:shadow-lg'}`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 shrink-0">
                <div className="space-y-1">
                    <CardTitle className={`text-base font-semibold ${isExpanded ? 'text-2xl' : ''}`}>
                        {title}
                    </CardTitle>
                    {isExpanded && <CardDescription>{description}</CardDescription>}
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
                    </div>

                    {!isExpanded && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400" onClick={toggleExpand}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    )}
                    {isExpanded && (
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggleExpand}>
                            <Minimize2 className="h-5 w-5" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className={`pt-2 ${isExpanded ? 'flex-1 overflow-y-auto min-h-0' : ''}`} onScroll={isExpanded ? handleScroll : undefined}>
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
        </Card >
    );
}
