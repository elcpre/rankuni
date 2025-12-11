import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trophy, Award, Briefcase, GraduationCap, Microscope } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RankingData {
    schoolId: string;
    name: string;
    globalRank: number;
    score?: number | null;
    educationRank?: number | null;
    employabilityRank?: number | null;
    facultyRank?: number | null;
    researchRank?: number | null;
}

interface RankingComparisonWidgetProps {
    rankings: RankingData[];
}

export function RankingComparisonWidget({ rankings }: RankingComparisonWidgetProps) {
    if (!rankings || rankings.length === 0) return null;

    // Sorting by global rank helps readability
    const sortedRankings = [...rankings].sort((a, b) => a.globalRank - b.globalRank);

    return (
        <Card className="col-span-1 lg:col-span-2 shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold text-slate-900 dark:text-white">Rankings Comparison</CardTitle>
                        <CardDescription>
                            Global and topic-specific performance indicators
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[300px]">Institution</TableHead>
                                <TableHead className="text-center font-bold text-indigo-600">
                                    <div className="flex flex-col items-center gap-1">
                                        <Trophy className="w-4 h-4" />
                                        <span>Global Rank</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="font-bold">Score</div>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <GraduationCap className="w-4 h-4 text-slate-400" />
                                        <span>Education</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <Briefcase className="w-4 h-4 text-slate-400" />
                                        <span>Employability</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <Award className="w-4 h-4 text-slate-400" />
                                        <span>Faculty</span>
                                    </div>
                                </TableHead>
                                <TableHead className="text-center">
                                    <div className="flex flex-col items-center gap-1">
                                        <Microscope className="w-4 h-4 text-slate-400" />
                                        <span>Research</span>
                                    </div>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedRankings.map((school) => (
                                <TableRow key={school.schoolId}>
                                    <TableCell className="font-semibold text-slate-900 dark:text-slate-100">
                                        {school.name}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                                            #{school.globalRank}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center font-mono text-sm text-slate-600">
                                        {school.score ? school.score.toFixed(1) : '-'}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {school.educationRank ? `#${school.educationRank}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {school.employabilityRank ? `#${school.employabilityRank}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {school.facultyRank ? `#${school.facultyRank}` : '-'}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {school.researchRank ? `#${school.researchRank}` : '-'}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
