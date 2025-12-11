
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const metrics = await prisma.metric.findMany({
        where: {
            school: { country: 'CA' },
            name: { in: ['Student Size', 'Admission Rate'] }
        },
        include: { school: true }
    });
    console.log(`🇨🇦 Found ${metrics.length} Enrollment/Admission metrics for Canada.`);
    if (metrics.length > 0) {
        console.table(metrics.map(m => ({ school: m.school.name, metric: m.name, value: m.value })));
    } else {
        console.log("❌ No Enrollment/Admission data found. Use ingest-canada.ts to add them.");
    }
}

main().finally(() => prisma.$disconnect());
