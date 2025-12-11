'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Users, MapPin, ArrowRight } from 'lucide-react';

interface SimilarSchool {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    country: string;
    studentSize: number;
}

interface SimilarSchoolsGridProps {
    schools: SimilarSchool[];
}

export function SimilarSchoolsGrid({ schools }: SimilarSchoolsGridProps) {
    if (!schools || schools.length === 0) return null;

    return (
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                Similar Institutions
                <span className="ml-3 text-sm font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-md">Based on size & type</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {schools.map(school => (
                    <Link key={school.id} href={`/school/${school.id}`} className="group">
                        <Card className="h-full hover:shadow-md transition-all duration-200 border-slate-200 group-hover:border-indigo-300">
                            <CardContent className="p-5 flex flex-col h-full">
                                <h3 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
                                    {school.name}
                                </h3>
                                <div className="flex items-center text-sm text-slate-500 mb-2">
                                    <MapPin className="w-4 h-4 mr-1.5 shrink-0" />
                                    <span className="truncate">{school.city}{school.state ? `, ${school.state}` : ''}, {school.country}</span>
                                </div>
                                <div className="flex items-center text-sm text-slate-500 mt-auto pt-4 border-t border-slate-100">
                                    <Users className="w-4 h-4 mr-1.5 shrink-0" />
                                    <span>{school.studentSize.toLocaleString()} Students</span>
                                    <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
