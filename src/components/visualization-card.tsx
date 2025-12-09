'use client';

import React, { useState } from 'react';
import { Maximize2, Minimize2, Table as TableIcon, BarChart2, Map as MapIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';

export type ViewMode = 'chart' | 'table' | 'map';

interface VisualizationCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    // Optional: If provided, renders a toggle for different views
    availableViews?: ViewMode[];
    currentView?: ViewMode;
    onViewChange?: (view: ViewMode) => void;
    // content to render in the expanded modal (defaults to children if not provided)
    expandedContent?: React.ReactNode;
    className?: string;
}

export function VisualizationCard({
    title,
    description,
    children,
    availableViews,
    currentView,
    onViewChange,
    expandedContent,
    className
}: VisualizationCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Header Actions Component
    const HeaderActions = ({ expanded = false }) => (
        <div className="flex items-center space-x-2">
            {availableViews && onViewChange && (
                <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mr-2">
                    {availableViews.includes('map') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewChange('map')}
                            className={`h-7 w-7 p-0 ${currentView === 'map' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                            title="Map View"
                        >
                            <MapIcon className="w-4 h-4" />
                        </Button>
                    )}
                    {availableViews.includes('chart') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewChange('chart')}
                            className={`h-7 w-7 p-0 ${currentView === 'chart' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                            title="Chart View"
                        >
                            <BarChart2 className="w-4 h-4" />
                        </Button>
                    )}
                    {availableViews.includes('table') && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewChange('table')}
                            className={`h-7 w-7 p-0 ${currentView === 'table' ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'}`}
                            title="Table View"
                        >
                            <TableIcon className="w-4 h-4" />
                        </Button>
                    )}
                </div>
            )}
            {!expanded && (
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setIsExpanded(true)}>
                    <Maximize2 className="w-4 h-4" />
                </Button>
            )}
            {expanded && (
                <DialogClose asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => setIsExpanded(false)}>
                        <Minimize2 className="w-4 h-4" />
                    </Button>
                </DialogClose>
            )}
        </div>
    );

    return (
        <>
            <Card className={`shadow-md flex flex-col ${className || ''}`}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div>
                        <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100">{title}</CardTitle>
                        {description && <CardDescription className="text-xs text-slate-500 mt-1">{description}</CardDescription>}
                    </div>
                    <HeaderActions />
                </CardHeader>
                <CardContent className="flex-1 min-h-0 relative">
                    {children}
                </CardContent>
            </Card>

            <Dialog open={isExpanded} onOpenChange={setIsExpanded}>
                <DialogContent className="max-w-[95vw] w-full h-[90vh] flex flex-col p-6">
                    <VisuallyHidden.Root>
                        <DialogTitle>{title}</DialogTitle>
                    </VisuallyHidden.Root>
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-50">{title}</h2>
                            <p className="text-slate-500">{description}</p>
                        </div>
                        <HeaderActions expanded={true} />
                    </div>
                    <div className="flex-1 min-h-0 overflow-hidden relative rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
                        {expandedContent || children}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
