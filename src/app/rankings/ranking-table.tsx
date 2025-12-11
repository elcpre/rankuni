'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getTopRanked } from '@/actions/schools';
import { Loader2 } from 'lucide-react';

interface RankingEntry {
    id: string;
    name: string;
    location: string;
    rank: number;
    metric: string;
    linked: boolean;
}

interface RankingTableProps {
    initialData: RankingEntry[];
}

export function RankingTable({ initialData }: RankingTableProps) {
    const [items, setItems] = useState<RankingEntry[]>(initialData);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            // Fetch next batch (limit 50)
            const nextItems = await getTopRanked('Global', 50, items.length);

            if (nextItems.length === 0) {
                setHasMore(false);
            } else {
                setItems(prev => [...prev, ...nextItems]);
            }
        } catch (error) {
            console.error("Failed to load more rankings:", error);
        } finally {
            setLoading(false);
        }
    }, [items.length, loading, hasMore]);

    const lastElementRef = useCallback((node: HTMLTableRowElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase text-slate-500 font-semibold sticky top-0 z-10">
                        <tr>
                            <th className="px-6 py-4 w-16">Rank</th>
                            <th className="px-6 py-4">Institution</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4 text-right">View</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {items.map((school, index) => (
                            <tr
                                key={`${school.id}-${index}`}
                                ref={index === items.length - 1 ? lastElementRef : null}
                                className="hover:bg-slate-50 transition-colors group"
                            >
                                <td className="px-6 py-4 font-bold text-slate-700">#{school.rank}</td>
                                <td className="px-6 py-4 font-medium text-slate-900">{school.name}</td>
                                <td className="px-6 py-4 text-slate-500">{school.location}</td>
                                <td className="px-6 py-4 text-right">
                                    {school.linked ? (
                                        <Link href={`/school/${school.id}`} className="inline-flex items-center gap-1 text-indigo-600 font-medium hover:underline opacity-0 group-hover:opacity-100 transition-opacity">
                                            Profile &rarr;
                                        </Link>
                                    ) : (
                                        <span className="text-slate-300 text-sm">No Profile</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Loading Indicator */}
            {loading && (
                <div className="p-4 border-t border-slate-100 flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
            )}

            {/* End of List */}
            {!hasMore && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                    End of list.
                </div>
            )}

            {/* Initial Stats (if needed) */}
            {hasMore && !loading && (
                <div className="p-4 bg-slate-50 border-t border-slate-100 text-center text-sm text-slate-500">
                    Showing {items.length} institutions. Scroll for more.
                </div>
            )}
        </div>
    );
}
