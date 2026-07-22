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

// 🌟 Tab disesuaikan persis dengan design gambar (Semua, Belum dibaca, Properti, Sistem)
const TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: 'Belum dibaca' },
    { key: 'message', label: 'Pesan' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'system', label: 'Sistem' },
];

const MESSAGE_TYPES = ['chat_message'];
const PAYMENT_TYPES = ['payment_success'];

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
                case 'message':
                    params.type = MESSAGE_TYPES;
                    break;
                case 'payment':
                    params.type = PAYMENT_TYPES;
                    break;
                case 'system':
                    params.exclude_type = [...MESSAGE_TYPES, ...PAYMENT_TYPES];
                    break;
            }

            const { data } = await api.get('/notifications', { params });
            const paginator = data?.data || {};
            const responseData = paginator?.data || [];
            setNotifications(Array.isArray(responseData) ? responseData : []);
            setPagination({
                currentPage: paginator?.current_page || 1,
                lastPage: paginator?.last_page || 1,
                total: paginator?.total || 0,
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

    useEffect(() => {
        const handleNewNotification = () => load(1, activeTab);
        window.addEventListener('new-notification', handleNewNotification);
        return () => window.removeEventListener('new-notification', handleNewNotification);
    }, [activeTab]);

    const markAsRead = async (id) => {
        try {
            await api.patch(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
            const { data } = await api.get('/notifications/unread-count');
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: data.count ?? 0 } }));
        } catch {
            toast.error('Gagal menandai notifikasi.');
        }
    };

    const filteredNotifications = useMemo(() => {
        if (!searchTerm.trim()) return notifications;
        const term = searchTerm.toLowerCase();
        return notifications.filter(n => {
            const data = n.data || {};
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

    // 🌟 Mengembalikan style & icon svg lingkaran penuh persis seperti di gambar mockup
    const getNotificationStyle = (type, status) => {
        if (type === 'property_moderation' && status === 'approved') {
            return {
                bgIcon: 'bg-[#FCF6E8] text-[#D3A25D]',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
        if (type === 'property_moderation' && status === 'rejected') {
            return {
                bgIcon: 'bg-[#FDF2F2] text-[#EF4444]',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
        if (type === 'chat_message' || type === 'property_disukai') {
            return {
                bgIcon: 'bg-[#FFF0F2] text-[#F43F5E]',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
        // Default: Update Sistem (Icon Lonceng Notifikasi)
        return {
            bgIcon: 'bg-[#F0F5FA] text-[#4B79A1]',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
            )
        };
    };

    const renderNotification = (n) => {
        const data = n.data || {};
        const isUnread = !n.read_at;
        const style = getNotificationStyle(data.type, data.status);

        let titleText = data.title || 'Notification';
        let bodyText = data.body || '';

        // Sinkronisasi data dinamis dari API ke teks mockup
        if (data.type === 'property_moderation') {
            titleText = data.status === 'approved' ? 'Properti Anda Disetujui' : 'Properti Ditolak';
            bodyText = data.status === 'approved' 
                ? `Properti '${data.title || 'Modern Glass Mansion'}' yang Anda ajukan telah disetujui oleh admin.`
                : `Pengajuan properti '${data.title || 'Old Town Apartment'}' ditolak. Klik untuk lihat alasan.`;
        } else if (data.type === 'chat_message') {
            titleText = `Pesan dari ${data.sender_name || 'Pengguna'}`;
            bodyText = data.body || 'Anda menerima pesan baru.';
        } else if (data.type === 'seller_verification') {
            titleText = data.status === 'approved' ? 'Pengajuan Seller Disetujui' : 'Pengajuan Seller Ditolak';
            bodyText = data.status === 'approved'
                ? 'Pengajuan seller Anda telah disetujui.'
                : `Pengajuan seller Anda ditolak. ${data.alasan ? `Alasan: ${data.alasan}` : ''}`;
        } else if (data.type === 'appeal') {
            titleText = data.status === 'approved' ? 'Banding Disetujui' : 'Banding Ditolak';
            bodyText = data.status === 'approved'
                ? 'Banding Anda telah disetujui.'
                : `Banding Anda ditolak. ${data.catatan ? `Catatan: ${data.catatan}` : ''}`;
        } else if (data.type === 'payment_success') {
            const isFeaturedPayment = data.payment_type === 'featured_listing';
            titleText = isFeaturedPayment ? 'Pembayaran Unggulan Berhasil' : 'Pembayaran Listing Berhasil';
            bodyText = isFeaturedPayment
                ? `Pembayaran unggulan untuk properti '${data.title || 'Properti'}' berhasil dan masuk antrian.`
                : `Pembayaran listing untuk properti '${data.title || 'Properti'}' berhasil.`;
        } else if (data.type === 'new_seller_application') {
            titleText = 'Pengajuan Seller Baru';
            bodyText = `${data.seller_name || 'Seller'} mengajukan verifikasi seller.`;
        } else if (data.type === 'new_property_submission') {
            titleText = 'Properti Baru Diajukan';
            bodyText = `Properti '${data.title || 'Properti'}' menunggu verifikasi.`;
        } else if (data.type === 'new_appeal') {
            titleText = 'Banding Baru';
            bodyText = `${data.seller_name || 'Seller'} mengirim banding baru.`;
        } else if (data.type === 'system_update' || !data.type) {
            titleText = 'Update Sistem';
            bodyText = data.body || 'Kami telah memperbarui kebijakan privasi layanan kami.';
        }

        return (
            <div
                key={n.id}
                onClick={() => isUnread && markAsRead(n.id)}
                className="p-5 bg-white rounded-2xl border border-gray-100 flex items-start gap-4 transition-all relative"
            >
                {/* 🌟 Border Indikator Oranye Tebal di Kiri Sisi untuk Item yang Belum Dibaca */}
                {isUnread && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D3A25D] rounded-l-2xl" />
                )}

                {/* Bulatan Lingkaran Icon */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${style.bgIcon}`}>
                    {style.icon}
                </div>

                <div className="flex-1 min-w-0 pr-8">
                    <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-gray-800 text-sm tracking-tight">
                            {titleText}
                        </h3>
                        {/* Badge 'BARU' Kuning Emas Elegan */}
                        {isUnread && (
                            <span className="inline-block px-1.5 py-0.5 text-[8px] font-black tracking-wider text-[#D3A25D] bg-[#FCF6E8] rounded">
                                BARU
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        {bodyText}
                    </p>
                    <span className="block text-[11px] text-gray-400 mt-2 font-normal">
                        {formatTimeAgo(n.created_at || new Date())}
                    </span>
                </div>

                {/* Dot Bulatan Oranye Penanda Notifikasi Baru di Kanan */}
                {isUnread && (
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-[#D3A25D] rounded-full" />
                )}
            </div>
        );
    };

    if (loading && notifications.length === 0) return (
        <div className="w-full flex items-center justify-center py-32">
            <div className="text-center">
                <div className="w-8 h-8 border-4 border-[#D3A25D] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-xs text-gray-400">Memuat notifikasi...</p>
            </div>
        </div>
    );

    return (
        <div className="w-full text-left">

            {/* Tab Filter Kategori */}
            <div className="flex flex-wrap gap-3 mb-6">
                {TABS.map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                            activeTab === tab.key
                                ? 'bg-[#C5A065] text-white border-[#C5A065] shadow-sm'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* List Tumpukan Notifikasi */}
            <div className="space-y-4">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
                        <p className="text-3xl mb-2"></p>
                        <p className="text-sm font-bold text-gray-700">Tidak ada notifikasi baru</p>
                    </div>
                ) : (
                    filteredNotifications.map(renderNotification)
                )}
            </div>

            {/* Pagination Controls */}
            {pagination.lastPage > 1 && (
                <div className="flex justify-center items-center gap-1.5 mt-8">
                    <button
                        disabled={pagination.currentPage === 1}
                        onClick={() => load(pagination.currentPage - 1)}
                        className="px-3 py-1 rounded border text-xs bg-white text-gray-500 disabled:opacity-40"
                    >
                        Sebelumnya
                    </button>
                    <span className="text-xs text-gray-400 mx-2">Halaman {pagination.currentPage} dari {pagination.lastPage}</span>
                    <button
                        disabled={pagination.currentPage === pagination.lastPage}
                        onClick={() => load(pagination.currentPage + 1)}
                        className="px-3 py-1 rounded border text-xs bg-white text-gray-500 disabled:opacity-40"
                    >
                        Selanjutnya
                    </button>
                </div>
            )}
        </div>
    );
};

export default Notifications;
