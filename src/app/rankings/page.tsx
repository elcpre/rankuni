import { Suspense } from 'react';
import { getTopRanked } from '@/actions/schools';
import { ExpandableRankingList } from './expandable-ranking-list';
import { RankingSearch } from './ranking-search';
import { Trophy } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Global University Rankings | RankUni',
    description: 'Explore top universities worldwide ranked by education quality, alumni employment, and research impact.',
};

export default async function RankingsPage() {
    // Parallel Fetching for all cards
    // Fetch initial 10 for everything (preview mode), infinite scroll handles the rest
    const [global, education, employment, research, faculty] = await Promise.all([
        getTopRanked('Global', 10),
        getTopRanked('Education', 10),
        getTopRanked('Employment', 10),
        getTopRanked('Research', 10),
        getTopRanked('Faculty', 10),
    ]);

    return (
        <div className="container mx-auto px-4 py-16 max-w-6xl">
            {/* Header matches styling of Find Page */}
            <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                    <Trophy className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">University Rankings</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Discover the world's top performing institutions based on objective metrics including education quality, alumni success, and research impact.
                </p>
                <p className="text-sm text-slate-500 mt-4">
                    Data provided by <span className="font-semibold">Center for World University Rankings (CWUR)</span>.
                </p>
            </div>

            {/* Quick Search */}
            <RankingSearch />

            {/* Grid Layout: Global First, then Topics */}
            <div className="space-y-12">

                {/* 1. Official World Ranking (Full Width or Large) */}
                <div className="max-w-3xl mx-auto">
                    <ExpandableRankingList
                        title="Official World Ranking 2024"
                        description="The comprehensive global leaderboard based on composite score."
                        iconName="global"
                        initialData={global}
                        listType="Global"
                        showScore={true}
                    />
                </div>

                {/* 2. Topic Rankings (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ExpandableRankingList
                        title="Top for Education"
                        description="Based on alumni academic recognition"
                        iconName="education"
                        initialData={education}
                        listType="Education"
                    />
                    <ExpandableRankingList
                        title="Top for Employment"
                        description="Based on alumni holding CEO positions"
                        iconName="employment"
                        initialData={employment}
                        listType="Employment"
                    />
                    <ExpandableRankingList
                        title="Top for Faculty"
                        description="Based on major academic awards"
                        iconName="faculty"
                        initialData={faculty}
                        listType="Faculty"
                    />
                    <ExpandableRankingList
                        title="Top for Research"
                        description="High-impact research publications"
                        iconName="research"
                        initialData={research}
                        listType="Research"
                    />
                </div>
            </div>
        </div>
    );
}
