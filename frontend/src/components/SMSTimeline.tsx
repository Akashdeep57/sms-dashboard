/**
 * SMSTimeline Component
 * Visualizes SMS activity over time with grouping controls
 */
import React, { useState } from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar, Legend, Cell,
} from 'recharts';
import { TimelineDataPoint } from '../types/sms';
import { Clock, TrendingUp } from 'lucide-react';

interface SMSTimelineProps {
    data: TimelineDataPoint[];
    isLoading?: boolean;
    onGroupByChange?: (groupBy: string) => void;
}

const GROUP_OPTIONS = [
    { label: 'By Hour', value: 'hour' },
    { label: 'By Day', value: 'day' },
    { label: 'By Month', value: 'month' },
];

const STATUS_COLORS = {
    delivered: '#22c55e',
    sent: '#3b82f6',
    pending: '#f59e0b',
    failed: '#ef4444',
    total: '#6366f1',
};

const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
            <p className="font-bold text-gray-700 mb-2">{label}</p>
            {payload.map((p: any) => (
                <div key={p.dataKey} className="flex items-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-gray-500 capitalize">{p.dataKey}:</span>
                    <span className="font-semibold text-gray-800">{p.value}</span>
                </div>
            ))}
        </div>
    );
};

export const SMSTimeline: React.FC<SMSTimelineProps> = ({
    data,
    isLoading = false,
    onGroupByChange,
}) => {
    const [groupBy, setGroupBy] = useState('day');
    const [chartType, setChartType] = useState<'area' | 'bar'>('area');

    const handleGroupChange = (val: string) => {
        setGroupBy(val);
        onGroupByChange?.(val);
    };

    // Shorten period labels for display
    const chartData = data.map(d => ({
        ...d,
        label: groupBy === 'hour'
            ? d.period.slice(11, 16)  // HH:MM
            : groupBy === 'month'
                ? d.period.slice(0, 7)    // YYYY-MM
                : d.period.slice(5),       // MM-DD
    }));

    // Summary stats
    const totalSMS = data.reduce((s, d) => s + d.total, 0);
    const totalDelivered = data.reduce((s, d) => s + d.delivered, 0);
    const totalFailed = data.reduce((s, d) => s + d.failed, 0);
    const peakDay = data.reduce((max, d) => d.total > max.total ? d : max, data[0] ?? { period: '—', total: 0 });

    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    if (data.length === 0) return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
            <p className="text-gray-400">No timeline data available</p>
        </div>
    );

    return (
        <div className="space-y-5">
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total in Period', value: totalSMS, color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
                    { label: 'Delivered', value: totalDelivered, color: 'text-green-600 bg-green-50 border-green-100' },
                    { label: 'Failed', value: totalFailed, color: 'text-red-600 bg-red-50 border-red-100' },
                    { label: 'Peak Period', value: peakDay.total, color: 'text-purple-600 bg-purple-50 border-purple-100', sub: peakDay.period?.slice(0, 10) },
                ].map(s => (
                    <div key={s.label} className={`rounded-xl p-4 border ${s.color}`}>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                        <p className="text-2xl font-bold mt-1">{s.value}</p>
                        {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
                    </div>
                ))}
            </div>

            {/* Main area chart */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                    <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <TrendingUp size={16} className="text-indigo-500" />
                        SMS Activity Over Time
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* Group by toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {GROUP_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleGroupChange(opt.value)}
                                    className={`px-3 py-1 text-xs rounded-md transition-colors font-medium ${groupBy === opt.value
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                        {/* Chart type toggle */}
                        <div className="flex bg-gray-100 rounded-lg p-0.5">
                            {(['area', 'bar'] as const).map(t => (
                                <button
                                    key={t}
                                    onClick={() => setChartType(t)}
                                    className={`px-3 py-1 text-xs rounded-md capitalize transition-colors font-medium ${chartType === t
                                        ? 'bg-white text-indigo-700 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <ResponsiveContainer width="100%" height={300}>
                    {chartType === 'area' ? (
                        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                {Object.entries(STATUS_COLORS).map(([key, color]) => (
                                    <linearGradient key={key} id={`grad-${key}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={color} stopOpacity={0.25} />
                                        <stop offset="95%" stopColor={color} stopOpacity={0.03} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area type="monotone" dataKey="total" name="Total" stroke={STATUS_COLORS.total} fill={`url(#grad-total)`} strokeWidth={2} />
                            <Area type="monotone" dataKey="delivered" name="Delivered" stroke={STATUS_COLORS.delivered} fill={`url(#grad-delivered)`} strokeWidth={1.5} />
                            <Area type="monotone" dataKey="failed" name="Failed" stroke={STATUS_COLORS.failed} fill={`url(#grad-failed)`} strokeWidth={1.5} />
                        </AreaChart>
                    ) : (
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Bar dataKey="delivered" name="Delivered" stackId="a" fill={STATUS_COLORS.delivered} />
                            <Bar dataKey="sent" name="Sent" stackId="a" fill={STATUS_COLORS.sent} />
                            <Bar dataKey="pending" name="Pending" stackId="a" fill={STATUS_COLORS.pending} />
                            <Bar dataKey="failed" name="Failed" stackId="a" fill={STATUS_COLORS.failed} radius={[4, 4, 0, 0]} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Delivered vs Failed comparison */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-indigo-500" />
                    Delivered vs Failed Over Time
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="delivered" name="Delivered" fill={STATUS_COLORS.delivered} radius={[4, 4, 0, 0]} />
                        <Bar dataKey="failed" name="Failed" fill={STATUS_COLORS.failed} radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
