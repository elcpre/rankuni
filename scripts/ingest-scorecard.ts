
import { PrismaClient } from '@prisma/client';
import 'dotenv/config'; // Ensure env is loaded if not using --env-file

const prisma = new PrismaClient();
const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

async function fetchPage(page: number) {
    if (!API_KEY) {
        throw new Error('COLLEGE_SCORECARD_API_KEY is not defined in .env');
    }

    const fields = [
        'id',
        'school.name',
        'school.city',
        'school.state',
        'school.zip',
        'school.school_url',
        'school.ownership',
        'location.lat',
        'location.lon',
        'latest.student.size',
        'latest.admissions.admission_rate.overall',
        'latest.cost.tuition.in_state',
        'latest.cost.tuition.out_of_state'
    ].join(',');

    let url = `${BASE_URL}?api_key=${API_KEY}&fields=${fields}&page=${page}&per_page=100`;

    if (process.env.STATE) {
        url += `&school.state=${process.env.STATE}`;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function main() {
    console.log('Starting College Scorecard Ingestion...');

    let page = 0;
    let hasMore = true;
    let count = 0;

    while (hasMore) {
        try {
            console.log(`Fetching page ${page}...`);
            const data = await fetchPage(page);

            const results = data.results;
            if (!results || results.length === 0) {
                hasMore = false;
                break;
            }

            for (const item of results) {
                const name = item['school.name'];
                if (!name) continue;

                // Map Ownership
                const ownershipCode = item['school.ownership'];
                let type = 'Unknown';
                if (ownershipCode === 1) type = 'Public';
                else if (ownershipCode === 2) type = 'Private Non-Profit';
                else if (ownershipCode === 3) type = 'Private For-Profit';

                const lat = item['location.lat'];
                const lon = item['location.lon'];
                // const lat = null;
                // const lon = null;

                const existing = await prisma.school.findFirst({
                    where: { name: name, state: item['school.state'] }
                });

                let schoolId = existing?.id;

                if (!existing) {
                    const created = await prisma.school.create({
                        data: {
                            name,
                            city: item['school.city'],
                            state: item['school.state'],
                            zip: item['school.zip'],
                            url: item['school.school_url'],
                            type: type,
                            level: 'Postsecondary',
                            latitude: lat,
                            longitude: lon,
                        }
                    });
                    schoolId = created.id;
                } else {
                    schoolId = existing.id;
                    // Update existing records with new fields
                    await prisma.school.update({
                        where: { id: schoolId },
                        data: {
                            type: type,
                            latitude: lat,
                            longitude: lon,
                        }
                    });
                }

                if (item['latest.student.size']) {
                    await prisma.metric.create({
                        data: {
                            schoolId: schoolId!,
                            category: 'Enrollment',
                            name: 'Student Size',
                            value: parseFloat(item['latest.student.size']),
                            year: new Date().getFullYear(),
                            source: 'CollegeScorecard'
                        }
                    });
                }

                if (item['latest.admissions.admission_rate.overall']) {
                    await prisma.metric.create({
                        data: {
                            schoolId: schoolId!,
                            category: 'Admissions',
                            name: 'Admission Rate',
                            value: parseFloat(item['latest.admissions.admission_rate.overall']),
                            year: new Date().getFullYear(),
                            source: 'CollegeScorecard'
                        }
                    });
                }

                // In-State Tuition
                if (item['latest.cost.tuition.in_state']) {
                    await prisma.metric.create({
                        data: {
                            schoolId: schoolId!,
                            category: 'Cost',
                            name: 'Tuition (In-State)',
                            value: parseFloat(item['latest.cost.tuition.in_state']),
                            year: new Date().getFullYear(),
                            source: 'CollegeScorecard'
                        }
                    });
                }
                // Out-of-State Tuition
                if (item['latest.cost.tuition.out_of_state']) {
                    await prisma.metric.create({
                        data: {
                            schoolId: schoolId!,
                            category: 'Cost',
                            name: 'Tuition (Out-of-State)',
                            value: parseFloat(item['latest.cost.tuition.out_of_state']),
                            year: new Date().getFullYear(),
                            source: 'CollegeScorecard'
                        }
                    });
                }
            }

            count += results.length;
            page++;

            if (page > 20) { // Limit to 20 pages (approx 2,000 schools) for local dev speed
                console.log('Stopping after 100 pages.');
                hasMore = false;
            }

        } catch (e) {
            console.error('Error fetching page ' + page, e);
            hasMore = false;
        }
    }

    console.log(`Ingestion complete. Processed ${count} items.`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
