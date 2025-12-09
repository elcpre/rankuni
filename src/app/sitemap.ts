import { MetadataRoute } from 'next';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

const BASE_URL = 'https://unimeta.com'; // Replace with actual domain in production

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // 1. Static Routes
    const routes = [
        '',
        '/dashboard',
        '/find',
        '/about',
        '/legal/privacy',
        '/legal/terms',
        '/legal/impressum',
        '/legal/cookies',
    ].map((route) => ({
        url: `${BASE_URL}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1.0 : 0.8,
    }));

    // 2. Dynamic School Routes
    // Fetch all IDs. For very large datasets, we might need a paginated sitemap index, 
    // but for <50k URLs standard sitemap is okay (limit is 50k).
    // Let's assume we fit or just take top 10000 for now to be safe/fast.
    const schools = await prisma.school.findMany({
        select: { id: true },
        take: 10000
    });

    const schoolRoutes = schools.map((school) => ({
        url: `${BASE_URL}/school/${school.id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...routes, ...schoolRoutes];
}
