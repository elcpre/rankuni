import { prisma } from '../src/lib/db';
import fs from 'fs';
import { parse } from 'csv-parse/sync';
import dotenv from 'dotenv';
import path from 'path';

// Load ecosystem env
dotenv.config({ path: '.env.local' });

async function ingestRankings() {
    // Usage: npx tsx scripts/ingest-rankings.ts <filepath> <sourceName> <year>
    const args = process.argv.slice(2);
    if (args.length < 3) {
        console.error('Usage: npx tsx scripts/ingest-rankings.ts <filepath> <sourceName> <year>');
        console.error('Example: npx tsx scripts/ingest-rankings.ts ./cwurData.csv "CWUR" 2024');
        process.exit(1);
    }

    const [filePath, sourceName, yearStr, csvYearStr] = args;
    const year = parseInt(yearStr, 10);
    const filterYear = csvYearStr ? parseInt(csvYearStr, 10) : year;

    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(1);
    }

    console.log(`Reading rankings from ${filePath} for source ${sourceName} (${year})...`);

    let fileContent = fs.readFileSync(filePath, 'utf-8');

    // Sanitization: Replace double quotes that are NOT entry boundaries with single quotes
    fileContent = fileContent.replace(/(?<!^|,|\r\n|\n)"(?!,|\r\n|\n|$)/gm, "'");

    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        relax_column_count: true
    });

    console.log(`Parsed ${records.length} records. Beginning matching process...`);

    let matched = 0;
    let created = 0;

    // Prefetch all schools for fuzzy matching to avoid N+1 queries
    const allSchools = await prisma.school.findMany({
        select: { id: true, name: true, country: true }
    });

    // Generic normalization
    const normalize = (str: string) => str.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

    // Dice Coefficient for similarity (0.0 to 1.0)
    function getSimilarity(s1: string, s2: string): number {
        const bigrams = (str: string) => {
            const s = str.toLowerCase().replace(/[^a-z0-9]/g, '');
            const res = new Set<string>();
            for (let i = 0; i < s.length - 1; i++) {
                res.add(s.substring(i, i + 2));
            }
            return res;
        };

        const bg1 = bigrams(s1);
        const bg2 = bigrams(s2);

        if (bg1.size === 0 || bg2.size === 0) return 0.0;

        let intersection = 0;
        bg1.forEach(bg => {
            if (bg2.has(bg)) intersection++;
        });

        return (2 * intersection) / (bg1.size + bg2.size);
    }

    // Map normalized names to school IDs for fast exact lookup
    const nameMap = new Map<string, string>();
    const schoolList: { id: string, name: string, norm: string }[] = [];

    allSchools.forEach(s => {
        const norm = normalize(s.name);
        nameMap.set(norm, s.id);
        schoolList.push({ id: s.id, name: s.name, norm });
    });

    // Clear existing entries for this source/year to prevent duplicates
    console.log(`Clearing existing ${sourceName} ${year} entries...`);
    await prisma.rankingEntry.deleteMany({
        where: { source: sourceName, year: year }
    });

    for (const record of records) {
        // Adapt fields based on common headers or generic logic
        const r = record as any;

        // FILTER BY YEAR if present in CSV
        // This is crucial to avoid ingesting 2012 data as 2024
        if (r.year && parseInt(r.year, 10) !== filterYear) {
            continue;
        }

        const keys = Object.keys(r);
        const nameKey = keys.find(k => /institution|university|school|name/i.test(k));
        const rankKey = keys.find(k => /rank|world_rank/i.test(k));
        const scoreKey = keys.find(k => /score|total_score/i.test(k));

        if (!nameKey || !rankKey) continue;

        const schoolName = r[nameKey];
        const rank = parseInt(r[rankKey], 10);
        const score = scoreKey ? parseFloat(r[scoreKey]) : undefined; // Optional

        if (!schoolName || isNaN(rank)) continue;

        const normalizedInput = normalize(schoolName);

        // 1. Exact Match
        let schoolId = nameMap.get(normalizedInput);
        let matchType = 'exact';

        // 2. Fuzzy Match (if no exact match)
        if (!schoolId) {
            let bestScore = 0;
            let bestCandidate = null;

            for (const school of schoolList) {
                // Optimization: Skip if length diff is huge
                if (Math.abs(school.norm.length - normalizedInput.length) > 5) continue;

                const sim = getSimilarity(schoolName, school.name);
                if (sim > bestScore) {
                    bestScore = sim;
                    bestCandidate = school;
                }
            }

            // Threshold: TIGHTENED to 0.95 to prevent "Tokyo" -> "Toledo"
            if (bestScore > 0.95 && bestCandidate) {
                schoolId = bestCandidate.id;
                matchType = `fuzzy (${bestScore.toFixed(2)})`;
            }
        }

        // Create RankingEntry for ALL records
        const subMetrics = [
            { key: 'quality_of_education', field: 'educationRank' },
            { key: 'alumni_employment', field: 'employabilityRank' },
            { key: 'quality_of_faculty', field: 'facultyRank' },
            { key: 'publications', field: 'researchRank' }
        ];

        const rankingData: any = {
            name: schoolName,
            country: r['country'] || null,
            rank: rank,
            score: score,
            year: year,
            source: sourceName,
            schoolId: schoolId || null
        };

        // Map sub-ranks safely
        for (const sub of subMetrics) {
            if (r[sub.key]) {
                const val = parseInt(r[sub.key], 10);
                if (!isNaN(val)) {
                    rankingData[sub.field] = val;
                }
            }
        }

        try {
            // Use Create instead of Upsert since we cleared the breakdown
            // Upsert is safer for idempotency if we run script twice for same year without clearing (but we clear now)
            await prisma.rankingEntry.create({
                data: rankingData
            });
            created++;
        } catch (e) {
            // Ignore duplicate unique constraints if any remain
            // console.error(e);
        }

        // Also Create Metric IF matched (for Dashboard backwards compatibility)
        if (schoolId) {
            const metricName = `Global Ranking (${sourceName})`;

            // Upsert Metric to avoid duplicates
            // Actually, Metric doesn't have unique constraint on [schoolId, name, year, source] by default?
            // Let's just try create or ignore.
            try {
                await prisma.metric.create({
                    data: {
                        schoolId,
                        category: 'Rankings',
                        name: metricName,
                        value: rank,
                        year: year,
                        source: sourceName
                    }
                });
            } catch { }

            // Also Sub-metrics for profile
            if (rankingData.educationRank) await createMetric(schoolId, `Rank - Education (${sourceName})`, rankingData.educationRank, year, sourceName);
            if (rankingData.employabilityRank) await createMetric(schoolId, `Rank - Employment (${sourceName})`, rankingData.employabilityRank, year, sourceName);
            if (rankingData.facultyRank) await createMetric(schoolId, `Rank - Faculty (${sourceName})`, rankingData.facultyRank, year, sourceName);
            if (rankingData.researchRank) await createMetric(schoolId, `Rank - Research (${sourceName})`, rankingData.researchRank, year, sourceName);

            matched++;
        }

        if (created % 50 === 0) process.stdout.write('.');
    }

    console.log(`\n\nIngestion Complete.`);
    console.log(`Ranking Entries processed: ${created}`);
    console.log(`Matched to DB Schools: ${matched}`);

    if (matched < 200 && records.length > 0) {
        console.warn("WARNING: Low match rate. Ensure school names in CSV match RankUni database.");
    }
}

async function createMetric(schoolId: string, name: string, value: number, year: number, source: string) {
    try {
        await prisma.metric.create({
            data: { schoolId, category: 'Rankings', name, value, year, source }
        });
    } catch { }
}

ingestRankings()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
