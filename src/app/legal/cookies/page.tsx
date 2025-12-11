'use client';

import { Button } from "@/components/ui/button";

export default function CookiesPage() {

    const resetCookies = () => {
        localStorage.removeItem('unimeta-consent');
        localStorage.removeItem('unimeta-consent-details');
        window.location.reload();
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-3xl">
            <h1 className="text-3xl font-bold mb-8">Cookie Policy</h1>
            <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 mb-12">
                <p>
                    This Cookie Policy explains what cookies are and how we use them. You should read this policy so You can understand what
                    type of cookies we use, or the information we collect using cookies and how that information is used.
                </p>

                <h3>What are Cookies?</h3>
                <p>
                    Cookies are small text files that are placed on your computer, mobile device or any other device by a website,
                    containing the details of your browsing history on that website among its many uses.
                </p>

                <h3>Types of Cookies We Use</h3>
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left border rounded-lg overflow-hidden">
                        <thead className="bg-slate-100 dark:bg-slate-800 font-bold">
                            <tr>
                                <th className="p-3">Category</th>
                                <th className="p-3">Cookie Name</th>
                                <th className="p-3">Purpose</th>
                                <th className="p-3">Duration</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                            <tr>
                                <td className="p-3 font-semibold">Essential</td>
                                <td className="p-3 font-mono text-xs">rankuni-consent</td>
                                <td className="p-3">Stores your cookie consent preferences so the banner doesn't reappear on every visit. (Local Storage)</td>
                                <td className="p-3">Persistent</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-semibold">Analytics (Google)</td>
                                <td className="p-3 font-mono text-xs">_ga</td>
                                <td className="p-3">Used to distinguish unique users by assigning a randomly generated number as a client identifier.</td>
                                <td className="p-3">2 years</td>
                            </tr>
                            <tr>
                                <td className="p-3 font-semibold">Analytics (Google)</td>
                                <td className="p-3 font-mono text-xs">_ga_49BRWVRMFX</td>
                                <td className="p-3">Used to persist session state.</td>
                                <td className="p-3">2 years</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                    <strong>Note:</strong> "Essential" items are stored in your browser's Local Storage, not technically as cookies, but serve the same functional purpose for consent management.
                </p>

                <h3>Your Choices Regarding Cookies</h3>
                <p>
                    If You prefer to avoid the use of specific cookies on the Website, first You must disable the use of Cookies in your browser and then delete the Cookies saved in your browser associated with this website. You may use this option for preventing the use of Cookies at any time.
                </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800">
                <h3 className="font-bold text-lg mb-2">Cookie Settings</h3>
                <p className="text-sm text-slate-500 mb-4">
                    You can change your cookie preferences at any time by resetting your choice below. This will re-open the consent banner.
                </p>
                <Button variant="outline" onClick={resetCookies}>
                    Reset Cookie Consent
                </Button>
            </div>
        </div>
    );
}
