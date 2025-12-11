'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ShieldCheck, Cookie } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function CookieConsent() {
    // State: 'undecided', 'accepted_all', 'accepted_essential', 'declined'
    const [consentState, setConsentState] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    // Settings State
    const [consents, setConsents] = useState({
        essential: true, // Always true
        analytics: false,
        marketing: false
    });

    useEffect(() => {
        const stored = localStorage.getItem('rankuni-consent');
        if (!stored) {
            setIsOpen(true);
        } else {
            setConsentState(stored);
            // If strictly needed, we could parse detailed settings here too if we saved them JSON
        }
    }, []);

    const handleAcceptAll = () => {
        localStorage.setItem('rankuni-consent', 'accepted_all');
        setConsentState('accepted_all');
        setIsOpen(false);
        // Here you would trigger analytics scripts
    };

    const handleDecline = () => {
        localStorage.setItem('rankuni-consent', 'declined');
        setConsentState('declined');
        setIsOpen(false);
    };

    const handleSaveSettings = () => {
        // Determine state based on detailed selection
        const state = consents.analytics ? 'accepted_custom' : 'accepted_essential';
        localStorage.setItem('rankuni-consent', state);
        localStorage.setItem('rankuni-consent-details', JSON.stringify(consents));
        setConsentState(state);
        setIsOpen(false);
    };

    const resetCookies = () => {
        localStorage.removeItem('rankuni-consent');
        localStorage.removeItem('rankuni-consent-details');
        window.location.reload();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-2xl animate-in slide-in-from-bottom duration-500">
            <div className="container mx-auto max-w-5xl">
                {!showSettings ? (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-600 font-bold mb-1">
                                <Cookie className="w-5 h-5" />
                                <span>We value your privacy</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                                Read our <Link href="/legal/cookies" className="underline hover:text-indigo-600">Cookie Policy</Link>.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
                            <Button variant="outline" onClick={() => setShowSettings(true)}>
                                Customize
                            </Button>
                            <Button variant="outline" onClick={handleDecline}>
                                Decline All
                            </Button>
                            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md" onClick={handleAcceptAll}>
                                Accept All
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-indigo-600" />
                                Cookie Preferences
                            </h3>
                            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>Back</Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="essential" className="font-bold">Essential</Label>
                                    <Switch id="essential" checked={true} disabled />
                                </div>
                                <p className="text-xs text-slate-500 mb-1">Required for the website to function properly.</p>
                                <p className="text-[10px] text-slate-400 font-mono">Cookies: rankuni-consent</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="analytics" className="font-bold">Analytics</Label>
                                    <Switch
                                        id="analytics"
                                        checked={consents.analytics}
                                        onCheckedChange={(c) => setConsents({ ...consents, analytics: c })}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mb-1">Help us understand how visitors interact with the website.</p>
                                <p className="text-[10px] text-slate-400 font-mono">Cookies: _ga, _ga_*</p>
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex items-center justify-between mb-2">
                                    <Label htmlFor="marketing" className="font-bold">Marketing</Label>
                                    <Switch
                                        id="marketing"
                                        checked={consents.marketing}
                                        onCheckedChange={(c) => setConsents({ ...consents, marketing: c })}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mb-1">Used to display relevant advertisements to you.</p>
                                <p className="text-[10px] text-slate-400 font-mono">Cookies: (None currently active)</p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={handleDecline}>Decline All</Button>
                            <Button className="bg-indigo-600 text-white" onClick={handleSaveSettings}>Save Preferences</Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
