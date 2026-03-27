/**
 * SMSMap Component
 * Visualizes SMS records on a Leaflet map with sender/receiver markers
 */
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, useMap } from 'react-leaflet';
import { LatLngExpression } from 'leaflet';
import { SMSRecord } from '../types/sms';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_COLORS: Record<string, string> = {
    Delivered: '#22c55e',
    Sent: '#3b82f6',
    Received: '#8b5cf6',
    Pending: '#f59e0b',
    Failed: '#ef4444',
    Unknown: '#9ca3af',
};

interface SMSMapProps {
    records: SMSRecord[];
    onRecordSelect?: (record: SMSRecord) => void;
}

const MapFitBounds: React.FC<{ records: SMSRecord[] }> = ({ records }) => {
    const map = useMap();
    useEffect(() => {
        const valid = records.filter(r => r.location?.lat && r.location?.lng);
        if (valid.length === 0) return;
        const points: LatLngExpression[] = valid.map(r => [r.location.lat!, r.location.lng!]);
        if (points.length > 0) {
            map.fitBounds(L.latLngBounds(points), { padding: [40, 40] });
        }
    }, [records, map]);
    return null;
};

export const SMSMap: React.FC<SMSMapProps> = ({ records, onRecordSelect }) => {
    // Default center: India
    const defaultCenter: LatLngExpression = [22.5937, 78.9629];
    const validRecords = records.filter(r => r.location?.lat && r.location?.lng);

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleString('en-IN'); }
        catch { return iso; }
    };

    if (validRecords.length === 0) {
        return (
            <div className="flex justify-center items-center h-96 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                <div className="text-center">
                    <p className="text-gray-400 font-medium">No location data to display</p>
                    <p className="text-gray-300 text-sm mt-1">Try adjusting your filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl overflow-hidden shadow-md border border-gray-100">
            {/* Legend */}
            <div className="bg-white px-4 py-3 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">Status:</span>
                {Object.entries(STATUS_COLORS).map(([status, color]) => (
                    <div key={status} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: color }} />
                        <span className="text-xs text-gray-600">{status}</span>
                    </div>
                ))}
                <span className="text-xs text-gray-400 ml-auto">{validRecords.length} locations plotted</span>
            </div>

            <MapContainer
                center={defaultCenter}
                zoom={5}
                style={{ width: '100%', height: '520px' }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <MapFitBounds records={validRecords} />

                {validRecords.map((rec, idx) => {
                    const pos: LatLngExpression = [rec.location.lat!, rec.location.lng!];
                    const color = STATUS_COLORS[rec.status] || STATUS_COLORS.Unknown;

                    return (
                        <CircleMarker
                            key={rec.id || idx}
                            center={pos}
                            radius={7}
                            pathOptions={{
                                fillColor: color,
                                fillOpacity: 0.85,
                                color: '#fff',
                                weight: 2,
                            }}
                            eventHandlers={{ click: () => onRecordSelect?.(rec) }}
                        >
                            <Popup maxWidth={280}>
                                <div className="text-sm p-1">
                                    <div className="font-bold mb-2 text-gray-800 border-b pb-1">
                                        SMS Record
                                    </div>
                                    <div
                                        className="inline-block text-xs px-2 py-0.5 rounded-full font-semibold mb-2"
                                        style={{ backgroundColor: color + '22', color }}
                                    >
                                        {rec.status}
                                    </div>
                                    <table className="w-full text-xs text-gray-600">
                                        <tbody>
                                            <tr><td className="font-medium pr-2 py-0.5">From</td><td className="font-mono">{rec.sender}</td></tr>
                                            <tr><td className="font-medium pr-2 py-0.5">To</td><td className="font-mono">{rec.receiver}</td></tr>
                                            <tr><td className="font-medium pr-2 py-0.5">Time</td><td>{formatDate(rec.timestamp)}</td></tr>
                                            <tr><td className="font-medium pr-2 py-0.5">Operator</td><td>{rec.operator} / {rec.network}</td></tr>
                                            <tr><td className="font-medium pr-2 py-0.5">Place</td><td>{rec.place}</td></tr>
                                            {rec.target && <tr><td className="font-medium pr-2 py-0.5">Target</td><td>{rec.target}</td></tr>}
                                            {rec.location.city && <tr><td className="font-medium pr-2 py-0.5">City</td><td>{rec.location.city}</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </Popup>
                        </CircleMarker>
                    );
                })}
            </MapContainer>
        </div>
    );
};
