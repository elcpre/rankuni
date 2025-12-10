
import React, { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import Link from 'next/link';
import { ArrowLeft, MapPin, Globe, GraduationCap, Users, Euro, Wallet } from 'lucide-react';

import { DashboardFilters } from '@/components/dashboard-filters';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolMetricsChart } from '@/components/school-metrics-chart';
import { EnrollmentHistoryChart } from '@/components/enrollment-history-chart';
import SchoolMapLoader from '@/components/school-map-loader';
import { VisualizationCard } from '@/components/visualization-card';

import { getSchool } from '@/actions/schools';
import { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: Promise<{ id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { id } = await params;
    const school = await getSchool(id);

    if (!school) {
        return {
            title: 'School Not Found',
        };
    }

    const currencySymbol = school.currency === 'GBP' ? '£' : school.currency === 'EUR' ? '€' : '$';

    // Find key metrics for description
    const tuition = school.metrics.find(m => m.name.includes('Tuition (In-State)'))?.value;
    const students = school.metrics.find(m => m.name === 'Student Size')?.value;
    const satisfaction = school.metrics.find(m => m.name === 'NSS Satisfaction')?.value;

    let desc = `Detailed analytics for ${school.name} in ${school.city}, ${school.country}.`;
    if (tuition) desc += ` Tuition: ${currencySymbol}${tuition.toLocaleString()}.`;
    if (students) desc += ` Students: ${students.toLocaleString()}.`;
    if (satisfaction) desc += ` Satisfaction: ${(satisfaction * 100).toFixed(0)}%.`;

    return {
        title: `${school.name} Stats, Tuition & Rankings`,
        description: desc,
        openGraph: {
            images: ['/school-placeholder.png'], // Ideally dynamic or school logo
        },
    };
}

export default async function SchoolDetailsPage({ params }: Props) {
    const { id } = await params;

    // The component already fetches it using getSchool(id).
    const school = await getSchool(id);

    if (!school) {
        notFound();
    }

    // --- Data Processing: Deduplicate Metrics ---
    // Group by name and sourceYear to find duplicates, keep the one with the highest precision or just first found (latest due to sort).
    // Actually, user says "duplicate values". It might be multiple entries for same year/name.
    // We will deduplicate by (name, year).
    const uniqueMetricsMap = new Map();
    school.metrics.forEach(m => {
        const key = `${m.name}-${m.year}`;
        if (!uniqueMetricsMap.has(key)) {
            uniqueMetricsMap.set(key, m);
        }
    });
    const metrics = Array.from(uniqueMetricsMap.values());

    // Latest distinct metrics for "At a Glance"
    const latestMetricsMap = new Map();
    metrics.forEach(m => {
        if (!latestMetricsMap.has(m.name) || m.year > latestMetricsMap.get(m.name).year) {
            latestMetricsMap.set(m.name, m);
        }
    });

    const admissionMetric = latestMetricsMap.get('Admission Rate');
    const enrollmentMetric = latestMetricsMap.get('Student Size');
    const tuitionInState = latestMetricsMap.get('Tuition (In-State)');
    const tuitionOutState = latestMetricsMap.get('Tuition (Out-of-State)');
    const satisfactionMetric = latestMetricsMap.get('NSS Satisfaction'); // UK
    const earningsMetric = latestMetricsMap.get('Median Earnings'); // US

    // Historical Enrollment Data (for France or anyone with history)
    const enrollmentHistory = metrics
        .filter(m => m.name === 'Student Size')
        .map(m => ({ year: m.year, value: m.value }));

    const isFrance = school.country === 'FR';

    // Prepare JSON-LD data for structured data
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "EducationalOrganization",
        "name": school.name,
        "url": school.url || `https://example.com/schools/${school.id}`, // Replace with your actual domain
        "address": {
            "@type": "PostalAddress",
            "addressLocality": school.city,
            "addressRegion": school.state,
            "addressCountry": school.country,
            "postalCode": school.zip,
        },
        "description": `Detailed analytics for ${school.name}, including tuition, enrollment, and student satisfaction.`,
        "image": "/school-placeholder.png", // Replace with actual school logo if available
        "numberOfStudents": enrollmentMetric ? enrollmentMetric.value : undefined,
        "aggregateRating": satisfactionMetric ? {
            "@type": "AggregateRating",
            "ratingValue": (satisfactionMetric.value * 5).toFixed(1), // Convert 0-1 to 0-5 scale
            "bestRating": "5",
            "ratingCount": 1, // Placeholder, ideally from actual reviews
        } : undefined,
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    School Details
                </h1>
            </div>

            {/* Filters (Search Bar) */}
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
                <DashboardFilters />
            </Suspense>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">

                {/* School Profile Sidebar (Left) */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="border-t-4 border-indigo-600 shadow-md">
                        <CardHeader>
                            <CardTitle className="text-2xl font-bold text-slate-900 leading-tight">
                                {school.name}
                            </CardTitle>
                            <div className="flex flex-wrap gap-2 mt-3">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${school.type?.includes('Public') ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'}`}>
                                    {school.type || 'Institution'}
                                </span>
                                {school.level && <span className="bg-slate-100 text-slate-800 text-xs px-2 py-1 rounded-full">{school.level}</span>}
                                <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full flex items-center">
                                    {school.country === 'US' ? '🇺🇸' : school.country === 'UK' ? '🇬🇧' : school.country === 'FR' ? '🇫🇷' : ''} {school.country}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start text-slate-600">
                                <MapPin className="w-5 h-5 mr-3 mt-0.5 text-slate-400 shrink-0" />
                                <div>
                                    <p className="font-medium text-slate-800">{school.city}, {school.state}</p>
                                    <p className="text-sm text-slate-400">{school.zip}</p>
                                </div>
                            </div>
                            {school.url && (
                                <div className="flex items-center text-slate-600">
                                    <Globe className="w-5 h-5 mr-3 text-slate-400 shrink-0" />
                                    <a href={school.url.startsWith('http') ? school.url : `https://${school.url}`} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline truncate max-w-[200px]">
                                        Visit Website
                                    </a>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* School Location Map */}
                    {school.latitude && school.longitude && (
                        <div className="rounded-xl overflow-hidden shadow-md border border-slate-200 h-[300px]">
                            <SchoolMapLoader schools={[school]} />
                        </div>
                    )}
                </div>

                {/* Main Content (Right) */}
                <div className="lg:col-span-8 space-y-8">

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <Users className="w-6 h-6 text-indigo-500 mb-2" />
                                <div className="text-xs text-slate-500 uppercase font-semibold">Enrollment</div>
                                <div className="text-xl font-bold text-slate-900 mt-1">
                                    {enrollmentMetric ? enrollmentMetric.value.toLocaleString() : 'N/A'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <GraduationCap className="w-6 h-6 text-pink-500 mb-2" />
                                <div className="text-xs text-slate-500 uppercase font-semibold">Admission</div>
                                <div className="text-xl font-bold text-slate-900 mt-1">
                                    {admissionMetric ? `${(admissionMetric.value * 100).toFixed(1)}%` : 'N/A'}
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                            <CardContent className="p-4 flex flex-col items-center text-center">
                                <Euro className="w-6 h-6 text-emerald-500 mb-2" />
                                <div className="text-xs text-slate-500 uppercase font-semibold">Tuition (In)</div>
                                <div className="text-xl font-bold text-slate-900 mt-1">
                                    {tuitionInState ? `${school.currency === 'GBP' ? '£' : school.currency === 'EUR' ? '€' : '$'}${tuitionInState.value.toLocaleString()} / year` : 'N/A'}
                                </div>
                            </CardContent>
                        </Card>
                        {satisfactionMetric && (
                            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <Wallet className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Student Satisf.</div>
                                    <div className="text-xl font-bold text-slate-900 mt-1">
                                        {(satisfactionMetric.value * 100).toFixed(0)}%
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                        {earningsMetric && (
                            <Card className="bg-slate-50 dark:bg-slate-900 border-slate-200">
                                <CardContent className="p-4 flex flex-col items-center text-center">
                                    <Wallet className="w-6 h-6 text-amber-500 mb-2" />
                                    <div className="text-xs text-slate-500 uppercase font-semibold">Median Earnings</div>
                                    <div className="text-xl font-bold text-slate-900 mt-1">
                                        ${earningsMetric.value.toLocaleString()}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Visualization: Enrollment History (France) or Tuition (General) */}
                    {isFrance && enrollmentHistory.length > 0 ? (
                        <VisualizationCard
                            title="Historical Enrollment Growth"
                            description="Evolution of student body size over time"
                            className="bg-white"
                        >
                            <EnrollmentHistoryChart data={enrollmentHistory} />
                        </VisualizationCard>
                    ) : (
                        (tuitionInState || tuitionOutState) && school.country === 'US' && (
                            <VisualizationCard
                                title="Tuition Costs"
                                description="Comparison of In-State vs Out-of-State tuition"
                                className="bg-white"
                            >
                                <div className="h-[300px] w-full mt-4">
                                    <SchoolMetricsChart
                                        data={[
                                            { name: 'In-State', value: tuitionInState?.value || 0, fill: '#6366f1' },
                                            { name: 'Out-of-State', value: tuitionOutState?.value || 0, fill: '#a855f7' }
                                        ].filter(d => d.value > 0)}
                                    />
                                </div>
                            </VisualizationCard>
                        )
                    )}

                    {/* Detailed Metrics Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b">
                                        <tr>
                                            <th className="px-4 py-3 font-semibold">Metric</th>
                                            <th className="px-4 py-3 font-semibold">Category</th>
                                            <th className="px-4 py-3 font-semibold text-right">Value</th>
                                            <th className="px-4 py-3 font-semibold text-right">Year</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {metrics.sort((a, b) => b.year - a.year).map((m) => (
                                            <tr key={m.id} className="hover:bg-slate-50">
                                                <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                                                <td className="px-4 py-3 text-slate-500">{m.category}</td>
                                                <td className="px-4 py-3 text-right text-slate-900 font-mono">
                                                    {m.name.includes('Rate') || m.name.includes('Satisfaction') ? `${(m.value * 100).toFixed(1)}%` :
                                                        m.name.includes('Tuition') || m.name.includes('Earnings') ? `${school.currency === 'GBP' ? '£' : school.currency === 'EUR' ? '€' : '$'}${m.value.toLocaleString()}${m.name.includes('Tuition') ? ' / year' : ''}` :
                                                            m.value.toLocaleString()}
                                                </td>
                                                <td className="px-4 py-3 text-right text-slate-400">{m.year}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
}
