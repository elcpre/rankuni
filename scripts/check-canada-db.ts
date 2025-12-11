
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log("Checking DB for Canadian Schools...");
    const schools = await prisma.school.findMany({
        where: { country: 'CA' }
    });
    console.log(`Found ${schools.length} schools with country='CA'.`);
    if (schools.length > 0) console.log("Sample:", schools[0].name);

    console.log("Checking RankingEntries for Canada...");
    const rankings = await prisma.rankingEntry.findMany({
        where: { country: 'Canada' },
        take: 5
    });
    console.log(`Found ranking entries for 'Canada'. Sample:`, rankings.map(r => r.name));
}
main().finally(() => prisma.$disconnect());
