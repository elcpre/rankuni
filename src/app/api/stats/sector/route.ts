
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const state = searchParams.get('state');

    const where: any = {};
    if (country) where.country = country;
    if (state) where.state = state;

    try {
        const schools = await prisma.school.groupBy({
            by: ['type'],
            where,
            _count: {
                _all: true
            }
        });

        // Format for Recharts
        const data = schools.map(group => ({
            name: group.type || 'Unknown',
            value: group._count._all
        })).filter(g => g.value > 0);

        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch sector stats' }, { status: 500 });
    }
}
