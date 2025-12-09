
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const school = await prisma.school.findUnique({
            where: { id },
            include: {
                metrics: {
                    orderBy: { year: 'desc' }
                }
            }
        });

        if (!school) {
            return NextResponse.json({ error: 'School not found' }, { status: 404 });
        }

        return NextResponse.json(school);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch school details' }, { status: 500 });
    }
}
