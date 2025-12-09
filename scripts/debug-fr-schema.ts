const UNIS_API = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-principaux-etablissements-enseignement-superieur/records?limit=1&refine=type_d_etablissement%3A%22Universit%C3%A9%22";

async function debug() {
    console.log("Fetching 1 record...");
    const res = await fetch(UNIS_API);
    const json = await res.json();
    if (json.results && json.results.length > 0) {
        console.log("Keys available:", Object.keys(json.results[0]));
        // Also print fields starting with 'inscrits'
        const keys = Object.keys(json.results[0]);
        const inscrits = keys.filter(k => k.includes('inscrits'));
        console.log("Enrollment fields:", inscrits);
    } else {
        console.log("No results");
    }
}

debug();
