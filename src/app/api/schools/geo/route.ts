
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const country = searchParams.get('country');
    const state = searchParams.get('state');

    const where: any = {
        latitude: { not: null },
        longitude: { not: null }
    };

    if (country) where.country = country;
    if (state) where.state = state;

    try {
        const schools = await prisma.school.findMany({
            where,
            select: {
                id: true,
                name: true,
                latitude: true,
                longitude: true,
                type: true,
                city: true,
                state: true,
                country: true,
            },
            take: 1000 // Limit for performance, maybe scale this up or use clustering later
        });

        const validSchools = schools.filter(s => s.latitude !== null && s.longitude !== null);

        return NextResponse.json(validSchools);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch school locations' }, { status: 500 });
    }
}
