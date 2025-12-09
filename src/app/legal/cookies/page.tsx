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
                <ul>
                    <li><strong>Essential Cookies:</strong> These cookies are essential to provide You with services available through the Website and to enable You to use some of its features.</li>
                    <li><strong>Analytics Cookies:</strong> These cookies are used to track information about traffic to the Website and how users use the Website. The information gathered via these cookies may directly or indirectly identify you as an individual visitor.</li>
                </ul>

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
