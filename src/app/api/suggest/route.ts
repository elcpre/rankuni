
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'school', 'city', 'state'
    const q = searchParams.get('q') || '';
    const country = searchParams.get('country');

    const qLower = q.toLowerCase();

    // Country Mapping
    let searchQ = q;
    if (type === 'country') {
        if (qLower.includes('united states') || qLower.includes('usa') || qLower.includes('america')) searchQ = 'US';
        else if (qLower.includes('united kingdom') || qLower.includes('britain') || qLower.includes('uk')) searchQ = 'UK';
        else if (qLower.includes('france')) searchQ = 'FR';
        else if (qLower.includes('canada')) searchQ = 'CA';
    } else if (type === 'state') {
        // Basic State Mapping (Example)
        if (qLower === 'california' || qLower.startsWith('calif')) searchQ = 'CA';
        else if (qLower === 'new york') searchQ = 'NY';
        else if (qLower === 'massachusetts') searchQ = 'MA';
        // Add more as needed or use a library
    }

    // Relaxed validation to allow "click to suggestions"
    if (!q && !country && type !== 'country' && type !== 'school') {
        // If searching city/state without context/query, maybe too broad? 
        // Let's allow it but limit to top 10 to show *something*.
    }

    try {
        let results: any[] = [];
        const state = searchParams.get('state');

        if (type === 'school') {
            results = await prisma.school.findMany({
                where: {
                    name: { contains: q, mode: 'insensitive' },
                    ...(country ? { country } : {}),
                    ...(state ? { state } : {})
                },
                take: 50,
                orderBy: { name: 'asc' },
                select: { id: true, name: true, city: true, state: true, country: true }
            });
        } else if (type === 'city') {
            const cities = await prisma.school.findMany({
                where: {
                    city: { contains: searchQ, mode: 'insensitive' },
                    ...(country ? { country } : {}),
                    ...(state ? { state } : {})
                },
                distinct: ['city', 'state'],
                take: 20,
                orderBy: { city: 'asc' },
                select: { city: true, state: true, country: true }
            });
            results = cities;
        } else if (type === 'state') {
            const states = await prisma.school.findMany({
                where: {
                    state: { contains: searchQ },
                    ...(country ? { country } : {})
                },
                distinct: ['state'],
                take: 100,
                orderBy: { state: 'asc' },
                select: { state: true, country: true }
            });
            results = states;
        } else if (type === 'country') {
            // STATIC LIST for Smart Suggestion (DB only has codes)
            const allCountries = [
                { country: 'US', keywords: ['united states', 'usa', 'us', 'america'] },
                { country: 'UK', keywords: ['united kingdom', 'uk', 'britain', 'england'] },
                { country: 'FR', keywords: ['france', 'fr'] },
                { country: 'CA', keywords: ['canada', 'ca'] }
            ];

            results = allCountries
                .filter(c => !q || c.keywords.some(k => k.includes(qLower)))
                .map(c => ({ country: c.country }));
        }

        return NextResponse.json(results);
    } catch (error) {
        console.error('Suggestion Error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
