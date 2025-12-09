import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const metricName = searchParams.get('metric');
    const limit = parseInt(searchParams.get('limit') || '100'); // Default to 100 for "all", or use -1 for everything (risky)
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const country = searchParams.get('country');
    const compareIds = searchParams.get('compareIds')?.split(',').filter(Boolean);
    const order = (searchParams.get('order') as 'asc' | 'desc') || 'desc';

    if (!metricName) {
        return NextResponse.json({ error: 'Metric name required' }, { status: 400 });
    }

    const where: any = {
        name: metricName,
    };

    if (compareIds && compareIds.length > 0) {
        where.schoolId = { in: compareIds };
    } else {
        if (country) where.school = { ...where.school, country };
        if (state) where.school = { ...where.school, state };
        if (city) where.school = { ...where.school, city };
    }

    try {
        const metrics = await prisma.metric.findMany({
            where,
            take: limit,
            distinct: ['schoolId'], // Prevent duplicates
            orderBy: { value: order },
            include: { school: true },
        });

        return NextResponse.json(metrics);
    } catch (e) {
        console.error(e);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
