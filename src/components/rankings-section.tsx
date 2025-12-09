
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BookOpen, GraduationCap, ArrowRight, Filter } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';


interface MetricResult {
    id: string;
    value: number;
    school: {
        id: string;
        name: string;
        city: string | null;
        state: string | null;
    };
}

export function RankingsSection() {
    const [countryFilter, setCountryFilter] = useState('US');
    const [stateFilter, setStateFilter] = useState('');
    const [cityFilter, setCityFilter] = useState('');

    const [topEnrollment, setTopEnrollment] = useState<MetricResult[]>([]);
    const [topAdmissions, setTopAdmissions] = useState<MetricResult[]>([]);
    const [highTuition, setHighTuition] = useState<MetricResult[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        const params = new URLSearchParams();
        if (countryFilter) params.append('country', countryFilter);
        if (stateFilter) params.append('state', stateFilter);
        if (cityFilter) params.append('city', cityFilter);

        try {
            // Fetch 3 datasets in parallel
            const [enrollmentRes, admissionsRes, tuitionRes] = await Promise.all([
                fetch(`/api/schools/top?metric=${encodeURIComponent('Student Size')}&limit=3&${params.toString()}`),
                fetch(`/api/schools/top?metric=${encodeURIComponent('Admission Rate')}&limit=3&${params.toString()}`),
                fetch(`/api/schools/top?metric=${encodeURIComponent('Tuition (In-State)')}&limit=3&${params.toString()}`)
            ]);

            const enrollmentData = await enrollmentRes.json();
            const admissionsData = await admissionsRes.json();
            const tuitionData = await tuitionRes.json();

            setTopEnrollment(Array.isArray(enrollmentData) ? enrollmentData : []);
            setTopAdmissions(Array.isArray(admissionsData) ? admissionsData : []);
            setHighTuition(Array.isArray(tuitionData) ? tuitionData : []);
        } catch (error) {
            console.error("Failed to fetch rankings", error);
        } finally {
            setLoading(false);
        }
    };

    // Debounce or just fetch on effect? 
    // For inputs, debounce is better. For Select, immediate.
    // Let's us a simple "Apply" button or just effect with small debounce/manual trigger?
    // User asked for "build a filter... and then the list loads". 
    // Let's do auto-fetch on effect for simplicity but maybe debounce filter changes if we had text input.
    // Since State is text input (or select? we don't have a list of states easily available on client yet).
    // Let's use simple text inputs for now as placeholders, or Select if we can hardcode states.
    // Hardcoding 50 states is verbose but better UX. Let's use text for simplicity/flexibility initially as requested "filter by state and (optional) city".

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 500); // 500ms debounce
        return () => clearTimeout(timer);
    }, [countryFilter, stateFilter, cityFilter]);

    const getDashboardLink = () => {
        const params = new URLSearchParams();
        if (countryFilter) params.append('country', countryFilter);
        if (stateFilter) params.append('state', stateFilter);
        if (cityFilter) params.append('city', cityFilter);
        return `/dashboard?${params.toString()}`;
    };

    return (
        <section className="py-20 bg-white dark:bg-slate-900">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-10">
                    <h2 className="text-3xl font-bold text-center md:text-left mb-6 md:mb-0">Explore National Rankings</h2>

                    {/* Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <div className="bg-slate-100 p-1 rounded-lg flex">
                            <button
                                onClick={() => setCountryFilter('US')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${countryFilter === 'US' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                US Schools
                            </button>
                            <button
                                onClick={() => setCountryFilter('UK')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${countryFilter === 'UK' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                UK Universities
                            </button>
                            <button
                                onClick={() => setCountryFilter('FR')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${countryFilter === 'FR' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                French Universities
                            </button>
                        </div>

                        <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                        <div className="flex flex-col sm:flex-row gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100 shadow-sm w-full md:w-auto">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-slate-400" />
                                <span className="text-sm font-medium text-slate-600">Filter:</span>
                            </div>
                            <Input
                                placeholder="State (e.g. NV)"
                                className="bg-white w-full sm:w-32"
                                value={stateFilter}
                                onChange={(e) => setStateFilter(e.target.value)}
                            />
                            <Input
                                placeholder="City"
                                className="bg-white w-full sm:w-40"
                                value={cityFilter}
                                onChange={(e) => setCityFilter(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1: Enrollment */}
                    <RankingCard
                        title="Top Enrollment"
                        description="Schools with highest student body counts"
                        icon={<TrendingUp className="h-8 w-8 text-indigo-500 mb-2" />}
                        borderColor="border-t-indigo-500"
                        data={topEnrollment}
                        loading={loading}
                        formatValue={(val: number) => val.toLocaleString()}
                        link={getDashboardLink()}
                        linkText="View Full List"
                        linkColor="text-indigo-600"
                    />

                    {/* Card 2: Highest Graduation (Note: We mapped to Admission Rate in API call for demo as we didn't ingest graduation rates yet, but let's label it correctly if we change API or keep it as 'Admission Rate'?) 
                        Wait, earlier mock showed 'Highest Graduation'. My API call above requested 'Admission Rate'. 
                        Let's change title to 'Selective Admissions' or 'Highest Admission Rate'? 
                        Actually, 'Highest Admission Rate' implies 'easiest to get in'.
                        Let's stick to valid data. We have 'Admission Rate'.
                        Let's label it 'Highest Acceptance' for now.
                    */}
                    <RankingCard
                        title="Highest Acceptance"
                        description="Schools with most open admissions"
                        icon={<GraduationCap className="h-8 w-8 text-purple-500 mb-2" />}
                        borderColor="border-t-purple-500"
                        data={topAdmissions}
                        loading={loading}
                        formatValue={(val: number) => `${(val * 100).toFixed(1)}%`}
                        link={getDashboardLink()}
                        linkText="View Full List"
                        linkColor="text-purple-600"
                    />

                    {/* Card 3: Tuition */}
                    <RankingCard
                        title="Highest Tuition"
                        description="Most expensive in-state tuition"
                        icon={<BookOpen className="h-8 w-8 text-pink-500 mb-2" />}
                        borderColor="border-t-pink-500"
                        data={highTuition}
                        loading={loading}
                        formatValue={(val: number) => {
                            if (countryFilter === 'US') return `$${val.toLocaleString()}`;
                            if (countryFilter === 'UK') return `£${val.toLocaleString()}`;
                            if (countryFilter === 'FR') return `€${val.toLocaleString()}`;
                            return `${val.toLocaleString()}`;
                        }}
                        link={getDashboardLink()}
                        linkText="View Full List"
                        linkColor="text-pink-600"
                    />
                </div>
            </div>
        </section>
    );
}

function RankingCard({ title, description, icon, borderColor, data, loading, formatValue, link, linkText, linkColor }: any) {
    return (
        <Card className={`hover:shadow-lg transition-shadow duration-300 border-t-4 ${borderColor}`}>
            <CardHeader>
                {icon}
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                    </div>
                ) : (
                    <>
                        <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400 mb-4 h-[120px] overflow-hidden">
                            {data.length === 0 ? (
                                <li className="text-slate-400 italic">No data found for filter.</li>
                            ) : (
                                data.map((item: any) => (
                                    <li key={item.id} className="flex justify-between items-center group cursor-default">
                                        <span className="truncate pr-2 group-hover:text-slate-900 transition-colors" title={item.school.name}>{item.school.name}</span>
                                        <span className="font-semibold text-slate-900 shrink-0">{formatValue(item.value)}</span>
                                    </li>
                                ))
                            )}
                        </ul>
                        <Link href={link} className={`${linkColor} font-medium inline-flex items-center hover:underline`}>
                            {linkText} <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
