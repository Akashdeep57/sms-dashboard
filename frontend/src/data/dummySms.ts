import { SMSRecord, SMSFrequencyData, DashboardStats, TimelineDataPoint } from '../types/sms';

export const DUMMY_SMS_RECORDS: SMSRecord[] = [
    {
        id: 'dummy-1',
        sender: '9966290000',
        receiver: '9288130000',
        msisdn: '9358540000',
        timestamp: '2025-05-01T14:45:00.000Z',
        status: 'Pending',
        content: 'ipsum',
        description: 'Sample telecom operation desc.',
        target: 'Lata',
        group: 'group-6',
        operator: 'Vodafone',
        network: '4G',
        country: 'India',
        place: 'Kolkata',
        model: 'Oppo Reno10',
        fake: false,
        location: { lat: 26.199346, lng: 77.2090, city: 'Kolkata Park', region: 'Tamil Nadu' },
        network_info: { ran: 'NR-RAN', band: 'n28', lac_tac: '20938', rx_level: -98, encryption: { a5_1: true, a5_2: true, a5_3: true } },
        imsi: '404900000001',
        imei: '354000000000001',
    },
    {
        id: 'dummy-2',
        sender: '9235000000',
        receiver: '9531710000',
        msisdn: '9077090000',
        timestamp: '2025-05-02T10:30:00.000Z',
        status: 'Delivered',
        content: 'ut',
        description: 'Sample telecom operation desc.',
        target: 'Vikram',
        group: 'group-3',
        operator: 'Airtel',
        network: '5G',
        country: 'India',
        place: 'Mumbai',
        model: 'iPhone 14',
        fake: false,
        location: { lat: 28.6139, lng: 77.2090, city: 'Mumbai', region: 'Maharashtra' },
        network_info: { ran: 'E-UTRAN', band: 'B3', lac_tac: '51467', rx_level: -102, encryption: { a5_1: true, a5_2: false, a5_3: false } },
        imsi: '404100000002',
        imei: '354000000000002',
    },
    {
        id: 'dummy-3',
        sender: '9501150000',
        receiver: '9397450000',
        msisdn: '9158660000',
        timestamp: '2025-05-03T08:15:00.000Z',
        status: 'Failed',
        content: 'consectetur',
        description: 'Sample telecom operation desc.',
        target: 'Arun',
        group: 'group-10',
        operator: 'Jio',
        network: 'LTE',
        country: 'India',
        place: 'Delhi',
        model: 'Samsung A54',
        fake: false,
        location: { lat: 28.7041, lng: 77.1025, city: 'Delhi', region: 'Delhi' },
        network_info: { ran: 'UTRAN', band: 'n41', lac_tac: '82132', rx_level: -84, encryption: { a5_1: false, a5_2: false, a5_3: true } },
        imsi: '404450000003',
        imei: '354000000000003',
    },
    {
        id: 'dummy-4',
        sender: '9055190000',
        receiver: '9689820000',
        msisdn: '9247750000',
        timestamp: '2025-05-04T16:00:00.000Z',
        status: 'Sent',
        content: 'lorem',
        description: 'Sample telecom operation desc.',
        target: 'Chaaya',
        group: 'group-4',
        operator: 'BSNL',
        network: '3G',
        country: 'India',
        place: 'Bangalore',
        model: 'Xiaomi 13',
        fake: false,
        location: { lat: 12.9716, lng: 77.5946, city: 'Bangalore', region: 'Karnataka' },
        network_info: { ran: 'UTRAN', band: 'B3', lac_tac: '31200', rx_level: -90, encryption: { a5_1: true, a5_2: true, a5_3: false } },
        imsi: '404200000004',
        imei: '354000000000004',
    },
    {
        id: 'dummy-5',
        sender: '9707070000',
        receiver: '9796400000',
        msisdn: '9881160000',
        timestamp: '2025-05-05T12:30:00.000Z',
        status: 'Received',
        content: 'amet',
        description: 'Sample telecom operation desc.',
        target: 'Raj',
        group: 'group-2',
        operator: 'Vodafone',
        network: '5G',
        country: 'India',
        place: 'Chennai',
        model: 'Vivo X90',
        fake: false,
        location: { lat: 13.0827, lng: 80.2707, city: 'Chennai', region: 'Tamil Nadu' },
        network_info: { ran: 'NR-RAN', band: 'n78', lac_tac: '11034', rx_level: -76, encryption: { a5_1: true, a5_2: false, a5_3: true } },
        imsi: '404200000005',
        imei: '354000000000005',
    },
];

export const DUMMY_DASHBOARD_STATS: DashboardStats = {
    total_records: 238,
    status_breakdown: [
        { status: 'Sent', count: 51 },
        { status: 'Delivered', count: 50 },
        { status: 'Pending', count: 50 },
        { status: 'Failed', count: 49 },
        { status: 'Received', count: 38 },
    ],
    operator_breakdown: [
        { operator: 'Airtel', count: 54, networks: ['3G', '5G', 'LTE', '4G'] },
        { operator: 'Jio', count: 64, networks: ['3G', '4G', 'LTE', '5G'] },
        { operator: 'BSNL', count: 67, networks: ['3G', '4G', 'LTE', '5G'] },
        { operator: 'Vodafone', count: 53, networks: ['3G', '4G', 'LTE', '5G'] },
    ],
    network_breakdown: [
        { network: '5G', count: 66 },
        { network: '4G', count: 61 },
        { network: '3G', count: 61 },
        { network: 'LTE', count: 50 },
    ],
    fake_count: 0,
    date_range: { start: '2025-04-30T05:52:00', end: '2026-03-26T21:10:00' },
};

export const DUMMY_TIMELINE: TimelineDataPoint[] = [
    { period: '2025-04-30', total: 12, delivered: 4, failed: 2, sent: 3, pending: 3 },
    { period: '2025-05-01', total: 18, delivered: 6, failed: 3, sent: 5, pending: 4 },
    { period: '2025-05-02', total: 15, delivered: 5, failed: 3, sent: 4, pending: 3 },
    { period: '2025-05-03', total: 22, delivered: 8, failed: 4, sent: 6, pending: 4 },
    { period: '2025-05-04', total: 19, delivered: 7, failed: 3, sent: 5, pending: 4 },
    { period: '2025-05-05', total: 25, delivered: 9, failed: 5, sent: 7, pending: 4 },
];

export const buildDummyFrequencyData = (records: SMSRecord[] = DUMMY_SMS_RECORDS): SMSFrequencyData[] => {
    const stats = new Map<string, { sent: number; received: number; contacts: Set<string>; operators: Set<string> }>();

    records.forEach((r) => {
        // Sender side
        const senderEntry = stats.get(r.sender) ?? { sent: 0, received: 0, contacts: new Set(), operators: new Set() };
        senderEntry.sent += 1;
        senderEntry.contacts.add(r.receiver);
        senderEntry.operators.add(r.operator);
        stats.set(r.sender, senderEntry);
    });

    return Array.from(stats.entries())
        .map(([number, v]) => ({
            number,
            sent_count: v.sent,
            received_count: v.received,
            total_count: v.sent + v.received,
            unique_contacts: v.contacts.size,
            operators: Array.from(v.operators),
        }))
        .sort((a, b) => b.total_count - a.total_count);
};
