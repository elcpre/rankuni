export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
                <p className="text-sm text-slate-500">Last updated: {new Date().toLocaleDateString()}</p>

                <h3>1. Acceptance of Terms</h3>
                <p>
                    By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.
                </p>

                <h3>2. Use License</h3>
                <p>
                    Permission is granted to temporarily download one copy of the materials (information or software) on RankUni's website for personal, non-commercial transitory viewing only.
                </p>

                <h3>3. Disclaimer</h3>
                <p>
                    The materials on RankUni's website are provided on an 'as is' basis. RankUni makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
                </p>

                <h3>4. Limitations</h3>
                <p>
                    In no event shall RankUni or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RankUni's website.
                </p>

                <h3>5. Governing Law</h3>
                <p>
                    These terms and conditions are governed by and construed in accordance with the laws of Spain and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
                </p>
            </div>
        </div>
    );
}
