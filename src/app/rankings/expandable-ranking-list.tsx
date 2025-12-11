
'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { getTopRanked } from '@/actions/schools';
import { Loader2, Maximize2, Minimize2, Globe, BookOpen, Briefcase, Microscope, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

interface RankingEntry {
    id: string;
    name: string;
    location: string;
    rank: number;
    metric: string;
    linked: boolean;
    score?: number;
}

const ICON_MAP = {
    global: Globe,
    education: BookOpen,
    employment: Briefcase,
    research: Microscope,
    faculty: Award
} as const;

type IconName = keyof typeof ICON_MAP;

interface ExpandableRankingListProps {
    title: string;
    description: string;
    iconName?: IconName;
    initialData: RankingEntry[];
    listType: 'Global' | 'Education' | 'Employment' | 'Research' | 'Faculty';
    showScore?: boolean;
}

export function ExpandableRankingList({ title, description, iconName, initialData, listType, showScore }: ExpandableRankingListProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [items, setItems] = useState<RankingEntry[]>(initialData);

    // Get the icon component
    const Icon = iconName ? ICON_MAP[iconName] : null;

    // We maintain two separate lists: one for preview (always initialData.slice(0,10)) and one for expanded (grows).
    // Actually, we can just use one 'items' state. When expanded, we fetch more. When closed, we just show top 10.
    // BUT efficient way: Only fetch more when expanded.

    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const fetchedOffset = useRef(initialData.length);

    // Reset state when opening/closing? No, keep loaded data.

    const loadMore = useCallback(async () => {
        if (loading || !hasMore) return;
        setLoading(true);

        try {
            // Fetch next batch (limit 20 for infinite scroll)
            // We use separate offset tracking because initialData might vary
            const currentCount = items.length;
            const nextItems = await getTopRanked(listType, 20, currentCount);

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
    }, [items.length, loading, hasMore, listType]);

    const lastElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && isExpanded) {
                loadMore();
            }
        });

        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore, isExpanded]);


    // Render Helper for a Row
    const RankingRow = ({ school, isLast }: { school: RankingEntry, isLast?: boolean }) => (
        <div
            ref={isLast ? lastElementRef : null}
            className="flex items-center p-4 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-0"
        >
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm mr-4 
                ${school.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                    school.rank === 2 ? 'bg-slate-200 text-slate-700' :
                        school.rank === 3 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-500'
                } `}>
                {school.rank}
            </div>
            <div className="flex-1 min-w-0">
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
            {showScore && school.score && (
                <div className="ml-4 flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</span>
                    <span className="text-sm font-bold text-slate-700">{school.score.toFixed(1)}</span>
                </div>
            )}
        </div>
    );

    return (
        <>
            {/* COLLAPSED CARD PREVIEW */}
            <Card className="h-full border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                            <CardTitle className="text-lg font-bold text-slate-800">{title}</CardTitle>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setIsExpanded(true)}>
                            <Maximize2 className="w-4 h-4" />
                        </Button>
                    </div>
                    <CardDescription className="line-clamp-1">{description}</CardDescription>
                </CardHeader>
                <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="divide-y divide-slate-100 flex-1">
                        {initialData.slice(0, 10).map((school, idx) => (
                            <RankingRow key={`${school.id}-preview-${idx}`} school={school} />
                        ))}
                    </div>
                    <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                        <Button variant="link" size="sm" onClick={() => setIsExpanded(true)} className="text-indigo-600">
                            View Full List ({listType === 'Global' ? '2000+' : 'Top 100+'})
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* EXPANDED MODAL */}
            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent hideCloseX className="max-w-4xl w-full h-[85vh] flex flex-col p-0 gap-0 overflow-hidden bg-white">
                    <VisuallyHidden.Root>
                        <DialogTitle>{title}</DialogTitle>
                    </VisuallyHidden.Root>

                    {/* Modal Header */}
                    <div className="p-6 border-b border-slate-200 bg-slate-50 flex items-start justify-between flex-shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                {Icon && <Icon className="w-6 h-6 text-indigo-600" />}
                                <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                            </div>
                            <p className="text-slate-500">{description}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setIsExpanded(false)}>
                            <Minimize2 className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto min-h-0 bg-white p-0">
                        <div className="divide-y divide-slate-100">
                            {items.map((school, idx) => (
                                <RankingRow
                                    key={`${school.id}-expanded-${idx}`}
                                    school={school}
                                    isLast={idx === items.length - 1}
                                />
                            ))}
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="p-6 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            </div>
                        )}
                        {!hasMore && (
                            <div className="p-6 text-center text-slate-500 text-sm">
                                End of list.
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
