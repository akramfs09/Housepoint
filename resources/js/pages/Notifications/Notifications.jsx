import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, CheckSquare, Square, X } from 'lucide-react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const CATEGORY_LABELS = {
    chat_message: 'Chat',
    seller_verification: 'Verifikasi Agen',
    property_moderation: 'Moderasi Properti',
    appeal: 'Banding',
    payment_success: 'Pembayaran',
    new_seller_application: 'Pengajuan Agen Baru',
    new_property_submission: 'Properti Baru',
    new_appeal: 'Banding Baru',
};

const Notifications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const currentRole = user?.role || 'customer';
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        lastPage: 1,
        total: 0,
    });
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // State untuk Kelola/Hapus Notifikasi
    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);

    const getRoleTabs = () => {
        if (currentRole === 'admin' || currentRole === 'super_admin') {
            return [
                { key: 'all', label: 'Semua' },
                { key: 'unread', label: 'Belum dibaca' },
                { key: 'seller_verif', label: 'Verifikasi Agen' },
                { key: 'property_verif', label: 'Verifikasi Properti' },
                { key: 'appeal', label: 'Banding' },
                { key: 'message', label: 'Pesan' },
            ];
        }
        if (currentRole === 'seller') {
            return [
                { key: 'all', label: 'Semua' },
                { key: 'unread', label: 'Belum dibaca' },
                { key: 'verification', label: 'Status Verifikasi' },
                { key: 'property', label: 'Properti' },
                { key: 'payment', label: 'Pembayaran' },
                { key: 'message', label: 'Pesan' },
            ];
        }
        return [
            { key: 'all', label: 'Semua' },
            { key: 'unread', label: 'Belum dibaca' },
            { key: 'message', label: 'Pesan' },
            { key: 'system', label: 'Sistem' },
        ];
    };

    const tabs = getRoleTabs();

    const load = async (page = 1, tab = activeTab) => {
        setLoading(true);
        try {
            const params = { page, per_page: 15 };

            switch (tab) {
                case 'unread':
                    params.unread = 1;
                    break;
                case 'message':
                    params.type = ['chat_message'];
                    break;
                case 'payment':
                    params.type = ['payment_success'];
                    break;
                case 'verification':
                    params.type = ['seller_verification', 'appeal'];
                    break;
                case 'property':
                    params.type = ['property_moderation'];
                    break;
                case 'seller_verif':
                    params.type = ['new_seller_application'];
                    break;
                case 'property_verif':
                    params.type = ['new_property_submission'];
                    break;
                case 'appeal':
                    params.type = ['new_appeal', 'appeal'];
                    break;
                case 'system':
                    params.exclude_type = ['chat_message', 'payment_success', 'seller_verification', 'property_moderation'];
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
        setSelectedIds([]);
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

    const handleNotificationClick = async (n) => {
        if (isSelectionMode) {
            toggleSelectItem(n.id);
            return;
        }

        if (!n.read_at) {
            await markAsRead(n.id);
        }

        const data = n.data || {};
        const type = data.type;

        if (type === 'chat_message') {
            navigate('/chat');
        } else if (type === 'new_seller_application' || type === 'new_appeal') {
            navigate('/admin/seller-verifications');
        } else if (type === 'new_property_submission') {
            navigate('/admin/properties');
        } else if (type === 'seller_verification' || type === 'appeal') {
            navigate('/seller/agen');
        } else if (type === 'property_moderation' || type === 'payment_success') {
            navigate('/seller/properties');
        }
    };

    // Fungsi Hapus Notifikasi
    const toggleSelectItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredNotifications.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredNotifications.map(n => n.id));
        }
    };

    const handleDeleteSingle = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm('Apakah Anda yakin ingin menghapus notifikasi ini?')) return;

        try {
            await api.delete(`/notifications/${id}`);
            setNotifications(prev => prev.filter(n => n.id !== id));
            setSelectedIds(prev => prev.filter(item => item !== id));
            toast.success('Notifikasi berhasil dihapus.');
            const { data } = await api.get('/notifications/unread-count');
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: data.count ?? 0 } }));
        } catch {
            toast.error('Gagal menghapus notifikasi.');
        }
    };

    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.length} notifikasi terpilih?`)) return;

        try {
            await api.post('/notifications/delete-batch', { ids: selectedIds });
            setNotifications(prev => prev.filter(n => !selectedIds.includes(n.id)));
            toast.success(`${selectedIds.length} notifikasi berhasil dihapus.`);
            setSelectedIds([]);
            const { data } = await api.get('/notifications/unread-count');
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: data.count ?? 0 } }));
        } catch {
            toast.error('Gagal menghapus notifikasi terpilih.');
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

    const getNotificationStyle = (type, status) => {
        if (type === 'new_seller_application') {
            return {
                bgIcon: 'bg-[#FFFBEB] text-[#D97706]',
                badgeStyle: 'bg-[#FEF3C7] text-[#92400E]',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                )
            };
        }
        if (type === 'new_property_submission') {
            return {
                bgIcon: 'bg-[#EFF6FF] text-[#2563EB]',
                badgeStyle: 'bg-[#DBEAFE] text-[#1E40AF]',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                )
            };
        }
        if (type === 'new_appeal') {
            return {
                bgIcon: 'bg-[#F5F3FF] text-[#7C3AED]',
                badgeStyle: 'bg-[#EDE9FE] text-[#5B21B6]',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                )
            };
        }
        if (status === 'approved' || type === 'payment_success') {
            return {
                bgIcon: 'bg-[#ECFDF5] text-[#059669]',
                badgeStyle: 'bg-[#D1FAE5] text-[#065F46]',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
        if (status === 'rejected') {
            return {
                bgIcon: 'bg-[#FFF1F2] text-[#E11D48]',
                badgeStyle: 'bg-[#FFE4E6] text-[#9F1239]',
                icon: (
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                )
            };
        }
        if (type === 'chat_message') {
            return {
                bgIcon: 'bg-[#FFF0F2] text-[#F43F5E]',
                badgeStyle: 'bg-[#FFE4E6] text-[#9F1239]',
                icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                )
            };
        }
        return {
            bgIcon: 'bg-[#F0F5FA] text-[#4B79A1]',
            badgeStyle: 'bg-[#E2E8F0] text-[#334155]',
            icon: (
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3 3z" />
                </svg>
            )
        };
    };

    const renderNotification = (n) => {
        const data = n.data || {};
        const isUnread = !n.read_at;
        const isSelected = selectedIds.includes(n.id);
        const style = getNotificationStyle(data.type, data.status);

        let titleText = data.title || 'Notifikasi';
        let bodyText = data.body || '';

        if (data.type === 'property_moderation') {
            titleText = data.status === 'approved' ? 'Properti Anda Disetujui' : 'Properti Ditolak';
            bodyText = data.status === 'approved' 
                ? `Properti '${data.title || 'Properti'}' yang Anda ajukan telah disetujui oleh admin.`
                : `Pengajuan properti '${data.title || 'Properti'}' ditolak. Klik untuk lihat detail.`;
        } else if (data.type === 'chat_message') {
            titleText = `Pesan dari ${data.sender_name || 'Pengguna'}`;
            bodyText = data.body || 'Anda menerima pesan baru.';
        } else if (data.type === 'seller_verification') {
            titleText = data.status === 'approved' ? 'Pengajuan Agen Disetujui' : 'Pengajuan Agen Ditolak';
            bodyText = data.status === 'approved'
                ? 'Selamat! Pengajuan akun agen Anda telah disetujui.'
                : `Pengajuan akun agen Anda ditolak. ${data.alasan ? `Alasan: ${data.alasan}` : ''}`;
        } else if (data.type === 'appeal') {
            titleText = data.status === 'approved' ? 'Banding Disetujui' : 'Banding Ditolak';
            bodyText = data.status === 'approved'
                ? 'Banding Anda telah disetujui oleh tim peninjau.'
                : `Banding Anda ditolak. ${data.catatan ? `Catatan: ${data.catatan}` : ''}`;
        } else if (data.type === 'payment_success') {
            const isFeaturedPayment = data.payment_type === 'featured_listing';
            titleText = isFeaturedPayment ? 'Pembayaran Unggulan Berhasil' : 'Pembayaran Listing Berhasil';
            bodyText = isFeaturedPayment
                ? `Pembayaran unggulan untuk properti '${data.title || 'Properti'}' berhasil.`
                : `Pembayaran listing untuk properti '${data.title || 'Properti'}' berhasil.`;
        } else if (data.type === 'new_seller_application') {
            titleText = 'Pengajuan Agen Baru';
            bodyText = `${data.seller_name || 'Calon Agen'} mengajukan verifikasi berkas agen baru.`;
        } else if (data.type === 'new_property_submission') {
            titleText = 'Properti Baru Diajukan';
            bodyText = `Properti '${data.title || 'Properti'}' menunggu verifikasi admin.`;
        } else if (data.type === 'new_appeal') {
            titleText = 'Banding Baru';
            bodyText = `${data.seller_name || 'Agen'} mengajukan banding baru.`;
        } else if (data.type === 'system_update' || !data.type) {
            titleText = 'Update Sistem';
            bodyText = data.body || 'Informasi pembaruan dari layanan HousePoint.';
        }

        return (
            <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`group p-5 bg-white rounded-2xl border transition-all relative cursor-pointer ${
                    isSelected
                        ? 'border-[#C5A065] bg-amber-50/40 shadow-sm ring-1 ring-[#C5A065]/30'
                        : isUnread
                        ? 'border-gray-100 hover:border-[#D3A25D]/50 hover:shadow-md'
                        : 'border-gray-100 hover:border-gray-300 hover:shadow-xs'
                }`}
            >
                {isUnread && !isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#D3A25D] rounded-l-2xl" />
                )}

                <div className="flex items-start gap-4">
                    {isSelectionMode && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectItem(n.id);
                            }}
                            className="mt-1 text-[#C5A065] focus:outline-none shrink-0"
                        >
                            {isSelected ? (
                                <CheckSquare size={20} className="fill-[#C5A065] text-white" />
                            ) : (
                                <Square size={20} className="text-gray-300 hover:text-[#C5A065]" />
                            )}
                        </button>
                    )}

                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${style.bgIcon}`}>
                        {style.icon}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-bold text-gray-800 text-sm tracking-tight">
                                {titleText}
                            </h3>
                            {CATEGORY_LABELS[data.type] && (
                                <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded ${style.badgeStyle}`}>
                                    {CATEGORY_LABELS[data.type]}
                                </span>
                            )}
                            {isUnread && (
                                <span className="inline-block px-1.5 py-0.5 text-[8px] font-black tracking-wider text-[#D3A25D] bg-[#FCF6E8] border border-[#D3A25D]/30 rounded">
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

                    {!isSelectionMode && (
                        <button
                            type="button"
                            onClick={(e) => handleDeleteSingle(n.id, e)}
                            title="Hapus notifikasi ini"
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}
                </div>

                {isUnread && !isSelectionMode && (
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
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex flex-wrap gap-2.5">
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            disabled={isSelectionMode}
                            className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all border ${
                                activeTab === tab.key
                                    ? 'bg-[#C5A065] text-white border-[#C5A065] shadow-xs'
                                    : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            } ${isSelectionMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {!isSelectionMode ? (
                    <button
                        type="button"
                        onClick={() => setIsSelectionMode(true)}
                        disabled={filteredNotifications.length === 0}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-300 transition-all shadow-2xs self-start sm:self-auto disabled:opacity-40"
                    >
                        <Trash2 size={14} />
                        <span>Kelola & Hapus</span>
                    </button>
                ) : (
                    <div className="flex items-center gap-2 flex-wrap">
                        <button
                            type="button"
                            onClick={toggleSelectAll}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-300 bg-[#FAF8F5] text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-all"
                        >
                            {selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0 ? (
                                <CheckSquare size={15} className="text-[#C5A065]" />
                            ) : (
                                <Square size={15} className="text-gray-400" />
                            )}
                            <span>Pilih Semua ({filteredNotifications.length})</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleDeleteSelected}
                            disabled={selectedIds.length === 0}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
                            title={selectedIds.length === 0 ? 'Centang notifikasi yang ingin dihapus' : `Hapus ${selectedIds.length} notifikasi terpilih`}
                        >
                            <Trash2 size={14} />
                            <span>Hapus {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setIsSelectionMode(false);
                                setSelectedIds([]);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <X size={14} />
                            <span>Batal</span>
                        </button>
                    </div>
                )}
            </div>

            {/* List Tumpukan Notifikasi */}
            <div className="space-y-3.5">
                {filteredNotifications.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center shadow-2xs">
                        <p className="text-sm font-bold text-gray-700">Tidak ada notifikasi</p>
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
