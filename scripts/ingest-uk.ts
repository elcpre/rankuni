
import { PrismaClient } from '@prisma/client';
import { prisma } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

// Mock Data for UK Universities (top 20 subset)
// In a real scenario, this would read from the HESA CSV file.
// Mock Data for UK Universities (top 20 subset)
// In a real scenario, this would read from the HESA CSV file.
// Added approximate lat/lon and type
const ukUniversities = [
    { name: "University of Oxford", city: "Oxford", state: "Oxfordshire", type: "Public", latitude: 51.7548, longitude: -1.2544, metrics: { "Student Size": 24000, "Admission Rate": 0.175, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.91 } },
    { name: "University of Cambridge", city: "Cambridge", state: "Cambridgeshire", type: "Public", latitude: 52.2043, longitude: 0.1166, metrics: { "Student Size": 22000, "Admission Rate": 0.21, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.89 } },
    { name: "Imperial College London", city: "London", state: "London", type: "Public", latitude: 51.4988, longitude: -0.1749, metrics: { "Student Size": 19000, "Admission Rate": 0.14, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.84 } },
    { name: "UCL (University College London)", city: "London", state: "London", type: "Public", latitude: 51.5246, longitude: -0.1340, metrics: { "Student Size": 42000, "Admission Rate": 0.30, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.80 } },
    { name: "University of Edinburgh", city: "Edinburgh", state: "Scotland", type: "Public", latitude: 55.9474, longitude: -3.1872, metrics: { "Student Size": 35000, "Admission Rate": 0.10, "Tuition (In-State)": 1820, "NSS Satisfaction": 0.78 } }, // Free for scots, but let's use rUK cap or avg
    { name: "University of Manchester", city: "Manchester", state: "Greater Manchester", type: "Public", latitude: 53.4668, longitude: -2.2339, metrics: { "Student Size": 40000, "Admission Rate": 0.56, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.79 } },
    { name: "University of Bristol", city: "Bristol", state: "Bristol", type: "Public", latitude: 51.4584, longitude: -2.6030, metrics: { "Student Size": 27000, "Admission Rate": 0.67, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.76 } },
    { name: "University of Warwick", city: "Coventry", state: "West Midlands", type: "Public", latitude: 52.3793, longitude: -1.5615, metrics: { "Student Size": 28000, "Admission Rate": 0.70, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.81 } },
    { name: "London School of Economics (LSE)", city: "London", state: "London", type: "Public", latitude: 51.5144, longitude: -0.1165, metrics: { "Student Size": 11000, "Admission Rate": 0.09, "Tuition (In-State)": 9250, "NSS Satisfaction": 0.82 } },
    { name: "University of St Andrews", city: "St Andrews", state: "Scotland", type: "Public", latitude: 56.3398, longitude: -2.7967, metrics: { "Student Size": 10000, "Admission Rate": 0.41, "Tuition (In-State)": 1820, "NSS Satisfaction": 0.93 } }
];

async function ingestUK() {
    console.log("Starting UK Data Ingestion...");

    for (const uni of ukUniversities) {
        console.log(`Processing ${uni.name}...`);

        const school = await prisma.school.upsert({
            where: { ncesId: `UK-${uni.name.replace(/\s+/g, '-')}` }, // Fake ID using name
            update: {
                // If it exists, update key fields
                country: 'UK',
                currency: 'GBP',
                type: uni.type,
                latitude: uni.latitude,
                longitude: uni.longitude,
            },
            create: {
                ncesId: `UK-${uni.name.replace(/\s+/g, '-')}`,
                name: uni.name,
                city: uni.city,
                state: uni.state,
                country: 'UK',
                currency: 'GBP',
                type: uni.type,
                level: 'University',
                latitude: uni.latitude,
                longitude: uni.longitude,
            }
        });

        // Ingest Metrics
        for (const [key, value] of Object.entries(uni.metrics)) {
            await prisma.metric.create({
                data: {
                    schoolId: school.id,
                    name: key,
                    category: key.includes('Size') ? 'Enrollment' : key.includes('Tuition') ? 'Cost' : 'Academics',
                    value: value,
                    year: 2024,
                    source: 'HESA/DiscoverUni (Mock)',
                }
            });
        }
    }

    console.log(`Ingestion complete. Processed ${ukUniversities.length} UK universities.`);
}

ingestUK()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
