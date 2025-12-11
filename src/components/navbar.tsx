'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BarChart2, Search, Menu, X, GraduationCap, LayoutDashboard, Trophy } from 'lucide-react';

export function Navbar() {
    const pathname = usePathname();

    const navLinks = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/find', label: 'Find Institution', icon: Search },
        { href: '/rankings', label: 'Rankings', icon: Trophy },
        { href: '/compare', label: 'Compare', icon: BarChart2 },
    ];

    return (
        <nav className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="bg-indigo-600 p-2 rounded-lg">
                        <GraduationCap className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                        RankUni
                    </span>
                </Link>

                <div className="flex items-center space-x-1">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2",
                                    isActive
                                        ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800"
                                )}
                                title={link.label}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="hidden sm:inline">{link.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
