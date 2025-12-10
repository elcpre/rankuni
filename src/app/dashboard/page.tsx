import React, { Suspense } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Users, GraduationCap, DollarSign, Activity, ThumbsUp, ThumbsDown, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { DashboardFilters } from '@/components/dashboard-filters';
import { SectorDistributionChart } from '@/components/sector-distribution-chart';
import SchoolMapLoader from '@/components/school-map-loader';
import { VisualizationCard } from '@/components/visualization-card';
import { MetricWidget } from '@/components/metric-widget';

// Helper to fetch top metrics directly (Server Component pattern)
async function getTopSchools(metricName: string, limit = 10, state?: string, city?: string, country?: string, compareIds?: string[], order: 'asc' | 'desc' = 'desc') {
    const where: any = { name: metricName };

    // Build School Filter
    const schoolWhere: any = {};

    if (compareIds && compareIds.length > 0) {
        // COMPARE MODE: Override/Ignore location filters
        schoolWhere.id = { in: compareIds };
    } else {
        // BROWSE MODE: Apply location filters
        if (state) schoolWhere.state = state;
        if (city) schoolWhere.city = { contains: city };
        if (country) schoolWhere.country = country;
    }

    if (Object.keys(schoolWhere).length > 0) {
        where.school = schoolWhere;
    }

    const metrics = await prisma.metric.findMany({
        where,
        take: limit,
        distinct: ['schoolId'],
        orderBy: { value: order },
        include: { school: true },
    });
    return metrics;
}

async function getSectorStats(state?: string, city?: string, country?: string, compareIds?: string[]) {
    const where: any = {};
    if (compareIds && compareIds.length > 0) {
        where.id = { in: compareIds };
    } else {
        if (state) where.state = state;
        if (city) where.city = { contains: city };
        if (country) where.country = country;
    }

    const groups = await prisma.school.groupBy({
        by: ['type'],
        where,
        _count: { _all: true }
    });

    return groups.map(g => ({ name: g.type || 'Unknown', value: g._count._all })).filter(x => x.value > 0);
}

async function getSchoolLocations(state?: string, city?: string, country?: string, compareIds?: string[]) {
    // 1. Where clause for the SCHOOL (Location)
    const schoolWhere: any = { latitude: { not: null }, longitude: { not: null } };

    if (compareIds && compareIds.length > 0) {
        schoolWhere.id = { in: compareIds };
    } else {
        if (state) schoolWhere.state = state;
        if (city) schoolWhere.city = { contains: city };
        if (country) schoolWhere.country = country;
    }

    // 2. Fetch via Metric (Student Size) to get the "Largest 1000"
    // We filter metrics where the related school matches the location criteria
    const topmetrics = await prisma.metric.findMany({
        where: {
            name: "Student Size",
            school: schoolWhere
        },
        orderBy: { value: 'desc' },
        distinct: ['schoolId'],
        take: 1000,
        include: {
            school: {
                select: { id: true, name: true, latitude: true, longitude: true, type: true, city: true, state: true, country: true }
            }
        }
    });

    // 3. Extract school objects
    return topmetrics.map(m => m.school);
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ state?: string, city?: string, country?: string, compare?: string }> }) {
    const { state, city, country, compare } = await searchParams;
    const compareIds = compare ? compare.split(',') : undefined;

    // Parallel data fetching
    const [
        topEnrollment,
        topAdmissions,
        highTuition,
        lowTuition,
        sectorStats,
        schoolLocations,
        highestSatisfaction,
        lowestSatisfaction
    ] = await Promise.all([
        getTopSchools('Student Size', 10, state, city, country, compareIds),
        getTopSchools('Admission Rate', 10, state, city, country, compareIds),
        getTopSchools('Tuition (In-State)', 10, state, city, country, compareIds, 'desc'),
        getTopSchools('Tuition (In-State)', 10, state, city, country, compareIds, 'asc'),
        getSectorStats(state, city, country, compareIds),
        getSchoolLocations(state, city, country, compareIds),
        getTopSchools('NSS Satisfaction', 5, state, city, country, compareIds, 'desc'),
        getTopSchools('NSS Satisfaction', 5, state, city, country, compareIds, 'asc')
    ]);

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                    <LayoutDashboard className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    Analytics <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dashboard</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    {compareIds
                        ? `Comparing ${compareIds.length} ${compareIds.length === 1 ? 'school' : 'schools'}`
                        : country
                            ? `Viewing data for ${country === 'US' ? 'United States' : country === 'UK' ? 'United Kingdom' : country === 'FR' ? 'France' : country}${state ? ` - ${state}` : ''}${city ? ` - ${city}` : ''}`
                            : 'Explore global university data and insights across the US, UK, and France.'
                    }
                </p>
            </div>

            {/* Filters */}
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <DashboardFilters />
            </Suspense>

            {/* Visualizations Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 mt-6">
                <div className="lg:col-span-2">
                    <VisualizationCard
                        title="School Locations"
                        description={`Geographic distribution of ${compareIds ? 'selected' : 'matching'} schools`}
                        availableViews={['map']}
                        currentView='map'
                        className="h-full min-h-[400px]"
                    >
                        <SchoolMapLoader schools={schoolLocations} />
                    </VisualizationCard>
                </div>
                <div>
                    <VisualizationCard
                        title="Sector Distribution"
                        description="Breakdown by institutional control"
                        availableViews={['chart']}
                        currentView='chart'
                        className="h-full min-h-[400px]"
                    >
                        <SectorDistributionChart data={sectorStats} />
                    </VisualizationCard>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Top Enrollment Widget */}
                <MetricWidget
                    title="Largest Student Body"
                    description="Schools with the highest enrollment numbers"
                    metrics={topEnrollment}
                    valueLabel="Students"
                    formatType="number"
                    metricName="Student Size"
                    contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                />

                {/* Top Admissions Widget */}
                <MetricWidget
                    title="Highest Admission Rates"
                    description="Schools with the most open admissions"
                    metrics={topAdmissions}
                    valueLabel="Rate"
                    formatType="percent"
                    metricName="Admission Rate"
                    contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Highest Tuition Widget */}
                <MetricWidget
                    title="Highest Tuition"
                    description="Most expensive annual tuition (In-State)"
                    metrics={highTuition}
                    valueLabel="Cost"
                    formatType="currency"
                    metricName="Tuition (In-State)"
                    contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                />

                {/* Lowest Tuition Widget */}
                <MetricWidget
                    title="Lowest Tuition"
                    description="Most affordable annual tuition (In-State)"
                    metrics={lowTuition}
                    valueLabel="Cost"
                    formatType="currency"
                    metricName="Tuition (In-State)"
                    contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                />
            </div>

            {/* Satisfaction Widgets */}
            {(highestSatisfaction.length > 0 || lowestSatisfaction.length > 0) && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                    {highestSatisfaction.length > 0 && (
                        <MetricWidget
                            title="Highest Satisfaction"
                            metricName="NSS Satisfaction" // Used for expansion fetching
                            description="Students most satisfied with course quality"
                            metrics={highestSatisfaction}
                            valueLabel="Satisfaction"
                            formatType="percent"
                            contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                        // Note: color prop is not in interface, assuming standard colors via order or randomness in component? 
                        // Ah, existing MetricWidget didn't have color prop in the interface in my previous read?
                        // Let's check MetricWidget interface. It did NOT have color. It seems color was phantom in my previous plan.
                        />
                    )}
                    {lowestSatisfaction.length > 0 && (
                        <MetricWidget
                            title="Lowest Satisfaction"
                            metricName="NSS Satisfaction" // Used for expansion fetching
                            description="Areas for potential improvement"
                            metrics={lowestSatisfaction}
                            valueLabel="Satisfaction"
                            formatType="percent"
                            contextParams={{ country, state, city, compareIds: Array.isArray(compareIds) ? compareIds.join(',') : compareIds }}
                        />
                    )}
                </div>
            )}
        </div>
    );
}
