'use server';

import { prisma } from '@/lib/db';

export async function getSchoolNames(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    try {
        const schools = await prisma.school.findMany({
            where: {
                id: { in: ids }
            },
            select: {
                id: true,
                name: true
            }
        });
        return schools;
    } catch (error) {
        console.error("Error fetching school names:", error);
        return [];
    }
}

export async function getSchool(id: string) {
    try {
        const school = await prisma.school.findUnique({
            where: { id },
            include: {
                metrics: {
                    orderBy: { year: 'desc' }
                }
            }
        });
        return school;
    } catch (error) {
        console.error("Error fetching school:", error);
        return null;
    }
}
const CACHE_DURATION = 3600; // 1 hour (simulated for now, or use unstable_cache)

export async function getNationalAverages(country: string) {
    // In a real optimized app, we'd cache this heavily or pre-compute it.
    // For now, we'll compute it live but filtered by year to get "latest".

    // 1. Get average tuition
    const tuitionIn = await prisma.metric.aggregate({
        where: { name: 'Tuition (In-State)', school: { country } },
        _avg: { value: true }
    });

    // 2. Get average admission
    const admission = await prisma.metric.aggregate({
        where: { name: 'Admission Rate', school: { country } },
        _avg: { value: true }
    });

    // 3. Get average earnings (US mostly)
    const earnings = await prisma.metric.aggregate({
        where: { name: 'Median Earnings', school: { country } },
        _avg: { value: true }
    });

    // 4. Get average satisfaction (UK mostly)
    const satisfaction = await prisma.metric.aggregate({
        where: { name: 'NSS Satisfaction', school: { country } },
        _avg: { value: true }
    });

    return {
        tuitionIn: tuitionIn._avg.value || 0,
        admission: admission._avg.value || 0,
        earnings: earnings._avg.value || 0,
        satisfaction: satisfaction._avg.value || 0
    };
}

export async function getSimilarSchools(schoolId: string) {
    try {
        const reference = await prisma.school.findUnique({
            where: { id: schoolId },
            include: { metrics: { where: { name: 'Student Size' } } }
        });

        if (!reference) return [];

        const size = reference.metrics[0]?.value || 0;

        // Find schools in same country, same type, with similar size (+/- 50% range or just closest sorted by diff)
        // Simplest: Find same country/type, order by size diff (simulated via raw query or fetching and sorting)

        // Prisma doesn't do "order by absolute difference" easily without raw query. 
        // We'll fetch a range.
        const similar = await prisma.school.findMany({
            where: {
                id: { not: schoolId },
                country: reference.country,
                type: reference.type, // Should match Public/Private
                metrics: {
                    some: {
                        name: 'Student Size',
                        value: {
                            gte: size * 0.5,
                            lte: size * 1.5
                        }
                    }
                }
            },
            take: 3,
            include: {
                metrics: {
                    where: { name: 'Student Size' }
                }
            }
        });

        return similar.map(s => ({
            id: s.id,
            name: s.name,
            city: s.city,
            state: s.state,
            country: s.country,
            studentSize: s.metrics[0]?.value || 0
        }));

    } catch (e) {
        console.error("Error finding similar schools", e);
        return [];
    }
}
// ... existing code

export async function getTopRanked(listType: 'Global' | 'Education' | 'Employment' | 'Research' | 'Faculty', limit: number = 20, offset: number = 0) {
    try {
        let orderBy: any = { rank: 'asc' };
        let where: any = {}; // Default Global

        if (listType === 'Education') {
            where = { educationRank: { not: null } };
            orderBy = { educationRank: 'asc' };
        } else if (listType === 'Employment') {
            where = { employabilityRank: { not: null } };
            orderBy = { employabilityRank: 'asc' };
        } else if (listType === 'Research') {
            where = { researchRank: { not: null } };
            orderBy = { researchRank: 'asc' };
        } else if (listType === 'Faculty') {
            where = { facultyRank: { not: null } };
            orderBy = { facultyRank: 'asc' };
        }

        const entries = await prisma.rankingEntry.findMany({
            where,
            take: limit,
            skip: offset,
            orderBy: orderBy,
            include: {
                school: {
                    select: {
                        id: true,
                        city: true,
                        country: true
                    }
                }
            }
        });

        return entries.map(e => {
            // Determine rank value based on list type
            let displayRank = e.rank;
            if (listType === 'Education') displayRank = e.educationRank!;
            if (listType === 'Employment') displayRank = e.employabilityRank!;
            if (listType === 'Research') displayRank = e.researchRank!;
            if (listType === 'Faculty') displayRank = e.facultyRank!;

            return {
                id: e.schoolId || e.id, // Use schoolId if linked, else local ID (for key)
                name: e.name,
                location: e.school ? `${e.school.city || ''}, ${e.school.country}` : e.country || 'Unknown',
                rank: displayRank,
                score: e.score || undefined,
                metric: listType,
                linked: !!e.schoolId
            };
        });
    } catch (e) {
        console.error("Error fetching top ranked:", e);
        return [];
    }
}

export async function searchRankingByName(query: string) {
    if (!query || query.length < 3) return null;

    try {
        // Find the best match (Global list usually has the most entries)
        const entry = await prisma.rankingEntry.findFirst({
            where: {
                name: { contains: query, mode: 'insensitive' },
                // Prefer matches that have a global rank
                rank: { gt: 0 }
            },
            orderBy: {
                rank: 'asc' // Get the highest ranked match if multiple
            },
            include: {
                school: {
                    select: {
                        id: true,
                        city: true,
                        country: true
                    }
                }
            }
        });

        if (!entry) return null;

        return {
            id: entry.schoolId || entry.id,
            name: entry.name,
            location: entry.school ? `${entry.school.city || ''}, ${entry.school.country}` : entry.country || 'Unknown',
            globalRank: entry.rank,
            score: entry.score || undefined,
            educationRank: entry.educationRank || undefined,
            employabilityRank: entry.employabilityRank || undefined,
            facultyRank: entry.facultyRank || undefined,
            researchRank: entry.researchRank || undefined,
            linked: !!entry.schoolId
        };
    } catch (e) {
        console.error("Error searching ranking:", e);
        return null;
    }
}

export async function getSchoolRankings(schoolIds: string[]) {
    if (!schoolIds || schoolIds.length === 0) return [];

    try {
        const rankings = await prisma.rankingEntry.findMany({
            where: {
                schoolId: { in: schoolIds }
            },
            include: {
                school: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return rankings.map(r => ({
            schoolId: r.schoolId!,
            name: r.school?.name || r.name,
            globalRank: r.rank,
            score: r.score,
            educationRank: r.educationRank,
            employabilityRank: r.employabilityRank,
            facultyRank: r.facultyRank,
            researchRank: r.researchRank
        }));
    } catch (e) {
        console.error("Error fetching school rankings:", e);
        return [];
    }
}
