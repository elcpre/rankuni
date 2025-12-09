
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SchoolLocation {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null; // Added country to interface
}

interface SchoolMapProps {
    schools: SchoolLocation[];
}

export default function SchoolMap({ schools }: SchoolMapProps) {
    // Default center (Atlantic Ocean to view US/UK/FR broadly) or dynamic
    const defaultCenter: [number, number] = [40, -40];
    const [center, setCenter] = useState<[number, number]>(defaultCenter);
    const [zoom, setZoom] = useState(3);

    // Auto-center based on schools
    useEffect(() => {
        if (schools.length > 0) {
            // Very basic centroid
            const latSum = schools.reduce((sum, s) => sum + s.latitude, 0);
            const lngSum = schools.reduce((sum, s) => sum + s.longitude, 0);
            setCenter([latSum / schools.length, lngSum / schools.length]);

            // Adjust zoom heuristic
            if (schools.length === 1) {
                // If single school, zoom in close
                setCenter([schools[0].latitude, schools[0].longitude]);
                setZoom(13);
            } else {
                // Check country consistency
                const countries = new Set(schools.map(s => s.country));
                if (countries.size === 1) {
                    if (countries.has('UK')) { setCenter([54, -2]); setZoom(5); }
                    else if (countries.has('FR')) { setCenter([46, 2]); setZoom(5); }
                    else if (countries.has('US')) { setCenter([39, -98]); setZoom(4); }
                    else { setZoom(3); }
                } else {
                    setZoom(3);
                }
            }
        }
    }, [schools]);

    if (!schools || schools.length === 0) {
        return (
            <Card className="shadow-md h-[500px]">
                <CardHeader>
                    <CardTitle>School Locations</CardTitle>
                    <CardDescription>Geographic distribution</CardDescription>
                </CardHeader>
                <CardContent className="h-full flex items-center justify-center text-slate-500">
                    No location data available.
                </CardContent>
            </Card>
        );
    }

    function MapController({ center, zoom }: { center: [number, number], zoom: number }) {
        const map = useMap();
        useEffect(() => {
            map.setView(center, zoom);
        }, [center, zoom, map]);
        return null;
    }

    return (
        <Card className="shadow-md h-[500px] flex flex-col">
            <CardHeader className="pb-2">
                <CardTitle>School Locations</CardTitle>
                <CardDescription>Interactive map of matching schools ({schools.length})</CardDescription>
            </CardHeader>
            <div className="flex-1 min-h-0 w-full relative">
                {/* z-0 to ensure it doesn't overlay dropdowns/modals if any */}
                <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                    <MapController center={center} zoom={zoom} />
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {schools.map(school => (
                        <Marker
                            key={school.id}
                            position={[school.latitude, school.longitude]}
                        >
                            <Popup>
                                <div className="text-sm">
                                    <div className="font-bold text-indigo-700">{school.name}</div>
                                    <div className="mb-1">{school.city}, {school.state}</div>
                                    <div className="text-xs text-slate-500 mb-2">{school.type}</div>
                                    <Link href={`/school/${school.id}`} className="text-blue-500 underline text-xs">
                                        View Details
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </Card>
    );
}
