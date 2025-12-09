#!/bin/bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

echo "Installing dependencies..."
npm install leaflet react-leaflet @types/leaflet leaflet-defaulticon-compatibility @radix-ui/react-dialog @radix-ui/react-visually-hidden

echo "Running UK Ingestion..."
npx tsx scripts/ingest-uk.ts

echo "Running US Ingestion..."
npx tsx scripts/ingest-scorecard.ts

echo "Done! You can now start the server with ./start.sh"
