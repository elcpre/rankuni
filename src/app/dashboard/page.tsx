import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { Users, GraduationCap, DollarSign, Activity, ThumbsUp, ThumbsDown, ArrowLeft } from 'lucide-react';
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
    const where: any = { latitude: { not: null }, longitude: { not: null } };
    if (compareIds && compareIds.length > 0) {
        where.id = { in: compareIds };
    } else {
        if (state) where.state = state;
        if (city) where.city = { contains: city };
        if (country) where.country = country;
    }

    // Limit map pins for performance
    return await prisma.school.findMany({
        where,
        select: { id: true, name: true, latitude: true, longitude: true, type: true, city: true, state: true, country: true },
        take: 1000
    });
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
            {/* Header / Nav */}
            <div className="flex items-center justify-between mb-8">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                </Link>
                <div className="text-right">
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        Analytics Dashboard
                    </h1>
                    <p className="text-xs text-slate-500">
                        {compareIds ? `Comparing ${compareIds.length} Schools` : (country || 'Global Data')}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <DashboardFilters />

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
