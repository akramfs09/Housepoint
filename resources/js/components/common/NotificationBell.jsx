import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';
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

const notificationText = (notification) => {
    const data = notification.data || {};

    switch (data.type) {
        case 'chat_message':
            return <p><strong>{data.sender_name}</strong>: {data.body}</p>;
        case 'seller_verification':
            return <p>Pengajuan seller <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>;
        case 'property_moderation':
            return <p>Properti <strong>{data.title}</strong> <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>;
        case 'appeal':
            return <p>Banding <strong>{data.status === 'approved' ? 'disetujui' : 'ditolak'}</strong></p>;
        case 'payment_success':
            return <p>Pembayaran berhasil untuk <strong>{data.title}</strong>.</p>;
        case 'new_seller_application':
            return <p>Pengajuan seller baru dari <strong>{data.seller_name}</strong></p>;
        case 'new_property_submission':
            return <p>Properti <strong>{data.title}</strong> diajukan</p>;
        case 'new_appeal':
            return <p>Banding baru dari <strong>{data.seller_name}</strong></p>;
        default:
            return <p>{data.body || data.title || 'Anda memiliki notifikasi baru.'}</p>;
    }
};

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const { data } = await api.get('/notifications/unread-count');
            setUnreadCount(data.count ?? 0);
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: data.count ?? 0 } }));
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
            window.dispatchEvent(new CustomEvent('notifications-updated'));
        };

        window.addEventListener('new-notification', handleNewNotification);
        return () => window.removeEventListener('new-notification', handleNewNotification);
    }, [fetchUnreadCount, fetchLatest]);

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
            window.dispatchEvent(new CustomEvent('notifications-updated', { detail: { count: 0 } }));
        } catch {}
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={handleToggle}
                className="relative flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full text-[#5a5243] transition hover:bg-[#c49a4a]/10 hover:text-[#c49a4a]"
            >
                <Bell className="h-4.5 w-4.5 sm:h-5 sm:w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 sm:-right-1 sm:-top-1 flex h-4 min-w-4 sm:h-5 sm:min-w-5 items-center justify-center rounded-full bg-red-500 px-0.5 sm:px-1 text-[8px] sm:text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <div className="fixed inset-x-4 top-[88px] sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:w-80 sm:mt-2 z-50 max-h-[70vh] overflow-y-auto rounded-xl border bg-white shadow-lg">
                    <div className="flex items-center justify-between border-b p-3">
                        <span className="text-sm font-semibold">Notifikasi</span>
                        {unreadCount > 0 && (
                            <button type="button" onClick={handleMarkAllRead} className="text-xs font-medium text-[#c49a4a] hover:underline">
                                Tandai semua dibaca
                            </button>
                        )}
                    </div>

                    {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500">Tidak ada notifikasi</p>
                    ) : (
                        notifications.map((notification) => (
                            <div key={notification.id} className={`border-b p-3 text-sm last:border-0 hover:bg-gray-50 ${!notification.read_at ? 'bg-[#faf7f0]' : ''}`}>
                                {notificationText(notification)}
                                <span className="mt-1 block text-xs text-gray-400">
                                    {new Date(notification.created_at || Date.now()).toLocaleString('id-ID')}
                                </span>
                            </div>
                        ))
                    )}

                    <Link
                        to="/notifications"
                        onClick={() => setOpen(false)}
                        className="block border-t p-2 text-center text-sm font-medium text-[#c49a4a] hover:bg-gray-50"
                    >
                        Lihat semua
                    </Link>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
