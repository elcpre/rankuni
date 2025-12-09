
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

async function main() {
    console.log(`[${new Date().toISOString()}] Starting daily update...`);

    // 1. Run Scorecard Ingestion
    try {
        console.log('--> Running Scorecard Ingestion...');
        // Ensure we use the same environment
        const { stdout, stderr } = await execPromise('npx tsx scripts/ingest-scorecard.ts');
        console.log(stdout);
        if (stderr) console.error(stderr);
    } catch (e: any) {
        console.error('Corecard Ingestion Failed:', e.message);
    }

    // 2. Run NCES Ingestion if file exists
    // For future implementation: Check for new CSVs in data/incoming

    console.log(`[${new Date().toISOString()}] Daily update finished.`);
}

main();
