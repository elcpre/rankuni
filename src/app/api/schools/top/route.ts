
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'Student Size';
    const limit = parseInt(searchParams.get('limit') || '10');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const country = searchParams.get('country') || 'US';

    try {
        const where: any = {
            name: metric,
        };

        if (state || city || country) {
            where.school = {};
            if (country) where.school.country = country;
            if (state) where.school.state = state;
            if (city) where.school.city = { contains: city }; // loose match for city
        }

        const results = await prisma.metric.findMany({
            where,
            take: limit,
            orderBy: {
                value: 'desc',
            },
            include: {
                school: true,
            }
        });

        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}
