import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Globe, RefreshCw } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 max-w-4xl">
            <div className="space-y-4 mb-12">
                <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">About RankUni</h1>
                <p className="text-xl text-slate-600 dark:text-slate-300">
                    Transparent, data-driven insights into global higher education.
                </p>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none mb-12">
                <p>
                    RankUni was founded with a single mission: to democratize access to higher education data.
                    Choosing a university is one of the most significant decisions in a person's life, yet consistent,
                    comparable data across borders is notoriously difficult to find.
                </p>
                <p>
                    We aggregate, standardize, and visualize data from official government sources to provide students,
                    parents, and researchers with an unbiased view of institutional performance, cost, and student satisfaction.
                </p>
            </div>

            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Database className="w-6 h-6 text-indigo-600" />
                Data Sources
            </h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🌍</span>
                            <h3 className="font-bold">Global Rankings</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">Source: CWUR</p>
                        <Badge variant="outline">cwur.org</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🇺🇸</span>
                            <h3 className="font-bold">United States</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">Source: IPEDS & College Scorecard</p>
                        <Badge variant="outline">Dept. of Education</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🇬🇧</span>
                            <h3 className="font-bold">United Kingdom</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">Source: HESA & NSS</p>
                        <Badge variant="outline">HESA Open Data</Badge>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🇫🇷</span>
                            <h3 className="font-bold">France</h3>
                        </div>
                        <p className="text-sm text-slate-500 mb-2">Source: MESR Open Data</p>
                        <Badge variant="outline">data.gouv.fr</Badge>
                    </CardContent>
                </Card>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-emerald-500" />
                        Last Data Update
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">Global datasets synchronized.</p>
                </div>
                <div className="font-mono text-sm bg-white dark:bg-black px-3 py-1 rounded border border-slate-200 dark:border-slate-700">
                    {new Date().toISOString().split('T')[0]}
                </div>
            </div>
        </div>
    );
}
