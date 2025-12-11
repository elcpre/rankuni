
import React, { Suspense } from 'react';
import Link from 'next/link';
import { DashboardFilters } from '@/components/dashboard-filters';
import { ArrowRight, BarChart2, Globe, Search, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "RankUni | The World's University Ranking & Comparison Engine",
  description: "RankUni helps you discover and compare global universities. Access ranking data, tuition costs, and admission stats for institutions in the US, UK, and France.",
};

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-10 lg:pt-20 lg:pb-12 text-center">
        <div className="container mx-auto px-4 relative z-10">
          <div className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-800 mb-6 animate-fade-in-up">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2"></span>
            RankUni v1.0 Live
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Find the Best University <br className="hidden md:block" /> for Your Future
          </h1>
          <p className="mt-2 text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-8 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">RankUni</span> is the premier analytics tool for students and researchers. Compare global rankings, tuition fees, and admission rates across US, UK, and French institutions to make data-driven education decisions.
          </p>

          {/* Search/Filter Container */}
          <div className="max-w-5xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 transform transition-all hover:scale-[1.01]">
            <Suspense fallback={<div className="text-center p-4">Loading...</div>}>
              <DashboardFilters />
            </Suspense>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Why use RankUni?</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              We aggregate official data from government sources and global ranking bodies (CWUR) to provide accurate, comparable metrics for thousands of institutions worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Global & Local Insights</h3>
              <p className="text-slate-500">
                Go beyond basic rankings. RankUni unifies datasets from the US (IPEDS), UK (HESA), and France to give you a truly international perspective on education quality.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-lg flex items-center justify-center mb-4">
                <BarChart2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Data-Driven Decisions</h3>
              <p className="text-slate-500">
                Visualize ROI. Compare tuition costs against median earnings and employment outcomes. Our interactive dashboards make complex data easy to understand.
              </p>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Fast, Free & Transparent</h3>
              <p className="text-slate-500">
                RankUni is built for accessibility. No hidden paywalls, no required signups to view data. Just pure, objective performance metrics at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-indigo-600 text-white text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to find your perfect fit?</h2>
          <p className="text-indigo-100 mb-8 text-lg max-w-2xl mx-auto">
            Start comparing top universities today. Filter by country, ranking, tuition, and student satisfaction.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary" size="lg" className="bg-white text-indigo-600 hover:bg-indigo-50" asChild>
              <Link href="/dashboard">Launch Dashboard</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
