
import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/db';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, MapPin, School as SchoolIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { redirect } from 'next/navigation';

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q: string }> }) {
    const { q } = await searchParams;
    const query = q || '';

    async function searchAction(formData: FormData) {
        'use server';
        const newQuery = formData.get('query')?.toString();
        if (newQuery) {
            redirect(`/search?q=${encodeURIComponent(newQuery)}`);
        }
    }

    const schools = query.length >= 2
        ? await prisma.school.findMany({
            where: {
                OR: [
                    { name: { contains: query } },
                    { city: { contains: query } },
                    { state: { contains: query } },
                ]
            },
            take: 50,
            include: {
                metrics: {
                    where: { name: 'Student Size' },
                    take: 1
                }
            }
        })
        : [];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
            <div className="container mx-auto px-4 py-8">

                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Search Results</h1>
                    </div>

                    {/* Search Bar Refinement */}
                    <form action={searchAction} className="relative flex items-center max-w-xl mx-auto mb-10">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 h-5 w-5" />
                        <Input
                            name="query"
                            type="text"
                            defaultValue={query}
                            placeholder="Search for a school, city, or state..."
                            className="pl-12 pr-4 py-6 text-lg w-full rounded-lg border-2 border-transparent focus:border-indigo-500 shadow-xl bg-white dark:bg-slate-900"
                        />
                        <Button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white px-6">
                            Search
                        </Button>
                    </form>

                    <div className="space-y-4">
                        {query.length < 2 && (
                            <p className="text-center text-slate-500">Please enter at least 2 characters to search.</p>
                        )}

                        {query.length >= 2 && schools.length === 0 && (
                            <p className="text-center text-slate-500">No schools found for "{query}".</p>
                        )}

                        {schools.map(school => (
                            <Link href={`/school/${school.id}`} key={school.id} className="block group">
                                <Card className="hover:shadow-md transition-shadow duration-200 border-l-4 border-l-transparent hover:border-l-indigo-500">
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                                                    {school.name}
                                                </h3>
                                                <div className="flex items-center text-slate-500 text-sm mt-1">
                                                    <MapPin className="w-4 h-4 mr-1" />
                                                    {school.city}, {school.state} {school.zip}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="inline-block bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full font-medium">
                                                    {school.type || 'College'}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex items-center space-x-6 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-slate-400 text-xs uppercase tracking-wider">Level</span>
                                                <span className="font-medium">{school.level || '-'}</span>
                                            </div>
                                            {school.metrics[0] && (
                                                <div className="flex flex-col">
                                                    <span className="text-slate-400 text-xs uppercase tracking-wider">Students</span>
                                                    <span className="font-medium text-slate-900">{school.metrics[0].value.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
