
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import fs from 'fs';
import { parse } from 'csv-parse/sync';
import path from 'path';

async function main() {
    console.log('🇨🇦 Ingesting Canada Data from Verified CSV...');

    const csvPath = path.resolve(__dirname, 'data/canada_universities_2024.csv');
    const fileContent = fs.readFileSync(csvPath, 'utf-8');

    const records = parse(fileContent, {
        columns: true,
    });

    interface CanadianMetric {
        name: string;
        city: string;
        state: string; // "ON", "BC"
        web: string;   // "utoronto.ca"
        lat: string;   // "43.6629" (needs parsing)
        lon: string;   // "-79.3957"
        enrollment: string; // "97000"
        tuition_dom: string; // "6100"
        tuition_intl: string; // "60000"
        admission: string; // "0.43"
    }

    const rows = records as CanadianMetric[];
    console.log(`Found ${rows.length} schools in CSV.`);

    for (const row of rows) {
        console.log(`Processing ${row.name}...`);

        // Upsert School
        const dbSchool = await prisma.school.upsert({
            where: { statCanId: row.web },
            update: {
                name: row.name,
                city: row.city,
                state: row.state,
                country: 'CA',
                currency: 'CAD',
                url: row.web,
                type: 'Public',
                latitude: parseFloat(row.lat),
                longitude: parseFloat(row.lon)
            },
            create: {
                statCanId: row.web,
                name: row.name,
                city: row.city,
                state: row.state,
                country: 'CA',
                currency: 'CAD',
                url: row.web,
                type: 'Public',
                latitude: parseFloat(row.lat),
                longitude: parseFloat(row.lon)
            }
        });

        // Cleanup old metrics to prevent duplicates
        await prisma.metric.deleteMany({
            where: { schoolId: dbSchool.id, source: { in: ['StatCan (Provincial Avg)', 'StatCan (Fallback)', 'StatCan (Estimate)', 'Verified 2024 Data'] } }
        });

        // Create Metrics from CSV
        const metrics = [
            { name: 'Student Size', value: parseInt(row.enrollment), category: 'Enrollment' },
            { name: 'Admission Rate', value: parseFloat(row.admission), category: 'Admissions' },
            { name: 'Tuition (Domestic Undergrad)', value: parseFloat(row.tuition_dom), category: 'Tuition' },
            { name: 'Tuition (International Undergrad)', value: parseFloat(row.tuition_intl), category: 'Tuition' }
        ];

        await prisma.metric.createMany({
            data: metrics.map(m => ({
                schoolId: dbSchool.id,
                name: m.name,
                value: m.value,
                category: m.category,
                year: 2024,
                source: 'Verified 2024 Data'
            }))
        });

        console.log(`   - Updated ${metrics.length} metrics`);
    }
}

function getProvinceName(code: string) {
    const map: Record<string, string> = {
        "ON": "Ontario",
        "BC": "British Columbia",
        "QC": "Quebec",
        "AB": "Alberta",
        "NS": "Nova Scotia",
        "MB": "Manitoba",
        "SK": "Saskatchewan",
        "NB": "New Brunswick",
        "PE": "Prince Edward Island",
        "NL": "Newfoundland and Labrador"
    };
    return map[code] || code;
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
