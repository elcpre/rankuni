

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, ArrowRight, Medal } from 'lucide-react';

interface RankingItem {
    id: string;
    name: string;
    location: string;
    rank: number;
    linked?: boolean; // New prop
}

interface RankingCardProps {
    title: string;
    description: string;
    icon?: any;
    schools: RankingItem[];
}

export function RankingCard({ title, description, icon: Icon, schools }: RankingCardProps) {
    return (
        <Card className="h-full border-slate-200">
            <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                    <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
                </div>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4 p-0">
                <div className="divide-y divide-slate-100">
                    {schools.map((school, idx) => (
                        <div key={school.id} className="flex items-center p-4 hover:bg-slate-50 transition-colors">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 
                                ${idx === 0 ? 'bg-yellow-100 text-yellow-700' :
                                    idx === 1 ? 'bg-slate-200 text-slate-700' :
                                        idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'}`}>
                                {school.rank}
                            </div>
                            <div className="flex-1 min-w-0 mr-4">
                                {school.linked ? (
                                    <Link href={`/school/${school.id}`} className="font-semibold text-slate-900 hover:text-indigo-600 hover:underline truncate block">
                                        {school.name}
                                    </Link>
                                ) : (
                                    <span className="font-semibold text-slate-900 truncate block">
                                        {school.name}
                                    </span>
                                )}
                                <div className="text-xs text-slate-500 truncate">{school.location}</div>
                            </div>
                        </div>
                    ))}
                    {schools.length === 0 && (
                        <div className="p-4 text-center text-slate-400 italic">No data available</div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
