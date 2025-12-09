
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    try {
        // Simple search logic: if country provided, filter by it.
        // If not provided, maybe default to US or search all? 
        // Let's search all if not specified, or allow param.
        const country = searchParams.get('country');

        const whereClause: any = {
            OR: [
                { name: { contains: query } },
                { city: { contains: query } },
                { state: { contains: query } },
            ]
        };

        if (country) {
            whereClause.country = country;
        }

        const schools = await prisma.school.findMany({
            where: whereClause,
            take: 20,
        });

        return NextResponse.json(schools);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to search schools' }, { status: 500 });
    }
}
