/**
 * SMSCharts Component
 * Analytics charts: status breakdown, operator stats, frequency, network distribution
 */
import React from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
    ResponsiveContainer, PieChart, Pie, Cell, RadarChart, Radar,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';
import { SMSFrequencyData, DashboardStats } from '../types/sms';
import { BarChart3, PieChart as PieIcon, Wifi, TrendingUp } from 'lucide-react';

interface SMSChartsProps {
    frequencyData: SMSFrequencyData[];
    stats: DashboardStats | null;
    isLoading?: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    Delivered: '#22c55e',
    Sent: '#3b82f6',
    Received: '#8b5cf6',
    Pending: '#f59e0b',
    Failed: '#ef4444',
};

const OPERATOR_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const NETWORK_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#22c55e'];

const StatCard = ({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) => (
    <div className={`rounded-xl p-4 border ${color}`}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold mt-1">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
);

export const SMSCharts: React.FC<SMSChartsProps> = ({ frequencyData, stats, isLoading = false }) => {
    if (isLoading) return (
        <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    if (!stats && frequencyData.length === 0) return (
        <div className="flex justify-center items-center h-64 bg-gray-50 rounded-xl">
            <p className="text-gray-400">No analytics data available</p>
        </div>
    );

    const total = stats?.total_records ?? 0;
    const delivered = stats?.status_breakdown.find(s => s.status === 'Delivered')?.count ?? 0;
    const failed = stats?.status_breakdown.find(s => s.status === 'Failed')?.count ?? 0;
    const deliveryRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : '0';
    const failRate = total > 0 ? ((failed / total) * 100).toFixed(1) : '0';

    // Frequency chart data
    const freqData = frequencyData.map(d => ({
        number: d.number.slice(-6),
        sent: d.sent_count,
        contacts: d.unique_contacts,
    }));

    // Radar data for operator comparison
    const radarData = (stats?.operator_breakdown ?? []).map(op => ({
        operator: op.operator,
        count: op.count,
        networks: op.networks?.length ?? 0,
    }));

    return (
        <div className="space-y-6">
            {/* KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Total SMS" value={total.toLocaleString()} color="bg-indigo-50 border-indigo-100 text-indigo-800" />
                <StatCard label="Delivery Rate" value={`${deliveryRate}%`} sub={`${delivered} delivered`} color="bg-green-50 border-green-100 text-green-800" />
                <StatCard label="Failure Rate" value={`${failRate}%`} sub={`${failed} failed`} color="bg-red-50 border-red-100 text-red-800" />
                <StatCard
                    label="Operators"
                    value={stats?.operator_breakdown.length ?? 0}
                    sub={stats?.network_breakdown.map(n => n.network).join(' · ')}
                    color="bg-purple-50 border-purple-100 text-purple-800"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Status Pie Chart */}
                {stats && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <PieIcon size={16} className="text-indigo-500" /> SMS Status Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={stats.status_breakdown}
                                    dataKey="count"
                                    nameKey="status"
                                    cx="50%" cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    label={({ status, percent }) => `${status} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {stats.status_breakdown.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.status] || '#9ca3af'} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(v: number) => [v, 'Count']} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 justify-center mt-2">
                            {stats.status_breakdown.map(s => (
                                <div key={s.status} className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] || '#9ca3af' }} />
                                    <span className="text-gray-600">{s.status} <span className="font-bold">{s.count}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Operator Bar Chart */}
                {stats && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <Wifi size={16} className="text-indigo-500" /> SMS by Operator
                        </h3>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats.operator_breakdown} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="operator" tick={{ fontSize: 12 }} />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" name="SMS Count" radius={[6, 6, 0, 0]}>
                                    {stats.operator_breakdown.map((_, i) => (
                                        <Cell key={i} fill={OPERATOR_COLORS[i % OPERATOR_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Senders Bar Chart */}
                {freqData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <TrendingUp size={16} className="text-indigo-500" /> Top Senders by Volume
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart
                                data={freqData}
                                layout="vertical"
                                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" tick={{ fontSize: 11 }} />
                                <YAxis dataKey="number" type="category" tick={{ fontSize: 11, fontFamily: 'monospace' }} width={75} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sent" name="Sent" fill="#6366f1" radius={[0, 4, 4, 0]} />
                                <Bar dataKey="contacts" name="Unique Contacts" fill="#10b981" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Network Radar / Donut */}
                {stats && (
                    <div className="bg-white rounded-xl shadow-md border border-gray-100 p-5">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            <BarChart3 size={16} className="text-indigo-500" /> Network Type Distribution
                        </h3>
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={stats.network_breakdown}
                                    dataKey="count"
                                    nameKey="network"
                                    cx="50%" cy="50%"
                                    outerRadius={100}
                                    paddingAngle={2}
                                    label={({ network, count }) => `${network}: ${count}`}
                                >
                                    {stats.network_breakdown.map((_, i) => (
                                        <Cell key={i} fill={NETWORK_COLORS[i % NETWORK_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex flex-wrap gap-3 justify-center mt-1">
                            {stats.network_breakdown.map((n, i) => (
                                <div key={n.network} className="flex items-center gap-1.5 text-xs">
                                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: NETWORK_COLORS[i % NETWORK_COLORS.length] }} />
                                    <span className="text-gray-600 font-mono">{n.network} <span className="font-bold">{n.count}</span></span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
