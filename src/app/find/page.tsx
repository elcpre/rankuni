'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardFilters } from '@/components/dashboard-filters';
import { Search } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function FindPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-5xl">
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full mb-6">
                    <Search className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
                    Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Future Institution</span>
                </h1>
                <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                    Search through thousands of universities across France, UK, and US. Compare metrics, tuition, and student satisfaction.
                </p>
            </div>

            <DashboardFilters defaultTab="search" autoFocusSearch={true} />
        </div>
    );
}
