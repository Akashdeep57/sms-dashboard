/**
 * Dashboard Page — SMS Management System
 * Main orchestration component combining all views
 */
import React, { useState } from 'react';
import {
    Header, Filters, SMSTable, SMSMap, SMSCharts, SMSTimeline,
} from '../components';
import { RecordDetailPanel } from '../components/RecordDetailPanel';
import { useSMSData } from '../hooks/useSMSData';
import { SMSRecord, SMSFilter, ViewMode } from '../types/sms';
import { List, Map, BarChart3, Clock, AlertCircle } from 'lucide-react';

export const Dashboard: React.FC = () => {
    const {
        records, frequencyData, dashboardStats, timelineData,
        loading, error, fetchRecords, fetchFrequencyData,
        fetchDashboardStats, fetchTimeline, recordCount,
    } = useSMSData();

    const [viewMode, setViewMode] = useState<ViewMode>('table');
    const [selectedRecord, setSelectedRecord] = useState<SMSRecord | null>(null);

    const handleFilterChange = async (filters: SMSFilter) => {
        await fetchRecords(filters);
    };

    const handleClearFilters = async () => {
        await fetchRecords();
        await fetchFrequencyData();
        await fetchDashboardStats();
        await fetchTimeline();
    };

    const handleGroupByChange = async (groupBy: string) => {
        await fetchTimeline(groupBy);
    };

    const viewBtnClass = (mode: ViewMode) =>
        `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${viewMode === mode
            ? 'bg-indigo-600 text-white shadow-sm'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header recordCount={recordCount} stats={dashboardStats} />

            <div className="max-w-7xl mx-auto px-4 py-6 space-y-5">

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                        <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-sm">API Connection Error</p>
                            <p className="text-sm text-red-600">{error} — showing demo data.</p>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <Filters
                    onFilterChange={handleFilterChange}
                    onClearFilters={handleClearFilters}
                    isLoading={loading}
                />

                {/* View selector + record count pill */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-xl shadow-sm border border-gray-100 px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setViewMode('table')} className={viewBtnClass('table')}>
                            <List size={15} /> Table
                        </button>
                        <button onClick={() => setViewMode('map')} className={viewBtnClass('map')}>
                            <Map size={15} /> Map
                        </button>
                        <button onClick={() => setViewMode('chart')} className={viewBtnClass('chart')}>
                            <BarChart3 size={15} /> Analytics
                        </button>
                        <button onClick={() => setViewMode('timeline')} className={viewBtnClass('timeline')}>
                            <Clock size={15} /> Timeline
                        </button>
                    </div>
                    <div className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full font-medium">
                        {records.length.toLocaleString()} records shown
                    </div>
                </div>

                {/* Main content area — record detail panel on the right when selected */}
                <div className={`flex gap-5 items-start ${selectedRecord ? 'flex-col lg:flex-row' : ''}`}>
                    <div className={selectedRecord ? 'flex-1 min-w-0' : 'w-full'}>
                        {viewMode === 'table' && (
                            <SMSTable
                                records={records}
                                isLoading={loading}
                                onRecordSelect={setSelectedRecord}
                            />
                        )}
                        {viewMode === 'map' && (
                            <SMSMap records={records} onRecordSelect={setSelectedRecord} />
                        )}
                        {viewMode === 'chart' && (
                            <SMSCharts
                                frequencyData={frequencyData}
                                stats={dashboardStats}
                                isLoading={loading}
                            />
                        )}
                        {viewMode === 'timeline' && (
                            <SMSTimeline
                                data={timelineData}
                                isLoading={loading}
                                onGroupByChange={handleGroupByChange}
                            />
                        )}
                    </div>

                    {/* Detail panel */}
                    {selectedRecord && (
                        <div className="w-full lg:w-80 flex-shrink-0">
                            <RecordDetailPanel
                                record={selectedRecord}
                                onClose={() => setSelectedRecord(null)}
                            />
                        </div>
                    )}
                </div>

                {/* Footer stats bar */}
                {records.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            {
                                label: 'Showing Records',
                                value: records.length,
                                color: 'text-indigo-600',
                                bg: 'bg-white',
                            },
                            {
                                label: 'Delivered',
                                value: records.filter(r => r.status === 'Delivered').length,
                                color: 'text-green-600',
                                bg: 'bg-white',
                            },
                            {
                                label: 'Failed',
                                value: records.filter(r => r.status === 'Failed').length,
                                color: 'text-red-500',
                                bg: 'bg-white',
                            },
                            {
                                label: 'Unique Numbers',
                                value: new Set([...records.map(r => r.sender), ...records.map(r => r.receiver)]).size,
                                color: 'text-purple-600',
                                bg: 'bg-white',
                            },
                        ].map(stat => (
                            <div key={stat.label} className={`${stat.bg} rounded-xl shadow-sm border border-gray-100 p-4`}>
                                <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                                <p className={`text-2xl font-bold mt-1 ${stat.color}`}>{stat.value.toLocaleString()}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
