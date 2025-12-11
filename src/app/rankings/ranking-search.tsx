'use client';

import { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { searchRankingByName } from '@/actions/schools';

interface SearchResult {
    id: string;
    name: string;
    location: string;
    globalRank: number;
    score?: number;
    educationRank?: number;
    employabilityRank?: number;
    facultyRank?: number;
    researchRank?: number;
    linked: boolean;
}

export function RankingSearch() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SearchResult | null>(null);
    const [touched, setTouched] = useState(false);

    const handleSearch = async () => {
        if (!query.trim() || query.length < 3) return;

        setLoading(true);
        setTouched(true);
        setResult(null);

        try {
            const data = await searchRankingByName(query);
            if (data) {
                setResult(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto mb-12">
            <div className="relative flex items-center gap-2 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search for a university..."
                        className="pl-10 h-12 text-lg bg-white shadow-sm border-slate-200 focus:border-indigo-500"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                </div>
                <Button
                    size="lg"
                    className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700"
                    onClick={handleSearch}
                    disabled={loading || query.length < 3}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Search'}
                </Button>
            </div>

            {/* Result Card */}
            {result && (
                <Card className="border-indigo-100 shadow-md bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                    <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">{result.name}</h3>
                                <p className="text-slate-500">{result.location}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-semibold text-slate-400 uppercase tracking-wider">World Rank</div>
                                <div className="text-3xl font-extrabold text-indigo-600">#{result.globalRank}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
                            {result.score && (
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Score</div>
                                    <div className="text-lg font-bold text-slate-800">{result.score.toFixed(1)}</div>
                                </div>
                            )}
                            {result.educationRank && (
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Education</div>
                                    <div className="text-lg font-bold text-slate-800">#{result.educationRank}</div>
                                </div>
                            )}
                            {result.employabilityRank && (
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Employability</div>
                                    <div className="text-lg font-bold text-slate-800">#{result.employabilityRank}</div>
                                </div>
                            )}
                            {result.researchRank && (
                                <div className="p-3 bg-slate-50 rounded-lg text-center">
                                    <div className="text-xs text-slate-500 uppercase font-semibold mb-1">Research</div>
                                    <div className="text-lg font-bold text-slate-800">#{result.researchRank}</div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {touched && !loading && !result && (
                <div className="text-center text-slate-500 p-4 bg-slate-50 rounded-lg border border-slate-100">
                    No rankings found for "{query}". Try searching for major universities like "Harvard" or "Cambridge".
                </div>
            )}
        </div>
    );
}
