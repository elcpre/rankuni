
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function checkCoverage() {
    console.log("Checking Database Coverage...");

    // 1. Overall Counts
    const counts = await prisma.school.groupBy({
        by: ['country'],
        _count: { _all: true }
    });
    console.log("\n--- Total Schools by Country ---");
    console.table(counts.map(c => ({ Country: c.country, Count: c._count._all })));

    // 2. US State Coverage
    const usStates = await prisma.school.groupBy({
        by: ['state'],
        where: { country: 'US' },
        _count: { _all: true },
        orderBy: { state: 'asc' }
    });
    console.log(`\n--- US States Covered: ${usStates.length} ---`);
    if (usStates.length < 50) {
        console.log("WARNING: Less than 50 states found!");
    }
    // Print first 5 and last 5 to keep valid output short
    console.table(usStates.slice(0, 5).map(s => ({ State: s.state, Count: s._count._all })));
    console.log("...");
    console.table(usStates.slice(-5).map(s => ({ State: s.state, Count: s._count._all })));

    // 3. UK Country Coverage (stored in 'country' or 'state' depending on ingest?)
    // UK ingest usually sets country='GB' or 'UK', let's check.
    // Actually schema validation might enforce iso codes.
    // Let's check 'state' for UK schools to see if we have England, Scotland, Wales, NI
    const ukRegions = await prisma.school.groupBy({
        by: ['state'], // UK script usually maps country (England/etc) to state
        where: {
            country: { in: ['UK', 'GB'] }
        },
        _count: { _all: true }
    });
    console.log("\n--- UK Regions/Countries ---");
    console.table(ukRegions.map(r => ({ Region: r.state, Count: r._count._all })));

    // 4. France Coverage
    const frcount = await prisma.school.count({ where: { country: 'FR' } });
    console.log(`\n--- France Total: ${frcount} ---`);

}

checkCoverage()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
