import { useCallback, useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight, UserPlus, Building, AlertCircle, CheckCircle, XCircle, MessageSquare, CreditCard } from 'lucide-react';
import api from '../../services/api';

const normalizeNotification = (notification) => {
    if (notification?.data) {
        return notification;
    }

    return {
        id: notification?.id || `broadcast-${Date.now()}`,
        data: {
            ...notification,
            type: notification?.type?.includes('\\') ? 'system_update' : notification?.type,
        },
        read_at: null,
        created_at: notification?.created_at || new Date().toISOString(),
    };
};

const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const timestamp = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffMs = now - timestamp;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins <= 0 ? 1 : diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}j lalu`;
    if (diffDays === 1) return 'Kemarin';
    return `${diffDays}h lalu`;
};

const getNotificationMeta = (notification) => {
    const data = notification.data || {};
    const type = data.type;
    const status = data.status;

    if (type === 'new_seller_application') {
        return {
            bg: 'bg-amber-50 text-amber-600 border-amber-200/60',
            icon: <UserPlus size={16} />,
            title: 'Pengajuan Agen Baru',
            desc: `${data.seller_name || 'Calon Agen'} mengajukan verifikasi agen.`,
        };
    }
    if (type === 'new_property_submission') {
        return {
            bg: 'bg-blue-50 text-blue-600 border-blue-200/60',
            icon: <Building size={16} />,
            title: 'Properti Baru Diajukan',
            desc: `Properti '${data.title || 'Properti'}' menunggu verifikasi.`,
        };
    }
    if (type === 'new_appeal') {
        return {
            bg: 'bg-purple-50 text-purple-600 border-purple-200/60',
            icon: <AlertCircle size={16} />,
            title: 'Banding Baru',
            desc: `${data.seller_name || 'Agen'} mengajukan banding baru.`,
        };
    }
    if (status === 'approved' || type === 'payment_success') {
        let desc = 'Notifikasi telah disetujui.';
        if (type === 'property_moderation') desc = `Properti '${data.title || 'Properti'}' telah disetujui.`;
        if (type === 'seller_verification') desc = 'Pengajuan akun agen Anda telah disetujui.';
        if (type === 'appeal') desc = 'Banding Anda telah disetujui.';
        if (type === 'payment_success') desc = `Pembayaran untuk '${data.title || 'Properti'}' berhasil.`;

        return {
            bg: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
            icon: type === 'payment_success' ? <CreditCard size={16} /> : <CheckCircle size={16} />,
            title: type === 'payment_success' ? 'Pembayaran Berhasil' : (data.title || 'Disetujui'),
            desc,
        };
    }
    if (status === 'rejected') {
        let desc = 'Notifikasi ditolak.';
        if (type === 'property_moderation') desc = `Properti '${data.title || 'Properti'}' ditolak oleh admin.`;
        if (type === 'seller_verification') desc = `Pengajuan akun agen ditolak. ${data.alasan ? `Alasan: ${data.alasan}` : ''}`;
        if (type === 'appeal') desc = `Banding ditolak. ${data.catatan ? `Catatan: ${data.catatan}` : ''}`;

        return {
            bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
            icon: <XCircle size={16} />,
            title: 'Pengajuan Ditolak',
            desc,
        };
    }
    if (type === 'chat_message') {
        return {
            bg: 'bg-rose-50 text-rose-600 border-rose-200/60',
            icon: <MessageSquare size={16} />,
            title: `Pesan dari ${data.sender_name || 'Pengguna'}`,
            desc: data.body || 'Anda menerima pesan baru.',
        };
    }

    return {
        bg: 'bg-slate-50 text-slate-600 border-slate-200/60',
        icon: <Bell size={16} />,
        title: data.title || 'Update Sistem',
        desc: data.body || 'Informasi pembaruan dari layanan HousePoint.',
    };
};

const NotificationBell = () => {
    const navigate = useNavigate();
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const bellRef = useRef(null);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count ?? 0);
        } catch {}
    }, []);

    const fetchLatest = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications', { params: { per_page: 5 } });
            const list = data?.data?.data || [];
            setNotifications(Array.isArray(list) ? list : []);
        } catch {}
    }, []);

    useEffect(() => {
        fetchUnreadCount();
        fetchLatest();

        const handleNewNotification = (event) => {
            const newNotification = normalizeNotification(event.detail);

            setNotifications((current) => {
                const withoutDuplicate = current.filter((item) => item.id !== newNotification.id);
                return [newNotification, ...withoutDuplicate].slice(0, 5);
            });
            setUnreadCount((current) => current + 1);
        };

        const handleNotificationsUpdated = (event) => {
            if (typeof event?.detail?.count === 'number') {
                setUnreadCount(event.detail.count);
            } else {
                fetchUnreadCount();
            }
            fetchLatest();
        };

        window.addEventListener('new-notification', handleNewNotification);
        window.addEventListener('notifications-updated', handleNotificationsUpdated);
        return () => {
            window.removeEventListener('new-notification', handleNewNotification);
            window.removeEventListener('notifications-updated', handleNotificationsUpdated);
        };
    }, [fetchUnreadCount, fetchLatest]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (bellRef.current && !bellRef.current.contains(event.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleToggle = () => {
        setOpen((current) => !current);
        if (!open) {
            fetchLatest();
            fetchUnreadCount();
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await api.patch('/notifications/read-all');
            setUnreadCount(0);
            setNotifications((current) => current.map((item) => ({ ...item, read_at: item.read_at || new Date().toISOString() })));
        } catch {}
    };

    const handleItemClick = async (notification) => {
        setOpen(false);

        if (!notification.read_at && notification.id) {
            try {
                await api.patch(`/notifications/${notification.id}/read`);
                setUnreadCount((prev) => Math.max(0, prev - 1));
                setNotifications((current) =>
                    current.map((item) => (item.id === notification.id ? { ...item, read_at: new Date().toISOString() } : item))
                );
            } catch {}
        }

        const data = notification.data || {};
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
        } else {
            navigate('/notifications');
        }
    };

    return (
        <div className="relative" ref={bellRef}>
            {/* Tombol Lonceng Header dengan Efek Modern */}
            <button
                type="button"
                onClick={handleToggle}
                className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                    open
                        ? 'bg-[#C5A065]/10 border-[#C5A065] text-[#C5A065] shadow-md ring-2 ring-[#C5A065]/20'
                        : 'bg-white/90 border-[#e5d8c0]/80 text-[#5a5243] hover:bg-[#C5A065]/10 hover:border-[#C5A065] hover:text-[#C5A065] shadow-sm'
                }`}
                title="Notifikasi"
            >
                <Bell className={`h-4.5 w-4.5 sm:h-5 sm:w-5 transition-transform duration-300 ${unreadCount > 0 ? 'animate-bounce-subtle' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-rose-600 px-1 text-[10px] font-black text-white shadow-md ring-2 ring-white">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Popover Dropdown Notifikasi Mewah */}
            {open && (
                <div className="fixed inset-x-4 top-[88px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:w-88 sm:mt-3 z-50 overflow-hidden rounded-2xl border border-[#e5d8c0]/90 bg-white/95 backdrop-blur-xl shadow-2xl shadow-amber-950/10 text-left transition-all duration-300">
                    {/* Header Popover */}
                    <div className="flex items-center justify-between border-b border-[#f3ebdd] bg-gradient-to-r from-[#FAF8F5] to-white px-4 py-3.5">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800 text-sm tracking-tight">Notifikasi</span>
                            {unreadCount > 0 && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-[#C5A065]/15 text-[#9b720f] rounded-full border border-[#C5A065]/30">
                                    {unreadCount} baru
                                </span>
                            )}
                        </div>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className="flex items-center gap-1 text-[11px] font-bold text-[#C5A065] hover:text-[#a37f46] hover:underline transition-colors"
                            >
                                <CheckCheck size={13} />
                                Tandai dibaca
                            </button>
                        )}
                    </div>

                    {/* Content List Notifikasi */}
                    <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f5efe4]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#C5A065] flex items-center justify-center mx-auto mb-2 border border-amber-100">
                                    <Bell size={20} />
                                </div>
                                <p className="text-xs font-semibold text-gray-600">Belum ada notifikasi baru</p>
                            </div>
                        ) : (
                            notifications.map((notification) => {
                                const meta = getNotificationMeta(notification);
                                const isUnread = !notification.read_at;

                                return (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleItemClick(notification)}
                                        className={`group relative p-3.5 flex items-start gap-3 transition-all cursor-pointer ${
                                            isUnread 
                                                ? 'bg-[#FFFDF7] hover:bg-[#FAF4E8] border-l-4 border-l-[#C5A065]' 
                                                : 'hover:bg-gray-50/80 text-gray-600'
                                        }`}
                                    >
                                        {/* Icon Circular Pill */}
                                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-xs transition-transform group-hover:scale-105 ${meta.bg}`}>
                                            {meta.icon}
                                        </div>

                                        {/* Content Detail */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2 mb-0.5">
                                                <h4 className={`text-xs truncate ${isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                                    {meta.title}
                                                </h4>
                                                <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                                                    {formatTimeAgo(notification.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed font-normal">
                                                {meta.desc}
                                            </p>
                                        </div>

                                        {/* Unread Dot Indicator */}
                                        {isUnread && (
                                            <span className="w-2 h-2 rounded-full bg-[#C5A065] shrink-0 mt-1.5 shadow-xs" />
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer View All Link */}
                    <Link
                        to="/notifications"
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-center gap-1.5 border-t border-[#f3ebdd] bg-gradient-to-b from-white to-[#FAF8F5] py-3 text-center text-xs font-bold text-[#C5A065] hover:text-[#9b720f] transition-all hover:bg-amber-50/50"
                    >
                        <span>Lihat semua notifikasi</span>
                        <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
