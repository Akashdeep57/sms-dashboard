/**
 * Header Component - SMS Dashboard
 */
import React from 'react';
import { MessageSquare, Activity, Shield } from 'lucide-react';
import { DashboardStats } from '../types/sms';

interface HeaderProps {
    recordCount?: number;
    stats?: DashboardStats | null;
}

export const Header: React.FC<HeaderProps> = ({ recordCount = 0, stats }) => {
    const delivered = stats?.status_breakdown.find(s => s.status === 'Delivered')?.count ?? 0;
    const failed = stats?.status_breakdown.find(s => s.status === 'Failed')?.count ?? 0;
    const deliveryRate = recordCount > 0 ? ((delivered / recordCount) * 100).toFixed(1) : '0';

    return (
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 text-white shadow-xl">
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Title */}
                    <div className="flex items-center gap-3">
                        <div className="bg-white bg-opacity-20 p-3 rounded-xl">
                            <MessageSquare size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">SMS Dashboard</h1>
                            <p className="text-indigo-200 text-sm mt-0.5">SMS Record Management & Intelligence System</p>
                        </div>
                    </div>

                    {/* Stats pills */}
                    <div className="flex flex-wrap gap-3">
                        <div className="flex items-center gap-2 bg-white bg-opacity-15 backdrop-blur px-4 py-2 rounded-lg border border-white border-opacity-20">
                            <Activity size={18} className="text-indigo-200" />
                            <div>
                                <p className="text-xs text-indigo-200 leading-none">Total Records</p>
                                <p className="text-xl font-bold leading-tight">{recordCount.toLocaleString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white bg-opacity-15 backdrop-blur px-4 py-2 rounded-lg border border-white border-opacity-20">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
                            <div>
                                <p className="text-xs text-indigo-200 leading-none">Delivery Rate</p>
                                <p className="text-xl font-bold leading-tight">{deliveryRate}%</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white bg-opacity-15 backdrop-blur px-4 py-2 rounded-lg border border-white border-opacity-20">
                            <Shield size={18} className="text-red-300" />
                            <div>
                                <p className="text-xs text-indigo-200 leading-none">Failed</p>
                                <p className="text-xl font-bold leading-tight">{failed}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
