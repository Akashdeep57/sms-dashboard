/**
 * SMSTable Component
 * Sortable, paginated table for SMS records with status badges
 */
import React, { useState, useMemo } from 'react';
import { SMSRecord, SMSStatus } from '../types/sms';
import {
    ChevronUp, ChevronDown, MessageSquare, Clock,
    MapPin, Smartphone, Wifi, User
} from 'lucide-react';

interface SMSTableProps {
    records: SMSRecord[];
    isLoading?: boolean;
    onRecordSelect?: (record: SMSRecord) => void;
}

const STATUS_STYLES: Record<SMSStatus, string> = {
    Delivered: 'bg-green-100 text-green-700 border-green-200',
    Sent: 'bg-blue-100 text-blue-700 border-blue-200',
    Received: 'bg-purple-100 text-purple-700 border-purple-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Failed: 'bg-red-100 text-red-700 border-red-200',
    Unknown: 'bg-gray-100 text-gray-600 border-gray-200',
};

const OPERATOR_COLORS: Record<string, string> = {
    Airtel: 'text-red-600',
    Jio: 'text-blue-600',
    BSNL: 'text-green-700',
    Vodafone: 'text-red-500',
};

type SortKey = 'sender' | 'receiver' | 'timestamp' | 'status' | 'operator' | 'network' | 'place';

export const SMSTable: React.FC<SMSTableProps> = ({
    records,
    isLoading = false,
    onRecordSelect,
}) => {
    const [sortKey, setSortKey] = useState<SortKey>('timestamp');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const sorted = useMemo(() => {
        return [...records].sort((a, b) => {
            const av = a[sortKey] ?? '';
            const bv = b[sortKey] ?? '';
            if (typeof av === 'string' && typeof bv === 'string') {
                return sortOrder === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
            }
            return 0;
        });
    }, [records, sortKey, sortOrder]);

    const paginated = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sorted.slice(start, start + itemsPerPage);
    }, [sorted, currentPage]);

    const totalPages = Math.ceil(sorted.length / itemsPerPage);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortOrder('asc'); }
        setCurrentPage(1);
    };

    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' }); }
        catch { return iso; }
    };

    const SortIcon = ({ col }: { col: SortKey }) => {
        if (sortKey !== col) return <span className="w-3 inline-block" />;
        return sortOrder === 'asc'
            ? <ChevronUp size={13} className="inline text-indigo-500" />
            : <ChevronDown size={13} className="inline text-indigo-500" />;
    };

    const ThBtn = ({ col, children }: { col: SortKey; children: React.ReactNode }) => (
        <th className="px-4 py-3 text-left">
            <button
                onClick={() => handleSort(col)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase tracking-wide hover:text-indigo-600 transition-colors"
            >
                {children}
                <SortIcon col={col} />
            </button>
        </th>
    );

    if (isLoading) return (
        <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
        </div>
    );

    if (records.length === 0) return (
        <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No SMS records found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
        </div>
    );

    return (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <ThBtn col="sender"><MessageSquare size={13} /> Sender</ThBtn>
                            <ThBtn col="receiver"><MessageSquare size={13} /> Receiver</ThBtn>
                            <ThBtn col="timestamp"><Clock size={13} /> Timestamp</ThBtn>
                            <ThBtn col="status">Status</ThBtn>
                            <ThBtn col="operator"><Wifi size={13} /> Operator</ThBtn>
                            <ThBtn col="network">Network</ThBtn>
                            <ThBtn col="place"><MapPin size={13} /> Place</ThBtn>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                <div className="flex items-center gap-1"><User size={13} /> Target</div>
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">
                                <div className="flex items-center gap-1"><Smartphone size={13} /> Device</div>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {paginated.map((rec, idx) => (
                            <tr
                                key={rec.id || idx}
                                onClick={() => onRecordSelect?.(rec)}
                                className="hover:bg-indigo-50 cursor-pointer transition-colors group"
                            >
                                <td className="px-4 py-3 font-mono text-indigo-700 font-medium text-xs">
                                    {rec.sender}
                                </td>
                                <td className="px-4 py-3 font-mono text-indigo-700 font-medium text-xs">
                                    {rec.receiver}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                                    {formatDate(rec.timestamp)}
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${STATUS_STYLES[rec.status as SMSStatus] || STATUS_STYLES.Unknown}`}>
                                        {rec.status}
                                    </span>
                                </td>
                                <td className={`px-4 py-3 font-semibold text-xs ${OPERATOR_COLORS[rec.operator] || 'text-gray-600'}`}>
                                    {rec.operator}
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded font-mono">
                                        {rec.network}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600 text-xs">
                                    <div className="flex items-center gap-1">
                                        <MapPin size={11} className="text-gray-400" />
                                        {rec.place}
                                    </div>
                                </td>
                                <td className="px-4 py-3 text-gray-700 text-xs font-medium">
                                    {rec.target || '—'}
                                </td>
                                <td className="px-4 py-3 text-gray-500 text-xs">
                                    {rec.model || '—'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <p className="text-xs text-gray-500">
                    Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, sorted.length)}</span> of <span className="font-semibold text-gray-700">{sorted.length}</span> records
                </p>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    >
                        ← Prev
                    </button>
                    {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-8 h-8 text-xs rounded-lg transition-colors ${currentPage === page
                                    ? 'bg-indigo-600 text-white font-bold'
                                    : 'bg-white border border-gray-200 hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-100 transition-colors"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
};
