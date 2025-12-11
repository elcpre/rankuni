
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const usInfo = await prisma.school.count({ where: { country: 'US' } });
    const caInfo = await prisma.school.count({ where: { country: 'CA' } });
    const metrics = await prisma.metric.count();
    const rankings = await prisma.rankingEntry.count();

    console.log(`🇺🇸 US Schools: ${usInfo}`);
    console.log(`🇨🇦 CA Schools: ${caInfo}`);
    console.log(`📊 Metrics: ${metrics}`);
    console.log(`🏆 Rankings: ${rankings}`);
}

main().finally(() => prisma.$disconnect());
