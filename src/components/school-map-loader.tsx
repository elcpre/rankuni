
'use client';

import dynamic from 'next/dynamic';

// Dynamically import the SchoolMap component with SSR disabled
const SchoolMap = dynamic(() => import('@/components/school-map'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-slate-100 animate-pulse rounded-md flex items-center justify-center text-slate-400">Loading Map...</div>
});

export default function SchoolMapLoader(props: any) {
    return <SchoolMap {...props} />;
}
