/**
 * Custom hook for fetching SMS data from API with dummy fallback
 */
import { useState, useCallback, useEffect } from 'react';
import {
    SMSRecord,
    SMSFilter,
    SMSFrequencyData,
    DashboardStats,
    TimelineDataPoint,
} from '../types/sms';
import {
    DUMMY_SMS_RECORDS,
    DUMMY_DASHBOARD_STATS,
    DUMMY_TIMELINE,
    buildDummyFrequencyData,
} from '../data/dummySms';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

interface UseSMSDataReturn {
    records: SMSRecord[];
    frequencyData: SMSFrequencyData[];
    dashboardStats: DashboardStats | null;
    timelineData: TimelineDataPoint[];
    loading: boolean;
    error: string | null;
    fetchRecords: (filters?: SMSFilter) => Promise<void>;
    fetchFrequencyData: () => Promise<void>;
    fetchDashboardStats: () => Promise<void>;
    fetchTimeline: (groupBy?: string) => Promise<void>;
    recordCount: number;
}

export const useSMSData = (): UseSMSDataReturn => {
    const [records, setRecords] = useState<SMSRecord[]>([]);
    const [frequencyData, setFrequencyData] = useState<SMSFrequencyData[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [timelineData, setTimelineData] = useState<TimelineDataPoint[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recordCount, setRecordCount] = useState(0);

    const useDummyData = useCallback(() => {
        setRecords(DUMMY_SMS_RECORDS);
        setFrequencyData(buildDummyFrequencyData(DUMMY_SMS_RECORDS));
        setDashboardStats(DUMMY_DASHBOARD_STATS);
        setTimelineData(DUMMY_TIMELINE);
        setRecordCount(DUMMY_DASHBOARD_STATS.total_records);
        setError(null);
    }, []);

    const fetchRecords = useCallback(async (filters?: SMSFilter) => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (filters?.number) params.append('number', filters.number);
            if (filters?.start_date) params.append('start_date', filters.start_date);
            if (filters?.end_date) params.append('end_date', filters.end_date);
            if (filters?.status) params.append('status', filters.status);
            if (filters?.operator) params.append('operator', filters.operator);
            if (filters?.network) params.append('network', filters.network);
            if (filters?.lat !== undefined) params.append('lat', filters.lat.toString());
            if (filters?.lng !== undefined) params.append('lng', filters.lng.toString());
            if (filters?.radius !== undefined) params.append('radius', filters.radius.toString());

            const url = `${API_URL}/api/sms${params.toString() ? '?' + params.toString() : ''}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`API Error: ${res.statusText}`);

            const data: SMSRecord[] = await res.json();
            if (data.length === 0) {
                useDummyData();
                return;
            }
            setRecords(data);
        } catch {
            useDummyData();
        } finally {
            setLoading(false);
        }
    }, [useDummyData]);

    const fetchFrequencyData = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/sms/stats/frequency?limit=10`);
            if (!res.ok) throw new Error('API Error');
            const data: SMSFrequencyData[] = await res.json();
            setFrequencyData(data.length > 0 ? data : buildDummyFrequencyData(DUMMY_SMS_RECORDS));
        } catch {
            setFrequencyData(buildDummyFrequencyData(DUMMY_SMS_RECORDS));
        }
    }, []);

    const fetchDashboardStats = useCallback(async () => {
        try {
            const res = await fetch(`${API_URL}/api/sms/stats/dashboard`);
            if (!res.ok) throw new Error('API Error');
            const data: DashboardStats = await res.json();
            setDashboardStats(data);
            setRecordCount(data.total_records);
        } catch {
            setDashboardStats(DUMMY_DASHBOARD_STATS);
            setRecordCount(DUMMY_DASHBOARD_STATS.total_records);
        }
    }, []);

    const fetchTimeline = useCallback(async (groupBy: string = 'day') => {
        try {
            const res = await fetch(`${API_URL}/api/sms/stats/timeline?group_by=${groupBy}`);
            if (!res.ok) throw new Error('API Error');
            const data: TimelineDataPoint[] = await res.json();
            setTimelineData(data.length > 0 ? data : DUMMY_TIMELINE);
        } catch {
            setTimelineData(DUMMY_TIMELINE);
        }
    }, []);

    // Initial data load
    useEffect(() => {
        fetchRecords();
        fetchFrequencyData();
        fetchDashboardStats();
        fetchTimeline();
    }, [fetchRecords, fetchFrequencyData, fetchDashboardStats, fetchTimeline]);

    return {
        records,
        frequencyData,
        dashboardStats,
        timelineData,
        loading,
        error,
        fetchRecords,
        fetchFrequencyData,
        fetchDashboardStats,
        fetchTimeline,
        recordCount,
    };
};
