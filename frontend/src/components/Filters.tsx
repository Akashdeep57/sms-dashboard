/**
 * Filters Component - SMS Dashboard
 * Full filter panel: number, date range, status, operator, network, location radius
 */
import React, { useState } from 'react';
import { SMSFilter } from '../types/sms';
import { Search, MapPin, X, ChevronDown, ChevronUp, SlidersHorizontal } from 'lucide-react';

interface FiltersProps {
    onFilterChange: (filters: SMSFilter) => void;
    onClearFilters: () => void;
    isLoading?: boolean;
}

const SMS_STATUSES = ['Sent', 'Delivered', 'Received', 'Pending', 'Failed'];
const OPERATORS = ['Airtel', 'Jio', 'BSNL', 'Vodafone'];
const NETWORKS = ['3G', '4G', 'LTE', '5G'];

export const Filters: React.FC<FiltersProps> = ({
    onFilterChange,
    onClearFilters,
    isLoading = false,
}) => {
    const [number, setNumber] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [status, setStatus] = useState('');
    const [operator, setOperator] = useState('');
    const [network, setNetwork] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [radius, setRadius] = useState('5');
    const [showLocation, setShowLocation] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);

    const activeFilterCount = [number, startDate, endDate, status, operator, network, lat && lng ? 'loc' : ''].filter(Boolean).length;

    const handleApply = () => {
        const filters: SMSFilter = {};
        if (number) filters.number = number;
        if (startDate) filters.start_date = new Date(startDate).toISOString();
        if (endDate) filters.end_date = new Date(endDate).toISOString();
        if (status) filters.status = status;
        if (operator) filters.operator = operator;
        if (network) filters.network = network;
        if (lat && lng) {
            filters.lat = parseFloat(lat);
            filters.lng = parseFloat(lng);
            filters.radius = parseFloat(radius);
        }
        onFilterChange(filters);
    };

    const handleClear = () => {
        setNumber(''); setStartDate(''); setEndDate('');
        setStatus(''); setOperator(''); setNetwork('');
        setLat(''); setLng(''); setRadius('5');
        setShowLocation(false);
        onClearFilters();
    };

    const selectClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white text-sm";
    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm";

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100">
            {/* Header bar */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-indigo-600" />
                    <span className="font-semibold text-gray-800">Search & Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                            {activeFilterCount} active
                        </span>
                    )}
                </div>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                    {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showAdvanced ? 'Collapse' : 'Expand'}
                </button>
            </div>

            <div className="px-5 py-4 space-y-4">
                {/* Row 1 — always visible */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Phone number */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Phone Number</label>
                        <div className="relative">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={number}
                                onChange={e => setNumber(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleApply()}
                                placeholder="e.g. 9966290000"
                                className={inputClass + ' pl-9'}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">SMS Status</label>
                        <select value={status} onChange={e => setStatus(e.target.value)} className={selectClass}>
                            <option value="">All Statuses</option>
                            {SMS_STATUSES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>

                    {/* Operator */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Operator</label>
                        <select value={operator} onChange={e => setOperator(e.target.value)} className={selectClass}>
                            <option value="">All Operators</option>
                            {OPERATORS.map(o => (
                                <option key={o} value={o}>{o}</option>
                            ))}
                        </select>
                    </div>

                    {/* Network */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Network</label>
                        <select value={network} onChange={e => setNetwork(e.target.value)} className={selectClass}>
                            <option value="">All Networks</option>
                            {NETWORKS.map(n => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Row 2 — advanced / expanded */}
                {showAdvanced && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-gray-50">
                        {/* Start Date */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">Start Date</label>
                            <input
                                type="datetime-local"
                                value={startDate}
                                onChange={e => setStartDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* End Date */}
                        <div>
                            <label className="block text-xs font-semibold text-gray-600 mb-1 uppercase tracking-wide">End Date</label>
                            <input
                                type="datetime-local"
                                value={endDate}
                                onChange={e => setEndDate(e.target.value)}
                                className={inputClass}
                            />
                        </div>

                        {/* Location toggle */}
                        <div className="flex items-end">
                            <button
                                onClick={() => setShowLocation(!showLocation)}
                                className={`w-full px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 border transition-colors ${showLocation
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white text-indigo-600 border-indigo-300 hover:bg-indigo-50'
                                    }`}
                            >
                                <MapPin size={15} />
                                {showLocation ? 'Hide Location' : 'Location Radius'}
                            </button>
                        </div>
                    </div>
                )}

                {/* Location sub-panel */}
                {showLocation && showAdvanced && (
                    <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-100">
                        <p className="text-xs font-semibold text-indigo-700 mb-3 flex items-center gap-1">
                            <MapPin size={13} /> Search by Location Radius
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Latitude</label>
                                <input
                                    type="number" step="0.0001" value={lat}
                                    onChange={e => setLat(e.target.value)}
                                    placeholder="28.6139"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Longitude</label>
                                <input
                                    type="number" step="0.0001" value={lng}
                                    onChange={e => setLng(e.target.value)}
                                    placeholder="77.2090"
                                    className={inputClass}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Radius (km)</label>
                                <input
                                    type="number" step="0.5" min="0.5" value={radius}
                                    onChange={e => setRadius(e.target.value)}
                                    placeholder="5"
                                    className={inputClass}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={handleApply}
                        disabled={isLoading}
                        className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 font-medium text-sm flex items-center gap-2"
                    >
                        <Search size={15} />
                        {isLoading ? 'Searching...' : 'Apply Filters'}
                    </button>
                    {activeFilterCount > 0 && (
                        <button
                            onClick={handleClear}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors text-sm flex items-center gap-2"
                        >
                            <X size={15} />
                            Clear All
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
