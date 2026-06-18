import { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
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

// Konfigurasi tab
const TABS = [
    { key: 'all', label: 'Semua' },
    { key: 'unread', label: 'Belum Dibaca' },
    { key: 'chat', label: 'Chat' },
    { key: 'payment', label: 'Pembayaran' },
    { key: 'system', label: 'Sistem' },
];

// Tipe yang termasuk dalam tab "Sistem"
const SYSTEM_TYPES = [
    'seller_verification',
    'property_moderation',
    'appeal',
    'new_seller_application',
    'new_property_submission',
    'new_appeal',
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

    // Fungsi untuk mengambil data dari server berdasarkan tab & halaman
    const load = async (page = 1, tab = activeTab) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };

            // Tentukan parameter filter berdasarkan tab
            switch (tab) {
                case 'unread':
                    params.unread = 1;
                    break;
                case 'chat':
                    params.type = 'chat_message';
                    break;
                case 'payment':
                    params.type = 'payment_success';
                    break;
                case 'system':
                    // Kirim array tipe sistem
                    params.type = SYSTEM_TYPES;
                    break;
                // 'all' tidak mengirim parameter filter
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

    // Filter client‑side berdasarkan searchTerm
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

    const renderNotification = (n) => {
        const data = n.data;
        const isUnread = !n.read_at;
        const categoryLabel = CATEGORY_LABELS[data.type] || 'Notifikasi';

        return (
            <div
                key={n.id}
                className={`p-4 bg-white rounded-xl shadow border cursor-pointer transition hover:bg-gray-50 ${
                    isUnread ? 'border-l-4 border-[#C5A065] bg-[#faf7f0]' : ''
                }`}
                onClick={() => !n.read_at && markAsRead(n.id)}
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <span className="inline-block text-[10px] font-medium text-[#C5A065] bg-[#faf7f0] px-2 py-0.5 rounded-full mb-1">
                            {categoryLabel}
                        </span>

                        {data.type === 'chat_message' && (
                            <p className="text-sm">
                                <strong>{data.sender_name}</strong> mengirim pesan: "{data.body}"
                            </p>
                        )}
                        {data.type === 'seller_verification' && (
                            <p className="text-sm">
                                Pengajuan seller Anda <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong>.
                                {data.alasan && <span className="block text-gray-500 text-xs mt-1">Alasan: {data.alasan}</span>}
                            </p>
                        )}
                        {data.type === 'property_moderation' && (
                            <p className="text-sm">
                                Properti <strong>{data.title}</strong> <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong>.
                                {data.alasan && <span className="block text-gray-500 text-xs mt-1">Alasan: {data.alasan}</span>}
                            </p>
                        )}
                        {data.type === 'appeal' && (
                            <p className="text-sm">
                                Banding Anda <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong>.
                                {data.catatan && <span className="block text-gray-500 text-xs mt-1">Catatan: {data.catatan}</span>}
                            </p>
                        )}
                        {data.type === 'payment_success' && (
                            <p className="text-sm">
                                Pembayaran berhasil! Properti <strong>{data.title}</strong> telah dipublikasikan.
                            </p>
                        )}
                        {data.type === 'new_seller_application' && (
                            <p className="text-sm">
                                Pengajuan seller baru dari <strong>{data.seller_name}</strong>.
                            </p>
                        )}
                        {data.type === 'new_property_submission' && (
                            <p className="text-sm">
                                Properti <strong>{data.title}</strong> diajukan untuk moderasi.
                            </p>
                        )}
                        {data.type === 'new_appeal' && (
                            <p className="text-sm">
                                Banding baru dari <strong>{data.seller_name}</strong>.
                            </p>
                        )}
                    </div>
                    {isUnread && (
                        <span className="w-3 h-3 bg-[#C5A065] rounded-full flex-shrink-0 ml-2 mt-1"></span>
                    )}
                </div>
                <p className="text-xs text-gray-400 mt-2">{new Date(n.created_at).toLocaleString('id-ID')}</p>
            </div>
        );
    };

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= pagination.lastPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => load(i, activeTab)}
                    className={`w-8 h-8 rounded-full text-sm font-medium ${
                        i === pagination.currentPage
                            ? 'bg-[#C5A065] text-white'
                            : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                    }`}
                >
                    {i}
                </button>
            );
        }
        return pages;
    };

    if (loading && notifications.length === 0) return (
        <div className="min-h-screen bg-[#efe6d5]">
            <Navbar />
            <div className="flex items-center justify-center py-20">
                <p>Memuat notifikasi...</p>
            </div>
            <Footer />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#efe6d5]">
            <Navbar />
            <div className="max-w-3xl mx-auto py-8 px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#2c2c2c]">Notifikasi</h1>
                    <button
                        onClick={markAllRead}
                        className="text-sm text-[#C5A065] hover:underline"
                    >
                        Tandai semua sudah dibaca
                    </button>
                </div>

                {/* Tab Kategori */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                                activeTab === tab.key
                                    ? 'bg-[#C5A065] text-white'
                                    : 'bg-white text-[#2c2c2c] border border-[#e5d8c0] hover:bg-[#faf7f0]'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Searchbar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="🔍 Cari notifikasi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full border border-[#e5d8c0] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#C5A065]"
                    />
                </div>

                <div className="space-y-3">
                    {filteredNotifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-10">
                            {activeTab !== 'all' ? 'Tidak ada notifikasi untuk kategori ini.' : 'Belum ada notifikasi.'}
                        </p>
                    ) : (
                        filteredNotifications.map(renderNotification)
                    )}
                </div>
                {pagination.lastPage > 1 && (
                    <div className="flex justify-center gap-1 mt-6">
                        {renderPagination()}
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

export default Notifications;