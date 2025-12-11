
import { PrismaClient } from '@prisma/client';
import { prisma } from '../src/lib/db';

async function debugQuery() {
    console.log("Simulating API Query...");

    const metricName = "Student Size";
    const country = "US";
    const limit = 3;

    const where: any = {
        name: metricName,
    };

    if (country) {
        where.school = {};
        where.school.country = country;
    }

    console.log("Query 'where':", JSON.stringify(where, null, 2));

    const metrics = await prisma.metric.findMany({
        where: {
            name: { contains: 'Ranking' }
        },
        take: 3,
        include: { school: true },
        orderBy: { value: 'asc' }
    });
    const count = await prisma.metric.count({ where: { name: { contains: 'Ranking' } } });
    console.log(`Found ${count} ranking metrics.`); console.log(`Found ${metrics.length} results.`);
    if (metrics.length > 0) {
        console.log("First result:", JSON.stringify(metrics[0], null, 2));
    }
}

debugQuery()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
