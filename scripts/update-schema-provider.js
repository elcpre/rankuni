const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

if (process.env.VERCEL) {
    console.log('🚀 Detected Vercel Environment: Switching Prisma provider to PostgreSQL...');
    try {
        let schema = fs.readFileSync(schemaPath, 'utf8');

        // Replace sqlite with postgresql
        // Regex targets the provider line specifically inside datasource db block ideally, 
        // but simpler replacement is usually safe for this file structure.
        const updatedSchema = schema.replace(
            /provider\s*=\s*"sqlite"/,
            'provider = "postgresql"'
        );

        if (schema !== updatedSchema) {
            fs.writeFileSync(schemaPath, updatedSchema);
            console.log('✅ Successfully updated schema.prisma to use PostgreSQL.');
        } else {
            console.log('ℹ️ Schema already appears to be using PostgreSQL or pattern not found.');
        }
    } catch (err) {
        console.error('❌ Error updating schema provider:', err);
        process.exit(1);
    }
} else {
    console.log('💻 Local Environment detected: Keeping existing Prisma provider.');
}
