export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

                <p>
                    This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
                    when You use the Service and tells You about Your privacy rights and how the law protects You.
                </p>

                <h3>1. Interpretation and Definitions</h3>
                <p>
                    <strong>Company</strong> (referred to as either "the Company", "We", "Us" or "Our" in this Agreement) refers to RankUni, Camino de las Viñas s/n, 18120, Alhama de Granada.
                </p>

                <h3>2. Collecting and Using Your Personal Data</h3>
                <p>
                    We may collect generic usage data to improve our service. We do not collect personally identifiable information (PII)
                    unless explicitly provided by you via contact forms.
                </p>
                <h4 className="font-bold mt-4">Tracking Technologies and Cookies</h4>
                <p>
                    We use third-party Service Providers to monitor and analyze the use of our Service. Specifically, we use <strong>Google Analytics 4</strong>.
                </p>
                <p>
                    Google Analytics is a web analytics service offered by Google that tracks and reports website traffic. Google uses the data collected to track and monitor the use of our Service. This data is shared with other Google services. Google may use the collected data to contextualize and personalize the ads of its own advertising network.
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>
                        For more information on the privacy practices of Google, please visit the Google Privacy & Terms web page: <a href="https://policies.google.com/privacy" className="text-indigo-600 underline" target="_blank" rel="noopener noreferrer">https://policies.google.com/privacy</a>
                    </li>
                </ul>

                <h3>3. GDPR Compliance (EU Users)</h3>
                <p>
                    If you are from the European Economic Area (EEA), our legal basis for collecting and using your personal info
                    depends on the context. We typically only collect data where we have your consent or where it is in our legitimate interests.
                </p>

                <h3>4. CCPA Compliance (California Users)</h3>
                <p>
                    We do not sell personal data. You have the right to request disclosure of data collection and deletion of your data.
                </p>

                <h3>5. Contact Us</h3>
                <p>If you have any questions about this Privacy Policy, You can contact us:</p>
                <ul>
                    <li>By email: info@rankuni.app</li>
                    <li>By mail: Camino de las Viñas s/n, 18120, Alhama de Granada, Spain</li>
                </ul>
            </div>
        </div>
    );
}
