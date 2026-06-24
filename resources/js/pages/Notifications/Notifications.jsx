import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const CATEGORY_LABELS = {
    chat_message: 'Chat',
    seller_verification: 'Verifikasi Seller',
    property_moderation: 'Moderasi Properti',
    appeal: 'Banding',
    payment_success: 'Pembayaran',
    new_seller_application: 'Pengajuan Seller Baru',
    new_property_submission: 'Properti Baru',
    new_appeal: 'Banding Baru',
};

// Konfigurasi tab sesuai contoh gambar (Semua, Belum dibaca, Properti, Sistem)
const TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: 'Belum dibaca' },
    { key: 'property', label: 'Properti' },
    { key: 'system', label: 'Sistem' },
];

const SYSTEM_TYPES = [
    'seller_verification',
    'appeal',
    'new_seller_application',
    'new_appeal',
];

const PROPERTY_TYPES = [
    'property_moderation',
    'new_property_submission',
    'payment_success'
];

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    const load = async (page = 1, tab = activeTab) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };

            switch (tab) {
                case 'unread':
                    params.unread = 1;
                    break;
                case 'property':
                    params.type = PROPERTY_TYPES;
                    break;
                case 'system':
                    params.type = SYSTEM_TYPES;
                    break;
            }

            const { data } = await api.get('/notifications', { params });
            const responseData = data?.data?.data || data?.data || [];
            setNotifications(Array.isArray(responseData) ? responseData : []);
            setPagination({
                currentPage: data?.data?.meta?.current_page || 1,
                lastPage: data?.data?.meta?.last_page || 1,
                total: data?.data?.meta?.total || 0,
            });
        } catch {
            toast.error('Gagal memuat notifikasi.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load(1, activeTab);
    }, [activeTab]);

    const markAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            toast.success('Semua notifikasi ditandai sudah dibaca.');
        } catch {
            toast.error('Gagal menandai notifikasi.');
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
        } catch {
            toast.error('Gagal menandai notifikasi.');
        }
    };

    const filteredNotifications = useMemo(() => {
        if (!searchTerm.trim()) return notifications;
        const term = searchTerm.toLowerCase();
        return notifications.filter(n => {
            const data = n.data;
            const text = [
                data.body,
                data.sender_name,
                data.title,
                data.seller_name,
                data.alasan,
                data.catatan,
                CATEGORY_LABELS[data.type] || '',
            ].join(' ').toLowerCase();
            return text.includes(term);
        });
    }, [notifications, searchTerm]);

    const formatTimeAgo = (dateStr) => {
        const timestamp = new Date(dateStr).getTime();
        const now = new Date().getTime();
        const diffMs = now - timestamp;
        
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins <= 0 ? 1 : diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays === 1) return 'Kemarin';
        return `${diffDays} hari lalu`;
    };

    const getNotificationStyle = (type, status) => {
        if (type === 'property_moderation' && status === 'approved') {
            return {
                bgIcon: 'bg-amber-50 text-amber-500',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                )
            };
        }
        if (type === 'property_moderation' && status === 'rejected') {
            return {
                bgIcon: 'bg-red-50 text-red-400',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            };
        }
        if (type === 'chat_message') {
            return {
                bgIcon: 'bg-blue-50 text-blue-400',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )
            };
        }
        return {
            bgIcon: 'bg-slate-50 text-slate-400',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
            )
        };
    };

    const renderNotification = (n) => {
        const data = n.data;
        const isUnread = !n.read_at;
        const style = getNotificationStyle(data.type, data.status);

        let titleText = 'Pemberitahuan';
        let bodyText = data.body || '';

        if (data.type === 'property_moderation') {
            titleText = data.status === 'approved' ? 'Properti Anda Disetujui' : 'Properti Ditolak';
            bodyText = data.status === 'approved' 
                ? `Properti '${data.title || 'Mansion'}' yang Anda ajukan telah disetujui oleh admin.`
                : `Pengajuan properti '${data.title || 'Apartment'}' ditolak. Klik untuk lihat alasan: ${data.alasan || '-'}`;
        } else if (data.type === 'chat_message') {
            titleText = `Pesan Baru dari ${data.sender_name || 'User'}`;
            bodyText = `"${data.body}"`;
        } else if (data.type === 'seller_verification') {
            titleText = data.status === 'approved' ? 'Verifikasi Agen Disetujui' : 'Verifikasi Agen Ditolak';
            bodyText = `Pengajuan pendaftaran akun agen Anda telah ${data.status === 'approved' ? 'diterima' : 'ditolak'}.`;
        }

        return (
            <div
                key={n.id}
                onClick={() => isUnread && markAsRead(n.id)}
                className={`p-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex items-start gap-4 transition-all duration-300 transform cursor-pointer hover:scale-[1.01] hover:shadow-md active:scale-[0.99] relative overflow-hidden ${
                    isUnread ? 'border-l-[5px] border-l-[#C5A065]' : ''
                }`}
            >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${style.bgIcon}`}>
                    {style.icon}
                </div>

                <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-bold text-gray-800 text-sm leading-snug tracking-tight">
                            {titleText}
                        </h3>
                        {isUnread && (
                            <span className="inline-block px-1.5 py-0.5 text-[9px] uppercase font-extrabold tracking-widest text-amber-600 bg-amber-50 rounded-md">
                                Baru
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                        {bodyText}
                    </p>
                    <span className="block text-[10px] text-gray-400 font-medium mt-1.5">
                        {formatTimeAgo(n.created_at)}
                    </span>
                </div>

                {isUnread && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#C5A065] rounded-full shadow-sm" />
                )}
            </div>
        );
    };

    const renderPagination = () => {
        const pages = [];
        
        pages.push(
            <button
                key="prev"
                disabled={pagination.currentPage === 1}
                onClick={() => load(pagination.currentPage - 1)}
                className="w-8 h-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center text-xs text-gray-400 hover:bg-gray-50 disabled:opacity-40 transition-all duration-200"
            >
                ‹
            </button>
        );

        for (let i = 1; i <= pagination.lastPage; i++) {
            if (pagination.lastPage > 6 && i > 3 && i < pagination.lastPage) {
                if (i === 4) pages.push(<span key="dots" className="px-1.5 text-gray-400 text-xs self-center">...</span>);
                continue;
            }

            pages.push(
                <button
                    key={i}
                    onClick={() => load(i, activeTab)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 transform active:scale-95 ${
                        i === pagination.currentPage
                            ? 'bg-[#C5A065] text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                    {i}
                </button>
            );
        }

        return pages;
    };

    if (loading && notifications.length === 0) return (
        <div className="w-full flex items-center justify-center py-32 bg-transparent">
            <div className="text-center">
                <div className="w-10 h-10 border-4 border-[#C5A065] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-sm font-semibold text-gray-500">Memuat notifikasi...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full bg-transparent p-1">

            {/* Tab Kategori */}
            <div className="flex flex-wrap gap-2.5 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-2 rounded-full text-xs font-bold tracking-wide transition-all duration-300 transform active:scale-95 shadow-sm ${
                            activeTab === tab.key
                                ? 'bg-[#C5A065] text-white shadow-md shadow-amber-600/10'
                                : 'bg-white text-gray-600 border border-gray-100 hover:border-[#e5d8c0] hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Searchbar Minimalis */}
            <div className="mb-6 relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </span>
                <input
                    type="text"
                    placeholder="Cari kata kunci notifikasi..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-gray-100 rounded-2xl pl-11 pr-4 py-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#C5A065] focus:border-[#C5A065] shadow-sm transition-all placeholder-gray-400"
                />
            </div>

            {/* List Notifikasi Grid/Stack */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-16 px-6 text-center shadow-sm">
                        <p className="text-4xl mb-3">🔔</p>
                        <p className="text-sm font-bold text-gray-700 mb-1">
                            Tidak ada notifikasi
                        </p>
                        <p className="text-xs text-gray-400 max-w-xs mx-auto">
                            {activeTab !== 'all' ? 'Tidak ditemukannya rekaman riwayat untuk filter kategori saat ini.' : 'Semua update sistem maupun aktivitas Anda akan muncul disini.'}
                        </p>
                    </div>
                ) : (
                    filteredNotifications.map(renderNotification)
                )}
            </div>

            {/* Area Kontrol Pagination Bawah */}
            {pagination.lastPage > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-8">
                    {renderPagination()}
                </div>
            )}
        </div>
    );
};

export default Notifications;