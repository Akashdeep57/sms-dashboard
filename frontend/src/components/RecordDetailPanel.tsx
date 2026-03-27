/**
 * RecordDetailPanel — slide-in detail view for a selected SMS record
 */
import React from 'react';
import { SMSRecord } from '../types/sms';
import { X, MessageSquare, MapPin, Smartphone, Wifi, Shield, User, Hash } from 'lucide-react';

interface RecordDetailPanelProps {
    record: SMSRecord;
    onClose: () => void;
}

const STATUS_STYLES: Record<string, string> = {
    Delivered: 'bg-green-100 text-green-700',
    Sent: 'bg-blue-100 text-blue-700',
    Received: 'bg-purple-100 text-purple-700',
    Pending: 'bg-yellow-100 text-yellow-700',
    Failed: 'bg-red-100 text-red-700',
};

const Row = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
    if (value === undefined || value === null || value === '') return null;
    return (
        <div className="flex justify-between py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-xs text-gray-500 font-medium">{label}</span>
            <span className="text-xs text-gray-800 font-semibold text-right max-w-[60%] break-all">
                {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
            </span>
        </div>
    );
};

export const RecordDetailPanel: React.FC<RecordDetailPanelProps> = ({ record, onClose }) => {
    const formatDate = (iso: string) => {
        try { return new Date(iso).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'medium' }); }
        catch { return iso; }
    };

    return (
        <div className="bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                    <MessageSquare size={18} />
                    <span className="font-bold text-sm">SMS Record Detail</span>
                </div>
                <button onClick={onClose} className="text-white hover:text-indigo-200 transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
                {/* Status badge */}
                <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[record.status] || 'bg-gray-100 text-gray-600'}`}>
                        {record.status}
                    </span>
                    <span className="text-xs text-gray-400">{formatDate(record.timestamp)}</span>
                </div>

                {/* Participants */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <MessageSquare size={12} /> Participants
                    </p>
                    <Row label="Sender" value={record.sender} />
                    <Row label="Receiver" value={record.receiver} />
                    <Row label="MSISDN" value={record.msisdn} />
                    {record.target && <Row label="Target Name" value={record.target} />}
                    {record.group && <Row label="Group" value={record.group} />}
                </div>

                {/* Network */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <Wifi size={12} /> Network Info
                    </p>
                    <Row label="Operator" value={record.operator} />
                    <Row label="Network" value={record.network} />
                    <Row label="RAN" value={record.network_info?.ran} />
                    <Row label="Band" value={record.network_info?.band} />
                    <Row label="LAC/TAC" value={record.network_info?.lac_tac} />
                    <Row label="Rx Level" value={record.network_info?.rx_level != null ? `${record.network_info.rx_level} dBm` : null} />
                </div>

                {/* Location */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <MapPin size={12} /> Location
                    </p>
                    <Row label="Place" value={record.place} />
                    <Row label="City" value={record.location?.city} />
                    <Row label="Region" value={record.location?.region} />
                    <Row label="Country" value={record.country} />
                    {record.location?.lat && <Row label="Coordinates" value={`${record.location.lat?.toFixed(5)}, ${record.location.lng?.toFixed(5)}`} />}
                </div>

                {/* Device */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                        <Smartphone size={12} /> Device & Identity
                    </p>
                    <Row label="Model" value={record.model} />
                    <Row label="IMSI" value={record.imsi} />
                    <Row label="IMEI" value={record.imei} />
                    <Row label="Fake/Spoofed" value={record.fake} />
                </div>

                {/* Encryption */}
                {record.network_info?.encryption && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Shield size={12} /> Encryption
                        </p>
                        <Row label="A5/1" value={record.network_info.encryption.a5_1} />
                        <Row label="A5/2" value={record.network_info.encryption.a5_2} />
                        <Row label="A5/3" value={record.network_info.encryption.a5_3} />
                    </div>
                )}

                {/* Content */}
                {(record.content || record.description) && (
                    <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1">
                            <Hash size={12} /> Content & Notes
                        </p>
                        {record.content && <Row label="Content" value={record.content} />}
                        {record.description && <Row label="Description" value={record.description} />}
                    </div>
                )}
            </div>
        </div>
    );
};
