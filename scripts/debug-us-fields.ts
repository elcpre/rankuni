
import 'dotenv/config';

const API_KEY = process.env.COLLEGE_SCORECARD_API_KEY;
const BASE_URL = 'https://api.data.gov/ed/collegescorecard/v1/schools.json';

async function checkFields() {
    if (!API_KEY) {
        console.error('No API Key found');
        return;
    }

    const fields = [
        'school.name',
        'latest.student.retention_rate.overall',
        'latest.earnings.10_yrs_after_entry.median',
        'school.ownership'
    ].join(',');

    const url = `${BASE_URL}?api_key=${API_KEY}&fields=${fields}&per_page=1`;
    console.log(`Fetching from ${url}...`);

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkFields();
