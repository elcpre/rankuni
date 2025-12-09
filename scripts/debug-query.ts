
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

    const results = await prisma.metric.findMany({
        where,
        take: limit,
        orderBy: { value: 'desc' },
        include: { school: true },
    });

    console.log(`Found ${results.length} results.`);
    if (results.length > 0) {
        console.log("First result:", JSON.stringify(results[0], null, 2));
    }
}

debugQuery()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
