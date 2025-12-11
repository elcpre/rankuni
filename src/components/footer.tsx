'use client';

import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-600 p-2 rounded-lg">
                                <GraduationCap className="h-6 w-6 text-white" />
                            </div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white">
                                RankUni
                            </span>
                        </div>
                        <p className="text-slate-500 text-sm leading-relaxed">
                            Global higher education analytics platform. Comparing institutions across US, UK, and France to help students make informed decisions.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Platform</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/" className="hover:text-indigo-600 transition-colors">Home</Link></li>
                            <li><Link href="/about" className="hover:text-indigo-600 transition-colors">About Us</Link></li>
                            <li><Link href="/dashboard" className="hover:text-indigo-600 transition-colors">Dashboard</Link></li>
                            <li><Link href="/find" className="text-slate-500 hover:text-indigo-600 transition-colors">Find Schools</Link></li>
                            <li><Link href="/rankings" className="text-slate-500 hover:text-indigo-600 transition-colors">Global Rankings</Link></li>
                            <li><Link href="/compare" className="text-slate-500 hover:text-indigo-600 transition-colors">Compare</Link></li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
                        <ul className="space-y-3 text-sm text-slate-500">
                            <li><Link href="/legal/privacy" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/legal/terms" className="hover:text-indigo-600 transition-colors">Terms of Service</Link></li>
                            <li><Link href="/legal/impressum" className="hover:text-indigo-600 transition-colors">Legal Note (Impressum)</Link></li>
                            <li><Link href="/legal/cookies" className="hover:text-indigo-600 transition-colors">Cookie Policy</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white mb-6">Contact</h4>
                        <address className="not-italic text-sm text-slate-500 space-y-3">
                            <p>Email: info@rankuni.app</p>
                            <p>
                                Camino de las Viñas s/n<br />
                                18120, Alhama de Granada<br />
                                Spain
                            </p>
                        </address>
                    </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-400">
                        © {currentYear} RankUni. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        {/* Social placeholders could go here */}
                    </div>
                </div>
            </div>
        </footer>
    );
}
