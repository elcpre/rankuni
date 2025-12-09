export default function ImpressumPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Legal Note (Impressum)</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p>According to § 5 TMG (German Telemedia Act):</p>

                <h3>Operator</h3>
                <p>
                    <strong>RankUni</strong><br />
                    Camino de las Viñas s/n<br />
                    18120, Alhama de Granada<br />
                    Spain
                </p>

                <h3>Contact</h3>
                <p>
                    Email: info@unimeta.com<br />
                    Website: www.unimeta.com
                </p>

                <h3>Responsible for Content</h3>
                <p>
                    RankUni Editorial Team<br />
                    Camino de las Viñas s/n<br />
                    18120, Alhama de Granada
                </p>

                <h3>Dispute Resolution</h3>
                <p>
                    The European Commission provides a platform for online dispute resolution (OS): https://ec.europa.eu/consumers/odr.<br />
                    We are not willing or obliged to participate in dispute resolution proceedings before a consumer arbitration board.
                </p>
            </div>
        </div>
    );
}
