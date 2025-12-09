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
