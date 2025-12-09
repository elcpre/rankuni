
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { parse } from 'csv-parse';

const prisma = new PrismaClient();

async function main() {
    const filePath = process.argv[2];
    if (!filePath) {
        console.error('Usage: npx tsx scripts/ingest-nces.ts <path-to-csv>');
        process.exit(1);
    }

    console.log(`Reading NCES data from ${filePath}...`);

    const parser = fs
        .createReadStream(filePath)
        .pipe(parse({ columns: true, trim: true, skip_empty_lines: true }));

    let count = 0;

    for await (const row of parser) {
        // Map NCES columns (Adjust these based on actual CSV header)
        // Common keys: NCESSCH, SCH_NAME, LSTREET1, LCITY, LSTATE, LZIP, SCH_TYPE_TEXT
        const ncesId = row.NCESSCH || row.ncurses_id; // Try probable keys
        const name = row.SCH_NAME || row.school_name;

        if (!ncesId || !name) continue;

        try {
            await prisma.school.upsert({
                where: { ncesId },
                update: {
                    name,
                    address: row.LSTREET1 || row.address,
                    city: row.LCITY || row.city,
                    state: row.LSTATE || row.state,
                    zip: row.LZIP || row.zip,
                    type: row.SCH_TYPE_TEXT || row.type,
                    level: row.LEVEL || row.level,
                    // latitude: parseFloat(row.LATITUDE) || null, // If available
                    // longitude: parseFloat(row.LONGITUDE) || null,
                },
                create: {
                    ncesId,
                    name,
                    address: row.LSTREET1 || row.address,
                    city: row.LCITY || row.city,
                    state: row.LSTATE || row.state,
                    zip: row.LZIP || row.zip,
                    type: row.SCH_TYPE_TEXT || row.type,
                    level: row.LEVEL || row.level,
                },
            });

            // Example Metric: Student Count?
            // if (row.TOTAL_STUDENTS) ...

            count++;
            if (count % 100 === 0) process.stdout.write(`\rProcessed ${count} schools...`);
        } catch (error) {
            console.error(`Error processing school ${name}:`, error);
        }
    }

    console.log(`\nImport complete. Processed ${count} schools.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
