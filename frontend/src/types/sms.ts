/**
 * TypeScript types for SMS Dashboard
 */

export interface LocationPoint {
    lat: number | null;
    lng: number | null;
    city: string;
    region: string;
}

export interface EncryptionInfo {
    a5_1: boolean;
    a5_2: boolean;
    a5_3: boolean;
}

export interface NetworkInfo {
    ran: string;
    band: string;
    lac_tac: string;
    rx_level: number | null;
    encryption: EncryptionInfo;
}

export interface SMSRecord {
    id?: string;
    sender: string;
    receiver: string;
    msisdn: string;
    timestamp: string; // ISO format
    status: SMSStatus;
    content: string;
    description: string;
    target: string;
    group: string;
    operator: string;
    network: string;
    country: string;
    place: string;
    model: string;
    fake: boolean;
    location: LocationPoint;
    network_info: NetworkInfo;
    imsi: string;
    imei: string;
}

export type SMSStatus = 'Sent' | 'Delivered' | 'Received' | 'Pending' | 'Failed' | 'Unknown';

export interface SMSFilter {
    number?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    operator?: string;
    network?: string;
    lat?: number;
    lng?: number;
    radius?: number;
}

export interface SMSFrequencyData {
    number: string;
    sent_count: number;
    received_count: number;
    total_count: number;
    unique_contacts: number;
    operators: string[];
}

export interface StatusBreakdown {
    status: string;
    count: number;
}

export interface OperatorStats {
    operator: string;
    count: number;
    networks: string[];
}

export interface NetworkStats {
    network: string;
    count: number;
}

export interface DashboardStats {
    total_records: number;
    status_breakdown: StatusBreakdown[];
    operator_breakdown: OperatorStats[];
    network_breakdown: NetworkStats[];
    fake_count: number;
    date_range: { start: string | null; end: string | null };
}

export interface TimelineDataPoint {
    period: string;
    total: number;
    delivered: number;
    failed: number;
    sent: number;
    pending: number;
}

export type ViewMode = 'table' | 'map' | 'chart' | 'timeline';
