'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, MapPin, Plus, X, BarChart2, Globe, Map } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

// --- Reusable Autocomplete Component ---
function AutocompleteInput({
    label,
    value,
    onChange,
    onSelect,
    placeholder,
    type,
    contextParams = {},
    icon: Icon,
    autoFocus = false
}: any) {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Unified fetcher
    const fetchSuggestions = async (query: string) => {
        try {
            const params = new URLSearchParams({ type, q: query, ...contextParams });
            const res = await fetch(`/api/suggest?${params.toString()}`);
            const data = await res.json();
            setSuggestions(Array.isArray(data) ? data : []);
            setShowSuggestions(true);
        } catch (e) {
            console.error(e);
        }
    };

    const handleInput = (val: string) => {
        onChange(val);
        // Debounce only for typing
        const timer = setTimeout(() => fetchSuggestions(val), 200);
        return () => clearTimeout(timer);
    };

    return (
        <div className="space-y-2 relative" ref={wrapperRef}>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center space-x-1">
                {Icon && <Icon className="w-3 h-3" />}
                <span>{label}</span>
            </label>
            <div className="relative">
                <Input
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => handleInput(e.target.value)}
                    onFocus={() => {
                        // Fetch immediately on focus (empty or not)
                        fetchSuggestions(value);
                    }}
                    className="h-10 bg-white dark:bg-slate-950"
                    autoFocus={autoFocus}
                />
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-950 rounded-md shadow-lg border border-slate-200 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                        {suggestions.map((s, idx) => (
                            <div
                                key={idx}
                                className="px-4 py-2 hover:bg-indigo-50 dark:hover:bg-slate-900 cursor-pointer text-sm"
                                onClick={() => {
                                    const val = type === 'country' ? s.country : type === 'state' ? s.state : type === 'city' ? s.city : s; // Pass full object for school/custom
                                    onSelect(val);
                                    setShowSuggestions(false);
                                }}
                            >
                                {type === 'country' && <span>{s.country === 'US' ? '🇺🇸 United States' : s.country === 'UK' ? '🇬🇧 United Kingdom' : s.country === 'FR' ? '🇫🇷 France' : s.country}</span>}
                                {type === 'state' && <span>{s.state}</span>}
                                {type === 'city' && <span>{s.city}, {s.state}</span>}
                                {type === 'school' && <span>{s.name} <span className='text-xs text-slate-400'>({s.city})</span></span>}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

interface DashboardFiltersProps {
    defaultTab?: 'location' | 'search' | 'compare';
    autoFocusSearch?: boolean;
}

export function DashboardFilters({ defaultTab = 'location', autoFocusSearch = false }: DashboardFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // -- State --
    // We keep internal state for inputs to allow typing, but we sync 'committed' filter state to URL
    const [country, setCountry] = useState(searchParams.get('country') || '');
    const [state, setState] = useState(searchParams.get('state') || '');
    const [city, setCity] = useState(searchParams.get('city') || '');

    // Compare State
    const [compareList, setCompareList] = useState<{ id: string, name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [directSearchTerm, setDirectSearchTerm] = useState('');
    const [schoolSuggestions, setSchoolSuggestions] = useState<any[]>([]);

    // -- Sync from URL on Load --
    useEffect(() => {
        const countryParam = searchParams.get('country');
        const stateParam = searchParams.get('state');
        const cityParam = searchParams.get('city');
        const compareParam = searchParams.get('compare');

        if (countryParam !== country) setCountry(countryParam || '');
        if (stateParam !== state) setState(stateParam || '');
        if (cityParam !== city) setCity(cityParam || '');

        // Hydrate Compare List if needed
        if (compareParam) {
            const ids = compareParam.split(',').filter(Boolean);
            // Only fetch if our current list doesn't match the URL (length mismatch or IDs missing)
            // This prevents redundant fetching if we just pushed the URL ourselves
            const currentIds = compareList.map(c => c.id);
            const needsUpdate = ids.length !== currentIds.length || !ids.every(id => currentIds.includes(id));

            if (needsUpdate) {
                import('@/actions/schools').then(({ getSchoolNames }) => {
                    getSchoolNames(ids).then(schools => {
                        setCompareList(schools);
                    });
                });
            }
        } else {
            // If URL has no compare, clear list (e.g. user cleared it via back button or filter change)
            if (compareList.length > 0) setCompareList([]);
        }
    }, [searchParams]);

    // -- Update Dashboard Logic --
    const updateDashboard = (newCountry?: string, newState?: string, newCity?: string, newCompare?: { id: string, name: string }[]) => {
        const params = new URLSearchParams();

        // Priority: If Compare list has items, we MIGHT want to clear location filters strictly
        // OR we allow both. User asked for "Independent". 
        // "Use either one or the other" implies we should probably clear location if adding compare, and vice versa?
        // Let's implement a "Mode" switch implicitly.

        const targetCompare = newCompare !== undefined ? newCompare : compareList;
        const targetCountry = newCountry !== undefined ? newCountry : country;
        const targetState = newState !== undefined ? newState : state;
        const targetCity = newCity !== undefined ? newCity : city;

        if (targetCompare.length > 0) {
            // Compare Mode Active: Send ONLY compare IDs
            console.log("Compare Mode Active");
            params.set('compare', targetCompare.map(s => s.id).join(','));
            // We consciously DO NOT set location params here to "Override" them visually in URL
            // But we keep input state so user can switch back? 
            // Better to clear inputs to avoid confusion "why is this filter here but not working?"
            // Actually, user said "In the UI, it should be clear that you can use either one or the other."
            // So if I add a school, I should probably clear the location filters visually.
        } else {
            // Browse Mode Active
            if (targetCountry) params.set('country', targetCountry);
            if (targetState) params.set('state', targetState);
            if (targetCity) params.set('city', targetCity);
        }

        router.push(`/dashboard?${params.toString()}`);
    };

    // -- Handlers --

    // Location Handlers (Instant Update)
    const handleLocationSelect = (type: 'country' | 'state' | 'city', val: string) => {
        if (type === 'country') {
            setCountry(val);
            setState(''); // Hierarchy reset
            setCity('');
            setCompareList([]); // Mutual exclusivity
            updateDashboard(val, '', '', []);
        } else if (type === 'state') {
            setState(val);
            setCity('');
            setCompareList([]);
            updateDashboard(country, val, '', []);
        } else if (type === 'city') {
            setCity(val);
            setCompareList([]);
            updateDashboard(country, state, val, []);
        }
    };

    // Search Handlers (Direct Navigation)
    const handleDirectSearch = (school: any) => {
        router.push(`/school/${school.id}`);
    };

    // Compare Handlers
    const searchSchoolForCompare = async (val: string) => {
        setSearchTerm(val);

        try {
            // Compare searches across ALL locations
            const res = await fetch(`/api/suggest?type=school&q=${encodeURIComponent(val)}`);
            const data = await res.json();
            setSchoolSuggestions(Array.isArray(data) ? data : []);
        } catch (e) {
            console.error(e);
        }
    };

    const addSchoolToCompare = (school: any) => {
        if (!compareList.find(s => s.id === school.id)) {
            const newList = [...compareList, { id: school.id, name: school.name }];
            setCompareList(newList);
            // Clear location filters on UI to show "Compare Mode"
            setCountry(''); setState(''); setCity('');
            updateDashboard('', '', '', newList);
        }
        setSearchTerm('');
        setSchoolSuggestions([]);
    };

    const removeSchoolFromCompare = (id: string) => {
        const newList = compareList.filter(s => s.id !== id);
        setCompareList(newList);
        // If list becomes empty, DO NOT automatically restore old filters, just show empty browse
        // or effectively "All"
        updateDashboard(country, state, city, newList);
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 mb-8">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* 1. Browse Section (Larger Share) */}
                <div className={`lg:col-span-5 transition-opacity duration-300 ${compareList.length > 0 ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="flex items-center space-x-2 mb-4 text-indigo-600">
                        <Globe className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Browse by Location</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <AutocompleteInput
                                label="Country"
                                placeholder="E.g. United States"
                                type="country"
                                value={country}
                                onChange={setCountry}
                                onSelect={(val: string) => handleLocationSelect('country', val)}
                                icon={Globe}
                            />
                        </div>
                        <AutocompleteInput
                            label="Region"
                            placeholder="State/Region"
                            type="state"
                            contextParams={{ country }}
                            value={state}
                            onChange={setState}
                            onSelect={(val: string) => handleLocationSelect('state', val)}
                            icon={Map}
                        />
                        <AutocompleteInput
                            label="City"
                            placeholder="City"
                            type="city"
                            contextParams={{ country, state }}
                            value={city}
                            onChange={setCity}
                            onSelect={(val: string) => handleLocationSelect('city', val)}
                            icon={MapPin}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:flex lg:col-span-1 justify-center relative">
                    <div className="h-full w-px bg-slate-200 dark:bg-slate-700 absolute"></div>
                    <span className="bg-white dark:bg-slate-900 py-2 px-1 text-xs text-slate-400 font-bold uppercase z-10 self-center">OR</span>
                </div>

                {/* 2. Direct Search Section */}
                <div className={`lg:col-span-3 transition-opacity duration-300 ${compareList.length > 0 ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
                    <div className="flex items-center space-x-2 mb-4 text-purple-600">
                        <Search className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Find Institution</h3>
                    </div>

                    <div className="relative z-20"> {/* Higher Z-index for dropdown */}
                        <AutocompleteInput
                            label="Search by Name"
                            placeholder="Type name..."
                            type="school"
                            contextParams={{ country }} // Respect selected country if any? Optional.
                            value={directSearchTerm}
                            onChange={setDirectSearchTerm}
                            onSelect={(val: any) => handleDirectSearch(val)} // Note: Autocomplete needs to pass object for school!
                            autoFocus={autoFocusSearch}
                        />
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden lg:flex lg:col-span-1 justify-center relative">
                    <div className="h-full w-px bg-slate-200 dark:bg-slate-700 absolute"></div>
                    <span className="bg-white dark:bg-slate-900 py-2 px-1 text-xs text-slate-400 font-bold uppercase z-10 self-center">OR</span>
                </div>

                {/* 3. Compare Section */}
                <div className="lg:col-span-2">
                    <div className="flex items-center space-x-2 mb-4 text-pink-600">
                        <BarChart2 className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-wide">Compare</h3>
                    </div>

                    <div className="relative">
                        <Input
                            placeholder="Type to add..."
                            value={searchTerm}
                            onChange={(e) => searchSchoolForCompare(e.target.value)}
                            onFocus={() => searchSchoolForCompare(searchTerm)} // Trigger on focus
                            className="h-10 text-sm"
                        />
                        {/* Suggestions Dropdown */}
                        {schoolSuggestions.length > 0 && (
                            <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-950 rounded-md shadow-lg border border-slate-200 max-h-60 overflow-y-auto right-0 min-w-[200px]">
                                {schoolSuggestions.map((s) => (
                                    <div
                                        key={s.id}
                                        className="px-4 py-2 hover:bg-pink-50 dark:hover:bg-pink-900/20 cursor-pointer text-sm flex justify-between"
                                        onClick={() => addSchoolToCompare(s)}
                                    >
                                        <span className="truncate pr-2">{s.name}</span>
                                        <Plus className="w-4 h-4 text-slate-400 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Compare Tags */}
                    <div className="flex flex-wrap gap-2 mt-3">
                        {compareList.map((item) => (
                            <div key={item.id} className="flex items-center bg-pink-50 border border-pink-200 text-pink-700 px-2 py-1 rounded-full text-xs font-medium">
                                <span className="truncate max-w-[80px]">{item.name}</span>
                                <button onClick={() => removeSchoolFromCompare(item.id)} className="ml-1 hover:text-pink-900">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}
