
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const schools = await prisma.school.findMany({
        where: { country: 'CA' },
        select: { name: true, latitude: true, longitude: true }
    });
    console.log("🇨🇦 Canadian Schools Location Check:");
    console.table(schools);
}

main().finally(() => prisma.$disconnect());
